// ============================================================
// dailyS Academic Scraper — Gerador de Notificação
// ============================================================
// Gera payloads diferenciados para manhã vs noite:
//
// Manhã (07h BRT): resumo completo — tudo que vence hoje, começa
//   hoje, provas próximas, peer reviews pendentes, leituras.
//
// Noite (19h BRT): delta — só o que mudou desde a manhã (novos,
//   prazo alterado, vencendo nas próximas 12h).
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig, getUserId, type ExecutionMode } from './config.js';
import type { ClassifiedItem } from './classifier.js';
import type { SyncResult, ChangeRecord } from './sync.js';

function log(msg: string) {
  console.log(`[notifier] ${new Date().toISOString()} — ${msg}`);
}

// ---- Payload types ----

export interface MorningPayload {
  type: 'morning_summary';
  timestamp: string;
  dueToday: NotificationItem[];
  startsToday: NotificationItem[];
  examsUpcoming: NotificationItem[];
  peerReviewsPending: NotificationItem[];
  readingsThisWeek: NotificationItem[];
  overdue: NotificationItem[];
  summary: string;
}

export interface EveningPayload {
  type: 'evening_delta';
  timestamp: string;
  newItems: NotificationItem[];
  deadlineChanged: NotificationItem[];
  dueNext12h: NotificationItem[];
  changesSinceMorning: ChangeRecord[];
  summary: string;
}

export type NotificationPayload = MorningPayload | EveningPayload;

export interface NotificationItem {
  idMoodle: string;
  title: string;
  courseName: string;
  courseCode: string;
  taskType: string;
  priority: string;
  dueDate?: string;
  status: string;
  avaUrl: string;
  estimatedHours: number;
  /** Mensagem formatada para exibição */
  displayMessage: string;
}

/** Converte ClassifiedItem para NotificationItem */
function toNotificationItem(item: ClassifiedItem): NotificationItem {
  const hoursLeft = item.dueDate
    ? Math.round((new Date(item.dueDate).getTime() - Date.now()) / (1000 * 60 * 60))
    : null;

  let displayMessage = `[${item.priority}] ${item.courseName}: ${item.title}`;
  if (hoursLeft !== null && hoursLeft > 0) {
    displayMessage += ` — ${hoursLeft}h restantes`;
  } else if (hoursLeft !== null && hoursLeft <= 0) {
    displayMessage += ' — VENCIDO';
  } else if (item.hasNoDeadline) {
    displayMessage += ' — sem prazo definido';
  }

  if (item.taskType === 'peer_review' && item.peerReviewTotal) {
    const pending = (item.peerReviewTotal || 0) - (item.peerReviewDone || 0);
    displayMessage += ` (${pending} avaliações pendentes)`;
  }

  return {
    idMoodle: item.idMoodle,
    title: item.title,
    courseName: item.courseName,
    courseCode: item.courseCode,
    taskType: item.taskType,
    priority: item.priority,
    dueDate: item.dueDate,
    status: item.status,
    avaUrl: item.avaUrl,
    estimatedHours: item.estimatedHours,
    displayMessage,
  };
}

/** Verifica se uma data é "hoje" no fuso de Brasília */
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  // Ajustar para BRT (UTC-3)
  const brtOffset = -3 * 60;
  const dateInBrt = new Date(date.getTime() + brtOffset * 60 * 1000);
  const nowInBrt = new Date(now.getTime() + brtOffset * 60 * 1000);
  return (
    dateInBrt.getFullYear() === nowInBrt.getFullYear() &&
    dateInBrt.getMonth() === nowInBrt.getMonth() &&
    dateInBrt.getDate() === nowInBrt.getDate()
  );
}

/** Verifica se uma data está nas próximas N horas */
function isWithinHours(dateStr?: string, hours: number = 12): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr).getTime();
  const now = Date.now();
  const limit = now + hours * 60 * 60 * 1000;
  return date > now && date <= limit;
}

/** Verifica se estamos na semana corrente (ou próxima) */
function isCurrentWeek(weekNumber?: number): boolean {
  if (!weekNumber) return false;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const currentWeek = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  return weekNumber === currentWeek || weekNumber === currentWeek + 1;
}

/**
 * Gera payload de notificação MANHÃ.
 * Resumo completo do dia.
 */
