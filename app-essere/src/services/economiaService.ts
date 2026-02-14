import { pagamentiService, speseService, ricaviService } from './pagamentiService';
import { sessioniService } from './sessioniService';
import { collaboratoreService } from './userService';
import { Pagamento, Spesa, Ricavo, Sessione } from '../types';

// ============================================
// TIPI REPORT
// ============================================

export interface ReportEconomico {
  periodo: {
    inizio: Date;
    fine: Date;
  };
  entrate: {
    totale: number;
    daAllievi: number;
    altre: number;
  };
  uscite: {
    totale: number;
    perCategoria: Record<string, number>;
  };
  profitto: number;
  sessioniCompletate: number;
}

export interface ReportCollaboratore {
  collaboratoreId: string;
  periodo: {
    inizio: Date;
    fine: Date;
  };
  sessioniCompletate: number;
  guadagnoLordo: number;
  percentuale: number;
  guadagnoNetto: number;
  quotaTitolare: number;
}

export interface DashboardEconomica {
  oggi: {
    entrate: number;
    uscite: number;
  };
  questoMese: {
    entrate: number;
    uscite: number;
    profitto: number;
  };
  rateInScadenza: number;
  sessioniOggi: number;
}

// ============================================
// SERVIZIO ECONOMIA
// ============================================

