// ============================================================
// dailyS Academic Scraper — Autenticação AVA (Moodle Univesp)
// ============================================================
// Login com Puppeteer, gestão de cookies para reutilização de sessão.
// Credenciais lidas EXCLUSIVAMENTE de variáveis de ambiente.
// ============================================================

import fs from 'node:fs/promises';
import type { Browser, Page, Cookie } from 'puppeteer';
import puppeteer from 'puppeteer';
import {
  COOKIES_PATH,
  AVA_LOGIN_URL,
  AVA_DASHBOARD_URL,
  PUPPETEER_CONFIG,
  getAvaCredentials,
} from './config.js';

// ---- Logger ----
function log(msg: string) {
  console.log(`[auth] ${new Date().toISOString()} — ${msg}`);
}

// ---- Cookies ----

async function saveCookies(page: Page): Promise<void> {
  const cookies = await page.cookies();
  await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2), 'utf-8');
  log(`Cookies salvos em ${COOKIES_PATH} (${cookies.length} cookies)`);
}

async function loadCookies(): Promise<Cookie[] | null> {
  try {
    const raw = await fs.readFile(COOKIES_PATH, 'utf-8');
    const cookies = JSON.parse(raw) as Cookie[];
    if (!Array.isArray(cookies) || cookies.length === 0) return null;
    log(`Cookies carregados de ${COOKIES_PATH} (${cookies.length} cookies)`);
    return cookies;
  } catch {
    log('Nenhum arquivo de cookies encontrado — será feito login completo');
    return null;
  }
}

// ---- Sessão válida? ----

async function isSessionValid(page: Page): Promise<boolean> {
  try {
    await page.goto(AVA_DASHBOARD_URL, { waitUntil: 'networkidle2', timeout: 20_000 });
    const url = page.url();

    // Se redirecionou para login, sessão expirada
    if (url.includes('/login/') || url.includes('univesp_login.php') || url.includes('login.univesp.br')) {
      log('Sessão expirada — cookies inválidos');
      return false;
    }

    // Verifica se o painel ou usuário está presente
    const hasUserContent = await page.$(
      '#user-menu-toggle, .usermenu, .userbutton, a[href*="logout"], .header-login, [data-region="drawer"]'
    );
    if (hasUserContent || url.includes('/my')) {
      log('Sessão válida — cookies reutilizados');
      return true;
    }

    log('Sessão ambígua — fazendo login por segurança');
    return false;
  } catch (err) {
    log(`Erro ao verificar sessão: ${err}`);
    return false;
  }
}

// ---- Login ----

async function performLogin(page: Page): Promise<boolean> {
  const { user, pass } = getAvaCredentials();

  log('Iniciando login no AVA...');
  await page.goto(AVA_LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30_000 });

  // 1. Digitar o username/e-mail no portal da Univesp
  const usernameSelector = '#username, input[name="username"]';
  await page.waitForSelector(usernameSelector, { timeout: 15_000 });
  await page.type(usernameSelector, user, { delay: 30 });
  await new Promise((r) => setTimeout(r, 1000));

  // 2. Se for login local (ex: CPF), o campo de senha aparece na própria página
  const isLocalPassVisible = await page
    .$eval('#password-group', (el) => el.classList.contains('show'))
    .catch(() => false);

  if (isLocalPassVisible) {
    log('Modo de autenticação local detectado — digitando senha...');
    await page.type('#password', pass, { delay: 30 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30_000 }).catch(() => {}),
      page.click('#login-button-default'),
    ]);
  } else {
    // 3. Caso padrão para aluno: redirecionamento SSO SAML para login.univesp.br
    log('Redirecionando para SSO SAML Univesp...');
    await page.click('#login-button-default');

    // Aguardar o campo de senha na página de SSO da Univesp (login.univesp.br)
    await page.waitForSelector('input[type="password"]', { timeout: 30_000 });
    log(`Página de autenticação atingida: ${page.url()}`);

    // Garantir que o campo de username no IdP está preenchido
    const idpUsernameVal = await page.$eval('#username', (el: any) => el.value).catch(() => '');
    if (!idpUsernameVal) {
      log('Preenchendo username no formulário IdP...');
      await page.$eval('#username', (el: any, val: string) => { el.value = val; }, user);
    }

    // Digitar a senha
    log('Digitando senha no IdP...');
    await page.type('input[type="password"]', pass, { delay: 30 });

    // Clicar em Entrar
    log('Enviando credenciais...');
    const submitBtn = await page.$('button[type="submit"], input[type="submit"], .btn-primary');
    if (submitBtn) {
      try {
        await submitBtn.click();
      } catch (err) {
        log('Botão não clicável, forçando clique via JS...');
        await page.evaluate((btn) => (btn as HTMLElement).click(), submitBtn);
      }
    } else {
      await page.keyboard.press('Enter');
    }

    // Aguardar ciclo de redirecionamento SAML POST de volta para o AVA
    log('Aguardando redirecionamento SAML...');
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30_000 });
    } catch {
      // Pode já ter finalizado a navegação
    }
    await new Promise((r) => setTimeout(r, 4000));
  }

  // 4. Validação final da sessão pós-login
  const finalUrl = page.url();
  log(`URL após login: ${finalUrl}`);

  if (
    finalUrl.includes('login.univesp.br') ||
    finalUrl.includes('/login/') ||
    finalUrl.includes('univesp_login.php')
  ) {
    const errorMsg = await page
      .$eval(
        '#error_box, .error, .alert-danger, .errormsg, .loginerrors',
        (el) => el.textContent?.trim() || ''
      )
      .catch(() => '');

    log(`❌ Login falhou: ${errorMsg || 'Ainda na página de login'}`);
    return false;
  }

  log('Login bem-sucedido!');
  await saveCookies(page);
  return true;
}

// ---- Interface pública ----

export interface AuthResult {
  browser: Browser;
  page: Page;
  success: boolean;
  error?: string;
}

/**
 * Abre um browser Puppeteer e retorna autenticado no AVA.
 * Tenta reusar cookies.json; se inválidos, faz login completo.
 */
export async function authenticate(): Promise<AuthResult> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: PUPPETEER_CONFIG.headless,
      defaultViewport: PUPPETEER_CONFIG.defaultViewport,
      args: [...PUPPETEER_CONFIG.args],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(PUPPETEER_CONFIG.timeout);

    // User-Agent realista para evitar bloqueio
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    );

    // Tentar carregar cookies existentes
    const savedCookies = await loadCookies();
    if (savedCookies) {
      await page.setCookie(...savedCookies);

      // Verificar se a sessão ainda é válida
      if (await isSessionValid(page)) {
        return { browser, page, success: true };
      }
    }

    // Cookies inválidos ou inexistentes — fazer login
    const loginOk = await performLogin(page);
    if (!loginOk) {
      return {
        browser,
        page,
        success: false,
        error: 'Falha no login do AVA. Verifique AVA_USER e AVA_PASS.',
      };
    }

    return { browser, page, success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    log(`ERRO fatal na autenticação: ${error}`);

    return {
      browser: browser!,
      page: (browser ? await browser.newPage() : null) as Page,
      success: false,
      error,
    };
  }
}

/**
 * Fecha o browser de forma segura.
 */
export async function closeBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close();
    log('Browser fechado');
  } catch (err) {
    log(`Erro ao fechar browser: ${err}`);
  }
}
