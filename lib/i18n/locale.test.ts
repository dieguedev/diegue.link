import { describe, expect, it } from 'vitest';
import { resolveLocale } from '@/lib/i18n/locale';

describe('En la elección del idioma', () => {
  describe('la cookie', () => {
    it('manda sobre el navegador', () => {
      expect(resolveLocale({ cookie: 'ca', acceptLanguage: 'es-ES' })).toBe(
        'ca',
      );
    });

    it('se ignora si no es un idioma de la web', () => {
      expect(resolveLocale({ cookie: 'fr', acceptLanguage: 'ca' })).toBe('ca');
    });
  });

  describe('el navegador', () => {
    it('decide sin cookie', () => {
      expect(resolveLocale({ acceptLanguage: 'ca-ES,ca;q=0.9' })).toBe('ca');
    });

    it('se lee por orden de preferencia', () => {
      expect(
        resolveLocale({ acceptLanguage: 'es;q=0.5,ca;q=0.8,en;q=0.9' }),
      ).toBe('ca');
    });

    it('salta los idiomas que la web no tiene', () => {
      expect(resolveLocale({ acceptLanguage: 'en-US,en;q=0.9,ca;q=0.8' })).toBe(
        'ca',
      );
    });
  });

  describe('el español', () => {
    it('es el idioma sin cookie ni navegador', () => {
      expect(resolveLocale({})).toBe('es');
    });

    it('es el idioma si el navegador no pide ninguno de la web', () => {
      expect(resolveLocale({ acceptLanguage: 'en-US,fr;q=0.8' })).toBe('es');
    });
  });
});
