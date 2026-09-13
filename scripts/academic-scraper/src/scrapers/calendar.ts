// ============================================================
// dailyS Academic Scraper — Calendar Scraper
// ============================================================
// Extrai eventos das páginas de calendário do Moodle:
//   - /calendar/view.php?view=upcoming (próximos eventos)
//   - /calendar/view.php?view=month    (visão mensal)
// ============================================================

import type { Page } from 'puppeteer';
import {
  AVA_CALENDAR_UPCOMING,
  AVA_CALENDAR_MONTH,
  AVA_BASE,
  type ScrapedItem,
  type ScrapedTaskType,
} from '../config.js';

function log(msg: string) {
  console.log(`[calendar] ${new Date().toISOString()} — ${msg}`);
}

/** Classifica o tipo de evento baseado no texto e ícone */
function classifyEventType(text: string, cssClass: string): ScrapedTaskType {
  const lower = text.toLowerCase();
  const cls = cssClass.toLowerCase();

  if (lower.includes('prova') || lower.includes('exame') || lower.includes('presencial')) {
    return 'exam';
  }
  if (lower.includes('avaliação entre pares') || lower.includes('peer') || lower.includes('workshop')) {
    return 'peer_review';
  }
  if (lower.includes('leitura') || lower.includes('reading') || lower.includes('livro')) {
    return 'reading';
  }
  if (lower.includes('quiz') || lower.includes('questionário') || lower.includes('teste')) {
    return 'quiz';
  }
  if (lower.includes('fórum') || lower.includes('forum') || lower.includes('discussão')) {
    return 'forum';
  }
  if (cls.includes('assign') || lower.includes('tarefa') || lower.includes('atividade') || lower.includes('enviar')) {
    return 'assignment';
  }

  return 'other';
}

/** Extrai nome da disciplina do texto do evento */
function extractCourseName(text: string): { courseName: string; courseCode: string } {
  // Padrões comuns no Moodle: "Curso: NomeDoCurso" ou "[CÓDIGO] ..."
  const coursePatterns = [
    /(?:curso|course)[:\s]+([^\n]+)/i,
    /\[([A-Z]{2,3}\d{2,5})\]/,
    /(COM\d{3}|DPA\d{5}|LET\d{3}|SOC\d{3})/i,
  ];

  for (const pattern of coursePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { courseName: match[1].trim(), courseCode: match[1].trim() };
    }
  }

  return { courseName: 'Geral', courseCode: 'GERAL' };
}

/**
 * Scrape da página de eventos próximos (/calendar/view.php?view=upcoming)
 */
async function scrapeUpcoming(page: Page): Promise<ScrapedItem[]> {
  log('Acessando calendário — upcoming...');
  await page.goto(AVA_CALENDAR_UPCOMING, { waitUntil: 'networkidle2', timeout: 30_000 });

  const items: ScrapedItem[] = [];

  // Moodle lista eventos com classe .event / .card / div[data-event-id]
  const events = await page.$$eval(
    '.event, [data-event-id], .calendar_event_course, .list-group-item',
    (elements) =>
      elements.map((el) => ({
        id: el.getAttribute('data-event-id') || '',
        text: (el.textContent || '').trim(),
        html: el.innerHTML || '',
        cssClass: el.className || '',
        links: Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) => ({
          href: a.getAttribute('href') || '',
          text: (a.textContent || '').trim(),
        })),
      }))
  );

  log(`Encontrados ${events.length} eventos no upcoming`);

  for (const event of events) {
    if (!event.text || event.text.length < 5) continue;

    const taskType = classifyEventType(event.text, event.cssClass);
    const { courseName, courseCode } = extractCourseName(event.text);

    // Extrair data/hora do evento
    const dateTimeMatch = event.text.match(
      /(\d{1,2})\s+(?:de\s+)?(\w+)\s*(?:de\s+)?(\d{4})?\s*,?\s*(\d{1,2}:\d{2})?/i
    );

    let dueDate: string | undefined;
    if (dateTimeMatch) {
      dueDate = parseBrDate(dateTimeMatch[1], dateTimeMatch[2], dateTimeMatch[3], dateTimeMatch[4]);
    }

    // Extrair link direto
    const activityLink = event.links.find(
      (l) => l.href.includes('/mod/') || l.href.includes('/assign/') || l.href.includes('/quiz/')
    );
    const avaUrl = activityLink
      ? (activityLink.href.startsWith('http') ? activityLink.href : `${AVA_BASE}${activityLink.href}`)
      : AVA_CALENDAR_UPCOMING;

    // Gerar ID único
    const idMoodle = event.id
      ? `cal_${event.id}`
      : `cal_${taskType}_${hashString(event.text.substring(0, 100))}`;

    // Extrair título (primeira linha significativa)
    const title = event.text.split('\n').find((line: string) => line.trim().length > 3)?.trim() || event.text.substring(0, 100);

    items.push({
      idMoodle,
      title: title.substring(0, 200),
      description: event.text.substring(0, 500),
      courseName,
      courseCode,
      taskType,
      dueDate,
      hasNoDeadline: !dueDate,
      status: 'pending',
      avaUrl,
      rawData: {
        source: 'calendar_upcoming',
        eventId: event.id,
        originalText: event.text.substring(0, 300),
      },
    });
  }

  return items;
}

