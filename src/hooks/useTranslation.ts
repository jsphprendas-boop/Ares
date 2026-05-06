import { useAuth } from '../lib/AuthContext';
import { translations, TranslationKey } from '../lib/translations';

export const useTranslation = () => {
  const { profile } = useAuth();
  const lang = profile?.language || 'es';

  const t = (key: TranslationKey) => {
    return translations[lang][key] || key;
  };

  return { t, lang };
};
