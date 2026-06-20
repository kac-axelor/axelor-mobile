/*
 * Axelor Business Solutions
 *
 * Copyright (C) 2026 Axelor (<http://axelor.com>).
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {useTranslation} from 'react-i18next';

/*
 * Map of translation key to the string it should resolve to during a test.
 * Keys that are not listed fall back to the identity behaviour (the key itself
 * is returned), which is the established convention for core tests.
 */
export type TranslationOverrides = Record<string, string>;

/*
 * react-i18next is mocked globally (see jest/setup-mocks.js) so useTranslation
 * is a jest mock function. Casting through unknown reaches the jest.Mock control
 * surface without importing the real react-i18next types.
 */
const mockUseTranslation = useTranslation as unknown as jest.Mock;

/*
 * Configure the core translator for a test. By default I18n.t(key) and
 * useTranslator().t(key) return the key unchanged. Pass overrides to make
 * specific keys resolve to specific strings (for example when an assertion needs
 * the human readable label rather than the key).
 */
export const mockTranslator = (overrides: TranslationOverrides = {}): void => {
  const translate = (key: string): string =>
    Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : key;

  mockUseTranslation.mockReturnValue({
    t: translate,
    i18n: {language: 'en', changeLanguage: jest.fn()},
  });
};
