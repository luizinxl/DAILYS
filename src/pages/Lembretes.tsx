import { Card } from '@/components/common/Card';
import { useModuleColors } from '@/hooks/useModuleColors';

export default function Page() {
  const { colors, defaultModuleColors } = useModuleColors();
  const themeColor = colors['lembretes'] || defaultModuleColors['lembretes'] || '#F43F5E';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: themeColor }}>
          Lembretes
        </h1>
        <p className="text-[#8E95A5] text-sm mt-1">Todos os seus lembretes e notificações.</p>
      </div>
      <Card variant="personal" className="p-6">
        <p className="text-sm text-[#D1D5DB] leading-relaxed">
          🚧 Módulo em construção. Estrutura, tipos e serviços já estão no repositório —
          o Antigravity expande esta tela a partir daqui.
        </p>
      </Card>
    </div>
  );
}
