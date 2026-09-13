// ============================================================
// dailyS Academic Scraper — Classificador de Prioridade
// ============================================================
// Classifica ScrapedItems em P1-P4 e estima tempo de execução.
//
// P1_critical: vence ≤24h, prova ≤48h, peer review pendente ≤24h
// P2_high:     vence ≤72h, prova ≤7 dias
// P3_normal:   vence ≤14 dias, leitura da semana corrente
// P4_low:      >14 dias, sem prazo definido
// ============================================================

import {
  type ScrapedItem,
  type Priority,
  PRIORITY_THRESHOLDS,
  TIME_ESTIMATES,
} from './config.js';

function log(msg: string) {
  console.log(`[classifier] ${new Date().toISOString()} — ${msg}`);
}

export interface ClassifiedItem extends ScrapedItem {
  priority: Priority;
  priorityScore: number;
  estimatedHours: number;
}

/**
 * Calcula horas até o prazo a partir de agora.
 * Retorna Infinity se não há prazo.
 */
function hoursUntilDue(dueDate?: string): number {
  if (!dueDate) return Infinity;

  const due = new Date(dueDate).getTime();
  const now = Date.now();

  if (isNaN(due)) return Infinity;

  return (due - now) / (1000 * 60 * 60);
}

/**
 * Calcula a semana atual do ano.
 */
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil(diff / oneWeek);
}

/**
 * Classifica um item com prioridade P1-P4.
 * Retorna prioridade + score numérico (0-300, maior = mais urgente).
 */
function classifyPriority(item: ScrapedItem): { priority: Priority; priorityScore: number } {
  // Itens já concluídos ou cancelados → P4
  if (item.status === 'completed' || item.status === 'submitted' || item.status === 'cancelled') {
    return { priority: 'P4_low', priorityScore: 0 };
  }

  const hours = hoursUntilDue(item.dueDate);
  const isExam = item.taskType === 'exam';
  const isPeerReview = item.taskType === 'peer_review';
  const isReading = item.taskType === 'reading';

  // ---- P1: Crítico ----
  // Vence em ≤24h
  if (hours <= PRIORITY_THRESHOLDS.P1_HOURS && hours > -Infinity) {
    const score = 300 - Math.max(0, hours); // quanto mais perto, maior o score
    return { priority: 'P1_critical', priorityScore: Math.round(score) };
  }
  // Prova em ≤48h
  if (isExam && hours <= PRIORITY_THRESHOLDS.P1_EXAM_HOURS) {
    return { priority: 'P1_critical', priorityScore: 280 };
  }
  // Peer review com pendências vencendo em ≤24h
  if (isPeerReview && hours <= PRIORITY_THRESHOLDS.P1_HOURS) {
    const pending = (item.peerReviewTotal || 0) - (item.peerReviewDone || 0);
    if (pending > 0) {
      return { priority: 'P1_critical', priorityScore: 290 };
    }
  }
  // Item já vencido (overdue) mas não completo
  if (item.status === 'overdue' || (hours < 0 && hours !== -Infinity)) {
    return { priority: 'P1_critical', priorityScore: 295 };
  }

  // ---- P2: Alto ----
  // Vence em ≤72h
  if (hours <= PRIORITY_THRESHOLDS.P2_HOURS) {
    const score = 200 + Math.round((PRIORITY_THRESHOLDS.P2_HOURS - hours) * 2);
    return { priority: 'P2_high', priorityScore: Math.min(score, 270) };
  }
  // Prova em ≤7 dias
  if (isExam && hours <= PRIORITY_THRESHOLDS.P2_EXAM_DAYS * 24) {
    return { priority: 'P2_high', priorityScore: 220 };
  }

  // ---- P3: Normal ----
  // Vence em ≤14 dias
  if (hours <= PRIORITY_THRESHOLDS.P3_DAYS * 24) {
    const daysLeft = hours / 24;
    const score = 100 + Math.round((PRIORITY_THRESHOLDS.P3_DAYS - daysLeft) * 5);
    return { priority: 'P3_normal', priorityScore: Math.min(score, 190) };
  }
  // Leitura da semana corrente
  if (isReading && item.weekNumber) {
    const currentWeek = getCurrentWeekNumber();
    if (item.weekNumber === currentWeek || item.weekNumber === currentWeek + 1) {
      return { priority: 'P3_normal', priorityScore: 110 };
    }
  }

  // ---- P4: Baixo ----
  // Mais de 14 dias, sem prazo definido, ou leitura futura
  const score = hours === Infinity ? 10 : Math.round(Math.max(0, 90 - hours / 24));
  return { priority: 'P4_low', priorityScore: Math.max(score, 5) };
}

/**
 * Estima horas de trabalho baseado no tipo da tarefa.
 */
function estimateHours(item: ScrapedItem): number {
  let base = TIME_ESTIMATES[item.taskType] || 2;

  // Peer review: ajustar pelo número de avaliações pendentes
  if (item.taskType === 'peer_review') {
    const pending = Math.max(0, (item.peerReviewTotal || 0) - (item.peerReviewDone || 0));
    base = pending * TIME_ESTIMATES.peer_review;
  }

  return base;
}

/**
 * Classifica todos os itens extraídos.
 * Retorna a lista classificada, ordenada por prioridade (P1 primeiro).
 */
export function classifyItems(items: ScrapedItem[]): ClassifiedItem[] {
  const classified = items.map((item) => {
    const { priority, priorityScore } = classifyPriority(item);
    const estimatedHours = estimateHours(item);

    return {
      ...item,
      priority,
      priorityScore,
      estimatedHours,
    };
  });

  // Ordenar: P1 > P2 > P3 > P4, dentro de cada nível por score decrescente
  classified.sort((a, b) => b.priorityScore - a.priorityScore);

  // Log de distribuição
  const dist = { P1: 0, P2: 0, P3: 0, P4: 0 };
  for (const item of classified) {
    if (item.priority === 'P1_critical') dist.P1++;
    else if (item.priority === 'P2_high') dist.P2++;
    else if (item.priority === 'P3_normal') dist.P3++;
    else dist.P4++;
  }
  log(`Classificação: P1=${dist.P1} P2=${dist.P2} P3=${dist.P3} P4=${dist.P4} (total=${classified.length})`);

  const totalHours = classified.reduce((sum, i) => sum + i.estimatedHours, 0);
  log(`Tempo total estimado: ${totalHours.toFixed(1)}h`);

  return classified;
}
