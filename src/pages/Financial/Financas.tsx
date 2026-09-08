import { Card } from '@/components/common/Card';

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finanças</h1>
        <p className="text-[#8A92A8] mt-1">Contas, cartões, orçamento, metas e projeções.</p>
      </div>
      <Card variant="financial">
        <p className="text-sm text-[#B8BFCC]">
          🚧 Módulo em construção. Estrutura, tipos e serviços já estão no repositório —
          o Antigravity expande esta tela a partir daqui.
        </p>
      </Card>
    </div>
  );
}
