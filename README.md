# SocialAffluence

SocialAffluence is an advanced crowd flow analysis platform powered by AI.

## Internationalization (i18n)

This project supports multiple languages using react-i18next. Currently supported languages:
- French (fr) - Default language
- English (en)

### How to Add a New Language

1. **Create translation file**: Add a new JSON file in `client/src/locales/` for your language code (e.g., `es.json` for Spanish).

2. **Add translations**: Copy the structure from `fr.json` or `en.json` and translate all the text values:

```json
{
  "navigation": {
    "features": "Características",
    "pricing": "Precios",
    // ... other translations
  },
  "hero": {
    "title": "Monitorea el flujo de personas en",
    "titleHighlight": "tiempo real"
    // ... other translations
  }
  // ... rest of the structure
}
```

3. **Update i18n configuration**: Add your new language to `client/src/i18n.ts`:

```typescript
// Import your translation file
import es from './locales/es.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es }, // Add your language here
};
```

4. **Update LanguageSwitcher**: Modify `client/src/components/LanguageSwitcher.tsx` to include your new language button:

```tsx
<Button
  variant={currentLanguage === 'es' ? 'default' : 'ghost'}
  size="sm"
  onClick={() => changeLanguage('es')}
  // ... styling and aria-label
>
  ES
</Button>
```

5. **Test**: Start the development server with `npm run dev` and verify that the language switching works correctly.

### Language Detection

The system automatically detects user language preference in this order:
1. localStorage (saved preference)
2. Browser language
3. HTML lang attribute
4. URL path/subdomain
5. Fallback to French (default)

### Translation Keys Structure

The translation keys are organized by sections:
- `navigation.*` - Header navigation links
- `hero.*` - Main hero section content  
- `features.*` - Product features section
- `examples.*` - Use case examples carousel
- `about.*` - About/technology section
- `cta.*` - Call-to-action section
- `footer.*` - Footer content
- `pricing.*` - Pricing page content

### Development

To run the development server:
```bash
npm run dev
```

To build the project:
```bash
npm run build
```

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- react-i18next for internationalization
- Tailwind CSS for styling
- Express.js backend
- PostgreSQL database