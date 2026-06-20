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

import React from 'react';
import {StyleSheet} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import MenuItemEntry from '../../../../lib/navigator/components/menu/MenuItemEntry';
import {getDefaultThemeColors, setup} from '../../../tools';

/*
 * MenuItemEntry is the redesigned drawer entry row. The redesign moves the
 * active highlight from a thin left side bar to a full width light primary pill
 * and wraps the icon in a rounded tile, while keeping the existing props and the
 * onPress / chevron behaviour untouched.
 */
describe('MenuItemEntry Component (drawer redesign)', () => {
  const Colors = getDefaultThemeColors();

  const setupEntry = overrideProps =>
    setup({
      Component: MenuItemEntry,
      baseProps: {
        icon: 'calendar-check',
        title: 'Planning',
        compatibility: undefined,
        onPress: jest.fn(),
      },
      overrideProps,
    });

  /* Flatten the styles applied to the touchable's single child row View. */
  const getRowStyle = root => {
    const row = root.children[0];
    return StyleSheet.flatten(row.props.style);
  };

  it('renders the title and fires onPress when tapped', () => {
    const onPress = jest.fn();
    const {getByText} = setupEntry({onPress});

    fireEvent.press(getByText('Planning'));

    expect(getByText('Planning')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    const {getByText} = setupEntry({onPress, disabled: true});

    fireEvent.press(getByText('Planning'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows no highlight pill when inactive', () => {
    const {toJSON} = setupEntry({isActive: false});

    const rowStyle = getRowStyle(toJSON());

    /* The inactive row keeps the rounded shape but no primary fill. */
    expect(rowStyle.borderRadius).toBe(14);
    expect(rowStyle.backgroundColor).toBeUndefined();
  });

  it('fills the whole row with the light primary pill when active', () => {
    const {toJSON} = setupEntry({isActive: true});

    const rowStyle = getRowStyle(toJSON());

    expect(rowStyle.backgroundColor).toBe(Colors.primaryColor.background_light);
  });

  it('highlights an expanded dropdown parent even when not the active route', () => {
    const {toJSON} = setupEntry({
      isActive: false,
      isDropdown: true,
      dropdown: true,
    });

    const rowStyle = getRowStyle(toJSON());

    expect(rowStyle.backgroundColor).toBe(Colors.primaryColor.background_light);
  });

  it('renders the dropdown chevron only for dropdown entries', () => {
    const collapsed = setupEntry({isDropdown: true, dropdown: false});
    expect(collapsed.getByText('Planning')).toBeTruthy();
    expect(collapsed.queryByTestId('icon-chevron-down')).toBeTruthy();
    expect(collapsed.queryByTestId('icon-chevron-up')).toBeNull();

    const expanded = setupEntry({isDropdown: true, dropdown: true});
    expect(expanded.queryByTestId('icon-chevron-up')).toBeTruthy();
    expect(expanded.queryByTestId('icon-chevron-down')).toBeNull();

    const simple = setupEntry({isDropdown: false});
    expect(simple.queryByTestId('icon-chevron-down')).toBeNull();
    expect(simple.queryByTestId('icon-chevron-up')).toBeNull();
  });
});
