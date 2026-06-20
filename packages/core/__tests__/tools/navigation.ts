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

import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';

/*
 * Subset of the React Navigation navigation object that core components touch.
 * Every entry is a jest mock function so tests can assert that
 * navigate/goBack/openDrawer were called.
 */
export interface MockNavigation {
  navigate: jest.Mock;
  goBack: jest.Mock;
  openDrawer: jest.Mock;
  closeDrawer: jest.Mock;
  toggleDrawer: jest.Mock;
  dispatch: jest.Mock;
  setOptions: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  reset: jest.Mock;
  emit: jest.Mock;
  isFocused: jest.Mock;
}

/*
 * Route object returned by useRoute. params defaults to an empty object so a
 * screen that reads route.params?.someField does not crash.
 */
export interface MockRoute {
  key: string;
  name: string;
  params: Record<string, unknown>;
}

/* The navigation hooks are jest mocks because the module is mocked globally. */
const mockUseNavigation = useNavigation as unknown as jest.Mock;
const mockUseRoute = useRoute as unknown as jest.Mock;
const mockUseIsFocused = useIsFocused as unknown as jest.Mock;

/*
 * Build a fresh navigation object whose every method is an independent jest
 * mock. emit returns a non prevented event so DrawerContent style code that
 * checks event.defaultPrevented behaves predictably.
 */
export const getMockNavigation = (): MockNavigation =>
  ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    toggleDrawer: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
    reset: jest.fn(),
    emit: jest.fn(() => ({defaultPrevented: false})),
    isFocused: jest.fn(() => true),
  } as unknown as MockNavigation);

/*
 * Wire the navigation hooks for a test. useNavigation returns the provided (or a
 * fresh) navigation object, useRoute returns a route merged with the provided
 * params, and useIsFocused returns the provided focus flag (true by default).
 * Returns the navigation object so a test can assert on its methods.
 */
export const mockNavigation = (options?: {
  navigation?: MockNavigation;
  routeParams?: Record<string, unknown>;
  isFocused?: boolean;
}): MockNavigation => {
  const navigation = options?.navigation ?? getMockNavigation();
  const route: MockRoute = {
    key: 'mock-route',
    name: 'MockScreen',
    params: options?.routeParams ?? {},
  };

  mockUseNavigation.mockReturnValue(navigation);
  mockUseRoute.mockReturnValue(route);
  mockUseIsFocused.mockReturnValue(options?.isFocused ?? true);

  return navigation;
};
