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

import {fireEvent, within} from '@testing-library/react-native';
import {SelectionContainer} from '@axelor/aos-mobile-ui';
import {setup} from '../../tools';

describe('SelectionContainer Component', () => {
  const setupSelectionContainer = overrideProps =>
    setup({
      Component: SelectionContainer,
      baseProps: {
        objectList: [
          {id: '1', name: 'Item 1'},
          {id: '2', name: 'Item 2'},
          {id: '3', name: 'Item 3'},
        ],
        displayValue: item => item.name,
      },
      overrideProps,
    });

  it('renders without crashing', () => {
    const {getByTestId} = setupSelectionContainer();

    expect(getByTestId('selectionContainerWrapper')).toBeTruthy();
  });

  it('should round the dropdown container with a softer shadow', () => {
    const {getByTestId} = setupSelectionContainer();

    expect(getByTestId('selectionContainerWrapper')).toHaveStyle({
      borderRadius: 16,
      shadowOpacity: 0.12,
      shadowOffset: {width: 0, height: 4},
    });
  });

  it('matches the AutoComplete dropdown snapshot', () => {
    const {toJSON} = setupSelectionContainer();

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches the picker dropdown snapshot', () => {
    const {toJSON} = setupSelectionContainer({isPicker: true});

    expect(toJSON()).toMatchSnapshot();
  });

  it('should render correctly with objectList', () => {
    const {getAllByTestId, props} = setupSelectionContainer();

    const _itemElts = getAllByTestId('selectionItemTouchable');

    expect(_itemElts).toHaveLength(props.objectList.length);

    props.objectList.forEach((_i, idx) => {
      expect(
        within(_itemElts.at(idx)).getByText(props.displayValue(_i)),
      ).toBeTruthy();
    });
  });

  it('should call handleSelect with the right item on press', () => {
    const {getAllByTestId, props} = setupSelectionContainer({
      handleSelect: jest.fn(),
    });

    const _itemElts = getAllByTestId('selectionItemTouchable');

    props.objectList.forEach((_i, idx) => {
      fireEvent.press(_itemElts.at(idx));
      expect(props.handleSelect).toHaveBeenCalledWith(_i);
    });
  });

  it('should render empty state message if objectList is empty or null', () => {
    const {queryAllByTestId, getByText, props} = setupSelectionContainer({
      translator: (_, values) => `Aucun(e) ${values.title} disponible.`,
      title: 'Item',
      objectList: [],
    });

    expect(queryAllByTestId('selectionItemTouchable')).toHaveLength(0);

    expect(
      getByText(props.translator(null, {title: props.title.toLowerCase()})),
    ).toBeTruthy();
  });

  it('should render a list of SelectionItem with Icon when isPicker is true', () => {
    const {getAllByTestId, props} = setupSelectionContainer({isPicker: true});

    const _itemElts = getAllByTestId('selectionItemTouchable');

    props.objectList.forEach((_i, idx) => {
      expect(within(_itemElts.at(idx)).getByTestId('icon-square')).toBeTruthy();
    });
  });

  it('should render a trailing chevron on AutoComplete rows', () => {
    const {getAllByTestId, props} = setupSelectionContainer();

    const _itemElts = getAllByTestId('selectionItemTouchable');

    props.objectList.forEach((_i, idx) => {
      expect(
        within(_itemElts.at(idx)).getByTestId('icon-chevron-right'),
      ).toBeTruthy();
    });
  });

  it('should not render a chevron on picker rows but a leading checkbox', () => {
    const {getAllByTestId, props} = setupSelectionContainer({isPicker: true});

    const _itemElts = getAllByTestId('selectionItemTouchable');

    props.objectList.forEach((_i, idx) => {
      expect(
        within(_itemElts.at(idx)).queryByTestId('icon-chevron-right'),
      ).toBeNull();
      expect(within(_itemElts.at(idx)).getByTestId('icon-square')).toBeTruthy();
    });
  });

  it('should render a color pill on picker rows when an item color is provided', () => {
    const coloredList = [
      {id: '1', name: 'Item 1', color: {background: '#FF0000'}},
      {id: '2', name: 'Item 2', color: {background: '#00FF00'}},
    ];

    const {getAllByTestId} = setupSelectionContainer({
      isPicker: true,
      objectList: coloredList,
    });

    const _itemElts = getAllByTestId('selectionItemTouchable');

    coloredList.forEach((_i, idx) => {
      expect(
        within(_itemElts.at(idx)).getByTestId('icon-square'),
      ).toBeTruthy();
    });

    expect(_itemElts).toHaveLength(coloredList.length);
  });

  it('should render an empty SelectionItem when isPicker and emptyValue are true', () => {
    const {getAllByTestId, props} = setupSelectionContainer({
      isPicker: true,
      emptyValue: true,
    });

    expect(getAllByTestId('selectionItemTouchable')).toHaveLength(
      props.objectList.length + 1,
    );
  });

  it('should apply custom style when provided', () => {
    const {getByTestId, props} = setupSelectionContainer({style: {width: 200}});

    expect(getByTestId('selectionContainerWrapper')).toHaveStyle(props.style);
  });
});
