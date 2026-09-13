import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Wallet,
  TrendingUp,
  User,
  Settings,
  Home as House,
  ShoppingCart,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import clsx from 'clsx';
import Logo from '@/components/common/Logo';
import { useTheme } from '@/contexts/ThemeContext';

const modules = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/academico', label: 'Tarefas Acadêmicas', icon: GraduationCap },
  { to: '/casa', label: 'Tarefas Domésticas', icon: House },
  { to: '/compras', label: 'Compras', icon: ShoppingCart },
  { to: '/financas', label: 'Finanças', icon: Wallet },
  { to: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { to: '/pessoal', label: 'Pessoal', icon: User },
  { to: '/configuracoes', label: 'Config', icon: Settings },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('@modus:sidebar-collapsed');
    return saved === 'true';
  });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { colors, updateColor } = useTheme();
  
  useEffect(() => {
    localStorage.setItem('@modus:sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside className={clsx(
      "shrink-0 bg-[#12141C] flex flex-col justify-between min-h-screen transition-all duration-300 relative border-r border-[#1E2230]",
      isCollapsed ? "w-[80px]" : "w-[220px]"
    )}>
      {/* Botão de Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-8 w-7 h-7 bg-[#1A1D27] border border-[#282E42] rounded-full flex items-center justify-center text-[#8E95A5] hover:text-white hover:bg-[#202535] transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-hidden">
        {/* Logo */}
        <div className={clsx("px-5 pb-6 flex", isCollapsed ? "justify-center" : "justify-start")}>
          <Logo size="sm" showWordmark={!isCollapsed} className={isCollapsed ? "justify-center" : "justify-start"} />
        </div>

        {/* Módulos */}
        <div className="px-3 mt-4 flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 pt-2 pb-3 text-[11px] uppercase tracking-wider text-[#636A7E] font-semibold">
              <span>MÓDULOS</span>
              <button 
                onClick={() => setShowColorPicker(true)}
                className="text-[#636A7E] hover:text-white transition-colors"
                title="Editar Cores dos Módulos"
              >
                <Pencil size={12} />
              </button>
            </div>
          )}
          
          <div className="space-y-[10px]">
            {modules.map((it) => {
              const moduleColor = colors[it.to] || '#7C5CFC';
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === '/'}
                  title={isCollapsed ? it.label : undefined}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent',
                      isCollapsed ? 'justify-center px-0' : 'px-3',
                      isActive ? 'bg-opacity-15' : 'hover:bg-[#1A1D27]'
                    )
                  }
                  style={({ isActive }) => isActive ? {
                    backgroundColor: `${moduleColor}26`, // 15% opacity hex
                    color: moduleColor
                  } : {
                    color: '#8E95A5'
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <it.icon 
                        size={isCollapsed ? 22 : 18} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        style={isActive ? { color: moduleColor } : {}}
                        className={!isActive && !isCollapsed ? "hover:text-white transition-colors" : ""}
                      />
                      {!isCollapsed && (
                        <span style={isActive ? { color: 'white' } : {}} className="transition-colors hover:text-white">
                          {it.label}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rodapé da Sidebar (Avatar do Usuário) */}
      <div className="px-3 pb-6 pt-4 border-t border-[#1E2230]/50">
        <div className={clsx(
          "flex items-center rounded-xl hover:bg-[#1A1D27] cursor-pointer transition-colors border border-transparent hover:border-[#202535] group",
          isCollapsed ? "justify-center p-2" : "justify-between px-3 py-2.5"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] rounded-full bg-[#202535] flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=luiz" 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium text-[#D1D5DB] group-hover:text-white transition-colors truncate">
                luiz
              </span>
            )}
          </div>
          {!isCollapsed && (
            <button className="text-[#636A7E] hover:text-white transition-colors shrink-0">
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Modal Editor de Cores */}
      {showColorPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12141C] border border-[#232735] rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#232735]">
              <h3 className="text-white font-bold">Cores dos Módulos</h3>
              <button onClick={() => setShowColorPicker(false)} className="text-[#636A7E] hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {modules.map(mod => (
                <div key={mod.to} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <mod.icon size={16} className="text-[#8E95A5]" />
                    <span className="text-sm text-white">{mod.label}</span>
                  </div>
                  <input 
                    type="color" 
                    value={colors[mod.to] || '#7C5CFC'} 
                    onChange={(e) => updateColor(mod.to, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
