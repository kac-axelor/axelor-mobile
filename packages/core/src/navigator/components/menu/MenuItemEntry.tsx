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

import React, {useMemo} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {
  Icon,
  Text,
  ThemeColors,
  WarningCard,
  useThemeColor,
} from '@axelor/aos-mobile-ui';
import {Compatibility} from '../../../app';
import {useTranslator} from '../../../i18n';
import {getCompatibilityError, isMenuIncompatible} from '../../helpers';

interface MenuItemEntryProps {
  style?: any;
  icon: string;
  title: string;
  compatibility: Compatibility;
  onPress: () => void;
  isActive?: boolean;
  disabled?: boolean;
  isDropdown?: boolean;
  dropdown?: boolean;
  iconSize?: number;
}

const MenuItemEntry = ({
  style,
  icon,
  title,
  compatibility,
  onPress,
  isActive = false,
  disabled = false,
  isDropdown = false,
  dropdown = false,
  iconSize = 24,
}: MenuItemEntryProps) => {
  const Colors = useThemeColor();
  const I18n = useTranslator();

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const compatibilityError = useMemo(
    () => isMenuIncompatible(compatibility),
    [compatibility],
  );

  const menuDisabled = useMemo(
    () => disabled || compatibilityError,
    [compatibilityError, disabled],
  );

  /*
   * The row reads as highlighted both when it is the active route and when it is
   * an expanded dropdown parent: a full width light primary pill replaces the
   * former left side bar so the whole entry is emphasised.
   */
  const highlighted = useMemo(
    () => isActive || dropdown,
    [dropdown, isActive],
  );

  const iconColor = useMemo(() => {
    if (menuDisabled) {
      return Colors.secondaryColor.background_light;
    }

    return highlighted
      ? Colors.primaryColor.background
      : Colors.secondaryColor_dark.background;
  }, [Colors, highlighted, menuDisabled]);

  return (
    <TouchableOpacity onPress={onPress} disabled={menuDisabled}>
      <View
        style={[
          styles.row,
          highlighted && styles.rowHighlighted,
          style,
        ]}>
        <View
          style={[
            styles.iconTile,
            highlighted && styles.iconTileHighlighted,
          ]}>
          <Icon
            name={icon}
            size={iconSize}
            color={iconColor}
            visible={icon != null}
          />
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text
            style={styles.menuItemTitle}
            textColor={
              menuDisabled ? Colors.secondaryColor.background_light : Colors.text
            }>
            {title}
          </Text>
        </View>
        <Icon
          name={dropdown ? 'chevron-up' : 'chevron-down'}
          color={Colors.secondaryColor_dark.background}
          style={styles.dropdownIcon}
          visible={isDropdown && !compatibilityError}
        />
        <Icon
          name="exclamation-triangle-fill"
          color={Colors.errorColor.background}
          style={styles.dropdownIcon}
          visible={compatibilityError}
        />
      </View>
      {compatibilityError && (
        <WarningCard
          style={styles.compatibilityError}
          errorMessage={getCompatibilityError(compatibility, I18n, false)}
        />
      )}
    </TouchableOpacity>
  );
};

const ICON_TILE_SIZE = 40;

const getStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 12,
      marginVertical: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: 14,
    },
    rowHighlighted: {
      backgroundColor: Colors.primaryColor.background_light,
    },
    iconTile: {
      width: ICON_TILE_SIZE,
      height: ICON_TILE_SIZE,
      borderRadius: 12,
      marginRight: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.primaryColor.background_light,
    },
    iconTileHighlighted: {
      backgroundColor: Colors.backgroundColor,
    },
    menuItemTextContainer: {
      flex: 1,
      alignSelf: 'center',
      paddingRight: 8,
    },
    menuItemTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    dropdownIcon: {
      marginHorizontal: 5,
      marginRight: 12,
    },
    compatibilityError: {
      marginVertical: 0,
      marginHorizontal: 7,
      width: '95%',
    },
  });

export default MenuItemEntry;
