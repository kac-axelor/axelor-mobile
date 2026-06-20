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
import {View} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import ShortcutsCard from '../../../../lib/auth/components/molecules/ShortcutsCard/ShortcutsCard';
import {
  getComputedStyles,
  getDefaultThemeColors,
  mockNavigation,
  setup,
} from '../../../tools';

/*
 * ShortcutsCard renders the app shortcut tiles read from
 * state.appConfig.mobileSettings.mobileShortcutList. The redesign gives every
 * tile a fixed 52x52 square with a 16 radius and a tinted (primary light)
 * background, the shortcut icon drawn in the solid primary color, the shortcut
 * label below it, and a navigate to the shortcut screen on press.
 */
describe('ShortcutsCard Component (shortcut tile redesign)', () => {
  const Colors = getDefaultThemeColors();

  const shortcutList = [
    {
      shortcutId: 1,
      name: 'Orders',
      iconName: 'cart',
      mobileScreenName: 'OrderScreen',
    },
    {
      shortcutId: 2,
      name: 'Favorites',
      iconName: 'heart',
      mobileScreenName: 'FavoriteScreen',
    },
    {
      shortcutId: 3,
      name: 'Settings',
      iconName: 'gear',
      mobileScreenName: 'SettingsScreen',
    },
  ];

  const renderShortcutsCard = ({overrideProps, mobileShortcutList} = {}) =>
    setup({
      Component: ShortcutsCard,
      overrideProps,
      reduxState: {
        appConfig: {
          mobileSettings: {
            mobileShortcutList:
              mobileShortcutList === undefined
                ? shortcutList
                : mobileShortcutList,
          },
        },
      },
    });

  /*
   * The tinted tile is the View wrapping each shortcut icon. It is the only View
   * carrying the fixed 52 width, so filter the rendered Views by that marker.
   */
  const getTileStyles = utils =>
    utils
      .UNSAFE_getAllByType(View)
      .map(view => getComputedStyles(view.props.style))
      .filter(style => style.width === 52);

  it('renders a tile for every shortcut in the list', () => {
    mockNavigation();
    const utils = renderShortcutsCard();

    expect(getTileStyles(utils)).toHaveLength(shortcutList.length);
  });

  it('renders each shortcut icon by its configured icon name', () => {
    mockNavigation();
    const {getByTestId} = renderShortcutsCard();

    expect(getByTestId('icon-cart')).toBeTruthy();
    expect(getByTestId('icon-heart')).toBeTruthy();
    expect(getByTestId('icon-gear')).toBeTruthy();
  });

  it('draws each shortcut icon in the solid primary color', () => {
    mockNavigation();
    const {getByTestId} = renderShortcutsCard();

    /* BootstrapIcon paints the glyph through the Svg fill prop. */
    expect(getByTestId('icon-cart').props.fill).toBe(
      Colors.primaryColor.background,
    );
  });

  it('labels each tile with the shortcut name', () => {
    mockNavigation();
    const {getByText} = renderShortcutsCard();

    expect(getByText('Orders')).toBeTruthy();
    expect(getByText('Favorites')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
  });

  it('gives every tile the 52px square redesign size', () => {
    mockNavigation();
    const utils = renderShortcutsCard();

    getTileStyles(utils).forEach(tileStyle => {
      expect(tileStyle.width).toBe(52);
      expect(tileStyle.height).toBe(52);
    });
  });

  it('rounds every tile with the 16 radius', () => {
    mockNavigation();
    const utils = renderShortcutsCard();

    getTileStyles(utils).forEach(tileStyle => {
      expect(tileStyle.borderRadius).toBe(16);
    });
  });

  it('tints every tile with the primary light background', () => {
    mockNavigation();
    const utils = renderShortcutsCard();

    getTileStyles(utils).forEach(tileStyle => {
      expect(tileStyle.backgroundColor).toBe(
        Colors.primaryColor.background_light,
      );
    });
  });

  it('navigates to the shortcut screen when a tile is pressed', () => {
    const navigation = mockNavigation();
    const {getByText} = renderShortcutsCard();

    fireEvent.press(getByText('Favorites'));

    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('FavoriteScreen');
  });

  it('renders nothing when there are no shortcuts', () => {
    mockNavigation();
    const {toJSON} = renderShortcutsCard({mobileShortcutList: []});

    expect(toJSON()).toBeNull();
  });
});
