// ============================================================
// dailyS Academic Scraper — Course Page Scraper
// ============================================================
// Percorre /course/view.php?id=X para cada disciplina e extrai:
//   - Atividades avaliativas (assignments, quizzes)
//   - Avaliações entre pares (workshops)
//   - Leituras obrigatórias
//   - Status de submissão
// ============================================================

import type { Page } from 'puppeteer';
import {
  AVA_BASE,
  type EnrolledCourse,
  type ScrapedItem,
  type ScrapedTaskType,
  type TaskStatus,
} from '../config.js';

function log(msg: string) {
  console.log(`[course] ${new Date().toISOString()} — ${msg}`);
}

/** Informação extraída de uma atividade Moodle */
interface MoodleActivity {
  id: string;
  title: string;
  modType: string; // assign, quiz, workshop, resource, page, url, forum, etc
  href: string;
  sectionName: string;
  completionState: string; // '', 'complete', 'incomplete'
  extraInfo: string;
}

/**
 * Extrai todas as atividades listadas na página do curso.
 */
async function extractActivities(page: Page): Promise<MoodleActivity[]> {
  return page.$$eval(
    '.activity, li[id^="module-"], .section .activity',
    (elements) =>
      elements.map((el) => {
        // ID do módulo Moodle
        const moduleId = el.id?.replace('module-', '') || el.getAttribute('data-id') || '';

        // Tipo do módulo (assign, quiz, workshop, resource, etc)
        const modType =
          el.getAttribute('data-modname') ||
          el.className.match(/modtype_(\w+)/)?.[1] ||
          '';

        // Link principal
        const link = el.querySelector('a[href*="/mod/"]') as HTMLAnchorElement | null;
        const href = link?.href || '';
        const title = (link?.textContent || el.querySelector('.instancename, .activityname')?.textContent || '').trim();

        // Seção (semana)
        const section = el.closest('.section')
          || el.closest('[data-sectionid]')
          || el.closest('li[id^="section-"]');
        const sectionName = (
          section?.querySelector('.sectionname, .section-title')?.textContent || ''
        ).trim();

        // Estado de conclusão
        const completionEl = el.querySelector(
          '.completion-info, [data-toggletype="manual"], .autocompletion, input[type="checkbox"]'
        );
        let completionState = '';
        if (completionEl) {
          const ariaChecked = completionEl.getAttribute('aria-checked');
          const dataValue = completionEl.getAttribute('data-value');
          if (ariaChecked === 'true' || dataValue === '1') {
            completionState = 'complete';
          } else {
            completionState = 'incomplete';
          }
        }

        // Info extra (datas, status)
        const extraInfo = (
          el.querySelector('.availabilityinfo, .contentafterlink, .activity-altcontent, .description')?.textContent || ''
        ).trim();

        return {
          id: moduleId,
          title: title.replace(/\s+/g, ' '),
          modType,
          href,
          sectionName,
          completionState,
          extraInfo,
        };
      })
  );
}

/** Mapeia mod type do Moodle para nosso tipo */
function mapModType(modType: string, title: string, extraInfo: string): ScrapedTaskType {
  const lowerTitle = title.toLowerCase();
  const lowerExtra = extraInfo.toLowerCase();

  switch (modType) {
    case 'assign':
      return 'assignment';
    case 'quiz':
      return 'quiz';
    case 'workshop':
      return 'peer_review';
    case 'forum':
      return 'forum';
    case 'resource':
    case 'page':
    case 'url':
    case 'book':
      return 'reading';
    default:
      // Fallback por texto
      if (lowerTitle.includes('avaliação entre pares') || lowerTitle.includes('workshop')) return 'peer_review';
      if (lowerTitle.includes('leitura') || lowerTitle.includes('reading')) return 'reading';
      if (lowerTitle.includes('prova') || lowerTitle.includes('exame')) return 'exam';
      if (lowerTitle.includes('quiz') || lowerTitle.includes('questionário')) return 'quiz';
      if (lowerTitle.includes('fórum') || lowerTitle.includes('forum')) return 'forum';
      if (lowerTitle.includes('tarefa') || lowerTitle.includes('atividade')) return 'assignment';
      return 'other';
  }
}

/** Detecta status a partir do completion state e informações extras */
function detectStatus(completionState: string, extraInfo: string, modType: string): TaskStatus {
  const lower = extraInfo.toLowerCase();

  if (completionState === 'complete') return 'completed';
  if (lower.includes('enviado') || lower.includes('submitted') || lower.includes('entregue')) {
    return 'submitted';
  }
  if (lower.includes('atrasado') || lower.includes('overdue') || lower.includes('vencido')) {
    return 'overdue';
  }
  if (lower.includes('em andamento') || lower.includes('in progress')) {
    return 'in_progress';
  }

  return 'pending';
}

