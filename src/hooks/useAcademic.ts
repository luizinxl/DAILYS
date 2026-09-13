// ============================================================
// dailyS — Hook: useAcademic
// ============================================================
// Hook customizado para consumir dados acadêmicos do Supabase.
// Segue o padrão de useInvestments: um hook por domínio.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchAcademicTasks,
  fetchSyncState,
  fetchCalendarMonth,
  fetchTasksByDate,
  type AcademicFilters,
  type CalendarDayInfo,
} from '@/services/api/academicService';
import type { AcademicTask, AcademicSyncState, AcademicTaskType } from '@/types';

export interface UseAcademicReturn {
  /** Todas as tarefas acadêmicas (filtradas) */
  tasks: AcademicTask[];
  /** Estado de sincronização do scraper */
  syncState: AcademicSyncState | null;
  /** Dados do calendário mensal (pontos coloridos) */
  calendarDays: CalendarDayInfo[];
  /** Tarefas de um dia selecionado */
  selectedDayTasks: AcademicTask[];
  /** Loading state */
  loading: boolean;
  /** Erro, se houver */
  error: string | null;
  /** Recarregar dados */
  refresh: () => Promise<void>;
  /** Aplicar filtros */
  setFilters: (filters: AcademicFilters) => void;
  /** Selecionar um dia no calendário */
  selectDay: (date: string | null) => void;
  /** Mudar mês no calendário */
  setCalendarMonth: (year: number, month: number) => void;
  /** Contadores rápidos */
  counts: {
    total: number;
    urgent: number; // P1 + P2
    overdue: number;
    dueToday: number;
    peerReviewPending: number;
  };
}

export function useAcademic(): UseAcademicReturn {
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [syncState, setSyncState] = useState<AcademicSyncState | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDayInfo[]>([]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<AcademicTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AcademicFilters>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonthState] = useState(new Date().getMonth() + 1);

  // ---- Fetch principal ----
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tasksData, syncData, calendarData] = await Promise.all([
        fetchAcademicTasks(filters),
        fetchSyncState(),
        fetchCalendarMonth(calendarYear, calendarMonth),
      ]);

      setTasks(tasksData);
      setSyncState(syncData);
      setCalendarDays(calendarData);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar dados acadêmicos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters, calendarYear, calendarMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Selecionar dia ----
  const selectDay = useCallback(async (date: string | null) => {
    setSelectedDay(date);
    if (!date) {
      setSelectedDayTasks([]);
      return;
    }

    try {
      const dayTasks = await fetchTasksByDate(date);
      setSelectedDayTasks(dayTasks);
    } catch {
      setSelectedDayTasks([]);
    }
  }, []);

  // ---- Mudar mês ----
  const setCalendarMonth = useCallback((year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonthState(month);
  }, []);

  // ---- Contadores rápidos ----
  const counts = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    return {
      total: tasks.length,
      urgent: tasks.filter(
        (t) => t.priority === 'P1_critical' || t.priority === 'P2_high'
      ).length,
      overdue: tasks.filter((t) => t.status === 'overdue').length,
      dueToday: tasks.filter(
        (t) => t.due_date && t.due_date.substring(0, 10) === todayStr
      ).length,
      peerReviewPending: tasks.filter((t) => {
        if (t.task_type !== 'peer_review') return false;
        const pending = (t.peer_review_total || 0) - (t.peer_review_done || 0);
        return pending > 0;
      }).length,
    };
  }, [tasks]);

  return {
    tasks,
    syncState,
    calendarDays,
    selectedDayTasks,
    loading,
    error,
    refresh: fetchData,
    setFilters,
    selectDay,
    setCalendarMonth,
    counts,
  };
}
