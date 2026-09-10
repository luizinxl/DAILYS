import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = useMobileDetect();

  const content = (
    <motion.main
      key={typeof window !== 'undefined' ? window.location.pathname : 'page'}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1 overflow-y-auto p-6 md:p-8"
    >
      {children}
    </motion.main>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col pb-20 bg-[#000000] text-white">
        <Header />
        {content}
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#000000] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        {content}
      </div>
    </div>
  );
}

export default Layout;
