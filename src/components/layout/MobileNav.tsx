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
    <nav className="fixed bottom-0 inset-x-0 bg-[#12172F] border-t border-[#2A3355] flex justify-around py-2 z-50">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 px-3 py-1 text-[11px]',
              isActive ? 'text-[#1C64EF]' : 'text-[#8A92A8]'
            )
          }
        >
          <it.icon size={20} />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNav;
