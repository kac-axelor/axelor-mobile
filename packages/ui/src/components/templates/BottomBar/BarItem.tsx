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
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Color, useThemeColor} from '../../../theme';
import {Icon} from '../../atoms';
import {NumberBubble} from '../../molecules';
import ItemTitle from './ItemTitle';

const BarItem = ({
  iconName,
  color,
  title,
  isSelected = false,
  disabled,
  indicator,
  onPress,
}: {
  iconName: string;
  color?: Color;
  title?: string;
  isSelected: boolean;
  size?: number;
  disabled?: boolean;
  indicator?: number;
  onPress: () => void;
}) => {
  const Colors = useThemeColor();

  const buttonColor: Color = useMemo(
    () => color ?? Colors.primaryColor,
    [Colors.primaryColor, color],
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isSelected
              ? buttonColor.background_light
              : 'transparent',
          },
        ]}>
        <Icon
          name={iconName}
          size={20}
          color={
            isSelected
              ? buttonColor.background
              : Colors.secondaryColor_dark.background
          }
        />
        {indicator > 0 && (
          <View style={styles.indicator}>
            <NumberBubble
              number={indicator}
              color={buttonColor}
              isNeutralBackground={true}
            />
          </View>
        )}
      </View>
      <ItemTitle
        title={title}
        isSelected={isSelected}
        activeColor={buttonColor.background}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  pill: {
    width: 42,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
});

export default BarItem;