export const economiaService = {
  // Dashboard economica per titolare
  async getDashboard(): Promise<DashboardEconomica> {
    try {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      const domani = new Date(oggi);
      domani.setDate(domani.getDate() + 1);

      const inizioMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
      const fineMese = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);

      // Dati di oggi
      const [entrateOggi, usciteOggi] = await Promise.all([
        ricaviService.getTotaleByPeriodo(oggi, domani),
        speseService.getTotaleByPeriodo(oggi, domani),
      ]);

      // Dati del mese
      const [entrateMese, usciteMese] = await Promise.all([
        ricaviService.getTotaleByPeriodo(inizioMese, fineMese),
        speseService.getTotaleByPeriodo(inizioMese, fineMese),
      ]);

      // Rate in scadenza (prossimi 7 giorni)
      const rateInScadenza = await pagamentiService.getRateInScadenza(7);

      // Sessioni di oggi
      const sessioniOggi = await sessioniService.getSessioniOggi();

      return {
        oggi: {
          entrate: entrateOggi,
          uscite: usciteOggi,
        },
        questoMese: {
          entrate: entrateMese,
          uscite: usciteMese,
          profitto: entrateMese - usciteMese,
        },
        rateInScadenza: rateInScadenza.length,
        sessioniOggi: sessioniOggi.length,
      };
    } catch (error) {
      console.error('Errore getDashboard:', error);
      throw error;
    }
  },

  // Report economico per periodo
  async getReportPeriodo(startDate: Date, endDate: Date): Promise<ReportEconomico> {
    try {
      const [ricavi, spese, sessioni] = await Promise.all([
        ricaviService.getByPeriodo(startDate, endDate),
        speseService.getByPeriodo(startDate, endDate),
        sessioniService.getByDateRange(startDate, endDate),
      ]);

      // Calcola entrate
      const entrateAllievi = ricavi
        .filter(r => r.pagamentoId)
        .reduce((acc, r) => acc + r.importo, 0);
      const entrateAltre = ricavi
        .filter(r => !r.pagamentoId)
        .reduce((acc, r) => acc + r.importo, 0);
      const entrateTotale = entrateAllievi + entrateAltre;

      // Calcola uscite per categoria
      const uscitePerCategoria: Record<string, number> = {};
      spese.forEach(spesa => {
        if (!uscitePerCategoria[spesa.categoria]) {
          uscitePerCategoria[spesa.categoria] = 0;
        }
        uscitePerCategoria[spesa.categoria] += spesa.importo;
      });
      const usciteTotale = spese.reduce((acc, s) => acc + s.importo, 0);

      // Conta sessioni completate
      const sessioniCompletate = sessioni.filter(s => s.stato === 'completata').length;

      return {
        periodo: {
          inizio: startDate,
          fine: endDate,
        },
        entrate: {
          totale: entrateTotale,
          daAllievi: entrateAllievi,
          altre: entrateAltre,
        },
        uscite: {
          totale: usciteTotale,
          perCategoria: uscitePerCategoria,
        },
        profitto: entrateTotale - usciteTotale,
        sessioniCompletate,
      };
    } catch (error) {
      console.error('Errore getReportPeriodo:', error);
      throw error;
    }
  },

  // Report per collaboratore
  async getReportCollaboratore(
    collaboratoreId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportCollaboratore> {
    try {
      const [collaboratore, pagamenti, sessioni] = await Promise.all([
        collaboratoreService.getById(collaboratoreId),
        pagamentiService.getByCollaboratore(collaboratoreId),
        sessioniService.getByCollaboratore(collaboratoreId, 'completata'),
      ]);

      if (!collaboratore) {
        throw new Error('Collaboratore non trovato');
      }

      // Filtra sessioni nel periodo
      const sessioniPeriodo = sessioni.filter(
        s => s.data >= startDate && s.data <= endDate
      );

      // Calcola guadagni dai pagamenti nel periodo
      const pagamentiPeriodo = pagamenti.filter(
        p => p.createdAt >= startDate && p.createdAt <= endDate
      );

      const guadagnoLordo = pagamentiPeriodo.reduce((acc, p) => acc + p.importoTotale, 0);
      const guadagnoNetto = pagamentiPeriodo.reduce((acc, p) => acc + p.guadagnoCollaboratore, 0);
      const quotaTitolare = pagamentiPeriodo.reduce((acc, p) => acc + p.quotaTitolare, 0);

      return {
        collaboratoreId,
        periodo: {
          inizio: startDate,
          fine: endDate,
        },
        sessioniCompletate: sessioniPeriodo.length,
        guadagnoLordo,
        percentuale: collaboratore.percentuale,
        guadagnoNetto,
        quotaTitolare,
      };
    } catch (error) {
      console.error('Errore getReportCollaboratore:', error);
      throw error;
    }
  },

  // Report mensile
  async getReportMensile(anno: number, mese: number): Promise<ReportEconomico> {
    const startDate = new Date(anno, mese - 1, 1);
    const endDate = new Date(anno, mese, 0);
    return this.getReportPeriodo(startDate, endDate);
  },

  // Report annuale
  async getReportAnnuale(anno: number): Promise<ReportEconomico> {
    const startDate = new Date(anno, 0, 1);
    const endDate = new Date(anno, 11, 31);
    return this.getReportPeriodo(startDate, endDate);
  },

  // Confronto mese precedente
  async getConfrontoMesePrecedente(): Promise<{
    meseCorrente: ReportEconomico;
    mesePrecedente: ReportEconomico;
    variazione: {
      entrate: number;
      uscite: number;
      profitto: number;
    };
  }> {
    const oggi = new Date();
    const annoCorrente = oggi.getFullYear();
    const meseCorrente = oggi.getMonth() + 1;

    const mesePrecedente = meseCorrente === 1 ? 12 : meseCorrente - 1;
    const annoPrecedente = meseCorrente === 1 ? annoCorrente - 1 : annoCorrente;

    const [reportCorrente, reportPrecedente] = await Promise.all([
      this.getReportMensile(annoCorrente, meseCorrente),
      this.getReportMensile(annoPrecedente, mesePrecedente),
    ]);

    const calcVariazione = (attuale: number, precedente: number): number => {
      if (precedente === 0) return attuale > 0 ? 100 : 0;
      return ((attuale - precedente) / precedente) * 100;
    };

    return {
      meseCorrente: reportCorrente,
      mesePrecedente: reportPrecedente,
      variazione: {
        entrate: calcVariazione(reportCorrente.entrate.totale, reportPrecedente.entrate.totale),
        uscite: calcVariazione(reportCorrente.uscite.totale, reportPrecedente.uscite.totale),
        profitto: calcVariazione(reportCorrente.profitto, reportPrecedente.profitto),
      },
    };
  },

  // Statistiche collaboratori
  async getStatisticheCollaboratori(startDate: Date, endDate: Date): Promise<ReportCollaboratore[]> {
    try {
      const collaboratori = await collaboratoreService.getAllActive();
      const reports = await Promise.all(
        collaboratori.map(c => this.getReportCollaboratore(c.id, startDate, endDate))
      );
      return reports.sort((a, b) => b.guadagnoLordo - a.guadagnoLordo);
    } catch (error) {
      console.error('Errore getStatisticheCollaboratori:', error);
      throw error;
    }
  },

  // Helper: Formatta importo in Euro
  formatEuro(importo: number): string {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(importo);
  },

  // Helper: Calcola percentuale
  calcPercentuale(parte: number, totale: number): number {
    if (totale === 0) return 0;
    return Math.round((parte / totale) * 100);
  },
};
