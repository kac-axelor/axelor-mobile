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
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Icon,
  InfoBubble,
  Text,
  useConfig,
  useThemeColor,
} from '@axelor/aos-mobile-ui';
import {Compatibility} from '../../../app';
import {useTranslator} from '../../../i18n';
import {getCompatibilityError, isMenuIncompatible} from '../../helpers';

const WIDTH = 48;
const HEIGHT = 48;
const DEFAULT_RADIUS = 14;
const ROUNDED_RADIUS = WIDTH / 2;

interface MenuIconButtonProps {
  style?: any;
  icon: string;
  onPress: () => void;
  isActive?: boolean;
  subtitle?: string;
  rounded?: boolean;
  disabled?: boolean;
  compatibility?: Compatibility;
}

const MenuIconButton = ({
  style,
  icon,
  onPress,
  isActive = false,
  subtitle,
  rounded = false,
  disabled = false,
  compatibility,
}: MenuIconButtonProps) => {
  const Colors = useThemeColor();
  const I18n = useTranslator();
  const {showSubtitles} = useConfig();

  /*
   * The rounded variant is the user avatar, which always reads as a solid
   * primary disc. Module tiles are filled with the solid primary color only
   * when active; inactive tiles stay transparent so the rail shows plain icons
   * over the drawer background.
   */
  const filled = useMemo(() => rounded || isActive, [isActive, rounded]);

  const _color = useMemo(
    () => (filled ? Colors.primaryColor.background : 'transparent'),
    [Colors, filled],
  );

  /*
   * Icon color follows the tile: the readable foreground over the primary fill
   * when filled, a muted grey when disabled, and the standard dark icon color
   * otherwise.
   */
  const iconColor = useMemo(() => {
    if (filled) {
      return Colors.primaryColor.foreground;
    }

    return disabled
      ? Colors.secondaryColor.background
      : Colors.secondaryColor_dark.background;
  }, [Colors, disabled, filled]);

  const styles = useMemo(
    () => getStyles(rounded, _color),
    [_color, rounded],
  );

  const compatibilityError = useMemo(
    () => isMenuIncompatible(compatibility),
    [compatibility],
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || compatibilityError}
      activeOpacity={0.95}>
      <View style={[styles.container, style]}>
        <Icon size={28} name={icon} color={iconColor} />
        {compatibilityError && (
          <InfoBubble
            style={styles.infoBubble}
            usePopup={true}
            iconName="exclamation-triangle-fill"
            badgeColor={Colors.errorColor}
            textIndicationStyle={styles.textIndicationStyle}
            indication={getCompatibilityError(compatibility, I18n)}
          />
        )}
      </View>
      {showSubtitles && (
        <Text style={styles.moduleSubtitle} numberOfLines={1}>
          {I18n.t(subtitle)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (rounded: boolean, _color: string) =>
  StyleSheet.create({
    container: {
      width: WIDTH,
      height: HEIGHT,
      borderRadius: rounded ? ROUNDED_RADIUS : DEFAULT_RADIUS,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: _color,
      zIndex: 10,
    },
    moduleSubtitle: {
      fontSize: 10,
      maxWidth: WIDTH + 6,
      alignSelf: 'center',
    },
    infoBubble: {
      position: 'absolute',
      bottom: -10,
      right: -10,
    },
    textIndicationStyle: {
      width: Dimensions.get('window').width * 0.6,
      top: 0,
    },
  });

export default MenuIconButton;
