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
import {StyleSheet, View} from 'react-native';
import {Color, useThemeColor} from '../../../theme';
import {Text} from '../../atoms';

interface BadgeProps {
  style?: any;
  txtStyle?: any;
  title: string | number;
  color?: Color;
  numberOfLines?: number;
}

const Badge = ({
  style,
  txtStyle,
  title,
  color = null,
  numberOfLines = 1,
}: BadgeProps) => {
  const Colors = useThemeColor();
  const badgeStyle = useMemo(
    () => getStyles(color || Colors.primaryColor),
    [color, Colors],
  );

  return (
    <View style={[badgeStyle.container, style]} testID="bagdeContainer">
      <Text
        style={[badgeStyle.text, txtStyle]}
        numberOfLines={numberOfLines}
        textColor={(color || Colors.primaryColor)?.background}
        fontSize={14}>
        {title}
      </Text>
    </View>
  );
};

const getStyles = color =>
  StyleSheet.create({
    container: {
      backgroundColor: color?.background_light,
      borderWidth: 0,
      borderRadius: 20,
      margin: '1%',
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      fontWeight: 'bold',
    },
  });

export default Badge;
