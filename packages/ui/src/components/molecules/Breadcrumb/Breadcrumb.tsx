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

import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {ThemeColors, useThemeColor} from '../../../theme';
import {Icon, Text} from '../../atoms';

const ICON_WIDTH = 18;
const EMPTY_ITEM_WIDTH = 31;
const EMPTY_ITEM = {title: '...'};

interface Item {
  title: string;
  onPress?: () => void;
}

interface BreadcrumbProps {
  style?: any;
  disabled?: boolean;
  items: Item[];
  rootLabel?: string;
  onHomePress: () => void;
}

const Breadcrumb = ({
  style,
  disabled = false,
  items,
  rootLabel,
  onHomePress,
}: BreadcrumbProps) => {
  const Colors = useThemeColor();

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const [visibleItems, setVisibleItems] = useState(items);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemsWidth, setItemsWidth] = useState<number[]>([]);

  useEffect(() => {
    setVisibleItems(items);
  }, [items]);

  const handleItemLayout = (event, index) => {
    const {width} = event.nativeEvent.layout;
    setItemsWidth(prevWidths => {
      const newWidths = [...prevWidths];
      newWidths[index] = width;
      return newWidths;
    });
  };

  useEffect(() => {
    let totalWidth = itemsWidth.reduce((acc, width) => acc + width, ICON_WIDTH);

    if (
      items.length > 0 &&
      itemsWidth.length === items.length &&
      totalWidth > containerWidth
    ) {
      let newVisibleItems = [...items];

      let idx = 0;
      while (totalWidth > containerWidth) {
        if (idx === 0) {
          newVisibleItems = [EMPTY_ITEM, ...newVisibleItems.slice(1)];
          totalWidth += EMPTY_ITEM_WIDTH;
        } else {
          newVisibleItems = [EMPTY_ITEM, ...newVisibleItems.slice(2)];
        }
        totalWidth -= itemsWidth[idx];
        idx++;
      }

      setVisibleItems(newVisibleItems);
    }
  }, [containerWidth, items, itemsWidth]);

  return (
    <View
      testID="breadcrumbContainer"
      style={[styles.container, style]}
      onLayout={e => setContainerWidth(e?.nativeEvent?.layout?.width)}>
      <Icon
        name="house-door-fill"
        touchable={!disabled}
        onPress={onHomePress}
      />
      {visibleItems.length === 0 && rootLabel != null && (
        <Text style={styles.rootLabel}>{rootLabel}</Text>
      )}
      {visibleItems.map((item, index) => (
        <View
          style={styles.contentContainer}
          onLayout={e => handleItemLayout(e, index)}
          key={index}
          testID={`breadcrumbItemContainer-idx${index}`}>
          <Icon name="chevron-right" color={Colors.secondaryColor.background} />
          <TouchableOpacity
            testID={`breadcrumbItem-idx${index}`}
            style={styles.textContainer}
            activeOpacity={0.7}
            disabled={disabled || !item.onPress}
            onPress={item.onPress}>
            <Text>{item.title}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const getStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '90%',
      height: 28,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      columnGap: 4,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContainer: {
      justifyContent: 'center',
    },
    rootLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.secondaryColor_dark.background,
    },
  });

export default Breadcrumb;
