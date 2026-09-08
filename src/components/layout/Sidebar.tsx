import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Wallet, TrendingUp,
  Home, User, Calendar, Bell,
} from 'lucide-react';
import clsx from 'clsx';

const groups = [
  { title: 'Geral', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'Acadêmico',
    items: [{ to: '/tarefas', label: 'Tarefas', icon: BookOpen }],
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/financas', label: 'Finanças', icon: Wallet },
      { to: '/investimentos', label: 'Investimentos', icon: TrendingUp },
    ],
  },
  {
    title: 'Pessoal',
    items: [
      { to: '/pessoal', label: 'Pessoal', icon: User },
      { to: '/casa', label: 'Casa', icon: Home },
    ],
  },
  {
    title: 'Organização',
    items: [
      { to: '/agenda', label: 'Agenda', icon: Calendar },
      { to: '/lembretes', label: 'Lembretes', icon: Bell },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-[#12172F] border-r border-[#2A3355] py-6 overflow-y-auto">
      <div className="px-6 pb-6 text-2xl font-bold text-[#1C64EF]">dailyS</div>
      {groups.map((g) => (
        <div key={g.title} className="mb-2">
          <div className="px-6 pt-3 pb-2 text-[11px] uppercase tracking-wider text-[#8A92A8] font-semibold">
            {g.title}
          </div>
          {g.items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-[3px]',
                  isActive
                    ? 'text-[#1C64EF] bg-[#1C64EF]/10 border-l-[#1C64EF]'
                    : 'text-[#B8BFCC] border-l-transparent hover:text-white hover:bg-[#1A2244]'
                )
              }
            >
              <it.icon size={18} />
              {it.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}

export default Sidebar;
