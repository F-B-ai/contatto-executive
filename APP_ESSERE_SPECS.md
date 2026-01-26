# App ESSĒRE - Specifiche Tecniche Complete

## Panoramica Progetto

**Nome:** App ESSĒRE
**Tipo:** App Mobile (Android + iOS)
**Sviluppo:** React Native + Expo (gratuito, cross-platform)
**Backend:** Firebase (piano gratuito generoso)
**Stato:** In sviluppo

---

## 1. Ruoli Utente e Permessi

### 1.1 Titolare (Francesco)
| Permesso | Descrizione |
|----------|-------------|
| Accesso completo | Tutte le sezioni dell'app |
| Dashboard globale | Vista unificata calendari + economia |
| Chat anonima | Monitoraggio conversazioni |
| Gestione collaboratori | CRUD + impostazione percentuali |
| Gestione allievi | Accesso a tutti i profili |
| Calendario globale | Vista aggregata tutti i calendari |
| Sezione economica | Spese/ricavi generali |

### 1.2 Collaboratori
| Permesso | Descrizione |
|----------|-------------|
| Propri allievi | Solo quelli assegnati |
| Calendario personale | Inserimento sessioni |
| Programmi allenamento | Creazione per propri allievi |
| Note avanzamento | Per propri allievi |
| Gestione pagamenti | Rate propri allievi |
| Vista percentuale | Loro guadagno vs quota titolare |
| Chat | Con propri allievi |

### 1.3 Allievi
| Permesso | Descrizione |
|----------|-------------|
| Proprio programma | Visualizzazione allenamenti |
| Calendario sessioni | Vista proprie sessioni |
| Annullamento | Solo 10h prima |
| Diario personale | Note private |
| Contenuti speciali | Podcast, risorse, video |
| Pagamenti | Vista rate/scadenze |
| Chat | Con collaboratore/titolare |

---

## 2. Moduli Funzionali

### 2.1 Sistema Calendario

```
┌─────────────────────────────────────────────────────────┐
│                    CALENDARIO GLOBALE                    │
│                    (Solo Titolare)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Calendario  │  │ Calendario  │  │ Calendario  │     │
│  │ Titolare    │  │ Collab. 1   │  │ Collab. 2   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Funzionalità:**
- Vista giornaliera/settimanale/mensile
- Colori diversi per collaboratore
- Filtri per collaboratore/allievo
- Contatore sessioni automatico
- Regola 10 ore per annullamento

### 2.2 Sistema Economico

#### Per Collaboratori:
```
Guadagno Sessione = Prezzo Sessione × Percentuale Collaboratore
Quota Titolare = Prezzo Sessione × (100% - Percentuale Collaboratore)

Esempio:
- Sessione: €50
- Percentuale Collaboratore: 60%
- Guadagno Collaboratore: €30
- Quota Titolare: €20
```

#### Per Titolare:
- **Entrate:** Pagamenti allievi, quote collaboratori
- **Uscite:** Spese generali (affitto, attrezzature, marketing, etc.)
- **Report:** Mensile/Annuale per collaboratore
- **Grafici:** Andamento economico

### 2.3 Sistema Pagamenti/Rate

```
┌─────────────────────────────────────────┐
│            PIANO PAGAMENTO              │
├─────────────────────────────────────────┤
│ Allievo: Mario Rossi                    │
│ Pacchetto: 10 sessioni                  │
│ Totale: €500                            │
│ Modalità: 5 rate da €100                │
├─────────────────────────────────────────┤
│ Rata 1: €100 ✅ Pagata (01/02/2026)     │
│ Rata 2: €100 ✅ Pagata (01/03/2026)     │
│ Rata 3: €100 ⏳ Scadenza: 01/04/2026    │
│ Rata 4: €100 ⏰ 01/05/2026              │
│ Rata 5: €100 ⏰ 01/06/2026              │
└─────────────────────────────────────────┘
```

### 2.4 Programmi Allenamento

**Struttura Programma:**
```
Programma
├── Nome Programma
├── Durata (settimane)
├── Obiettivo
└── Sessioni[]
    ├── Sessione 1
    │   ├── Esercizio 1
    │   │   ├── Nome
    │   │   ├── Serie × Ripetizioni
    │   │   ├── Recupero
    │   │   ├── Video dimostrativo
    │   │   └── Note tecniche
    │   ├── Esercizio 2
    │   └── ...
    ├── Sessione 2
    └── ...
