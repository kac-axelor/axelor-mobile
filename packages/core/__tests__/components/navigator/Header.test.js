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

import React from 'react';
import {act, fireEvent} from '@testing-library/react-native';
import {DrawerActions, StackActions} from '@react-navigation/native';
import {Header, headerActionsProvider} from '@axelor/aos-mobile-core';
import {setup, mockNavigation, getComputedStyles} from '../../tools';

/*
 * The Header is fully data driven: header icons come from actions registered on
 * the headerActionsProvider for a given actionID. These helpers register a
 * controlled set of actions so the tests can exercise the 0/1/2 icons + overflow
 * cases without depending on any real app.
 */
const registerActions = (actionID, actions) =>
  headerActionsProvider.registerModel(actionID, {
    model: 'com.axelor.test.db.Sample',
    actions,
  });

const buildAction = overrides => ({
  key: 'action',
  order: 10,
  title: 'Action',
  iconName: 'plus-lg',
  showInHeader: true,
  onPress: jest.fn(),
  ...overrides,
});

const renderHeader = ({overrideProps, reduxState} = {}) =>
  setup({
    Component: Header,
    baseProps: {title: 'Sample_Title', actionID: undefined},
    overrideProps,
    reduxState: {
      auth: {userId: 1},
      online: {isEnabled: true},
      appConfig: {mobileSettings: {}},
      ...reduxState,
    },
  });

/*
 * The Header schedules a deferred read of the registered options through a
 * setTimeout; advancing the (fake) timers flushes that read so the action cards
 * are rendered before assertions run.
 */
const flushHeaderOptions = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
};

describe('Header Component (redesign)', () => {
  it('renders the screen title', () => {
    const navigation = mockNavigation();
    const {getByText} = renderHeader();

    expect(getByText('Sample_Title')).toBeTruthy();
    expect(navigation).toBeTruthy();
  });

  it('left button opens the drawer on a root screen', () => {
    const navigation = mockNavigation();
    const {getAllByTestId} = renderHeader({
      overrideProps: {mainScreen: true},
    });

    /* The header left button is the first touchable icon in the bar. */
    const leftButton = getAllByTestId('iconTouchable')[0];
    fireEvent.press(leftButton);

    expect(navigation.dispatch).toHaveBeenCalledWith(
      DrawerActions.toggleDrawer(),
    );
  });

  it('left button goes back (pop) on a detail screen', () => {
    const navigation = mockNavigation();
    const {getAllByTestId} = renderHeader({
      overrideProps: {mainScreen: false},
    });

    const leftButton = getAllByTestId('iconTouchable')[0];
    fireEvent.press(leftButton);

    expect(navigation.dispatch).toHaveBeenCalledWith(StackActions.pop());
  });

  it('left button sits on the new elevated rounded card surface', () => {
    mockNavigation();
    const {getAllByTestId} = renderHeader({
      overrideProps: {mainScreen: true},
    });

    const leftButtonStyle = getComputedStyles(
      getAllByTestId('iconTouchable')[0].props.style,
    );

    expect(leftButtonStyle.borderRadius).toBe(12);
    expect(leftButtonStyle.width).toBe(40);
    expect(leftButtonStyle.height).toBe(40);
    expect(leftButtonStyle.elevation).toBe(3);
  });

  it('renders no action card when there are no header actions', () => {
    mockNavigation();
    const actionID = 'header_test_none';
    registerActions(actionID, []);

    const {queryAllByTestId} = renderHeader({overrideProps: {actionID}});
    flushHeaderOptions();

    expect(queryAllByTestId('headerActionCard')).toHaveLength(0);
    expect(queryAllByTestId('headerOverflowCard')).toHaveLength(0);
  });

  it('renders a single action as one card and no overflow menu', () => {
    mockNavigation();
    const actionID = 'header_test_single';
    registerActions(actionID, [
      buildAction({key: 'only', title: 'Only', showInHeader: true}),
    ]);

    const {queryAllByTestId} = renderHeader({overrideProps: {actionID}});
    flushHeaderOptions();

    expect(queryAllByTestId('headerActionCard')).toHaveLength(1);
    expect(queryAllByTestId('headerOverflowCard')).toHaveLength(0);
  });

  it('caps in-header icons at two and pushes the rest into the overflow card', () => {
    mockNavigation();
    const actionID = 'header_test_overflow';
    registerActions(actionID, [
      buildAction({key: 'first', order: 10, title: 'First', showInHeader: true}),
      buildAction({
        key: 'second',
        order: 20,
        title: 'Second',
        showInHeader: true,
      }),
      buildAction({
        key: 'third',
        order: 30,
        title: 'Third',
        showInHeader: true,
      }),
      buildAction({
        key: 'fourth',
        order: 40,
        title: 'Fourth',
        showInHeader: false,
      }),
    ]);

    const {queryAllByTestId} = renderHeader({overrideProps: {actionID}});
    flushHeaderOptions();

    /* Only the first two showInHeader actions become icon cards; everything
     * else (the third icon and the non showInHeader action) falls into the
     * single overflow card. */
    expect(queryAllByTestId('headerActionCard')).toHaveLength(2);
    expect(queryAllByTestId('headerOverflowCard')).toHaveLength(1);
  });

  it('keeps the action onPress behavior intact through the card wrapper', () => {
    mockNavigation();
    const actionID = 'header_test_press';
    const onPress = jest.fn();
    registerActions(actionID, [
      buildAction({key: 'pressable', title: 'Pressable', onPress}),
    ]);

    const {getAllByTestId} = renderHeader({overrideProps: {actionID}});
    flushHeaderOptions();

    /* The first iconTouchable is the left button; the action icon follows. */
    const actionIcon = getAllByTestId('iconTouchable')[1];
    fireEvent.press(actionIcon);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('gives each action its own elevated rounded card surface', () => {
    mockNavigation();
    const actionID = 'header_test_card_style';
    registerActions(actionID, [buildAction({key: 'styled', title: 'Styled'})]);

    const {getAllByTestId} = renderHeader({overrideProps: {actionID}});
    flushHeaderOptions();

    const cardStyle = getComputedStyles(
      getAllByTestId('headerActionCard')[0].props.style,
    );

    expect(cardStyle.borderRadius).toBe(12);
    expect(cardStyle.width).toBe(40);
    expect(cardStyle.height).toBe(40);
    expect(cardStyle.elevation).toBe(3);
  });
});
