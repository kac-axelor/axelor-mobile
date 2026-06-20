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
import {Picker} from '@axelor/aos-mobile-ui';
import {getDefaultThemeColors, setup} from '../../tools';

describe('Picker Component', () => {
  const Colors = getDefaultThemeColors();

  const setupPicker = overrideProps =>
    setup({
      Component: Picker,
      baseProps: {
        listItems: [
          {id: 1, name: 'Item 1'},
          {id: 2, name: 'Item 2'},
          {id: 3, name: 'Item 3'},
        ],
        valueField: 'id',
        labelField: 'name',
        onValueChange: jest.fn(),
        emptyValue: false,
      },
      overrideProps,
    });

  it('renders without crashing', () => {
    const {getByTestId} = setupPicker();

    expect(getByTestId('pickerContainer')).toBeTruthy();
  });

  it('should display the placeholder if provided and no value is selected', () => {
    const {getByText, props} = setupPicker({placeholder: 'Select an item'});

    expect(getByText(props.placeholder)).toBeTruthy();
  });

  it('should give listItems to SelectionContainer', () => {
    const {queryAllByTestId, getAllByTestId, getByTestId, props} =
      setupPicker();

    expect(queryAllByTestId('selectionItemTouchable').length).toBe(0);

    fireEvent.press(getByTestId('rightIconButtonContainer'));

    expect(getAllByTestId('selectionItemTouchable').length).toBe(
      props.listItems.length,
    );
  });

  it('should render picker options with a checkbox and no chevron', () => {
    const {getAllByTestId, queryAllByTestId, getByTestId} = setupPicker();

    fireEvent.press(getByTestId('rightIconButtonContainer'));

    expect(getAllByTestId('icon-square').length).toBeGreaterThan(0);
    expect(queryAllByTestId('icon-chevron-right').length).toBe(0);
  });

  it('should call onValueChange with the right args', () => {
    const {getAllByTestId, getByTestId, props} = setupPicker({
      onValueChange: jest.fn(),
    });

    fireEvent.press(getByTestId('rightIconButtonContainer'));
    fireEvent.press(getAllByTestId('selectionItemTouchable').at(2));

    expect(props.onValueChange).toHaveBeenCalledWith(
      props.listItems[2][props.valueField],
    );
  });

  it('should display a title if provided', () => {
    const {getByText, props} = setupPicker({title: 'Title'});

    expect(getByText(props.title)).toBeTruthy();
  });

  it('should render readonly FormInput when props is true', () => {
    const {getByTestId} = setupPicker({readonly: true});

    expect(getByTestId('formInputContainer')).toBeTruthy();
  });

  it('should apply required styling when props is true', () => {
    const {getByTestId} = setupPicker({required: true});

    expect(
      within(getByTestId('rightIconButtonContainer')).getByTestId(
        'cardContainer',
      ),
    ).toHaveStyle({borderColor: Colors.errorColor.background});
  });

  it('should apply custom style to container when provided', () => {
    const {getByTestId, props} = setupPicker({style: {width: 200}});

    expect(getByTestId('pickerContainer')).toHaveStyle(props.style);
  });

  it('should apply custom style to picker when provided', () => {
    const {getByTestId, props} = setupPicker({pickerStyle: {width: 200}});

    expect(
      within(getByTestId('rightIconButtonContainer')).getByTestId(
        'cardContainer',
      ),
    ).toHaveStyle(props.pickerStyle);
  });

  it('should apply custom style to title when provided', () => {
    const {getByText, props} = setupPicker({
      title: 'Title',
      styleTxt: {fontSize: 20},
    });

    expect(getByText(props.title)).toHaveStyle(props.styleTxt);
  });

  it('should render the selected option color dot in the closed field', () => {
    const greenColor = {background: '#00FF00'};
    const {getByTestId} = setupPicker({
      listItems: [
        {id: 1, name: 'Item 1', color: greenColor},
        {id: 2, name: 'Item 2'},
      ],
      defaultValue: 1,
    });

    expect(getByTestId('pickerSelectedColorDot')).toHaveStyle({
      backgroundColor: greenColor.background,
    });
  });

  it('should not render the color dot when the selected option has no color', () => {
    const {queryByTestId} = setupPicker({
      listItems: [
        {id: 1, name: 'Item 1'},
        {id: 2, name: 'Item 2', color: {background: '#0000FF'}},
      ],
      defaultValue: 1,
    });

    expect(queryByTestId('pickerSelectedColorDot')).toBeNull();
  });

  it('should not render the color dot when no option is selected', () => {
    const {queryByTestId} = setupPicker({
      listItems: [{id: 1, name: 'Item 1', color: {background: '#00FF00'}}],
    });

    expect(queryByTestId('pickerSelectedColorDot')).toBeNull();
  });
});