```

**Libreria Esercizi:**
- Database esercizi con video
- Descrizioni dettagliate
- Categorie (forza, mobilità, cardio, etc.)
- Ricerca e filtri

### 2.5 Test Posturali con AI

**Flusso Analisi:**
```
1. Caricamento Foto (fronte, lato, retro)
         ↓
2. Analisi AI Automatica
   - Rilevamento punti chiave corpo
   - Analisi allineamento
   - Identificazione squilibri
         ↓
3. Report Generato
   - Punti critici evidenziati
   - Suggerimenti
         ↓
4. Note Manuali (opzionale)
   - Annotazioni professionista
   - Osservazioni aggiuntive
```

**Tecnologia AI (Gratuita):**
- TensorFlow.js + PoseNet/MoveNet
- Analisi client-side (no costi server)
- Modelli pre-addestrati

### 2.6 Sistema Chat

**Tipi di Conversazione:**
- 1:1 Allievo ↔ Collaboratore
- 1:1 Allievo ↔ Titolare
- Gruppo (opzionale futuro)

**Modalità Titolare:**
| Modalità | Descrizione |
|----------|-------------|
| Normale | Partecipa visibilmente |
| Anonima | Legge senza essere visto |

**Funzionalità:**
- Messaggi testo
- Invio immagini
- Invio documenti/PDF
- Notifiche push
- Storico conversazioni

### 2.7 Contenuti Speciali

**Tipi di Contenuto:**
- Podcast audio
- Video formativi
- PDF/documenti
- Link risorse esterne

**Gestione:**
- Upload da Titolare/Collaboratori
- Assegnazione a singoli allievi o gruppi
- Categorizzazione

### 2.8 Diario Allievo

**Campi:**
- Data
- Come mi sento (1-10)
- Note libere
- Foto progressi (opzionale)
- Privato (solo allievo) o condiviso

---

## 3. Schema Database (Firebase Firestore)

```
firestore/
├── users/
│   └── {userId}
│       ├── email
│       ├── nome
│       ├── cognome
│       ├── telefono
│       ├── ruolo: "titolare" | "collaboratore" | "allievo"
│       ├── avatarUrl
│       ├── createdAt
│       └── updatedAt
│
├── collaboratori/
│   └── {odId}
│       ├── userId (ref)
│       ├── percentuale: number (es. 60)
│       ├── specializzazioni[]
│       ├── allieviIds[]
│       └── attivo: boolean
│
├── allievi/
│   └── {allievoId}
│       ├── userId (ref)
│       ├── collaboratoreId (ref)
│       ├── dataInizio
│       ├── obiettivo
│       ├── note
│       └── attivo: boolean
│
├── sessioni/
│   └── {sessioneId}
│       ├── allievoId (ref)
│       ├── collaboratoreId (ref)
│       ├── data: timestamp
│       ├── durata: number (minuti)
│       ├── tipo: "allenamento" | "consulenza_nutrizionale" | "valutazione"
│       ├── stato: "programmata" | "completata" | "annullata"
│       ├── annullataOreprima: number | null
│       ├── noteCollaboratore
│       ├── programmaId (ref, opzionale)
│       └── esercizi[] (se personalizzati)
│
├── programmi/
│   └── {programmaId}
│       ├── nome
│       ├── descrizione
│       ├── durataSettimane
│       ├── creatoDa (userId ref)
│       ├── sessioni[]
│       │   ├── giorno
│       │   └── esercizi[]
│       │       ├── esercizioId (ref)
│       │       ├── serie
│       │       ├── ripetizioni
│       │       ├── recupero
│       │       └── note
│       └── assegnatoA[] (allievoIds)
│
├── esercizi/
│   └── {esercizioId}
│       ├── nome
│       ├── descrizione
│       ├── categoria
│       ├── videoUrl
│       ├── immagineUrl
│       └── istruzioni
│
├── pagamenti/
│   └── {pagamentoId}
│       ├── allievoId (ref)
│       ├── collaboratoreId (ref)
│       ├── importoTotale
│       ├── modalita: "unica" | "rate"
│       ├── rate[]
│       │   ├── numero
│       │   ├── importo
│       │   ├── scadenza
│       │   ├── pagata: boolean
│       │   └── dataPagamento
│       ├── percentualeCollaboratore
│       ├── guadagnoCollaboratore
│       └── quotaTitolare
│
├── spese/
│   └── {spesaId}
│       ├── descrizione
│       ├── importo
│       ├── categoria
│       ├── data
│       └── ricorrente: boolean
│
├── ricavi/
│   └── {ricavoId}
│       ├── descrizione
│       ├── importo
│       ├── categoria
│       ├── data
│       └── pagamentoId (ref, se collegato)
│
├── testPosturali/
│   └── {testId}
│       ├── allievoId (ref)
│       ├── collaboratoreId (ref)
│       ├── data
│       ├── immagini[]
│       │   ├── url
│       │   ├── tipo: "fronte" | "lato_dx" | "lato_sx" | "retro"
│       │   └── analisiAI{}
│       ├── noteAutomatiche
│       ├── noteManuali
│       └── report
│
├── contenuti/
│   └── {contenutoId}
│       ├── titolo
│       ├── descrizione
│       ├── tipo: "podcast" | "video" | "documento" | "link"
│       ├── url
│       ├── categoria
│       ├── creatoDa (userId)
│       ├── visibileA: "tutti" | allievoIds[]
│       └── createdAt
│
├── diario/
│   └── {diarioEntryId}
│       ├── allievoId (ref)
│       ├── data
│       ├── umore: 1-10
│       ├── note
│       ├── immagini[]
│       ├── condiviso: boolean
│       └── createdAt
│
├── chat/
│   └── {conversazioneId}
│       ├── partecipanti[]
│       ├── tipo: "1to1" | "gruppo"
│       ├── ultimoMessaggio
│       ├── ultimoMessaggioAt
│       └── messaggi/ (subcollection)
│           └── {messaggioId}
│               ├── mittente (userId)
│               ├── testo
│               ├── allegati[]
│               ├── letto: boolean
│               └── createdAt
│
└── calendario/
    └── {eventoId}
        ├── titolo
        ├── descrizione
        ├── data
        ├── oraInizio
        ├── oraFine
        ├── tipo
        ├── userId (proprietario)
        ├── allievoId (opzionale)
        ├── collaboratoreId (opzionale)
        ├── sessioneId (ref, se è una sessione)
        └── colore
