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
import {
  UserSearchBar,
  useNavigation,
  usePermitted,
  useSelector,
} from '@axelor/aos-mobile-core';
import {
  Icon,
  ThemeColors,
  ToggleButton,
  useThemeColor,
} from '@axelor/aos-mobile-ui';

interface AuthorFilterProps {
  author: any;
  setAuthor: (author: any) => void;
  parent?: any;
}

const AuthorFilter = ({author, setAuthor, parent}: AuthorFilterProps) => {
  const Colors = useThemeColor();
  const navigation = useNavigation();
  const {canCreate} = usePermitted({
    modelName: 'com.axelor.dms.db.DMSFile',
  });

  const {user} = useSelector(state => state.user);
  const {mobileSettings} = useSelector((state: any) => state.appConfig);

  const styles = useMemo(() => getStyles(Colors), [Colors]);

  const canAdd =
    canCreate &&
    (mobileSettings?.isFolderCreationAllowed ||
      mobileSettings?.isFileCreationAllowed);

  return (
    <View style={styles.container}>
      <ToggleButton
        isActive={author?.id === user?.id}
        onPress={() =>
          setAuthor(current => (current?.id === user?.id ? null : user))
        }
        buttonConfig={{
          iconName: 'person-fill',
          style: styles.toggleButton,
        }}
      />
      <UserSearchBar
        style={styles.userSearchBar}
        defaultValue={author}
        onChange={setAuthor}
        showTitle={false}
      />
      {canAdd && (
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('DocumentFormScreen', {parent})
          }>
          <Icon
            name="plus-lg"
            size={22}
            color={Colors.backgroundColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      zIndex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'center',
      alignItems: 'center',
      width: '90%',
      columnGap: 8,
    },
    toggleButton: {
      width: 46,
      height: 46,
      borderRadius: 13,
      marginVertical: 0,
    },
    userSearchBar: {
      flex: 1,
    },
    addButton: {
      width: 46,
      height: 46,
      borderRadius: 13,
      backgroundColor: Colors.primaryColor.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default AuthorFilter;
