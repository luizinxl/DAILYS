import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import AcademicDashboard from '@/pages/Academic';
import Financas from '@/pages/Financial/Financas';
import Investimentos from '@/pages/Financial/Investimentos';
import Pessoal from '@/pages/Personal/Pessoal';
import Casa from '@/pages/Household/Casa';
import Compras from '@/pages/Household/Compras';
import Agenda from '@/pages/Agenda';
import Lembretes from '@/pages/Lembretes';
import Configuracoes from '@/pages/Settings/Configuracoes';
import { ModuleColorsProvider } from '@/hooks/useModuleColors';

export default function App() {
  return (
    <ModuleColorsProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/academico" element={<AcademicDashboard />} />
          <Route path="/tarefas" element={<AcademicDashboard />} />
          <Route path="/financas" element={<Financas />} />
          <Route path="/investimentos" element={<Investimentos />} />
          <Route path="/pessoal" element={<Pessoal />} />
          <Route path="/casa" element={<Casa />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/lembretes" element={<Lembretes />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Routes>
      </Layout>
    </ModuleColorsProvider>
  );
}
