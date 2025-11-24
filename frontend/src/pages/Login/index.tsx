import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData, {
      onSuccess: () => {
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
      <div className="bg-card border border-border rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('login.welcome')}</h1>
          <p className="text-muted-foreground">
            {t('login.desc')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('login.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="organizer@supervive.gg"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
              {t('login.error')}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t('login.signing.in') : t('login.sign.in')}
          </button>
        </form>

        {/* Test Accounts */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3 font-semibold">{t('login.test.accounts')}:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-accent/50 px-3 py-2 rounded">
              <span className="text-muted-foreground">{t('nav.organizer')}:</span>
              <button
                type="button"
                onClick={() => setFormData({ email: 'organizer@supervive.gg', password: 'password123' })}
                className="text-primary hover:underline font-mono"
              >
                organizer@supervive.gg
              </button>
            </div>
            <div className="flex justify-between bg-accent/50 px-3 py-2 rounded">
              <span className="text-muted-foreground">{t('nav.admin')}:</span>
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@supervive.gg', password: 'password123' })}
                className="text-primary hover:underline font-mono"
              >
                admin@supervive.gg
              </button>
            </div>
            <div className="flex justify-between bg-accent/50 px-3 py-2 rounded">
              <span className="text-muted-foreground">{t('login.captain')}:</span>
              <button
                type="button"
                onClick={() => setFormData({ email: 'player1@supervive.gg', password: 'password123' })}
                className="text-primary hover:underline font-mono"
              >
                player1@supervive.gg
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            {t('login.test.password')}: <code className="bg-accent px-2 py-1 rounded">password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
