import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user } = useAuth();
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-[#12172F] border-b border-[#2A3355]">
      <div className="text-sm text-[#8A92A8]">Bem-vindo de volta 👋</div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#B8BFCC]">{user?.email ?? 'visitante'}</span>
        <div className="w-9 h-9 rounded-full bg-[#1C64EF] flex items-center justify-center text-sm">
          {(user?.email ?? 'D')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Header;