```

---

## 4. Struttura App (Schermate)

### 4.1 Schermate Comuni
- Login
- Registrazione
- Profilo
- Impostazioni
- Notifiche

### 4.2 Schermate Titolare
```
Home (Dashboard)
├── Riepilogo economico
├── Calendario globale (mini)
├── Sessioni oggi
└── Avvisi pagamenti

Calendario
├── Vista globale (tutti)
├── Filtri per collaboratore
└── Il mio calendario

Collaboratori
├── Lista collaboratori
├── Dettaglio collaboratore
│   ├── Percentuale (modificabile)
│   ├── Allievi assegnati
│   ├── Rendimento economico
│   └── Calendario
└── Aggiungi collaboratore

Allievi
├── Lista tutti gli allievi
├── Dettaglio allievo
│   ├── Programma attuale
│   ├── Storico sessioni
│   ├── Pagamenti
│   ├── Test posturali
│   └── Diario (se condiviso)
└── Aggiungi allievo

Economia
├── Dashboard
│   ├── Entrate totali
│   ├── Uscite totali
│   ├── Profitto
│   └── Grafici
├── Entrate
│   ├── Da allievi
│   └── Altre entrate
├── Uscite
│   ├── Lista spese
│   └── Aggiungi spesa
└── Report
    ├── Mensile
    └── Annuale

Programmi
├── Libreria programmi
├── Crea programma
└── Libreria esercizi
    └── Aggiungi esercizio

Contenuti
├── Lista contenuti
├── Carica contenuto
└── Gestisci visibilità

Chat
├── Conversazioni
├── Modalità normale
└── Modalità anonima (solo lettura)

Test Posturali
├── Lista test
├── Nuovo test
└── Analisi AI
```

### 4.3 Schermate Collaboratore
```
Home
├── I miei allievi
├── Sessioni oggi
├── Calendario (mini)
└── Pagamenti in arrivo

