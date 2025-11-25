import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, RefreshCw, Upload, Download, AlertCircle, Check, TrendingUp } from 'lucide-react';

interface Team {
  _id: string;
  name: string;
  tag: string;
  tier: string;
  mmr: {
    value: number;
    tier: string;
    gamesPlayed: number;
    isCalibrating: boolean;
  };
  stats: {
    wins: number;
    losses: number;
  };
}

export default function MMRManagement() {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch all teams
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['admin-teams-mmr', filterTier],
    queryFn: async () => {
      const params = filterTier !== 'ALL' ? `?tier=${filterTier}` : '';
      const res = await fetch(`http://localhost:5000/api/admin/teams/mmr${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
  });

  // Update single team MMR
  const updateMMR = useMutation({
    mutationFn: async ({ teamId, mmr }: { teamId: string; mmr: number }) => {
      const res = await fetch(`http://localhost:5000/api/admin/teams/${teamId}/mmr`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ mmr }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams-mmr'] });
      setSuccessMessage('MMR updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingTeam(null);
    },
  });

  // Auto-calibrate all teams
  const calibrateAll = useMutation({
    mutationFn: async () => {
      const res = await fetch('http://localhost:5000/api/admin/teams/calibrate-mmr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-teams-mmr'] });
      setSuccessMessage(`Calibrated ${data.calibrated} teams!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    },
  });

  const handleEdit = (team: Team) => {
    setEditingTeam(team._id);
    setEditValue(team.mmr?.value || 1200);
  };

  const handleSave = (teamId: string) => {
    updateMMR.mutate({ teamId, mmr: editValue });
  };

  const handleCancel = () => {
    setEditingTeam(null);
    setEditValue(0);
  };

  const getTierColor = (mmr: number) => {
    if (mmr >= 2200) return 'text-yellow-500';
    if (mmr >= 1900) return 'text-pink-500';
    if (mmr >= 1600) return 'text-purple-500';
    if (mmr >= 1300) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getTierBadge = (mmr: number) => {
    if (mmr >= 2200) return { label: '👑 ELITE', class: 'bg-gradient-to-r from-yellow-500 to-orange-500' };
    if (mmr >= 1900) return { label: '💎 T1', class: 'bg-gradient-to-r from-pink-500 to-primary' };
    if (mmr >= 1600) return { label: '⚔️ T2H', class: 'bg-gradient-to-r from-purple-500 to-blue-500' };
    if (mmr >= 1300) return { label: '🎯 T2', class: 'bg-blue-500/20 text-blue-400 border border-blue-500' };
    return { label: '🌱 T3', class: 'bg-gray-500/20 text-gray-400 border border-gray-500' };
  };

  const calculateSuggestedMMR = (team: Team) => {
    const currentTier = team.tier;
    const winRate = team.stats?.wins / (team.stats?.wins + team.stats?.losses) || 0;
    
    let baseMMR = 1200;
    if (currentTier === 'Tier 1') baseMMR = 2000;
    else if (currentTier === 'Tier 2') baseMMR = 1500;
    
    // Adjust based on win rate
    if (winRate > 0.7) baseMMR += 200;
    else if (winRate > 0.6) baseMMR += 100;
    else if (winRate < 0.4) baseMMR -= 100;
    
    return Math.max(1000, Math.min(2600, baseMMR));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">MMR Management</h1>
          <p className="text-muted-foreground">
            Manage team MMR ratings and perform calibrations
          </p>
        </div>
        
        <button
          onClick={() => calibrateAll.mutate()}
          disabled={calibrateAll.isPending}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={calibrateAll.isPending ? 'animate-spin' : ''} size={20} />
          {calibrateAll.isPending ? 'Calibrating...' : 'Auto-Calibrate All'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-muted-foreground">
              Filter by Tier
            </label>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Tiers</option>
              <option value="Tier 1">Tier 1 Teams</option>
              <option value="Tier 2">Tier 2 Teams</option>
              <option value="Amateur">Amateur Teams</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-muted-foreground">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button className="flex-1 bg-secondary border border-border px-4 py-2 rounded-lg hover:border-primary transition-colors text-sm">
                <Download size={16} className="inline mr-2" />
                Export CSV
              </button>
              <button className="flex-1 bg-secondary border border-border px-4 py-2 rounded-lg hover:border-primary transition-colors text-sm">
                <Upload size={16} className="inline mr-2" />
                Import CSV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-muted-foreground">
              Total Teams
            </label>
            <div className="text-3xl font-bold text-primary">
              {teams.length}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <strong>MMR Calibration Guide:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Elite: 2200+ MMR (Top tier competitive teams)</li>
            <li>Tier 1: 1900-2199 MMR (High competitive level)</li>
            <li>Tier 2 High: 1600-1899 MMR (Intermediate-Advanced)</li>
            <li>Tier 2: 1300-1599 MMR (Intermediate)</li>
            <li>Tier 3: 0-1299 MMR (Amateur/New teams)</li>
          </ul>
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading teams...
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No teams found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left py-4 px-4 font-bold text-sm uppercase">Team</th>
                  <th className="text-center py-4 px-4 font-bold text-sm uppercase">Current MMR</th>
                  <th className="text-center py-4 px-4 font-bold text-sm uppercase">New Tier</th>
                  <th className="text-center py-4 px-4 font-bold text-sm uppercase">W-L</th>
                  <th className="text-center py-4 px-4 font-bold text-sm uppercase">Suggested MMR</th>
                  <th className="text-center py-4 px-4 font-bold text-sm uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team: Team) => {
                  const tierBadge = getTierBadge(team.mmr?.value || 1200);
                  const suggestedMMR = calculateSuggestedMMR(team);
                  const isEditing = editingTeam === team._id;

                  return (
                    <tr key={team._id} className="border-b border-border hover:bg-secondary/50">
                      {/* Team Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center font-bold text-primary">
                            {team.tag || team.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold">{team.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Old Tier: {team.tier}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current MMR */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(parseInt(e.target.value))}
                            className="w-24 bg-input border border-border rounded px-2 py-1 text-center font-bold text-xl"
                            min="0"
                            max="3000"
                          />
                        ) : (
                          <div className={`text-2xl font-bold ${getTierColor(team.mmr?.value || 1200)}`}>
                            {team.mmr?.value || 1200}
                          </div>
                        )}
                      </td>

                      {/* New Tier Badge */}
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${tierBadge.class}`}>
                          {tierBadge.label}
                        </span>
                      </td>

                      {/* W-L */}
                      <td className="py-4 px-4 text-center">
                        <div className="font-semibold text-sm">
                          <span className="text-green-500">{team.stats?.wins || 0}</span>
                          {' - '}
                          <span className="text-red-500">{team.stats?.losses || 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {team.stats?.wins + team.stats?.losses > 0
                            ? `${Math.round((team.stats?.wins / (team.stats?.wins + team.stats?.losses)) * 100)}% WR`
                            : 'N/A'}
                        </div>
                      </td>

                      {/* Suggested MMR */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp size={16} className="text-primary" />
                          <span className="font-bold text-primary">{suggestedMMR}</span>
                        </div>
                        {Math.abs(suggestedMMR - (team.mmr?.value || 1200)) > 50 && (
                          <div className="text-xs text-muted-foreground">
                            ({suggestedMMR > (team.mmr?.value || 1200) ? '+' : ''}{suggestedMMR - (team.mmr?.value || 1200)})
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSave(team._id)}
                              disabled={updateMMR.isPending}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(team)}
                            className="bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-primary/90 transition-colors text-sm font-semibold"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

