import { Card } from '@/components/common/Card';
import { BookOpen, Wallet, TrendingUp, User } from 'lucide-react';

const quick = [
  { icon: BookOpen, label: 'Tarefas ativas', value: '—', variant: 'academic' as const },
  { icon: Wallet, label: 'Saldo do mês', value: '—', variant: 'financial' as const },
  { icon: TrendingUp, label: 'Carteira', value: '—', variant: 'financial' as const },
  { icon: User, label: 'Cursos em andamento', value: '—', variant: 'personal' as const },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seu dia</h1>
        <p className="text-[#8A92A8] mt-1">Visão geral de tudo em um lugar só.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quick.map((q) => (
          <Card key={q.label} variant={q.variant}>
            <q.icon className="text-[#7080FE] mb-3" size={22} />
            <div className="text-2xl font-bold">{q.value}</div>
            <div className="text-xs text-[#8A92A8] mt-1">{q.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card variant="academic">
          <h2 className="text-lg font-semibold mb-2">📚 Próximas tarefas</h2>
          <p className="text-sm text-[#8A92A8]">
            Conecte o Supabase e sincronize suas tarefas para vê-las aqui.
          </p>
        </Card>
        <Card variant="financial">
          <h2 className="text-lg font-semibold mb-2">💰 Resumo financeiro</h2>
          <p className="text-sm text-[#8A92A8]">
            Conecte o Pluggy para importar contas, cartões e transações.
          </p>
        </Card>
      </div>
    </div>
  );
}
