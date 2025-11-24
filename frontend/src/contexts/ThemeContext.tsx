import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Charger depuis localStorage ou préférences utilisateur
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && (stored === 'dark' || stored === 'light')) {
      return stored;
    }
    // Utiliser la préférence de l'utilisateur si disponible
    if (user?.preferences?.theme) {
      return user.preferences.theme as Theme;
    }
    // Par défaut: dark
    return 'dark';
  });

  // Synchroniser avec les préférences utilisateur
  useEffect(() => {
    if (user?.preferences?.theme) {
      setThemeState(user.preferences.theme as Theme);
      localStorage.setItem('theme', user.preferences.theme);
    }
  }, [user?.preferences?.theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement;
    if (themeToApply === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  // Appliquer le thème au chargement
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}







