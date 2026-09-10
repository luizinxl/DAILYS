import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Wallet, TrendingUp,
  Home, User, Calendar, Bell,
  Settings } from 'lucide-react';
import clsx from 'clsx';
import Logo from '@/components/common/Logo';

const groups = [
  { title: 'Geral', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'AcadÃƒÂªmico',
    items: [{ to: '/tarefas', label: 'Tarefas', icon: BookOpen }],
  },
  {
    title: 'Financeiro',
    items: [
      { to: '/financas', label: 'FinanÃƒÂ§as', icon: Wallet },
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
    title: 'OrganizaÃƒÂ§ÃƒÂ£o',
    items: [
      { to: '/agenda', label: 'Agenda', icon: Calendar },
      { to: '/lembretes', label: 'Lembretes', icon: Bell },
  { to: '/configuracoes', label: 'ConfiguraÃ§Ãµes', icon: Settings },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-[#0E1017] border-r border-[#1E2230] py-6 flex flex-col justify-between overflow-y-auto min-h-screen">
      <div>
        {/* Logo estilo Monef */}
        <div className="px-6 py-4 flex items-center justify-between min-h-[80px] overflow-visible">
          <div className="flex items-center gap-2.5">
            <Logo size="lg" className="w-full" />
          </div>
          <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-sm shadow-[#10B981]/50" title="Online" />
        </div>

        {/* Grupos de navegaÃƒÂ§ÃƒÂ£o */}
        <div className="space-y-4 px-3">
          {groups.map((g) => (
            <div key={g.title}>
              <div className="px-3 pt-2 pb-1.5 text-[11px] uppercase tracking-wider text-[#636A7E] font-semibold">
                {g.title}
              </div>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[#181B26] text-white border border-[#282E42]/80 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.4)]'
                          : 'text-[#8E95A5] hover:text-white hover:bg-[#141722]'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={clsx(
                            'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                            isActive
                              ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/30'
                              : 'text-[#8E95A5] group-hover:text-white group-hover:bg-[#1D212F]'
                          )}
                        >
                          <it.icon size={16} />
                        </div>
                        <span>{it.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget inferior estilo Monef */}
      <div className="px-4 mt-6">
        <div className="p-3.5 rounded-2xl bg-[#141722] border border-[#202535] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">Hub Inteligente</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25">
              Online
            </span>
          </div>
          <p className="text-[11px] text-[#8E95A5] leading-relaxed">
            SincronizaÃƒÂ§ÃƒÂ£o em tempo real ativa
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
