import { NavLink } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Wallet,
  TrendingUp,
  User,
  Settings,
  Home as House,
  Pencil,
} from 'lucide-react';
import clsx from 'clsx';
import Logo from '@/components/common/Logo';

const modules = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/academico', label: 'Tarefas Acadêmicas', icon: GraduationCap },
  { to: '/casa', label: 'Tarefas Domésticas', icon: House },
  { to: '/financas', label: 'Finanças', icon: Wallet },
  { to: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { to: '/pessoal', label: 'Pessoal', icon: User },
  { to: '/configuracoes', label: 'Config', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 bg-[#12141C] py-6 flex flex-col justify-between overflow-y-auto min-h-screen">
      <div>
        {/* Logo */}
        <div className="px-5 pb-6">
          <Logo size="sm" showWordmark={true} className="justify-start" />
        </div>

        {/* Módulos */}
        <div className="px-3 mt-4">
          <div className="flex items-center justify-between px-3 pt-2 pb-3 text-[11px] uppercase tracking-wider text-[#636A7E] font-semibold">
            <span>MÓDULOS</span>
            <button className="text-[#636A7E] hover:text-white transition-colors">
              <Pencil size={12} />
            </button>
          </div>
          <div className="space-y-[10px]">
            {modules.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent',
                    isActive
                      ? 'bg-[#7C5CFC]/15 text-[#7C5CFC]'
                      : 'text-[#8E95A5] hover:text-white hover:bg-[#1A1D27]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <it.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#7C5CFC]' : ''} />
                    <span className={isActive ? 'text-white' : ''}>{it.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar (Avatar do Usuário) */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1A1D27] cursor-pointer transition-colors border border-transparent hover:border-[#202535] group">
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full bg-[#202535] flex items-center justify-center overflow-hidden">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=luiz" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-medium text-[#D1D5DB] group-hover:text-white transition-colors">
              luiz
            </span>
          </div>
          <button className="text-[#636A7E] hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