function generateMorningPayload(items: ClassifiedItem[]): MorningPayload {
  const activeItems = items.filter(
    (i) => i.status !== 'completed' && i.status !== 'submitted' && i.status !== 'cancelled'
  );

  const dueToday = activeItems
    .filter((i) => isToday(i.dueDate))
    .map(toNotificationItem);

  const startsToday = activeItems
    .filter((i) => isToday(i.startDate))
    .map(toNotificationItem);

  const examsUpcoming = activeItems
    .filter((i) => i.taskType === 'exam')
    .map(toNotificationItem);

  const peerReviewsPending = activeItems
    .filter((i) => {
      if (i.taskType !== 'peer_review') return false;
      const pending = (i.peerReviewTotal || 0) - (i.peerReviewDone || 0);
      return pending > 0;
    })
    .map(toNotificationItem);

  const readingsThisWeek = activeItems
    .filter((i) => i.taskType === 'reading' && (isCurrentWeek(i.weekNumber) || isToday(i.dueDate)))
    .map(toNotificationItem);

  const overdue = activeItems
    .filter((i) => i.status === 'overdue' || (i.dueDate && new Date(i.dueDate).getTime() < Date.now()))
    .map(toNotificationItem);

  // Resumo textual
  const parts: string[] = [];
  if (dueToday.length) parts.push(`${dueToday.length} vence(m) hoje`);
  if (startsToday.length) parts.push(`${startsToday.length} começa(m) hoje`);
  if (examsUpcoming.length) parts.push(`${examsUpcoming.length} prova(s) próxima(s)`);
  if (peerReviewsPending.length) parts.push(`${peerReviewsPending.length} avaliação(ões) entre pares pendente(s)`);
  if (overdue.length) parts.push(`⚠ ${overdue.length} vencido(s)`);

  const summary = parts.length > 0
    ? `🌅 Resumo da manhã: ${parts.join(', ')}.`
    : '🌅 Sem atividades urgentes para hoje. Bom dia!';

  log(`Payload manhã: ${summary}`);

  return {
    type: 'morning_summary',
    timestamp: new Date().toISOString(),
    dueToday,
    startsToday,
    examsUpcoming,
    peerReviewsPending,
    readingsThisWeek,
    overdue,
    summary,
  };
}

/**
 * Gera payload de notificação NOITE.
 * Apenas mudanças desde a manhã + o que vence nas próximas 12h.
 */
function generateEveningPayload(
  items: ClassifiedItem[],
  syncResult: SyncResult
): EveningPayload {
  const activeItems = items.filter(
    (i) => i.status !== 'completed' && i.status !== 'submitted' && i.status !== 'cancelled'
  );

  // Novos itens detectados nesta sync
  const newChanges = syncResult.changes.filter((c) => c.changeType === 'new');
  const newItems = activeItems
    .filter((i) => newChanges.some((c) => c.idMoodle === i.idMoodle))
    .map(toNotificationItem);

  // Prazo alterado
  const deadlineChanges = syncResult.changes.filter((c) => c.changeType === 'deadline_changed');
  const deadlineChanged = activeItems
    .filter((i) => deadlineChanges.some((c) => c.idMoodle === i.idMoodle))
    .map(toNotificationItem);

  // Vence nas próximas 12h
  const dueNext12h = activeItems
    .filter((i) => isWithinHours(i.dueDate, 12))
    .map(toNotificationItem);

  // Resumo textual
  const parts: string[] = [];
  if (newItems.length) parts.push(`${newItems.length} nova(s) atividade(s)`);
  if (deadlineChanged.length) parts.push(`${deadlineChanged.length} prazo(s) alterado(s)`);
  if (dueNext12h.length) parts.push(`${dueNext12h.length} vence(m) nas próximas 12h`);

  const summary = parts.length > 0
    ? `🌙 Atualização noturna: ${parts.join(', ')}.`
    : '🌙 Sem mudanças desde a manhã. Boa noite!';

  log(`Payload noite: ${summary}`);

  return {
    type: 'evening_delta',
    timestamp: new Date().toISOString(),
    newItems,
    deadlineChanged,
    dueNext12h,
    changesSinceMorning: syncResult.changes,
    summary,
  };
}

/**
 * Gera o payload de notificação e salva em notification_history.
 */
export async function generateNotification(
  items: ClassifiedItem[],
  syncResult: SyncResult,
  mode: ExecutionMode
): Promise<NotificationPayload> {
  const payload = mode === 'morning'
    ? generateMorningPayload(items)
    : generateEveningPayload(items, syncResult);

  // Salvar em notification_history
  try {
    const { url, key } = getSupabaseConfig();
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const userId = getUserId();

    const hasContent = mode === 'morning'
      ? (payload as MorningPayload).dueToday.length > 0
        || (payload as MorningPayload).overdue.length > 0
        || (payload as MorningPayload).examsUpcoming.length > 0
      : (payload as EveningPayload).newItems.length > 0
        || (payload as EveningPayload).deadlineChanged.length > 0
        || (payload as EveningPayload).dueNext12h.length > 0;

    if (hasContent) {
      await supabase.from('notification_history').insert({
        user_id: userId,
        notification_type: mode === 'morning' ? 'academic_morning_summary' : 'academic_evening_delta',
        title: payload.summary.substring(0, 200),
        message: JSON.stringify(payload),
        related_to: 'academic_task',
        channels: ['push'],
      });
      log('Notificação salva em notification_history');
    } else {
      log('Sem conteúdo relevante — notificação não salva');
    }
  } catch (err) {
    log(`⚠ Erro ao salvar notificação: ${err}`);
  }

  return payload;
}
