import { useI18n } from '@/i18n/i18n';

export default function Profile() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('profile.simple.title')}</h1>
      <p>{t('profile.simple.desc')}</p>
    </div>
  );
}
