import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-slate-400" aria-hidden="true" />
      <div className="flex items-center space-x-1">
        <Button
          variant={currentLanguage === 'fr' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('fr')}
          className={`px-2 py-1 text-xs ${
            currentLanguage === 'fr' 
              ? 'bg-primary text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Passer en français"
        >
          FR
        </Button>
        <Button
          variant={currentLanguage === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => changeLanguage('en')}
          className={`px-2 py-1 text-xs ${
            currentLanguage === 'en' 
              ? 'bg-primary text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          aria-label="Switch to English"
        >
          EN
        </Button>
      </div>
    </div>
  );
}