/** Extrai datas de strings como "Abertura: 01/09/2024" ou "Encerramento: 15/09/2024 23:59" */
function extractDates(text: string): { startDate?: string; dueDate?: string } {
  const result: { startDate?: string; dueDate?: string } = {};

  // Padrão brasileiro: dd/mm/yyyy HH:mm
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/g;
  const matches = [...text.matchAll(dateRegex)];

  // Padrão por extenso: "15 de setembro de 2024, 23:59"
  const extensoRegex = /(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/gi;
  const extensoMatches = [...text.matchAll(extensoRegex)];

  const allDates: string[] = [];

  for (const m of matches) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    const time = m[4] && m[5] ? `${m[4].padStart(2, '0')}:${m[5]}` : '23:59';
    allDates.push(`${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T${time}:00.000Z`);
  }

  const monthMap: Record<string, string> = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06', julho: '07',
    agosto: '08', setembro: '09', outubro: '10',
    novembro: '11', dezembro: '12',
  };

  for (const m of extensoMatches) {
    const monthNum = monthMap[m[2].toLowerCase()];
    if (monthNum) {
      const time = m[4] && m[5] ? `${m[4].padStart(2, '0')}:${m[5]}` : '23:59';
      allDates.push(`${m[3]}-${monthNum}-${m[1].padStart(2, '0')}T${time}:00.000Z`);
    }
  }

  // Heurística: primeiro date após "abertura" = startDate, último = dueDate
  const lower = text.toLowerCase();
  if (allDates.length >= 2) {
    result.startDate = allDates[0];
    result.dueDate = allDates[allDates.length - 1];
  } else if (allDates.length === 1) {
    if (lower.includes('abertura') || lower.includes('início') || lower.includes('início')) {
      result.startDate = allDates[0];
    } else {
      result.dueDate = allDates[0];
    }
  }

  return result;
}

