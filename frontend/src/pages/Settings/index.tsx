import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Bell, Shield, User, Lock, Trash2, Mail, Eye, EyeOff, Palette } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/i18n/i18n';
import api from '@/services/api';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function SettingsPage() {
  const { user, token, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'privacy' | 'account' | 'security'>('appearance');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Récupérer les préférences utilisateur
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data.user;
    },
    enabled: !!user?.id,
  });

  // Mettre à jour l'apparence (thème et langue)
  const updateAppearanceMutation = useMutation({
    mutationFn: async (appearance: { theme?: string; language?: string }) => {
      const response = await api.put('/profile', {
        preferences: {
          theme: appearance.theme,
          language: appearance.language,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(['user-settings', user?.id], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-settings'] });
        
        // Appliquer le thème et la langue immédiatement
        if (data.user.preferences?.theme) {
          setTheme(data.user.preferences.theme as 'dark' | 'light');
        }
        if (data.user.preferences?.language) {
          setLanguage(data.user.preferences.language as any);
        }
      }
    },
    onError: (error: any) => {
      console.error('Error updating appearance:', error);
      if (error.response?.status !== 401) {
        alert(error?.response?.data?.message || t('settings.error.update'));
      }
    },
  });

  // Mettre à jour les notifications
  const updateNotificationsMutation = useMutation({
    mutationFn: async (notifications: any) => {
      const response = await api.put('/profile', {
        preferences: { notifications },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(['user-settings', user?.id], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      }
    },
    onError: (error: any) => {
      console.error('Error updating notifications:', error);
      if (error.response?.status !== 401) {
        alert(error?.response?.data?.message || 'Erreur lors de la mise à jour des notifications');
      }
    },
  });

  // Mettre à jour la confidentialité
  const updatePrivacyMutation = useMutation({
    mutationFn: async (privacy: any) => {
      const response = await api.put('/profile', {
        preferences: { privacy },
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(['user-settings', user?.id], data.user);
        queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      }
    },
    onError: (error: any) => {
      console.error('Error updating privacy:', error);
      if (error.response?.status !== 401) {
        alert(error?.response?.data?.message || 'Erreur lors de la mise à jour de la confidentialité');
      }
    },
  });

  // Changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/auth/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert(t('settings.password.changed'));
    },
    onError: (error: any) => {
      if (error.response?.status !== 401) {
        alert(error?.response?.data?.message || t('settings.password.error'));
      }
    },
  });

  // Supprimer le compte
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/auth/account');
      return response.data;
    },
    onSuccess: () => {
      alert(t('settings.account.deleted'));
      window.location.href = '/login';
    },
    onError: (error: any) => {
      if (error.response?.status !== 401) {
        alert(error?.response?.data?.message || t('settings.account.delete.error'));
      }
    },
  });

  const handleNotificationsChange = (key: string, value: boolean) => {
    const currentNotifications = userData?.preferences?.notifications || {
      email: true,
      teamInvites: true,
      tournamentUpdates: true,
    };
    updateNotificationsMutation.mutate({
      ...currentNotifications,
      [key]: value,
    });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    const currentPrivacy = userData?.preferences?.privacy || {
      profileVisibility: 'public',
      showEmail: false,
      showStats: true,
      allowTeamInvites: true,
    };
    updatePrivacyMutation.mutate({
      ...currentPrivacy,
      [key]: value,
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('settings.password.mismatch'));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert(t('settings.password.too.short'));
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'SUPPRIMER' && deleteConfirm !== 'DELETE') {
      alert(t('settings.delete.type'));
      return;
    }
    if (confirm(t('settings.delete.confirm.title'))) {
      deleteAccountMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">{t('settings.loading')}</p>
      </div>
    );
  }

  // Valeurs par défaut pour éviter les erreurs si userData n'est pas chargé
  // Utiliser userData en priorité, puis user du store, puis valeurs par défaut
  const notifications = userData?.preferences?.notifications || user?.preferences?.notifications || {
    email: true,
    teamInvites: true,
    tournamentUpdates: true,
  };

  const privacy = userData?.preferences?.privacy || user?.preferences?.privacy || {
    profileVisibility: 'public',
    showEmail: false,
    showStats: true,
    allowTeamInvites: true,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-primary" size={32} />
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette size={18} className="inline mr-2" />
          {t('settings.appearance')}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell size={18} className="inline mr-2" />
          {t('settings.notifications')}
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'privacy'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield size={18} className="inline mr-2" />
          {t('settings.privacy')}
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'account'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <User size={18} className="inline mr-2" />
          {t('settings.account')}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'security'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock size={18} className="inline mr-2" />
          {t('settings.security')}
        </button>
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="text-primary" size={24} />
            {t('settings.appearance')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.appearance.desc') || 'Personnalisez l\'apparence de l\'interface selon vos préférences.'}
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.theme')}</label>
              <select
                value={theme}
                onChange={(e) => {
                  const newTheme = e.target.value as 'dark' | 'light';
                  setTheme(newTheme);
                  updateAppearanceMutation.mutate({ theme: newTheme });
                }}
                disabled={updateAppearanceMutation.isPending}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                <option value="dark">{t('settings.theme.dark')}</option>
                <option value="light">{t('settings.theme.light')}</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('settings.theme.desc') || 'Choisissez le thème de l\'interface'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.language')}</label>
              <select
                value={language}
                onChange={(e) => {
                  const newLanguage = e.target.value as any;
                  setLanguage(newLanguage);
                  updateAppearanceMutation.mutate({ language: newLanguage });
                }}
                disabled={updateAppearanceMutation.isPending}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {t('settings.language.desc') || 'Sélectionnez votre langue préférée'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="text-primary" size={24} />
            {t('settings.notifications')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.notifications.desc')}
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.email.notifications')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.email.notifications.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => handleNotificationsChange('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.team.invites')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.team.invites.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.teamInvites}
                  onChange={(e) => handleNotificationsChange('teamInvites', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.tournament.updates')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.tournament.updates.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.tournamentUpdates}
                  onChange={(e) => handleNotificationsChange('tournamentUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            {t('settings.privacy')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.privacy.desc')}
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.profile.visibility')}</label>
              <select
                value={privacy.profileVisibility || 'public'}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="public">{t('settings.profile.visibility.public')}</option>
                <option value="private">{t('settings.profile.visibility.private')}</option>
                <option value="hidden">{t('settings.profile.visibility.hidden')}</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.show.email')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.show.email.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showEmail || false}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.show.stats')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.show.stats.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.showStats !== false}
                  onChange={(e) => handlePrivacyChange('showStats', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold">{t('settings.allow.team.invites')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.allow.team.invites.desc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy.allowTeamInvites !== false}
                  onChange={(e) => handlePrivacyChange('allowTeamInvites', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="text-primary" size={24} />
            {t('settings.account')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.account.desc')}
          </p>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.username')}</label>
              <input
                type="text"
                value={userData?.username || ''}
                disabled
                className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">{t('settings.username.desc')}</p>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.email')}</label>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2 opacity-60 cursor-not-allowed"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  {t('settings.modify')}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('settings.coming.soon')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-card p-6 rounded-lg border border-border space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="text-primary" size={24} />
            {t('settings.security')}
          </h2>
          <p className="text-muted-foreground">
            {t('settings.security.desc')}
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.current.password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.new.password')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <div className="p-4 rounded-lg border border-border">
              <label className="block font-semibold mb-2">{t('settings.confirm.password')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? t('settings.password.changing') || 'Modification...' : t('settings.change.password')}
            </button>
          </form>

          <div className="border-t border-border pt-6 mt-6">
            <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
              <Trash2 size={20} />
              {t('settings.danger.zone') || 'Zone de danger'}
            </h3>
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <p className="font-semibold mb-2">{t('settings.delete.account')}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settings.delete.account.desc')}
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={t('settings.delete.confirm')}
                  className="w-full bg-background border border-destructive rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-destructive"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={(deleteConfirm !== 'SUPPRIMER' && deleteConfirm !== 'DELETE') || deleteAccountMutation.isPending}
                  className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteAccountMutation.isPending ? (t('settings.deleting') || 'Suppression...') : t('settings.delete.account')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

