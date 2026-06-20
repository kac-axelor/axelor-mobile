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
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Card,
  Icon,
  Text,
  ThemeColors,
  useThemeColor,
} from '@axelor/aos-mobile-ui';
import {useSelector} from '../../../../index';
import {useNavigation} from '../../../../hooks/use-navigation';

const CARD_PERCENT_WIDTH = 90;
const CARD_PADDING = 16;

interface ShortcutsCardProps {
  style?: any;
  horizontal?: boolean;
}

const ShortcutsCard = ({style, horizontal = true}: ShortcutsCardProps) => {
  const navigation = useNavigation();
  const Colors = useThemeColor();

  const {mobileSettings} = useSelector((state: any) => state.appConfig);

  const styles = useMemo(() => {
    const cardWidth =
      Dimensions.get('window').width * (CARD_PERCENT_WIDTH / 100);
    const insideCardWidth = cardWidth - CARD_PADDING * 2;
    const baseNumberShortcutPerLine =
      Dimensions.get('window').width < 500 ? 3 : 6;
    const numberShortcutPerLine = horizontal
      ? baseNumberShortcutPerLine + 0.5
      : baseNumberShortcutPerLine;
    const shortCutWidth = insideCardWidth / numberShortcutPerLine;

    return getStyles(shortCutWidth, Colors);
  }, [Colors, horizontal]);

  const renderShortCut = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          style={styles.shortcut}
          onPress={() => navigation.navigate(item.mobileScreenName)}
          key={item.shortcutId}>
          <View style={styles.shortcutTile}>
            <Icon
              name={item.iconName}
              size={24}
              color={Colors.primaryColor.background}
            />
          </View>
          <View style={styles.shortcutTextContainer}>
            <Text fontSize={12} numberOfLines={2} style={styles.shortcutText}>
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [Colors, navigation, styles],
  );

  if (
    !Array.isArray(mobileSettings?.mobileShortcutList) ||
    mobileSettings?.mobileShortcutList.length === 0
  ) {
    return null;
  }

  return (
    <Card style={[styles.card, style]}>
      {horizontal ? (
        <FlatList
          data={mobileSettings?.mobileShortcutList}
          renderItem={renderShortCut}
          horizontal
        />
      ) : (
        mobileSettings?.mobileShortcutList.map(item => renderShortCut({item}))
      )}
    </Card>
  );
};

const getStyles = (shortCutWidth: number, Colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: `${CARD_PERCENT_WIDTH}%`,
      alignSelf: 'center',
      borderRadius: 20,
      paddingHorizontal: CARD_PADDING,
      paddingRight: CARD_PADDING,
      zIndex: 1,
    },
    shortcut: {
      width: shortCutWidth,
      paddingVertical: 5,
      alignItems: 'center',
      gap: 6,
    },
    shortcutTile: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: Colors.primaryColor.background_light,
      justifyContent: 'center',
      alignItems: 'center',
    },
    shortcutTextContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    shortcutText: {
      textAlign: 'center',
      fontWeight: '700',
    },
  });

export default ShortcutsCard;
