import { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SimpleAnimatedBackground from '../SimpleAnimatedBackground';
import VideoBackground from '../VideoBackground';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
// import DynamicVideoBackground from '../DynamicVideoBackground';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { token, user, setAuth, setUser, isAuthenticated } = useAuthStore();
  const { theme } = useTheme();

  // Charger l'utilisateur au démarrage si un token existe mais pas d'utilisateur
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !user) {
        try {
          const data = await authService.getCurrentUser();
          setAuth(data.user, storedToken);
        } catch (error) {
          // Token invalide ou backend inaccessible, nettoyer silencieusement
          console.warn('Failed to load user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
    };

    // Ne pas bloquer le rendu si le chargement échoue
    loadUser().catch((err) => {
      console.warn('Error loading user on mount:', err);
    });
  }, []); // Seulement au montage du composant

  // Synchroniser le token avec localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else if (!isAuthenticated) {
      localStorage.removeItem('token');
    }
  }, [token, isAuthenticated]);

  // ============================================
  // CONFIGURATION DU BACKGROUND
  // ============================================
  // true = Vidéo background (.webm)
  // false = CSS animé (orbes gradient)
  const [useVideoBackground] = useState(true);
  
  return (
    <div className={`min-h-screen flex flex-col relative ${theme}`}>
      {/* Background gradient is applied in index.css body */}
      
      <Sidebar />
      <main className="flex-1 ml-20 px-8 py-8 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
