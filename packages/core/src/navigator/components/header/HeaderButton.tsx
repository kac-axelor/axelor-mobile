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

import React, {useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {
  DrawerActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {Icon, ThemeColors, useThemeColor} from '@axelor/aos-mobile-ui';

interface HeaderButtonProps {
  isRoot?: boolean;
}

const HeaderButton = ({isRoot = false}: HeaderButtonProps) => {
  const navigation = useNavigation();
  const Colors = useThemeColor();

  const handlePress = useCallback(
    () =>
      navigation.dispatch(
        isRoot ? DrawerActions.toggleDrawer() : StackActions.pop(),
      ),
    [isRoot, navigation],
  );

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  return (
    <Icon
      style={styles.button}
      name={isRoot ? 'list' : 'chevron-left'}
      size={24}
      color={Colors.primaryColor.background}
      touchable
      onPress={handlePress}
    />
  );
};

/* The left button now sits on an elevated rounded surface (matching the redesign
 * action cards), while keeping its existing icon and navigation behavior. */
const getStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: Colors.backgroundColor,
      elevation: 3,
      shadowOpacity: 0.5,
      shadowColor: Colors.secondaryColor.background,
      shadowOffset: {width: 0, height: 0},
    },
  });

export default HeaderButton;
