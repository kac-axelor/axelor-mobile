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

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';
import {Card} from '../../atoms';
import BarItem from './BarItem';
import {BottomBarItem} from './types.helper';
import {getVisibleItems} from './display.helper';

const BottomBar = ({
  style,
  items,
  updateActiveItem = false,
  itemSize = 50,
  manageActiveTitle = true,
}: {
  style?: any;
  items: BottomBarItem[];
  updateActiveItem?: boolean;
  itemSize?: number;
  manageActiveTitle?: boolean;
}) => {
  const [selectedKey, setSelectedKey] = useState<string>();

  const visibleItems: BottomBarItem[] = useMemo(
    () => getVisibleItems(items),
    [items],
  );

  const handleItemPress = useCallback(
    (item: BottomBarItem) => {
      if (typeof item.onPress === 'function') {
        item.onPress();
      }

      if (item.viewComponent != null) {
        setSelectedKey(item.key);
      }
    },
    [setSelectedKey],
  );

  const renderItem = useCallback(
    (item: BottomBarItem) => {
      return (
        <View key={item.key} testID={`bar-item-${(item as any).testID}`}>
          <BarItem
            {...item}
            title={manageActiveTitle ? item.title : undefined}
            size={itemSize}
            onPress={() => handleItemPress(item)}
            isSelected={selectedKey === item.key && !('onPress' in item)}
          />
        </View>
      );
    },
    [manageActiveTitle, itemSize, selectedKey, handleItemPress],
  );

  useEffect(() => {
    if (selectedKey == null) {
      const _viewItem = visibleItems?.find(
        ({viewComponent}) => viewComponent != null,
      );
      setSelectedKey(_viewItem?.key);
    }
  }, [selectedKey, visibleItems]);

  useEffect(() => {
    const activeItem = visibleItems.find(item => item.isActive);

    if (activeItem && updateActiveItem) {
      setSelectedKey(activeItem.key);
    }
  }, [updateActiveItem, visibleItems]);

  const activeView = useMemo(
    () => visibleItems.find(_item => _item.key === selectedKey),
    [selectedKey, visibleItems],
  );

  return (
    <View style={styles.container}>
      <View style={styles.viewContainer} testID="bottomBarViewComtainer">
        {activeView?.viewComponent}
      </View>
      <View testID="bottomBarComtainer">
        <Card
          style={[
            styles.bottomContainer,
            {marginBottom: 10 + StaticSafeAreaInsets.safeAreaInsetsBottom},
            style,
          ]}>
          <View style={styles.itemsContainer}>
            {visibleItems.map(renderItem)}
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    width: '100%',
  },
  bottomContainer: {
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'column',
    width: '90%',
    alignSelf: 'center',
  },
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default BottomBar;
