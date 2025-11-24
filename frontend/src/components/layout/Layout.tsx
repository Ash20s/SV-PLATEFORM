import { ReactNode, useState, useEffect } from 'react';
import Navbar from './Navbar';
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
    <div className={`min-h-screen flex flex-col bg-background relative ${theme}`}>
      {/* ============================================ */}
      {/* BACKGROUNDS - Choisissez votre option       */}
      {/* ============================================ */}
      
      {useVideoBackground ? (
        // ============================================
        // OPTION VIDÉO : Placez vos .webm dans /public/videos/
        // ============================================
        <VideoBackground 
          videoUrl="/videos/02 SV_CT_Background.webm"   // Votre fichier vidéo
          fallbackImage="/images/thumb-gameplay.jpg"    // Image si vidéo ne charge pas
          opacity={0.3}                                  // Opacité vidéo (0.2-0.5)
          blur={0}                                       // Flou en pixels (0-10)
          overlay={true}                                 // Overlay sombre pour lisibilité
          overlayOpacity={0.75}                          // Opacité de l'overlay (0.5-0.9)
        />
        
        // OU utilisez le sélecteur multi-vidéos :
        // <DynamicVideoBackground 
        //   opacity={0.3}
        //   blur={0}
        //   showSelector={true}  // Sélecteur en bas à droite
        // />
      ) : (
        // ============================================
        // OPTION CSS : Background animé (orbes gradient)
        // ============================================
        <SimpleAnimatedBackground />
      )}
      
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
