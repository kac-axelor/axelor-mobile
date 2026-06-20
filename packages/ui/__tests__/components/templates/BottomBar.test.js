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
import {View} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import {BottomBar} from '@axelor/aos-mobile-ui';
import {getVisibleItems} from '../../../src/components/templates/BottomBar/display.helper';
import {getDefaultThemeColors, setup} from '../../tools';

const Screen = ({testID}) => <View testID={testID} />;

/*
 * The redesigned bar renders each segment as a 42x34 radius-12 icon pill. The
 * pill is the descendant of a `bar-item-*` wrapper whose flattened style carries
 * those fixed dimensions, so locating it by those values is stable across the
 * inner View nesting. Returns the pill's flattened style object (or null), since
 * the walked node is not a host element queried through RNTL.
 */
const findPillStyle = node => {
  let pillStyle = null;
  const walk = current => {
    if (pillStyle != null || current == null) {
      return;
    }

    const style = current.props?.style;
    if (Array.isArray(style)) {
      const flat = Object.assign({}, ...style.filter(Boolean));
      if (flat.width === 42 && flat.height === 34 && flat.borderRadius === 12) {
        pillStyle = flat;
        return;
      }
    }

    (current.children || []).forEach(walk);
  };

  walk(node);
  return pillStyle;
};

describe('BottomBar Component', () => {
  const Colors = getDefaultThemeColors();

  const setupBottomBar = overrideProps =>
    setup({
      Component: BottomBar,
      baseProps: {
        items: [
          {
            iconName: 'house',
            testID: 'view1-home',
            title: 'Home',
            viewComponent: <Screen testID="view1-home" />,
            color: Colors.secondaryColor_dark,
          },
          {
            iconName: 'clock-history',
            testID: 'view2-clock',
            title: 'History',
            viewComponent: <Screen testID="view2-clock" />,
            indicator: 5,
            color: Colors.plannedColor,
          },
          {
            iconName: 'trash',
            testID: 'view3-trash',
            title: 'Trash',
            viewComponent: <Screen testID="view3-trash" />,
            color: Colors.infoColor,
            hidden: true,
          },
          {
            iconName: 'x-lg',
            testID: 'view4-x',
            title: 'Close',
            viewComponent: <Screen testID="view4-x" />,
            color: Colors.progressColor,
          },
          {
            iconName: 'person-fill',
            testID: 'view5-person',
            title: 'Profile',
            viewComponent: <Screen testID="view5-person" />,
          },
        ],
      },
      overrideProps,
    });

  it('should render without crashing', () => {
    const {getByTestId} = setupBottomBar();

    expect(getByTestId('bottomBarViewComtainer')).toBeTruthy();
    expect(getByTestId('bottomBarComtainer')).toBeTruthy();
  });

  it('should render one segment per visible item and filter hidden ones', () => {
    const {queryAllByTestId, queryByTestId, props} = setupBottomBar();

    expect(queryAllByTestId(/^bar-item-.*/).length).toBe(
      getVisibleItems(props.items).length,
    );

    props.items.forEach(item => {
      if (item.hidden) {
        expect(queryByTestId(`bar-item-${item.testID}`)).toBeFalsy();
      } else {
        expect(queryByTestId(`bar-item-${item.testID}`)).toBeTruthy();
      }
    });
  });

  it('should render the floating pill bar inside a card with radius 22', () => {
    const {getByTestId} = setupBottomBar();

    const card = getByTestId('cardContainer');
    expect(card).toHaveStyle({borderRadius: 22});
    expect(card).toHaveStyle({width: '90%'});
    expect(card).toHaveStyle({alignSelf: 'center'});
  });

  it('should render an icon pill for every visible segment', () => {
    const {getByTestId, queryByTestId, props} = setupBottomBar();

    getVisibleItems(props.items).forEach(item => {
      const segment = getByTestId(`bar-item-${item.testID}`);
      const pillStyle = findPillStyle(segment);

      expect(pillStyle).toBeTruthy();
      expect(pillStyle).toMatchObject({width: 42, height: 34, borderRadius: 12});
      expect(queryByTestId(`icon-${item.iconName}`)).toBeTruthy();
    });
  });

  it('should render a per-segment label below each pill', () => {
    const {getByText, queryByText} = setupBottomBar();

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('History')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    /* hidden segment's label must not render */
    expect(queryByText('Trash')).toBeFalsy();
  });

  it('should not render segment labels when manageActiveTitle is false', () => {
    const {queryByText} = setupBottomBar({manageActiveTitle: false});

    expect(queryByText('Home')).toBeFalsy();
    expect(queryByText('History')).toBeFalsy();
    expect(queryByText('Profile')).toBeFalsy();
  });

  it('should highlight the selected segment pill with the item color background', () => {
    const {getByTestId, props} = setupBottomBar();
    const firstVisible = getVisibleItems(props.items)[0];

    /* the first item with a view is selected by default */
    const selectedPillStyle = findPillStyle(
      getByTestId(`bar-item-${firstVisible.testID}`),
    );
    expect(selectedPillStyle.backgroundColor).toBe(
      Colors.secondaryColor_dark.background_light,
    );

    /* a non-selected segment keeps a transparent pill */
    const otherPillStyle = findPillStyle(getByTestId('bar-item-view4-x'));
    expect(otherPillStyle.backgroundColor).toBe('transparent');
  });

  it('should switch the active view when a segment is pressed', () => {
    const {getByTestId, queryByTestId, props} = setupBottomBar();
    const visibleItems = getVisibleItems(props.items);

    /* first item with a view is shown initially */
    expect(getByTestId(visibleItems[0].testID)).toBeTruthy();

    /*
     * Pressing the segment icon bubbles to the BarItem touchable; assert the
     * matching view replaces the previous one.
     */
    fireEvent.press(getByTestId('icon-x-lg'));

    expect(getByTestId('view4-x')).toBeTruthy();
    expect(queryByTestId('view1-home')).toBeFalsy();
  });

  it('should render an indicator bubble for segments that provide one', () => {
    const {getByText} = setupBottomBar();

    expect(getByText('5')).toBeTruthy();
  });

  it('should apply custom style when provided', () => {
    const {getByTestId, props} = setupBottomBar({style: {marginBottom: 10}});

    expect(getByTestId('cardContainer')).toHaveStyle(props.style);
  });
});
