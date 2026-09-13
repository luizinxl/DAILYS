import { Card } from '@/components/common/Card';
import { useModuleColors, defaultModuleColors } from '@/hooks/useModuleColors';

export default function Financas() {
  const { colors } = useModuleColors();
  const themeColor = colors['financas'] || defaultModuleColors['financas'] || '#10B981';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: themeColor }}>
          Finanças
        </h1>
        <p className="text-[#8E95A5] text-sm mt-1">Contas, cartões, orçamento, metas e projeções.</p>
      </div>
      <Card variant="financial" className="p-6">
        <p className="text-sm text-[#D1D5DB] leading-relaxed">
          🚧 Módulo em construção. Estrutura, tipos e serviços já estão no repositório —
          o Antigravity expande esta tela a partir daqui.
        </p>
      </Card>
    </div>
  );
}
