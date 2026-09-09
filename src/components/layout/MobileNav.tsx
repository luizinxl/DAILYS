import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Wallet, TrendingUp, User } from 'lucide-react';
import clsx from 'clsx';

const items = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/tarefas', label: 'Tarefas', icon: BookOpen },
  { to: '/financas', label: 'Finanças', icon: Wallet },
  { to: '/investimentos', label: 'Invest', icon: TrendingUp },
  { to: '/pessoal', label: 'Pessoal', icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#0E1017]/95 backdrop-blur-lg border-t border-[#1E2230] flex justify-around py-2 z-50">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all',
              isActive
                ? 'text-white'
                : 'text-[#646B80] hover:text-[#9CA3AF]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                  isActive
                    ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                    : 'text-[#646B80]'
                )}
              >
                <it.icon size={18} />
              </div>
              <span className={isActive ? 'text-[#9B82FF] font-semibold' : ''}>{it.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