/** Extrai número da semana a partir do nome da seção */
function extractWeekNumber(sectionName: string): number | undefined {
  const match = sectionName.match(/semana\s*(\d+)/i)
    || sectionName.match(/week\s*(\d+)/i)
    || sectionName.match(/^(\d+)\s*[-–]/);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Busca detalhes de submissão para atividades avaliativas.
 * Abre uma aba isolada temporária sem navegar para longe da página do curso.
 */
async function fetchActivityDetails(
  browser: import('puppeteer').Browser,
  href: string,
  modType: string
): Promise<{
  submittedAt?: string;
  peerReviewTotal?: number;
  peerReviewDone?: number;
  detailedDueDate?: string;
  detailedStartDate?: string;
  detailedStatus?: TaskStatus;
}> {
  const result: {
    submittedAt?: string;
    peerReviewTotal?: number;
    peerReviewDone?: number;
    detailedDueDate?: string;
    detailedStartDate?: string;
    detailedStatus?: TaskStatus;
  } = {};

  let tab: Page | null = null;
  try {
    tab = await browser.newPage();
    await tab.goto(href, { waitUntil: 'domcontentloaded', timeout: 10_000 });

    const pageText = await tab.$eval('body', (el) => el.textContent || '');
    const dates = extractDates(pageText);

    if (dates.startDate) result.detailedStartDate = dates.startDate;
    if (dates.dueDate) result.detailedDueDate = dates.dueDate;

    // Verificar status de submissão
    const submissionStatus = await tab.$$eval(
      '.submissionstatustable td, .submission-status, .submissionstatus, [class*="submission"]',
      (els) => els.map((e) => (e.textContent || '').trim())
    );

    for (const status of submissionStatus) {
      const lower = status.toLowerCase();
      if (lower.includes('enviado') || lower.includes('submitted')) {
        result.detailedStatus = 'submitted';
        // Tentar pegar data de envio
        const subDateMatch = status.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        if (subDateMatch) {
          const y = subDateMatch[3].length === 2 ? `20${subDateMatch[3]}` : subDateMatch[3];
          result.submittedAt = `${y}-${subDateMatch[2].padStart(2, '0')}-${subDateMatch[1].padStart(2, '0')}T00:00:00.000Z`;
        }
      } else if (lower.includes('nenhum envio') || lower.includes('no submission')) {
        result.detailedStatus = 'pending';
      }
    }

    // Se for workshop (peer review), extrair quantos faltam avaliar
    if (modType === 'workshop') {
      const assessmentInfo = await tab.$$eval(
        '.assessment-summary, .grading-report, table.submissions td, .assessmentform',
        (els) => els.map((e) => (e.textContent || '').trim())
      );

      const allText = assessmentInfo.join(' ');
      const totalMatch = allText.match(/(\d+)\s*(?:colegas?|submiss|trabalhos?|assessments?)/i);
      const doneMatch = allText.match(/(\d+)\s*(?:avaliados?|assessed|concluíd|done)/i);

      if (totalMatch) result.peerReviewTotal = parseInt(totalMatch[1], 10);
      if (doneMatch) result.peerReviewDone = parseInt(doneMatch[1], 10);
    }
  } catch (err) {
    log(`  ⚠ Erro ao buscar detalhes de ${href}: ${err}`);
  } finally {
    if (tab) {
      await tab.close().catch(() => {});
    }
  }

  return result;
}

/**
 * Scrape completo de uma disciplina.
 */
export async function scrapeCourse(
  page: Page,
  course: EnrolledCourse
): Promise<ScrapedItem[]> {
  if (!course.moodleCourseId) {
    log(`⏭ Pulando ${course.code} — sem moodleCourseId`);
    return [];
  }

  const courseUrl = `${AVA_BASE}/course/view.php?id=${course.moodleCourseId}`;
  log(`Acessando ${course.code} (id=${course.moodleCourseId})...`);

  await page.goto(courseUrl, { waitUntil: 'networkidle2', timeout: 30_000 });

  // Extrair lista de atividades
  const activities = await extractActivities(page);
  log(`  ${activities.length} atividades encontradas em ${course.code}`);

  const items: ScrapedItem[] = [];

  // Filtrar atividades avaliativas (ignorar resources simples que não têm prazo)
  const evaluableModTypes = ['assign', 'quiz', 'workshop', 'forum'];

  for (const activity of activities) {
    const taskType = mapModType(activity.modType, activity.title, activity.extraInfo);
    const isEvaluable = evaluableModTypes.includes(activity.modType)
      || taskType === 'assignment'
      || taskType === 'quiz'
      || taskType === 'peer_review';

    // Incluir leituras também (com ou sem prazo)
    const isReading = taskType === 'reading';

    if (!isEvaluable && !isReading) continue;
    if (!activity.title || activity.title.length < 3) continue;

    const status = detectStatus(activity.completionState, activity.extraInfo, activity.modType);
    const dates = extractDates(activity.extraInfo);
    const weekNumber = extractWeekNumber(activity.sectionName);

    const fullHref = activity.href.startsWith('http')
      ? activity.href
      : `${AVA_BASE}${activity.href}`;

    // Buscar detalhes em aba separada apenas se for workshop ou assignment pendente sem prazo claro
    let details: Awaited<ReturnType<typeof fetchActivityDetails>> = {};
    const shouldFetchDetails =
      (activity.modType === 'workshop' || activity.modType === 'assign') &&
      activity.href &&
      (!dates.dueDate || status === 'pending');

    if (shouldFetchDetails) {
      details = await fetchActivityDetails(page.browser(), fullHref, activity.modType);
    }

    const dueDate = details.detailedDueDate || dates.dueDate;
    const startDate = details.detailedStartDate || dates.startDate;
    const hasNoDeadline = !dueDate && (isReading || taskType === 'forum');

    const item: ScrapedItem = {
      idMoodle: activity.id
        ? `${activity.modType}_${activity.id}`
        : `${activity.modType}_${hashString(activity.title + course.code)}`,
      title: activity.title,
      description: activity.extraInfo || undefined,
      courseName: course.name,
      courseCode: course.code,
      taskType,
      startDate,
      dueDate,
      hasNoDeadline,
      status: details.detailedStatus || status,
      submittedAt: details.submittedAt,
      avaUrl: fullHref,
      peerReviewTotal: details.peerReviewTotal,
      peerReviewDone: details.peerReviewDone,
      weekNumber,
      rawData: {
        source: 'course_page',
        moodleCourseId: course.moodleCourseId,
        modType: activity.modType,
        sectionName: activity.sectionName,
        completionState: activity.completionState,
      },
    };

    items.push(item);
  }

  log(`  ${items.length} itens relevantes extraídos de ${course.code}`);
  return items;
}

/** Hash simples para gerar IDs determinísticos */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