/**
 * Scrape da visão mensal (/calendar/view.php?view=month)
 * Foco em extrair períodos de prova (faixas contínuas)
 */
async function scrapeMonth(page: Page): Promise<ScrapedItem[]> {
  log('Acessando calendário — month...');
  await page.goto(AVA_CALENDAR_MONTH, { waitUntil: 'networkidle2', timeout: 30_000 });

  const items: ScrapedItem[] = [];

  // Moodle exibe eventos no calendário mensal como links dentro de cells <td>
  const dayEvents = await page.$$eval(
    '.calendar_event_course, [data-event-id], .day .events-new .event, td[data-day] a[href*="calendar"]',
    (elements) =>
      elements.map((el) => ({
        id: el.getAttribute('data-event-id') || '',
        text: (el.textContent || '').trim(),
        href: el.getAttribute('href') || '',
        cssClass: el.className || '',
        parentDay: el.closest('[data-day]')?.getAttribute('data-day') || '',
      }))
  );

  log(`Encontrados ${dayEvents.length} eventos no calendário mensal`);

  for (const event of dayEvents) {
    if (!event.text || event.text.length < 3) continue;

    const taskType = classifyEventType(event.text, event.cssClass);
    const { courseName, courseCode } = extractCourseName(event.text);

    const avaUrl = event.href.startsWith('http')
      ? event.href
      : event.href
        ? `${AVA_BASE}${event.href}`
        : AVA_CALENDAR_MONTH;

    const idMoodle = event.id
      ? `cal_month_${event.id}`
      : `cal_month_${hashString(event.text + event.parentDay)}`;

    items.push({
      idMoodle,
      title: event.text.substring(0, 200),
      courseName,
      courseCode,
      taskType,
      hasNoDeadline: false,
      status: 'pending',
      avaUrl,
      rawData: {
        source: 'calendar_month',
        eventId: event.id,
        day: event.parentDay,
      },
    });
  }

  return items;
}

/** Parseia data em português (ex: "15 de setembro de 2024, 23:59") para ISO */
function parseBrDate(day: string, month: string, year?: string, time?: string): string {
  const monthMap: Record<string, string> = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06',
    julho: '07', agosto: '08', setembro: '09',
    outubro: '10', novembro: '11', dezembro: '12',
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
  };

  const m = monthMap[month.toLowerCase()] || '01';
  const y = year || new Date().getFullYear().toString();
  const t = time || '23:59';

  return `${y}-${m}-${day.padStart(2, '0')}T${t}:00.000Z`;
}

/** Hash simples para gerar IDs determinísticos */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

/**
 * Scrape completo do calendário (upcoming + month).
 */
export async function scrapeCalendar(page: Page): Promise<ScrapedItem[]> {
  const upcoming = await scrapeUpcoming(page);
  const monthly = await scrapeMonth(page);

  // Deduplicar entre upcoming e monthly pelo idMoodle
  const seen = new Set(upcoming.map((i) => i.idMoodle));
  const unique = [...upcoming];

  for (const item of monthly) {
    if (!seen.has(item.idMoodle)) {
      seen.add(item.idMoodle);
      unique.push(item);
    }
  }

  log(`Total calendário: ${unique.length} itens únicos (${upcoming.length} upcoming + ${monthly.length} monthly - duplicatas)`);
  return unique;
}
