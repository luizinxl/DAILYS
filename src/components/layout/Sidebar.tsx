import { NavLink } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  CheckSquare,
  Wallet,
  TrendingUp,
  User,
  Settings,
  Home as House,
} from 'lucide-react';
import clsx from 'clsx';
import Logo from '@/components/common/Logo';

const modules = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/academico', label: 'Acadêmico', icon: GraduationCap },
  { to: '/tarefas', label: 'Tarefas', icon: CheckSquare },
  { to: '/financas', label: 'Finanças', icon: Wallet },
  { to: '/investimentos', label: 'Invest', icon: TrendingUp },
  { to: '/pessoal', label: 'Pessoal', icon: User },
  { to: '/casa', label: 'Casa', icon: House },
  { to: '/configuracoes', label: 'Config', icon: Settings },
];


export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-[#12141C] py-6 flex flex-col justify-between overflow-y-auto min-h-screen">
      <div>
        {/* Logo */}
        <div className="px-6 py-4 flex items-center justify-between min-h-[80px] overflow-visible">
          <Logo size="lg" className="w-full" />
        </div>

        {/* Módulos */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between px-3 pt-2 pb-2 text-[11px] uppercase tracking-wider text-[#636A7E] font-semibold">
            <span>MÓDULOS</span>
          </div>
          <div className="space-y-1">
            {modules.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#7C5CFC]/15 text-[#7C5CFC]'
                      : 'text-[#8E95A5] hover:text-white hover:bg-[#1A1D27]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <it.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar (Avatar do Usuário) */}
      <div className="px-4 mt-6">
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-[#1A1D27] cursor-pointer transition-colors border border-transparent hover:border-[#202535]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C5CFC] to-[#4F46E5] flex items-center justify-center text-white font-bold text-xs">
            L
          </div>
          <div className="flex-1 flex flex-col">
            <span className="text-sm font-medium text-white">luiz</span>
            <span className="text-[11px] text-[#8E95A5]">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
