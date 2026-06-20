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
import {
  useNavigation,
  usePermitted,
  useSelector,
} from '@axelor/aos-mobile-core';
import {
  Icon,
  LabelText,
  Text,
  ThemeColors,
  useThemeColor,
} from '@axelor/aos-mobile-ui';

interface DirectoryCardProps {
  directory: any;
}

const DirectoryCard = ({directory}: DirectoryCardProps) => {
  const Colors = useThemeColor();
  const navigation = useNavigation();
  const {canCreate} = usePermitted({
    modelName: 'com.axelor.dms.db.DMSFile',
  });

  const {mobileSettings} = useSelector((state: any) => state.appConfig);

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  return (
    <View style={styles.container}>
      <View style={styles.iconTile}>
        <Icon
          name="folder-fill"
          size={18}
          color={Colors.primaryColor.background}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} writingType="important" numberOfLines={2}>
          {directory.fileName}
        </Text>
        <LabelText
          title={directory.createdBy?.fullName}
          iconName="person-fill"
        />
      </View>
      {canCreate &&
        (mobileSettings?.isFolderCreationAllowed ||
          mobileSettings?.isFileCreationAllowed) && (
          <Icon
            style={styles.icon}
            name="plus"
            size={32}
            touchable
            onPress={() =>
              navigation.navigate('DocumentFormScreen', {parent: directory})
            }
          />
        )}
    </View>
  );
};

const getStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: 10,
    },
    iconTile: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: Colors.primaryColor.background_light,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: Colors.text,
      marginBottom: 2,
    },
    icon: {
      marginRight: 4,
    },
  });

export default DirectoryCard;
