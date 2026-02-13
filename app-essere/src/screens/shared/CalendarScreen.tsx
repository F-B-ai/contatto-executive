// App ESSĒRE - Calendar Screen (Shared)
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CalendarView } from '../../components/calendar';
import { Loading } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { EventoCalendario, Sessione, User } from '../../types';
import {
  getEventiMese,
  getColoreCollaboratore,
  sessioneToEvento,
} from '../../services/calendarService';
import { getSessioniByDateRange } from '../../services/sessionService';
import { getUsersByRole, getAllCollaboratori } from '../../services/userService';
import { COLORS } from '../../constants/theme';

interface CalendarScreenProps {
  onSessionePress?: (sessioneId: string) => void;
  onAddSessione?: (date: Date) => void;
  collaboratoreId?: string; // Se specificato, mostra solo le sessioni di questo collaboratore
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  onSessionePress,
  onAddSessione,
  collaboratoreId,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eventi, setEventi] = useState<EventoCalendario[]>([]);
  const [collaboratoriColori, setCollaboratoriColori] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Carica i colori per i collaboratori
  const loadCollaboratoriColori = useCallback(async () => {
    try {
      const collaboratori = await getAllCollaboratori();
      const colori: Record<string, string> = {};

      collaboratori.forEach((collab, index) => {
        colori[collab.userId] = getColoreCollaboratore(index);
      });

      // Aggiungi anche il titolare con un colore
      if (user?.ruolo === 'titolare') {
        colori[user.id] = COLORS.titolare;
      }

      setCollaboratoriColori(colori);
    } catch (error) {
      console.error('Errore caricamento colori collaboratori:', error);
    }
  }, [user]);

  // Carica le sessioni e convertile in eventi
  const loadEventi = useCallback(async () => {
    try {
      setLoading(true);

      const anno = currentMonth.getFullYear();
      const mese = currentMonth.getMonth();

      // Calcola le date del mese
      const startDate = new Date(anno, mese, 1);
      const endDate = new Date(anno, mese + 1, 0, 23, 59, 59);

      // Carica le sessioni
      const sessioni = await getSessioniByDateRange(
        startDate,
        endDate,
        collaboratoreId || (user?.ruolo === 'collaboratore' ? user?.id : undefined)
      );

      // Carica i nomi degli allievi per le sessioni
      const allievi = await getUsersByRole('allievo');
      const allieviMap = new Map(allievi.map((a) => [a.id, a]));

      // Converti sessioni in eventi
      const newEventi: EventoCalendario[] = sessioni.map((sessione) => {
        const allievo = allieviMap.get(sessione.allievoId);
        const allievoNome = allievo ? `${allievo.nome} ${allievo.cognome}` : 'Allievo';

        // Trova l'indice del collaboratore per il colore
        const collabIndex = Object.keys(collaboratoriColori).indexOf(sessione.collaboratoreId);

        return {
          id: sessione.id,
          ...sessioneToEvento(sessione, allievoNome, collabIndex >= 0 ? collabIndex : 0),
        };
      });

      setEventi(newEventi);
    } catch (error) {
      console.error('Errore caricamento eventi:', error);
      Alert.alert('Errore', 'Impossibile caricare il calendario');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, collaboratoreId, user, collaboratoriColori]);

  useEffect(() => {
    loadCollaboratoriColori();
  }, [loadCollaboratoriColori]);

  useEffect(() => {
    if (Object.keys(collaboratoriColori).length > 0 || user?.ruolo === 'allievo') {
      loadEventi();
    }
  }, [loadEventi, collaboratoriColori, user]);

  const handleEventoPress = (evento: EventoCalendario) => {
    if (evento.sessioneId && onSessionePress) {
      onSessionePress(evento.sessioneId);
    }
  };

  const handleDayPress = (date: Date) => {
    if (onAddSessione && user?.ruolo !== 'allievo') {
      // Potresti mostrare un menu per aggiungere una nuova sessione
      // Per ora logghiamo solo
      console.log('Day pressed:', date);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Caricamento calendario..." />;
  }

  return (
    <View style={styles.container}>
      <CalendarView
        eventi={eventi}
        onEventoPress={handleEventoPress}
        onDayPress={handleDayPress}
        initialDate={currentMonth}
        collaboratoriColori={collaboratoriColori}
        showViewModeSelector={user?.ruolo !== 'allievo'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default CalendarScreen;
