// App ESSĒRE - Calendar View Component
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { EventoCalendario } from '../../types';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import {
  getWeekDays,
  getDaysInMonth,
  isSameDay,
  GIORNI_SETTIMANA,
  MESI,
  raggruppaEventiPerGiorno,
} from '../../services/calendarService';

type ViewMode = 'giorno' | 'settimana' | 'mese';

interface CalendarViewProps {
  eventi: EventoCalendario[];
  onEventoPress?: (evento: EventoCalendario) => void;
  onDayPress?: (date: Date) => void;
  initialDate?: Date;
  showViewModeSelector?: boolean;
  collaboratoriColori?: Record<string, string>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  eventi,
  onEventoPress,
  onDayPress,
  initialDate = new Date(),
  showViewModeSelector = true,
  collaboratoriColori = {},
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('settimana');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const eventiPerGiorno = useMemo(() => raggruppaEventiPerGiorno(eventi), [eventi]);

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'giorno') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'settimana') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'giorno') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'settimana') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    onDayPress?.(date);
  };

  const getEventiForDate = (date: Date): EventoCalendario[] => {
    const dateKey = date.toISOString().split('T')[0];
    return eventiPerGiorno[dateKey] || [];
  };

  const renderHeader = () => {
    let title = '';
    if (viewMode === 'giorno') {
      title = currentDate.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } else if (viewMode === 'settimana') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      title = `${start.getDate()} - ${end.getDate()} ${MESI[end.getMonth()]} ${end.getFullYear()}`;
    } else {
      title = `${MESI[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={navigatePrev} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={navigateNext} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderViewModeSelector = () => {
    if (!showViewModeSelector) return null;

    return (
      <View style={styles.viewModeContainer}>
        {(['giorno', 'settimana', 'mese'] as ViewMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewModeButton,
              viewMode === mode && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === mode && styles.viewModeTextActive,
              ]}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderEvento = (evento: EventoCalendario) => {
    const colore = collaboratoriColori[evento.collaboratoreId || ''] || evento.colore;

    return (
      <TouchableOpacity
        key={evento.id}
        style={[styles.evento, { borderLeftColor: colore }]}
        onPress={() => onEventoPress?.(evento)}
      >
        <Text style={styles.eventoTime}>{evento.oraInizio} - {evento.oraFine}</Text>
        <Text style={styles.eventoTitle} numberOfLines={1}>{evento.titolo}</Text>
        {evento.descrizione && (
          <Text style={styles.eventoDesc} numberOfLines={1}>{evento.descrizione}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayCell = (date: Date, isHeader: boolean = false) => {
    const isToday = isSameDay(date, new Date());
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const dayEventi = getEventiForDate(date);
    const hasEvents = dayEventi.length > 0;

    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[
          styles.dayCell,
          isToday && styles.dayCellToday,
          isSelected && styles.dayCellSelected,
        ]}
        onPress={() => handleDayPress(date)}
      >
        {isHeader && (
          <Text style={styles.dayName}>
            {GIORNI_SETTIMANA[date.getDay() === 0 ? 6 : date.getDay() - 1]}
          </Text>
        )}
        <Text
          style={[
            styles.dayNumber,
            isToday && styles.dayNumberToday,
            isSelected && styles.dayNumberSelected,
          ]}
        >
          {date.getDate()}
        </Text>
        {hasEvents && (
          <View style={styles.eventIndicators}>
            {dayEventi.slice(0, 3).map((e, i) => (
              <View
                key={i}
                style={[
                  styles.eventDot,
                  { backgroundColor: collaboratoriColori[e.collaboratoreId || ''] || e.colore },
                ]}
              />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          {weekDays.map((day) => renderDayCell(day, true))}
        </View>

        <ScrollView style={styles.weekEvents}>
          {selectedDate && (
            <View style={styles.selectedDayEvents}>
              <Text style={styles.selectedDayTitle}>
                {selectedDate.toLocaleDateString('it-IT', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
              {getEventiForDate(selectedDate).length > 0 ? (
                getEventiForDate(selectedDate).map(renderEvento)
              ) : (
                <Text style={styles.noEventsText}>Nessun evento</Text>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Aggiungi giorni vuoti all'inizio per allineare con il giorno della settimana
    const firstDayOfMonth = days[0].getDay();
    const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    return (
      <View style={styles.monthContainer}>
        <View style={styles.monthHeader}>
          {GIORNI_SETTIMANA.map((day) => (
            <Text key={day} style={styles.monthDayName}>{day}</Text>
          ))}
        </View>

        <View style={styles.monthGrid}>
          {Array(emptyDays).fill(null).map((_, i) => (
            <View key={`empty-${i}`} style={styles.monthDayCell} />
          ))}
          {days.map((day) => {
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dayEventi = getEventiForDate(day);

            return (
              <TouchableOpacity
                key={day.toISOString()}
                style={[
                  styles.monthDayCell,
                  isToday && styles.monthDayCellToday,
                  isSelected && styles.monthDayCellSelected,
                ]}
                onPress={() => handleDayPress(day)}
              >
                <Text
                  style={[
                    styles.monthDayNumber,
                    isToday && styles.monthDayNumberToday,
                    isSelected && styles.monthDayNumberSelected,
                  ]}
                >
                  {day.getDate()}
                </Text>
                {dayEventi.length > 0 && (
                  <View style={styles.monthEventDots}>
                    {dayEventi.slice(0, 3).map((e, i) => (
                      <View
                        key={i}
                        style={[
                          styles.monthEventDot,
                          { backgroundColor: collaboratoriColori[e.collaboratoreId || ''] || e.colore },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDayView = () => {
    const dayEventi = getEventiForDate(currentDate);

    return (
      <ScrollView style={styles.dayContainer}>
        {dayEventi.length > 0 ? (
          dayEventi.map(renderEvento)
        ) : (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>Nessun evento per oggi</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderViewModeSelector()}

      {viewMode === 'giorno' && renderDayView()}
      {viewMode === 'settimana' && renderWeekView()}
      {viewMode === 'mese' && renderMonthView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  navButton: {
    padding: SPACING.sm,
  },
  navButtonText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: '300',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  viewModeContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    gap: SPACING.xs,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  viewModeTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // Week View
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dayCellToday: {
    backgroundColor: COLORS.primary + '10',
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  dayName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dayNumberToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayNumberSelected: {
    color: COLORS.primary,
  },
  eventIndicators: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 2,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekEvents: {
    flex: 1,
    padding: SPACING.md,
  },
  selectedDayEvents: {
    flex: 1,
  },
  selectedDayTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    textTransform: 'capitalize',
  },
  // Month View
  monthContainer: {
    flex: 1,
    padding: SPACING.sm,
  },
  monthHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  monthDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  monthDayCellToday: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  monthDayCellSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  monthDayNumber: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  monthDayNumberToday: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  monthDayNumberSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  monthEventDots: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 1,
  },
  monthEventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Day View
  dayContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  // Evento
  evento: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  eventoTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  eventoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventoDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  // No Events
  noEventsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  noEventsText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default CalendarView;
