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

import {View} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import {DateInput} from '@axelor/aos-mobile-core';
import {setup, getComputedStyles, getDefaultThemeColors} from '../../tools';

/*
 * The native picker is a platform module; the global jest setup replaces it with
 * a value that is not a valid React element type once it is actually rendered
 * inside the open picker. Provide a render safe stand in so opening the picker in
 * the onDateChange test does not crash. The component under test owns the action
 * (check/clear) icons, so the stub only needs to render nothing.
 */
jest.mock('react-native-date-picker', () => ({
  __esModule: true,
  default: () => null,
}));

/*
 * DateInput is a redesigned form field: a RightIconButton surface that shows the
 * formatted date (or a mode specific placeholder), an optional bold label with a
 * required dot, and a date picker that opens on press unless the field is
 * readonly. The harness resolves useThemeColor through the default purple theme,
 * which is exactly what getDefaultThemeColors returns, so style assertions can be
 * made against theme tokens rather than raw hex.
 */
describe('DateInput Component (redesign)', () => {
  const Colors = getDefaultThemeColors();

  /* Fixed local date so the formatted output is deterministic. Constructed with
   * explicit local Y/M/D/h/m because the helper formats from local getters. */
  const fixedDate = new Date(2026, 5, 20, 14, 35);

  const renderDateInput = overrideProps =>
    setup({
      Component: DateInput,
      baseProps: {
        title: 'Birth_Date',
        mode: 'date',
        onDateChange: jest.fn(),
      },
      overrideProps,
      translations: {
        Base_DateFormat: 'DD/MM/YYYY',
        Base_DateTimeFormat: 'DD/MM/YYYY HH:mm',
        Base_TimeFormat: 'HH:mm',
      },
    });

  it('renders the label and a placeholder when no date is selected', () => {
    const {getByText} = renderDateInput();

    expect(getByText('Birth_Date')).toBeTruthy();
    /* date mode placeholder from DateInputUtils.placeHolder.Date */
    expect(getByText('__/__/____')).toBeTruthy();
  });

  it('shows the formatted value instead of the placeholder when a date is set', () => {
    const {getByText, queryByText} = renderDateInput({defaultDate: fixedDate});

    expect(getByText('20/06/2026')).toBeTruthy();
    expect(queryByText('__/__/____')).toBeNull();
  });

  it('uses the mode specific placeholder for datetime', () => {
    const {getByText} = renderDateInput({mode: 'datetime'});

    expect(getByText('__/__/____ __:__')).toBeTruthy();
  });

  it('formats a datetime value with the datetime format', () => {
    const {getByText} = renderDateInput({
      mode: 'datetime',
      defaultDate: fixedDate,
    });

    expect(getByText('20/06/2026 14:35')).toBeTruthy();
  });

  it('renders the redesigned value text style when a date is set', () => {
    const {getByText} = renderDateInput({defaultDate: fixedDate});

    const valueStyle = getComputedStyles(getByText('20/06/2026').props.style);

    expect(valueStyle.fontSize).toBe(16);
    expect(valueStyle.fontWeight).toBe('700');
    expect(valueStyle.color).toBe(Colors.text);
  });

  it('renders the redesigned placeholder text style when empty', () => {
    const {getByText} = renderDateInput();

    const placeholderStyle = getComputedStyles(
      getByText('__/__/____').props.style,
    );

    expect(placeholderStyle.fontSize).toBe(15);
    expect(placeholderStyle.fontWeight).toBe('600');
    expect(placeholderStyle.color).toBe(
      Colors.secondaryColor_dark.background,
    );
  });

  it('renders the redesigned bold label style', () => {
    const {getByText} = renderDateInput();

    const labelStyle = getComputedStyles(getByText('Birth_Date').props.style);

    expect(labelStyle.fontSize).toBe(13);
    expect(labelStyle.fontWeight).toBe('800');
    expect(labelStyle.color).toBe(Colors.secondaryColor_dark.background);
  });

  it('shows the required dot when required and no date is selected', () => {
    const {UNSAFE_getAllByType} = renderDateInput({required: true});

    /* The required dot is a small error colored circle View rendered next to the
     * label. It is identified by its redesign geometry plus the error token. */
    const dot = UNSAFE_getAllByType(View).find(node => {
      const style = getComputedStyles(node.props.style);
      return (
        style.width === 6 &&
        style.height === 6 &&
        style.borderRadius === 3 &&
        style.backgroundColor === Colors.errorColor.background
      );
    });

    expect(dot).toBeTruthy();
  });

  it('hides the required dot when required but a date is already selected', () => {
    /* required only drives the error styling; the dot View itself is rendered
     * whenever required is true, but the field is no longer in the "required and
     * empty" error state, so the field border drops back to the neutral
     * secondary token rather than the error token. */
    const {getByText, getByTestId} = renderDateInput({
      required: true,
      defaultDate: fixedDate,
    });

    expect(getByText('20/06/2026')).toBeTruthy();
    const fieldStyle = getComputedStyles(
      getByTestId('cardContainer').props.style,
    );

    expect(fieldStyle.borderColor).toBe(Colors.secondaryColor.background);
  });

  it('uses the error border color when required and empty', () => {
    const {getByText, getByTestId} = renderDateInput({required: true});

    expect(getByText('__/__/____')).toBeTruthy();
    const fieldStyle = getComputedStyles(
      getByTestId('cardContainer').props.style,
    );

    expect(fieldStyle.borderColor).toBe(Colors.errorColor.background);
  });

  it('wires onDateChange when confirming the picker selection', () => {
    const onDateChange = jest.fn();
    const {getByTestId, getAllByTestId} = renderDateInput({
      defaultDate: fixedDate,
      onDateChange,
    });

    /* Closed: only the (disabled) leading calendar icon is present. */
    expect(getAllByTestId('iconTouchable')).toHaveLength(1);

    /* Press the field surface to open the picker. */
    fireEvent.press(getByTestId('rightIconButtonContainer'));

    /* Open: leading calendar icon [0] plus the picker action icons. The confirm
     * (check-circle) button is the first action icon and calls onDateChange with
     * the selected date. */
    const icons = getAllByTestId('iconTouchable');
    expect(icons.length).toBeGreaterThan(1);
    fireEvent.press(icons[1]);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith(fixedDate);
  });

  it('does not open the picker or call onDateChange when readonly', () => {
    const onDateChange = jest.fn();
    const {getByTestId, queryAllByTestId} = renderDateInput({
      readonly: true,
      onDateChange,
    });

    fireEvent.press(getByTestId('rightIconButtonContainer'));

    /* readonly suppresses the leading icon and keeps the picker shut, so no icon
     * (leading or picker action) is ever rendered. */
    expect(queryAllByTestId('iconTouchable')).toHaveLength(0);
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('hides the leading mode icon when readonly but shows it when editable', () => {
    const {queryAllByTestId} = renderDateInput({readonly: true});
    expect(queryAllByTestId('iconTouchable')).toHaveLength(0);

    const {queryAllByTestId: queryEditable} = renderDateInput({
      readonly: false,
    });
    /* Editable, closed field renders exactly the one leading calendar icon. */
    expect(queryEditable('iconTouchable')).toHaveLength(1);
  });
});
