import { useState, useEffect } from 'react';
import { useCreateTeam } from '@/hooks/useTeams';
import { useAuthStore } from '@/stores/authStore';
import { useTeams } from '@/hooks/useTeams';
import { Users, Shield, Flag, Hash, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '@/i18n/i18n';

interface CreateTeamFormProps {
  onCreated?: (team: any) => void;
}

const REGIONS = ['EU', 'NA', 'ASIA', 'OCE', 'SA'] as const;

export default function CreateTeamForm({ onCreated }: CreateTeamFormProps) {
  const { updateUser, isAuthenticated, user } = useAuthStore();
  const createTeam = useCreateTeam();
  const { data: teamsData } = useTeams();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    region: 'EU' as (typeof REGIONS)[number],
    logo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    tag?: string;
    logo?: string;
  }>({});

  // Liste des équipes existantes pour vérifier les doublons
  const existingTeams = (teamsData as any)?.data || (teamsData as any)?.teams || [];

  // Vérification des doublons en temps réel
  useEffect(() => {
    const errors: { name?: string; tag?: string } = {};
    
    if (formData.name.trim()) {
      const nameExists = existingTeams.some((team: any) => 
        team.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
      if (nameExists) {
        errors.name = t('team.create.name.duplicate');
      }
    }

    if (formData.tag.trim()) {
      const tagExists = existingTeams.some((team: any) => 
        team.tag.toUpperCase() === formData.tag.trim().toUpperCase()
      );
      if (tagExists) {
        errors.tag = t('team.create.tag.duplicate');
      }
    }

    setValidationErrors(errors);
  }, [formData.name, formData.tag, existingTeams]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
    // Réinitialiser l'erreur de validation pour ce champ
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof validationErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Vérifier l'authentification
    if (!isAuthenticated || !user) {
      setError(t('team.create.must.login'));
      return;
    }

    // Vérifier que l'utilisateur n'a pas déjà une équipe
    if (user.teamId) {
      setError(t('team.create.already.has.team'));
      return;
    }

    const payload = {
      name: formData.name.trim(),
      tag: formData.tag.trim(),
      region: formData.region,
      logo: formData.logo.trim() || undefined,
    };

    // Validations
    if (!payload.name || !payload.tag) {
      setError(t('team.create.name.required'));
      return;
    }

    if (payload.name.length < 3 || payload.name.length > 50) {
      setError(t('team.create.name.length'));
      return;
    }

    if (payload.tag.length < 3 || payload.tag.length > 5) {
      setError(t('team.create.tag.length'));
      return;
    }

    // Vérifier les doublons
    if (validationErrors.name || validationErrors.tag) {
      setError(t('team.create.validation.errors'));
      return;
    }

    // Validation de l'URL du logo si fournie
    if (payload.logo) {
      try {
        new URL(payload.logo);
      } catch {
        setError(t('team.create.logo.invalid'));
        return;
      }
    }

    createTeam.mutate(payload, {
      onSuccess: (data) => {
        const team = data.team;
        const createdTeamId = (team as any)?._id || (team as any)?.id;
        updateUser({ role: 'captain', teamId: createdTeamId });
        setSuccess(t('team.create.success'));
        setFormData({
          name: '',
          tag: '',
          region: 'EU',
          logo: '',
        });
        onCreated?.(team);
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message ??
          t('team.create.error');
        setError(message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Users size={16} />
            {t('team.create.name.label')} *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Dream Squad"
            className={`w-full bg-background border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              validationErrors.name 
                ? 'border-destructive focus:ring-destructive' 
                : 'border-border focus:ring-primary'
            }`}
            required
            minLength={3}
            maxLength={50}
          />
          {validationErrors.name && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.name}
            </p>
          )}
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Hash size={16} />
            {t('team.create.tag.label')} *
          </label>
          <input
            type="text"
            value={formData.tag}
            onChange={(e) => handleChange('tag', e.target.value.toUpperCase())}
            placeholder="DSQD"
            className={`w-full bg-background border rounded-lg px-4 py-2 uppercase tracking-wide focus:outline-none focus:ring-2 ${
              validationErrors.tag 
                ? 'border-destructive focus:ring-destructive' 
                : 'border-border focus:ring-primary'
            }`}
            maxLength={5}
            minLength={3}
            required
          />
          {validationErrors.tag && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.tag}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Flag size={16} />
            {t('team.create.region.label')} *
          </label>
          <select
            value={formData.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Shield size={16} />
            {t('team.create.logo.label')}
          </label>
          <input
            type="url"
            value={formData.logo}
            onChange={(e) => handleChange('logo', e.target.value)}
            placeholder="https://..."
            className={`w-full bg-background border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              validationErrors.logo 
                ? 'border-destructive focus:ring-destructive' 
                : 'border-border focus:ring-primary'
            }`}
          />
          {validationErrors.logo && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {validationErrors.logo}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {t('team.create.logo.optional')}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={createTeam.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createTeam.isPending && <Loader2 size={16} className="animate-spin" />}
        {t('team.create.button')}
      </button>
    </form>
  );
}

