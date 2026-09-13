import React, { createContext, useContext, useState, useEffect } from 'react';

type ModuleColors = {
  [key: string]: string;
};

const defaultColors: ModuleColors = {
  '/': '#7C5CFC', // Início
  '/academico': '#3B82F6', // Acadêmico
  '/casa': '#10B981', // Casa
  '/compras': '#14B8A6', // Compras
  '/financas': '#F59E0B', // Finanças
  '/investimentos': '#8B5CF6', // Investimentos
  '/pessoal': '#EC4899', // Pessoal
  '/configuracoes': '#64748B', // Config
};

interface ThemeContextType {
  colors: ModuleColors;
  updateColor: (path: string, color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ModuleColors>(() => {
    const saved = localStorage.getItem('@modus:colors');
    return saved ? { ...defaultColors, ...JSON.parse(saved) } : defaultColors;
  });

  useEffect(() => {
    localStorage.setItem('@modus:colors', JSON.stringify(colors));
  }, [colors]);

  const updateColor = (path: string, color: string) => {
    setColors(prev => ({ ...prev, [path]: color }));
  };

  return (
    <ThemeContext.Provider value={{ colors, updateColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
