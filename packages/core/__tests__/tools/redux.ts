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

import {useDispatch, useSelector} from 'react-redux';

/*
 * The shape of the redux state is intentionally open: each feature slice owns
 * its own keys (auth, online, camera, ...) and tests only supply the slices the
 * component under test reads. A nested partial state is therefore modelled as a
 * dictionary of unknown values that selectors narrow at their use site.
 */
export type MockReduxState = Record<string, unknown>;

type Selector = (state: MockReduxState) => unknown;

/*
 * react-redux is mocked globally (see jest/setup-mocks.js) so useSelector and
 * useDispatch are jest mock functions. Casting through unknown exposes the mock
 * control surface (mockImplementation / mockReturnValue) on these hooks.
 */
const mockUseSelector = useSelector as unknown as jest.Mock;
const mockUseDispatch = useDispatch as unknown as jest.Mock;

/*
 * Make every useSelector(selector) call in the component run the selector
 * against the provided state object. Core components call useSelector many times
 * with different selectors (state.auth, state.online, ...), so a single
 * mockReturnValue is not enough; an implementation that applies the selector is
 * required. Returns the same state so callers can keep a reference if needed.
 */
export const mockReduxState = (state: MockReduxState = {}): MockReduxState => {
  mockUseSelector.mockImplementation((selector: Selector) =>
    typeof selector === 'function' ? selector(state) : undefined,
  );

  return state;
};

/*
 * Provide a fresh dispatch mock and wire useDispatch to return it for the
 * duration of a test. Returns the dispatch mock so a test can assert on the
 * actions a component dispatched.
 */
export const getMockDispatch = (): jest.Mock => {
  const dispatch = jest.fn();
  mockUseDispatch.mockReturnValue(dispatch);

  return dispatch;
};