Calendario
├── Il mio calendario
├── Aggiungi sessione
└── Vista settimanale/mensile

Allievi
├── I miei allievi
├── Dettaglio allievo
│   ├── Programma
│   ├── Inserisci sessione
│   ├── Note avanzamento
│   ├── Pagamenti
│   └── Test posturali
└── Storico sessioni

Economia
├── Il mio riepilogo
├── Sessioni completate
├── Guadagni
├── Quote da versare
└── Storico

Programmi
├── Crea programma
├── I miei programmi
└── Assegna programma

Contenuti
├── Carica contenuto
└── I miei contenuti

Chat
└── Conversazioni con allievi
```

### 4.4 Schermate Allievo
```
Home
├── Prossima sessione
├── Il mio programma (oggi)
├── Sessioni completate
└── Contenuti nuovi

Programma
├── Programma attuale
├── Dettaglio sessione
│   ├── Esercizi
│   ├── Video
│   └── Descrizioni
└── Storico programmi

Calendario
├── Le mie sessioni
├── Annulla sessione (se >10h)
└── Richiedi sessione

Pagamenti
├── Situazione attuale
├── Rate in scadenza
└── Storico pagamenti

Contenuti
├── Podcast
├── Video
├── Documenti
└── Risorse

Diario
├── Le mie note
├── Nuova nota
└── Foto progressi

Chat
├── Chat con coach
└── Chat con titolare

Test Posturali
├── I miei test
└── Storico + progressi
```

---

## 5. Stack Tecnologico (Gratuito)

| Componente | Tecnologia | Costo |
|------------|------------|-------|
| **Framework** | React Native + Expo | Gratuito |
| **Backend** | Firebase | Gratuito (piano Spark) |
| **Database** | Firestore | Gratuito fino a 1GB |
| **Auth** | Firebase Auth | Gratuito |
| **Storage** | Firebase Storage | Gratuito fino a 5GB |
| **Notifiche** | Firebase Cloud Messaging | Gratuito |
| **AI Posturale** | TensorFlow.js + MoveNet | Gratuito |
| **Hosting Web** | Firebase Hosting | Gratuito |
| **CI/CD** | GitHub Actions | Gratuito |
| **App Store** | Google Play | €25 una tantum |
| **App Store** | Apple App Store | €99/anno |

### Limiti Piano Gratuito Firebase:
- 1GB storage Firestore
- 5GB storage file
- 50k letture/giorno
- 20k scritture/giorno
- 20k eliminazioni/giorno

**Nota:** Questi limiti sono più che sufficienti per iniziare. Se l'app cresce, si può passare al piano a consumo.

---

## 6. Roadmap Sviluppo

### Fase 1: Fondamenta (Settimane 1-2)
- [ ] Setup progetto React Native + Expo
- [ ] Configurazione Firebase
- [ ] Sistema autenticazione
- [ ] Struttura navigazione base
- [ ] UI Kit componenti base

### Fase 2: Core Features (Settimane 3-6)
- [ ] Gestione utenti e ruoli
- [ ] Calendario base
- [ ] Sistema sessioni
- [ ] CRUD programmi/esercizi

### Fase 3: Economia (Settimane 7-8)
- [ ] Sistema pagamenti/rate
- [ ] Calcolo percentuali
- [ ] Dashboard economica
- [ ] Gestione spese/ricavi

### Fase 4: Comunicazione (Settimane 9-10)
- [ ] Sistema chat
- [ ] Modalità anonima
- [ ] Notifiche push
- [ ] Contenuti speciali

### Fase 5: AI & Advanced (Settimane 11-12)
- [ ] Test posturali
- [ ] Analisi AI
- [ ] Diario allievo
- [ ] Report e statistiche

### Fase 6: Polish & Deploy (Settimane 13-14)
- [ ] Testing completo
- [ ] Ottimizzazione performance
- [ ] Pubblicazione Android
- [ ] Pubblicazione iOS

---

## 7. Prossimi Passi

1. **Creare repository GitHub** per il progetto
2. **Inizializzare progetto Expo** con React Native
3. **Configurare Firebase** (progetto + credenziali)
4. **Creare struttura cartelle** e componenti base
5. **Implementare autenticazione**

---

*Documento creato: 26 Gennaio 2026*
*Versione: 1.0*
