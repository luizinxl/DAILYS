import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell } from 'lucide-react';
// import Logo from '@/components/common/Logo'; // removed, header now uses avatar

export function Header() {
  const { user } = useAuth();
  const initial = (user?.email ?? 'MODUS')[0].toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 md:px-8 py-3.5 bg-[#0E1017] border-b border-[#1E2230] transition-colors">
      {/* Lado esquerdo: Saudação & Busca estilo Monef */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            Olá, {user?.email ? user.email.split('@')[0] : 'Bem-vindo'} <span className="text-base">👋</span>
          </h2>
          <p className="text-[11px] text-[#8E95A5] hidden sm:block">
            Seu painel financeiro e pessoal unificado
          </p>
        </div>

        {/* Input de busca estilo Monef */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141722] border border-[#222736] text-[#8E95A5] focus-within:border-[#7C5CFC]/50 transition-colors w-64">
          <Search size={15} className="text-[#646B80]" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="bg-transparent text-xs text-white placeholder-[#646B80] outline-none w-full"
            readOnly
          />
        </div>
      </div>

      {/* Lado direito: Notificações e Perfil */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="w-9 h-9 rounded-xl bg-[#141722] border border-[#222736] flex items-center justify-center text-[#8E95A5] hover:text-white hover:border-[#2F364C] transition-colors relative"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-[#1E2230]">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.email ?? 'Visitante'}</div>
            <div className="text-[10px] text-[#10B981] font-medium">Plano Pro</div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Compact avatar/icon for header */}
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#7C5CFC] text-white font-semibold text-sm">
              {initial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0E1017]" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
