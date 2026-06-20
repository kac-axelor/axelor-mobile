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
import {fireEvent} from '@testing-library/react-native';
import ItemCard from '../../../lib/components/organisms/AutoCompleteSearch/ItemCard';
import {setup} from '../../tools';

describe('ItemCard Component', () => {
  const setupItemCard = overrideProps =>
    setup({
      Component: ItemCard,
      baseProps: {title: 'Item title', onSelect: jest.fn()},
      overrideProps,
    });

  it('renders without crashing', () => {
    const {getByText, props} = setupItemCard();

    expect(getByText(props.title)).toBeTruthy();
  });

  it('should render a trailing chevron when not selected', () => {
    const {getByTestId, queryByTestId} = setupItemCard({isSelected: false});

    expect(getByTestId('icon-chevron-right')).toBeTruthy();
    expect(queryByTestId('icon-check-lg')).toBeNull();
  });

  it('should render a trailing check icon when selected', () => {
    const {getByTestId, queryByTestId} = setupItemCard({isSelected: true});

    expect(getByTestId('icon-check-lg')).toBeTruthy();
    expect(queryByTestId('icon-chevron-right')).toBeNull();
  });

  it('should call onSelect when pressed', () => {
    const {getByText, props} = setupItemCard({onSelect: jest.fn()});

    fireEvent.press(getByText(props.title));

    expect(props.onSelect).toHaveBeenCalledTimes(1);
  });

  it('matches the unselected snapshot', () => {
    const {toJSON} = setupItemCard({isSelected: false});

    expect(toJSON()).toMatchSnapshot();
  });

  it('matches the selected snapshot', () => {
    const {toJSON} = setupItemCard({isSelected: true});

    expect(toJSON()).toMatchSnapshot();
  });
});
