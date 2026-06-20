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
import {StyleSheet, TouchableOpacity} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import MenuIconButton from '../../../../lib/navigator/components/menu/MenuIconButton';
import {getDefaultThemeColors, setup} from '../../../tools';

/*
 * MenuIconButton is the left rail module tile. The redesign drops the elevated
 * card: inactive tiles are transparent flat icons, the active module tile is a
 * solid primary square, and the rounded variant (the user avatar) is always a
 * solid primary disc. Press behaviour and the disabled guard are unchanged.
 */
describe('MenuIconButton Component (drawer redesign)', () => {
  const Colors = getDefaultThemeColors();

  const setupButton = overrideProps =>
    setup({
      Component: MenuIconButton,
      baseProps: {icon: 'stack', subtitle: 'Stock', onPress: jest.fn()},
      overrideProps,
    });

  /* The touchable root wraps the tile container View as its first child. */
  const getContainerStyle = root =>
    StyleSheet.flatten(root.children[0].props.style);

  /* The outer pressable tile is the first TouchableOpacity (the inner one
   * belongs to the Icon and stays non touchable). */
  const getTile = utils => utils.UNSAFE_getAllByType(TouchableOpacity)[0];

  it('fires onPress when tapped and renders its icon', () => {
    const onPress = jest.fn();
    const utils = setupButton({onPress});

    expect(utils.getByTestId('icon-stack')).toBeTruthy();
    fireEvent.press(getTile(utils));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks the tile disabled so it cannot be pressed', () => {
    const utils = setupButton({disabled: true});

    expect(getTile(utils).props.disabled).toBe(true);
  });

  it('keeps an inactive module tile transparent', () => {
    const {toJSON} = setupButton({isActive: false});

    expect(getContainerStyle(toJSON()).backgroundColor).toBe('transparent');
  });

  it('fills the active module tile with the solid primary color', () => {
    const {toJSON} = setupButton({isActive: true});

    expect(getContainerStyle(toJSON()).backgroundColor).toBe(
      Colors.primaryColor.background,
    );
  });

  it('always fills the rounded avatar with the solid primary color', () => {
    const {toJSON} = setupButton({rounded: true, isActive: false});

    const containerStyle = getContainerStyle(toJSON());
    expect(containerStyle.backgroundColor).toBe(Colors.primaryColor.background);
    /* A rounded variant uses a circular radius (half its width). */
    expect(containerStyle.borderRadius).toBeGreaterThan(20);
  });
});
