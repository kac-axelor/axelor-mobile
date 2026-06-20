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

import {DateDisplay} from '@axelor/aos-mobile-core';
import {setup} from '../../tools';

/*
 * Smoke test exercising the core test harness against a stable low dependency
 * leaf component. DateDisplay consumes the core translator and the ui theme but
 * neither redux nor navigation, which keeps it independent of the redesign
 * target components owned by other tickets while still proving the harness wires
 * those cross cutting contexts.
 */
describe('DateDisplay Component (core harness smoke test)', () => {
  const setupDateDisplay = overrideProps =>
    setup({
      Component: DateDisplay,
      baseProps: {date: '2026-06-19', displayYear: true},
      overrideProps,
    });

  it('renders without crashing', () => {
    const {getByText, props} = setupDateDisplay();

    /* getFullDateItems splits the date prop into the rendered day-of-month and,
     * because displayYear is set, the year. */
    expect(getByText(/19/)).toBeTruthy();
    expect(getByText(/2026/)).toBeTruthy();
    expect(props.date).toBe('2026-06-19');
  });
});
