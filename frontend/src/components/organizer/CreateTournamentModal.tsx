import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, DollarSign, Users, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '@/services/api';

interface PrizeDistribution {
  placement: number;
  percentage: number;
}

interface CreateTournamentModalProps {
  onClose: () => void;
}

const PRIZE_PRESETS = {
  'winner-takes-all': [
    { placement: 1, percentage: 100 }
  ],
  'top2-80-20': [
    { placement: 1, percentage: 80 },
    { placement: 2, percentage: 20 }
  ],
  'top3': [
    { placement: 1, percentage: 50 },
    { placement: 2, percentage: 30 },
    { placement: 3, percentage: 20 }
  ],
  'top6': [
    { placement: 1, percentage: 40 },
    { placement: 2, percentage: 25 },
    { placement: 3, percentage: 15 },
    { placement: 4, percentage: 10 },
    { placement: 5, percentage: 6 },
    { placement: 6, percentage: 4 }
  ]
};

interface QualificationFormatPreviewProps {
  numberOfGroups?: number;
  qualifiersPerGroup?: number;
  maxTeams: number;
  gameMode: 'Trio' | 'Squad';
}

function QualificationFormatPreview({ 
  numberOfGroups, 
  qualifiersPerGroup, 
  maxTeams,
  gameMode 
}: QualificationFormatPreviewProps) {
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // Valeurs par défaut pour la prévisualisation si non spécifiées
  const previewNumberOfGroups = numberOfGroups || 2;
  const previewQualifiersPerGroup = qualifiersPerGroup || Math.floor(maxTeams / previewNumberOfGroups);
  const teamsPerGroup = Math.ceil(maxTeams / previewNumberOfGroups);
  const totalQualified = previewNumberOfGroups * previewQualifiersPerGroup;
  const nonQualifiedPerGroup = teamsPerGroup - previewQualifiersPerGroup;
  const exceedsMaxTeams = totalQualified > maxTeams;

  const lobbyColors = [
    'bg-purple-500/20 border-purple-500/30 text-purple-300',
    'bg-green-500/20 border-green-500/30 text-green-300',
    'bg-blue-500/20 border-blue-500/30 text-blue-300',
    'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  ];

  return (
    <div className="mt-6 p-4 bg-background/50 border border-border rounded-lg">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Trophy size={16} className="text-primary" />
        Qualification Format Preview
      </h4>
      
      <div className="space-y-4">
        {/* Info si calcul automatique */}
        {(!numberOfGroups || !qualifiersPerGroup) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3 text-xs text-yellow-300/80">
            ⚠️ Prévisualisation avec valeurs estimées. Le calcul final se fera automatiquement selon le nombre d'équipes inscrites.
          </div>
        )}

        {/* Lobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: previewNumberOfGroups }).map((_, index) => {
            const groupLetter = groupLetters[index];
            const colorClass = lobbyColors[index % lobbyColors.length];
            
            return (
              <div key={index} className={`p-3 rounded-lg border ${colorClass}`}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-sm">Lobby {groupLetter}</h5>
                  <span className="text-xs opacity-75">{teamsPerGroup} teams</span>
                </div>
                
                <div className="space-y-1.5">
                  {/* Qualified placements */}
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-400" />
                          <span className="text-xs">
                            <span className="font-semibold">Top {previewQualifiersPerGroup}</span> qualify
                          </span>
                        </div>

                        {/* Placements list */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.from({ length: previewQualifiersPerGroup }).map((_, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-green-500/30 text-green-300 rounded text-xs font-semibold"
                      >
                        #{i + 1}
                      </span>
                    ))}
                    {nonQualifiedPerGroup > 0 && (
                      <>
                        {Array.from({ length: Math.min(nonQualifiedPerGroup, 3) }).map((_, i) => (
                          <span
                                  key={`elim-${i}`}
                                  className="px-2 py-0.5 bg-gray-600/30 text-gray-400 rounded text-xs"
                                >
                                  #{previewQualifiersPerGroup + i + 1}
                          </span>
                        ))}
                        {nonQualifiedPerGroup > 3 && (
                          <span className="px-2 py-0.5 bg-gray-600/30 text-gray-400 rounded text-xs">
                            ...
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Lobby */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <div className="flex-1 flex items-center gap-2">
            <ArrowRight size={16} className="text-primary" />
            <span className="text-sm font-semibold">Final Lobby</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            exceedsMaxTeams 
              ? 'bg-yellow-500/20 border-yellow-500/30' 
              : 'bg-primary/20 border-primary/30'
          }`}>
            <Trophy size={14} className={exceedsMaxTeams ? 'text-yellow-400' : 'text-primary'} />
            <span className={`text-sm font-bold ${exceedsMaxTeams ? 'text-yellow-400' : 'text-primary'}`}>
              {totalQualified} teams
            </span>
          </div>
        </div>

        {/* Warning if exceeds maxTeams */}
        {exceedsMaxTeams && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs">
            <p className="text-yellow-400 font-semibold mb-1">⚠️ Warning</p>
            <p className="text-yellow-300/80">
              Final lobby will have <span className="font-bold">{totalQualified} teams</span>, which exceeds the max teams per lobby ({maxTeams}).
              {gameMode === 'Trio' ? ' Consider splitting into multiple final lobbies or reducing qualifiers per group.' : ''}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p>
            • {previewNumberOfGroups} lobbies × {previewQualifiersPerGroup} qualifiers = <span className="font-semibold text-primary">{totalQualified} teams</span> in finals
          </p>
          <p>
            • {gameMode} mode: <span className="font-semibold">{maxTeams} teams max per qualification lobby</span>
          </p>
          {exceedsMaxTeams && (
            <p className="text-yellow-400 mt-1">
              • Final lobby will exceed the qualification lobby limit
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateTournamentModal({ onClose }: CreateTournamentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    tier: 'Both' as 'Tier 1' | 'Tier 2' | 'Both',
    startDate: '',
    endDate: '',
    region: 'EU',
    gameMode: 'Squad' as 'Trio' | 'Squad',
    prizePool: '',
    maxTeams: 10,
    numberOfGames: 5,
    description: '',
    hasQualifiers: false,
    numberOfGroups: undefined as number | undefined,
    qualifiersPerGroup: undefined as number | undefined,
    gamesPerGroup: 3
  });

  const [prizePreset, setPrizePreset] = useState<string>('top6');
  const [customPrizeDistribution, setCustomPrizeDistribution] = useState<PrizeDistribution[]>(PRIZE_PRESETS['top6']);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/tournaments', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournaments', 'upcoming'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tournamentData: any = {
      ...formData,
      gameMode: formData.gameMode,
      prizePool: formData.prizePool ? parseFloat(formData.prizePool) : undefined,
      pointsSystem: {
        placementPoints: {
          1: 20, 2: 15, 3: 12, 4: 10, 5: 8, 6: 6,
          7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0
        },
        killPoints: 1
      }
    };
    
    // Add prize distribution if prize pool exists
    if (formData.prizePool && parseFloat(formData.prizePool) > 0) {
      tournamentData.prizeDistribution = customPrizeDistribution;
    }
    
    if (formData.hasQualifiers) {
      tournamentData.qualifierSettings = {
        numberOfGroups: formData.numberOfGroups || undefined,
        qualifiersPerGroup: formData.qualifiersPerGroup || undefined,
        gamesPerGroup: formData.gamesPerGroup
      };
    }
    
    createMutation.mutate(tournamentData);
  };

  const handlePresetChange = (preset: string) => {
    setPrizePreset(preset);
    if (preset !== 'custom') {
      setCustomPrizeDistribution(PRIZE_PRESETS[preset as keyof typeof PRIZE_PRESETS]);
    }
  };

  const handleCustomDistributionChange = (index: number, field: 'placement' | 'percentage', value: number) => {
    const newDistribution = [...customPrizeDistribution];
    newDistribution[index][field] = value;
    setCustomPrizeDistribution(newDistribution);
  };

  const addPrizePlacement = () => {
    const nextPlacement = customPrizeDistribution.length + 1;
    setCustomPrizeDistribution([...customPrizeDistribution, { placement: nextPlacement, percentage: 0 }]);
    setPrizePreset('custom');
  };

  const removePrizePlacement = (index: number) => {
    setCustomPrizeDistribution(customPrizeDistribution.filter((_, i) => i !== index));
    setPrizePreset('custom');
  };

  const getTotalPercentage = () => {
    return customPrizeDistribution.reduce((sum, item) => sum + item.percentage, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-500" size={24} />
            <h2 className="text-2xl font-bold">Create Tournament</h2>
          </div>
          <button onClick={onClose} className="hover:bg-accent p-2 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tournament Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Supervive Championship 2025"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Start Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar size={16} />
                End Date *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Region, Tier & Game Mode */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="EU">Europe</option>
                <option value="NA">North America</option>
                <option value="ASIA">Asia</option>
                <option value="OCE">Oceania</option>
                <option value="SA">South America</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tier Level *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'Tier 1' | 'Tier 2' | 'Both' })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Tier 1">Tier 1 (Top Level)</option>
                <option value="Tier 2">Tier 2 (Intermediate)</option>
                <option value="Both">Both Tiers</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Game Mode *
              </label>
              <select
                value={formData.gameMode}
                onChange={(e) => {
                  const newMode = e.target.value as 'Trio' | 'Squad';
                  const newMaxTeams = newMode === 'Trio' ? 12 : 10;
                  setFormData({ ...formData, gameMode: newMode, maxTeams: newMaxTeams });
                }}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Trio">Trio (3 players, max 12 teams)</option>
                <option value="Squad">Squad (4 players, max 10 teams)</option>
              </select>
            </div>
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Prize Pool (€)
            </label>
            <input
              type="number"
              value={formData.prizePool}
              onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="10000"
            />
          </div>

          {/* Prize Distribution */}
          {formData.prizePool && parseFloat(formData.prizePool) > 0 && (
            <div className="border border-border rounded-lg p-4 bg-accent/30">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-500" />
                Prize Distribution
              </h3>

              {/* Presets */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quick Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('winner-takes-all')}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                      prizePreset === 'winner-takes-all'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    Winner Takes All
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('top2-80-20')}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                      prizePreset === 'top2-80-20'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    Top 2 (80/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('top3')}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                      prizePreset === 'top3'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    Top 3 (50/30/20)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetChange('top6')}
                    className={`px-3 py-2 rounded border text-sm font-medium transition ${
                      prizePreset === 'top6'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    Top 6
                  </button>
                </div>
              </div>

              {/* Custom Distribution */}
              <div className="space-y-2">
                {customPrizeDistribution.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-12">#{item.placement}</span>
                    <input
                      type="number"
                      value={item.percentage}
                      onChange={(e) => handleCustomDistributionChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="flex-1 bg-background border border-border rounded px-3 py-1.5 text-sm"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-sm">%</span>
                    <span className="text-xs text-muted-foreground w-20 text-right">
                      €{((parseFloat(formData.prizePool) * item.percentage) / 100).toFixed(2)}
                    </span>
                    {customPrizeDistribution.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrizePlacement(index)}
                        className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Placement & Total */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={addPrizePlacement}
                  className="text-sm text-primary hover:underline"
                >
                  + Add Placement
                </button>
                <div className={`text-sm font-semibold ${getTotalPercentage() === 100 ? 'text-green-500' : 'text-destructive'}`}>
                  Total: {getTotalPercentage()}% {getTotalPercentage() !== 100 && '⚠️'}
                </div>
              </div>
            </div>
          )}

          {/* Max Teams & Games */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Users size={16} />
                Max Teams per Lobby *
              </label>
              <input
                type="number"
                required
                value={formData.maxTeams}
                onChange={(e) => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min="2"
                max={formData.gameMode === 'Trio' ? 12 : 10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.gameMode === 'Trio' 
                  ? `Maximum teams per lobby/game (max 12 for Trio mode). Each of the ${formData.numberOfGames} game(s) will have up to ${formData.maxTeams} teams.`
                  : `Maximum teams per lobby/game (max 10 for Squad mode). Each of the ${formData.numberOfGames} game(s) will have up to ${formData.maxTeams} teams.`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Number of Games *
              </label>
              <input
                type="number"
                required
                value={formData.numberOfGames}
                onChange={(e) => setFormData({ ...formData, numberOfGames: parseInt(e.target.value) })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max="10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Tournament details, rules, etc..."
            />
          </div>

          {/* Qualifiers System */}
          <div className="border border-border rounded-lg p-4 bg-accent/30">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="hasQualifiers"
                checked={formData.hasQualifiers}
                onChange={(e) => setFormData({ ...formData, hasQualifiers: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="hasQualifiers" className="font-semibold cursor-pointer">
                Enable Qualification Groups
              </label>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Split teams into groups (A, B, C...) for qualifiers. Top teams from each group advance to finals.
            </p>

            {formData.hasQualifiers && (
              <>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3 mt-3">
                  <p className="text-xs text-blue-300/80">
                    💡 <strong>Calcul automatique :</strong> Le système calculera automatiquement le nombre de lobbies et les qualifiés par lobby selon le nombre d'équipes inscrites. Vous pouvez laisser ces valeurs vides ou les ajuster manuellement.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Number of Groups <span className="text-muted-foreground">(optionnel)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.numberOfGroups || ''}
                      onChange={(e) => setFormData({ ...formData, numberOfGroups: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                      min="2"
                      max="6"
                      placeholder="Auto"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Laisser vide pour calcul automatique
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Qualifiers per Group <span className="text-muted-foreground">(optionnel)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.qualifiersPerGroup || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        if (value) {
                          const maxValue = formData.numberOfGroups 
                            ? Math.ceil(formData.maxTeams / formData.numberOfGroups) 
                            : formData.maxTeams;
                          setFormData({ 
                            ...formData, 
                            qualifiersPerGroup: Math.min(value, maxValue || formData.maxTeams) 
                          });
                        } else {
                          setFormData({ ...formData, qualifiersPerGroup: undefined });
                        }
                      }}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                      min="1"
                      max={formData.numberOfGroups ? Math.ceil(formData.maxTeams / formData.numberOfGroups) : formData.maxTeams}
                      placeholder="Auto"
                    />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Calculé pour remplir la finale
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Games per Group
                    </label>
                    <input
                      type="number"
                      value={formData.gamesPerGroup}
                      onChange={(e) => setFormData({ ...formData, gamesPerGroup: parseInt(e.target.value) })}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-sm"
                      min="1"
                      max="6"
                    />
                  </div>
                </div>

                {/* Qualification Format Preview */}
                <QualificationFormatPreview
                  numberOfGroups={formData.numberOfGroups}
                  qualifiersPerGroup={formData.qualifiersPerGroup}
                  maxTeams={formData.maxTeams}
                  gameMode={formData.gameMode}
                />
              </>
            )}
          </div>

          {/* Points System Info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Battle Royale Points System</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Placement: 1st=12pts, 2nd=9pts, 3rd=7pts, 4th=5pts...</p>
              <p>• Kills: 1 point per kill</p>
              <p>• Total = Placement Points + Kill Points</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Tournament'}
            </button>
          </div>

          {createMutation.isError && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
              Error creating tournament. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
