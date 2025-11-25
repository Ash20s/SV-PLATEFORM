import { Calendar, MapPin, Trophy, Users, X, Clock, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Scrim, Tournament } from '@/types';
import { useI18n } from '@/i18n/i18n';

export type SelectedEvent =
  | { type: 'tournament'; data: Partial<Tournament> & { _id?: string; registeredTeams?: Array<{ team?: { name?: string; tag?: string }; checkedIn?: boolean }>; prizePool?: number; tier?: string; region?: string; status?: string; description?: string; startDate?: string | Date; endDate?: string | Date; pointsSystem?: any; name?: string } }
  | { type: 'scrim'; data: Partial<Scrim> & { _id?: string; host?: { name?: string }; participants?: Array<{ team?: { name?: string; tag?: string }; status?: string }>; tier?: string; region?: string; date?: string | Date; time?: string; numberOfGames?: number; maxTeams?: number; status?: string; name?: string } };

interface EventDetailsModalProps {
  event: SelectedEvent;
  onClose: () => void;
}

const formatDate = (value?: string | Date) => {
  // Note: formatDate is called before useI18n hook, so we keep it simple
  if (!value) return 'Unknown date';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
};

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { t } = useI18n();
  const isTournament = event.type === 'tournament';
  const base = event.data;
  const displayTitle = isTournament ? (base as any).name : (base as any).title;
  const organizerName = typeof (base as any).organizer === 'object' && (base as any).organizer !== null
    ? (base as any).organizer.username
    : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-border bg-background p-2 text-muted-foreground transition hover:text-foreground"
          aria-label="Close event details"
        >
          <X size={18} />
        </button>

        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              {isTournament ? <Trophy size={22} /> : <Users size={22} />}
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {isTournament ? t('common.tournaments') : t('scrims.title')} {t('common.details')}
              </p>
              <h2 className="text-2xl font-bold">{displayTitle ?? t('event.untitled')}</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
          <div className="space-y-4">
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Calendar size={16} /> {t('event.schedule')}
              </h3>
              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{formatDate((base as any).startDate ?? (base as any).date)}</p>
                {isTournament && (base as any).endDate && (
                  <p className="mt-1">{t('event.ends')}: {formatDate((base as any).endDate)}</p>
                )}
                {!isTournament && (base as any).time && <p className="mt-1 flex items-center gap-2"><Clock size={14} /> {(base as any).time}</p>}
              </div>
            </section>

            {(isTournament ? (base as any).description : (base as any).notes) && (
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  <Info size={16} /> {t('event.overview')}
                </h3>
                <p className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground whitespace-pre-line">
                  {isTournament ? (base as any).description : (base as any).notes}
                </p>
              </section>
            )}
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin size={16} /> {t('event.key.info')}
              </h3>
              <div className="grid gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm">
                {isTournament ? (
                    <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('common.organizer')}</span>
                      <span className="font-semibold">{organizerName ?? t('common.unknown')}</span>
                    </div>
                    {(base as any).status && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.status')}</span>
                        <span className="font-semibold capitalize">{(base as any).status}</span>
                      </div>
                    )}
                    {(base as any).tier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.tier')}</span>
                        <span className="font-semibold">{(base as any).tier}</span>
                      </div>
                    )}
                    {(base as any).region && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.region')}</span>
                        <span className="font-semibold">{(base as any).region}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('common.teams')}</span>
                      <span className="font-semibold">
                        {(base as any).registeredTeams?.length ?? 0}/{(base as any).maxTeams ?? 0}
                      </span>
                    </div>
                    {(base as any).prizePool && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('tournament.details.prize.pool')}</span>
                        <span className="bg-[#FFBE0B] text-black px-3 py-1 rounded font-bold text-sm">
                          ${(base as any).prizePool.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('common.organizer')}</span>
                      <span className="font-semibold">{organizerName ?? t('common.unknown')}</span>
                    </div>
                    {(base as any).status && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.status')}</span>
                        <span className="font-semibold capitalize">{(base as any).status}</span>
                      </div>
                    )}
                    {(base as any).tier && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.tier')}</span>
                        <span className="font-semibold">{(base as any).tier}</span>
                      </div>
                    )}
                    {(base as any).region && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('common.region')}</span>
                        <span className="font-semibold">{(base as any).region}</span>
                      </div>
                    )}
                    {(base as any).maxTeams && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{t('event.max.teams')}</span>
                        <span className="font-semibold">{(base as any).maxTeams}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('common.games')}</span>
                      <span className="font-semibold">{(base as any).numberOfGames ?? 0}</span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {isTournament ? (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('tournament.details.registered.teams')}</h3>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-background px-4 py-3 text-sm">
                  {(base as any).registeredTeams?.length ? (
                    <ul className="space-y-2">
                      {(base as any).registeredTeams.map((entry: any, idx: number) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="font-medium text-foreground">
                            {entry.team?.name ?? t('common.unknown.team')}
                          </span>
                          {entry.team?.tag && <span className="text-xs text-muted-foreground">[{entry.team.tag}]</span>}
                          {entry.checkedIn && <span className="text-xs text-green-500">{t('tournament.details.checked.in')}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">{t('event.no.teams.registered')}</p>
                  )}
                </div>
              </section>
            ) : (
              <section>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('event.participants')}</h3>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-border bg-background px-4 py-3 text-sm">
                  {(base as any).participants?.length ? (
                    <ul className="space-y-2">
                      {(base as any).participants.map((entry: any, idx: number) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{entry.team?.name ?? t('common.unknown.team')}</span>
                          <span className="text-xs uppercase text-muted-foreground">{entry.status ?? 'pending'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">{t('event.no.participants')}</p>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-card/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            {t('common.close')}
          </button>
          {isTournament ? (
            <Link
              to={`/tournaments/${(base as any)._id ?? ''}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t('event.view.tournament')}
            </Link>
          ) : (
            <Link
              to="/scrims"
              className="rounded-lg bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              {t('event.manage.scrims')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
