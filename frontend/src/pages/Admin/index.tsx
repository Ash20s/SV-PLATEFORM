import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Users, Flag, MessageSquare, BarChart3, 
  Settings, AlertTriangle, CheckCircle, XCircle, Ban, UserCog, Plus, X
} from 'lucide-react';
import { useI18n } from '@/i18n/i18n';

type AdminTab = 'overview' | 'reports' | 'users' | 'content' | 'settings';

interface Report {
  _id: string;
  type: 'toxicity' | 'dispute' | 'bug' | 'other';
  reporter: { _id: string; username: string };
  reported?: { _id: string; username: string };
  reason: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  createdAt: string;
}

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdAt: string;
}

const API_URL = 'http://localhost:5000/api';
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function Admin() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  const tabs = [
    { id: 'overview' as AdminTab, label: t('admin.overview'), icon: BarChart3 },
    { id: 'reports' as AdminTab, label: t('admin.reports'), icon: Flag },
    { id: 'users' as AdminTab, label: t('admin.users'), icon: Users },
    { id: 'content' as AdminTab, label: t('admin.content'), icon: MessageSquare },
    { id: 'settings' as AdminTab, label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border mb-8">
        <div className="flex items-center gap-3 pb-4">
          <Shield className="text-red-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('admin.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-border mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && <OverviewSection stats={stats} setActiveTab={setActiveTab} />}
        {activeTab === 'reports' && <ReportsSection />}
        {activeTab === 'users' && <UsersSection />}
        {activeTab === 'content' && <ContentSection />}
        {activeTab === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW SECTION
// ============================================
function OverviewSection({ stats, setActiveTab }: { stats: any; setActiveTab: (tab: AdminTab) => void }) {
  const { t } = useI18n();
  const statCards = [
    {
      label: t('admin.total.users'),
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      change: `+12 ${t('admin.this.week')}`
    },
    {
      label: t('admin.pending.reports'),
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: 'red',
      change: stats?.pendingReports > 0 ? t('admin.requires.attention') : t('admin.none')
    },
    {
      label: t('admin.active.teams'),
      value: stats?.totalTeams || 0,
      icon: Users,
      color: 'green',
      change: `+5 ${t('admin.this.week')}`
    },
    {
      label: t('admin.active.tournaments'),
      value: stats?.activeTournaments || 0,
      icon: BarChart3,
      color: 'purple',
      change: t('admin.supervision.required')
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon size={20} className={`text-${stat.color}-500`} />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-4">{t('admin.recent.activity')}</h2>
        <div className="space-y-3">
          {[
            { type: 'warning', message: 'Nouveau report de toxicité par Shadow', time: 'Il y a 5 min' },
            { type: 'info', message: 'Phoenix Rising a été créée', time: 'Il y a 1h' },
            { type: 'success', message: 'Tournoi "November Cup" démarré', time: 'Il y a 2h' },
            { type: 'warning', message: 'Dispute de résultats sur scrim #453', time: 'Il y a 3h' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded bg-accent/50">
              {activity.type === 'warning' && <AlertTriangle size={18} className="text-yellow-500" />}
              {activity.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
              {activity.type === 'info' && <BarChart3 size={18} className="text-blue-500" />}
              <div className="flex-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h2 className="text-xl font-bold mb-4">{t('admin.quick.actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('reports')}
            className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-left"
          >
            <Flag className="mb-2 text-red-500" size={24} />
            <h3 className="font-semibold mb-1">{t('admin.view.reports')}</h3>
            <p className="text-sm text-muted-foreground">{stats?.pendingReports || 0} {t('admin.pending')}</p>
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-left"
          >
            <MessageSquare className="mb-2 text-blue-500" size={24} />
            <h3 className="font-semibold mb-1">{t('admin.create.announcement')}</h3>
            <p className="text-sm text-muted-foreground">{t('admin.inform.community')}</p>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className="p-4 border border-border rounded-lg hover:border-primary transition-colors text-left"
          >
            <Settings className="mb-2 text-gray-500" size={24} />
            <h3 className="font-semibold mb-1">{t('admin.settings')}</h3>
            <p className="text-sm text-muted-foreground">{t('admin.configuration')}</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// REPORTS SECTION
// ============================================
function ReportsSection() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin', 'reports', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await fetch(`http://localhost:5000/api/admin/reports${params}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    }
  });

  // Resolve report mutation
  const resolveMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: string; notes: string }) => {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${id}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, notes })
      });
      if (!res.ok) throw new Error('Failed to resolve report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });

  // Reject report mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${id}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes })
      });
      if (!res.ok) throw new Error('Failed to reject report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports & Modération</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setStatusFilter('')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${!statusFilter ? 'bg-accent' : 'hover:bg-accent'}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === 'pending' ? 'bg-accent font-semibold' : 'hover:bg-accent'}`}
          >
            En attente
          </button>
          <button 
            onClick={() => setStatusFilter('resolved')}
            className={`px-4 py-2 rounded-lg text-sm ${statusFilter === 'resolved' ? 'bg-accent font-semibold' : 'hover:bg-accent'}`}
          >
            Résolus
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Chargement...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucun report</p>
      ) : (
        <div className="space-y-3">
          {reports.map((report: Report) => (
            <div key={report._id} className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      report.type === 'toxicity' 
                        ? 'bg-red-500/10 text-red-500'
                        : report.type === 'dispute'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {report.type === 'toxicity' ? 'Toxicité' : report.type === 'dispute' ? 'Dispute' : 'Bug'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      report.status === 'pending'
                        ? 'bg-orange-500/10 text-orange-500'
                        : report.status === 'resolved'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {report.status === 'pending' ? 'En attente' : report.status === 'resolved' ? 'Résolu' : 'Rejeté'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="font-semibold mb-1">
                    {report.reporter.username} signale {report.reported?.username || 'système'}
                  </p>
                  <p className="text-sm text-muted-foreground">{report.reason}</p>
                </div>
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const action = prompt('Action (ban/warning/other):') || 'warning';
                        const notes = prompt('Notes:') || '';
                        resolveMutation.mutate({ id: report._id, action, notes });
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Sanctionner
                    </button>
                    <button 
                      onClick={() => {
                        const notes = prompt('Notes de résolution:') || 'Résolu';
                        resolveMutation.mutate({ id: report._id, action: 'resolved', notes });
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Résoudre
                    </button>
                    <button 
                      onClick={() => {
                        const notes = prompt('Raison du rejet:') || 'Non fondé';
                        rejectMutation.mutate({ id: report._id, notes });
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// USERS SECTION
// ============================================
function UsersSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', searchTerm],
    queryFn: async () => {
      const params = searchTerm ? `?search=${searchTerm}` : '';
      const res = await fetch(`http://localhost:5000/api/admin/users${params}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async ({ id, banned, reason }: { id: string; banned: boolean; reason: string }) => {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/ban`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ banned, reason })
      });
      if (!res.ok) throw new Error('Failed to ban user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });

  // Change role mutation
  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error('Failed to change role');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher par nom ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
      />

      {/* Users Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent">
            <tr>
              <th className="text-left p-4">Utilisateur</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rôle</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.slice(0, 20).map((user: UserData) => (
                <tr key={user._id} className="border-t border-border">
                  <td className="p-4 font-semibold">{user.username}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-red-500/10 text-red-500'
                        : user.role === 'organizer'
                        ? 'bg-purple-500/10 text-purple-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.status === 'banned'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {user.status === 'banned' ? 'Banni' : 'Actif'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          const newRole = prompt('Nouveau rôle (player/captain/organizer/admin):', user.role);
                          if (newRole && ['player', 'captain', 'organizer', 'admin'].includes(newRole)) {
                            roleMutation.mutate({ id: user._id, role: newRole });
                          }
                        }}
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Rôle
                      </button>
                      <button
                        onClick={() => {
                          if (user.status === 'banned') {
                            banMutation.mutate({ id: user._id, banned: false, reason: '' });
                          } else {
                            const reason = prompt('Raison du ban:') || 'Non spécifiée';
                            banMutation.mutate({ id: user._id, banned: true, reason });
                          }
                        }}
                        className={`px-2 py-1 rounded text-xs ${
                          user.status === 'banned'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {user.status === 'banned' ? 'Débannir' : 'Bannir'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// CONTENT SECTION
// ============================================
function ContentSection() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info',
    priority: 'normal'
  });

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/admin/announcements', {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch announcements');
      return res.json();
    }
  });

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newAnnouncement) => {
      const res = await fetch('http://localhost:5000/api/admin/announcements', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setShowCreateModal(false);
      setNewAnnouncement({ title: '', content: '', type: 'info', priority: 'normal' });
    }
  });

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`http://localhost:5000/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete announcement');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion du Contenu</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvelle annonce
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg border border-border max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Créer une annonce</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Titre</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
                  placeholder="Titre de l'annonce"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Contenu</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-4 py-2 bg-accent border border-border rounded-lg min-h-[100px]"
                  placeholder="Contenu de l'annonce"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                    className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Priorité</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => createMutation.mutate(newAnnouncement)}
                  disabled={!newAnnouncement.title || !newAnnouncement.content}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Annonces système</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune annonce</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement: Announcement) => (
              <div key={announcement._id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        announcement.type === 'warning'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : announcement.type === 'success'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {announcement.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette annonce ?')) {
                        deleteMutation.mutate(announcement._id);
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SETTINGS SECTION
// ============================================
function SettingsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Paramètres de la Plateforme</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Configuration générale</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nom de la plateforme</label>
              <input
                type="text"
                defaultValue="Supervise"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Email de contact</label>
              <input
                type="email"
                defaultValue="admin@supervise.gg"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Inscriptions ouvertes</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Création d'équipes autorisée</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tournament Settings */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Paramètres Tournois</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Taille max équipe</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Durée check-in (minutes)</label>
              <input
                type="number"
                defaultValue="15"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Vérification des rosters</span>
              </label>
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Modération</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Durée ban temporaire (jours)</label>
              <input
                type="number"
                defaultValue="7"
                className="w-full px-4 py-2 bg-accent border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Reports automatiques activés</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Filtre langage toxique</span>
              </label>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Informations Système</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-semibold">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière MAJ:</span>
              <span className="font-semibold">10/11/2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-semibold">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environnement:</span>
              <span className="font-semibold">Production</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
          Réinitialiser
        </button>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
}
