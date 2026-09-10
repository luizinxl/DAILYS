import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/common/Card';
import { supabase } from '../../config/supabase';

interface Receipt {
  id: string;
  merchant: string | null;
  total_amount: number | null;
  purchased_at: string | null;
  raw_text: string | null;
  created_at: string;
}

function parseReceiptText(text: string) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const merchant = lines[0] ?? null;

  let total: number | null = null;
  const totalLineRegex = /(total|valor total|total a pagar)/i;
  const numberRegex = /(\d{1,3}(?:\.\d{3})*,\d{2}|\d+[.,]\d{2})/;
  for (const line of lines) {
    if (totalLineRegex.test(line)) {
      const match = line.match(numberRegex);
      if (match) {
        const normalized = match[1].replace(/\./g, '').replace(',', '.');
        const value = parseFloat(normalized);
        if (!isNaN(value)) {
          total = value;
        }
      }
    }
  }
  return { merchant, total };
}

function IntegrationRow({ name, status, detail }: { name: string; status: 'ok' | 'pendente' | 'nao_configurado'; detail: string }) {
  const colors: Record<string, string> = {
    ok: '#2ECC71',
    pendente: '#F5A623',
    nao_configurado: '#64748B',
  };
  const labels: Record<string, string> = {
    ok: 'Conectado',
    pendente: 'Parcial',
    nao_configurado: 'Não configurado',
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#232735] last:border-b-0">
      <div>
        <p className="text-sm text-white font-medium">{name}</p>
        <p className="text-xs text-[#8E95A5] mt-0.5">{detail}</p>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ color: colors[status], backgroundColor: `${colors[status]}1A` }}>
        {labels[status]}
      </span>
    </div>
  );
}

export default function Page() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReceipts = useCallback(async () => {
    setLoadingReceipts(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error) setReceipts(data ?? []);
    setLoadingReceipts(false);
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrError(null);
    setOcrStatus('Lendo imagem...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('por');
      setOcrStatus('Reconhecendo texto (OCR)...');
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const { merchant, total } = parseReceiptText(data.text);

      const { error: insertError } = await supabase.from('receipts').insert({
        merchant,
        total_amount: total,
        raw_text: data.text,
        purchased_at: new Date().toISOString().slice(0, 10),
      });
      if (insertError) throw insertError;

      setOcrStatus('Nota fiscal processada com sucesso.');
      await fetchReceipts();
    } catch (err: any) {
      setOcrError(err?.message ?? 'Erro ao processar a nota fiscal.');
      setOcrStatus(null);
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Configurações</h1>
        <p className="text-[#8E95A5] text-sm mt-1">Integrações, preferências e o agente de nota fiscal.</p>
      </div>

      <Card variant="default" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Nota Fiscal (OCR)</h2>
        <p className="text-xs text-[#8E95A5] mb-4">Envie uma foto ou print da nota fiscal para extrair o total automaticamente. Processado no seu navegador — nenhuma imagem é enviada a terceiros.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={ocrLoading}
          className="hidden"
          id="receipt-upload"
        />
        <label
          htmlFor="receipt-upload"
          className={`inline-block px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${ocrLoading ? 'bg-[#1D2029] text-[#64748B] cursor-not-allowed' : 'bg-[#7C5CFC] hover:bg-[#6D4AEF] text-white'}`}
        >
          {ocrLoading ? (ocrStatus ?? 'Processando...') : 'Enviar nota fiscal'}
        </label>

        {ocrError && <p className="text-sm text-[#F43F5E] mt-3">{ocrError}</p>}
        {!ocrLoading && ocrStatus && !ocrError && <p className="text-sm text-[#2ECC71] mt-3">{ocrStatus}</p>}

        <div className="mt-5 space-y-2">
          {!loadingReceipts && receipts.length === 0 && (
            <p className="text-sm text-[#8E95A5]">Nenhuma nota fiscal enviada ainda.</p>
          )}
          {receipts.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg bg-[#1D2029] border border-[#232735] px-3 py-2">
              <span className="text-sm text-white">{r.merchant ?? 'Estabelecimento não identificado'}</span>
              <span className="text-sm font-semibold text-[#2ECC71]">
                {r.total_amount != null ? `R$ ${r.total_amount.toFixed(2)}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="default" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Integrações</h2>
        <IntegrationRow name="Supabase" status="ok" detail="Banco de dados e autenticação" />
        <IntegrationRow name="brapi (cotações)" status="pendente" detail="Sem token configurado — dólar e maiores altas/baixas ficam vazios" />
        <IntegrationRow name="Pluggy (Open Finance)" status="nao_configurado" detail="Conecte pelo card na aba Início ou Investimentos" />
        <IntegrationRow name="Gmail (leitura de faturas)" status="nao_configurado" detail="Precisa de credenciais OAuth do Google Cloud" />
        <IntegrationRow name="Google Calendar (somente leitura)" status="nao_configurado" detail="Precisa de credenciais OAuth do Google Cloud" />
        <IntegrationRow name="Notificações (SendGrid + push)" status="nao_configurado" detail="Precisa de uma API key do SendGrid" />
        <IntegrationRow name="Agente AVA (Antigravity)" status="nao_configurado" detail="Bloqueado — aguardando decisão sobre credenciais de login" />
      </Card>

      <Card variant="default" className="p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Preferências</h2>
        <p className="text-xs text-[#8E95A5]">Tema escuro (fundo preto puro) fixo no momento. Mais preferências chegam aqui conforme os módulos forem sendo implementados.</p>
      </Card>
    </div>
  );
}
