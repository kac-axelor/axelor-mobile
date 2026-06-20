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

import {fireEvent} from '@testing-library/react-native';
import {Chip} from '@axelor/aos-mobile-ui';
import {getDefaultThemeColors, setup} from '../../tools';

describe('Chip Component', () => {
  const Colors = getDefaultThemeColors();

  const setupChip = overrideProps =>
    setup({
      Component: Chip,
      baseProps: {
        onPress: jest.fn(),
        title: 'Chip title',
        selected: true,
        selectedColor: Colors.infoColor,
        readonly: false,
      },
      overrideProps,
    });

  /*
   * Toggle variant, active state: selectedColor.background_light fill,
   * saturated selectedColor.background border (2px), leading colour dot and
   * a bold label coloured with selectedColor.background.
   */
  function checkActiveToggleStyle(viewElt, textElt, color) {
    expect(viewElt).toHaveStyle({
      backgroundColor: color.background_light,
      borderColor: color.background,
      borderWidth: 2,
      borderRadius: 13,
      height: 44,
    });

    expect(textElt).toHaveStyle({color: color.background, fontWeight: 'bold'});
  }

  /*
   * Toggle variant, inactive state: flat screenBackgroundColor fill with no
   * border and a muted secondaryColor_dark label.
   */
  function checkInactiveToggleStyle(viewElt, textElt) {
    expect(viewElt).toHaveStyle({
      backgroundColor: Colors.screenBackgroundColor,
      borderWidth: 0,
      borderRadius: 13,
      height: 44,
    });

    expect(textElt).toHaveStyle({
      color: Colors.secondaryColor_dark.background,
      fontWeight: 'bold',
    });
  }

  /*
   * Outlined variant: transparent fill, 1px type-colour border, radius 99 pill
   * and a bold type-colour label, regardless of selected state.
   */
  function checkOutlinedStyle(viewElt, textElt, color) {
    expect(viewElt).toHaveStyle({
      backgroundColor: 'transparent',
      borderColor: color.background,
      borderWidth: 1,
      borderRadius: 99,
      height: 34,
    });

    expect(textElt).toHaveStyle({color: color.background, fontWeight: 'bold'});
  }

  it('renders without crashing', () => {
    const {getByTestId} = setupChip();

    expect(getByTestId('chipTouchable')).toBeTruthy();
  });

  it('should render a touchable chip with label', () => {
    const {getByTestId, getByText, props} = setupChip({selectedColor: null});

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();

    checkActiveToggleStyle(_viewElt, _textElt, Colors.primaryColor);
  });

  it('should disable touchable when readonly', () => {
    const {getByTestId, props} = setupChip({
      readonly: true,
      onPress: jest.fn(),
    });

    fireEvent.press(getByTestId('chipTouchable'));
    expect(props.onPress).not.toHaveBeenCalledTimes(1);
  });

  it('should invoke onPress when pressed', () => {
    const {getByTestId, props} = setupChip({onPress: jest.fn()});

    fireEvent.press(getByTestId('chipTouchable'));
    expect(props.onPress).toHaveBeenCalledTimes(1);
  });

  it('should use custom selected color for active toggle', () => {
    const {getByTestId, getByText, props} = setupChip();

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();

    checkActiveToggleStyle(_viewElt, _textElt, props.selectedColor);
  });

  it('should fall back to primary color for active toggle when no selectedColor', () => {
    const {getByTestId, getByText, props} = setupChip({selectedColor: null});

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    checkActiveToggleStyle(_viewElt, _textElt, Colors.primaryColor);
  });

  it('should show the leading colour dot only when active toggle', () => {
    const {getByTestId, rerender} = setupChip();

    /*
     * The dot is a small 8x8 round view (background of the saturated colour)
     * rendered as the first child of the container before the label, only in
     * the active toggle state.
     */
    const isDot = node =>
      node != null &&
      typeof node === 'object' &&
      node.props?.style?.width === 8 &&
      node.props?.style?.height === 8 &&
      node.props?.style?.borderRadius === 99;

    const activeContainer = getByTestId('chipContainer');
    expect(activeContainer.children.some(isDot)).toBe(true);
    const activeDot = activeContainer.children.find(isDot);
    expect(activeDot.props.style.backgroundColor).toBe(
      Colors.infoColor.background,
    );

    rerender({selected: false});
    const inactiveContainer = getByTestId('chipContainer');
    expect(inactiveContainer.children.some(isDot)).toBe(false);
  });

  it('should use muted inactive toggle styles when not selected', () => {
    const {getByTestId, getByText, props} = setupChip({
      selected: false,
      selectedColor: null,
    });

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();

    checkInactiveToggleStyle(_viewElt, _textElt);
  });

  it('should keep muted inactive toggle styles even with a provided color', () => {
    const {getByTestId, getByText, props} = setupChip({selected: false});

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();

    /*
     * Inactive toggle ignores the saturated colour for fill and label; only a
     * flat muted look is shown.
     */
    checkInactiveToggleStyle(_viewElt, _textElt);
  });

  it('should render an outlined chip with transparent fill and type-colour border', () => {
    const {getByTestId, getByText, props} = setupChip({variant: 'outlined'});

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();

    checkOutlinedStyle(_viewElt, _textElt, props.selectedColor);
  });

  it('should keep outlined styling regardless of selected state', () => {
    const {getByTestId, getByText, props} = setupChip({
      variant: 'outlined',
      selected: false,
    });

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    /* Outlined fill/border/label do not depend on the selected flag. */
    checkOutlinedStyle(_viewElt, _textElt, props.selectedColor);
  });

  it('should fall back to primary color for outlined chip when no selectedColor', () => {
    const {getByTestId, getByText, props} = setupChip({
      variant: 'outlined',
      selectedColor: null,
    });

    const _viewElt = getByTestId('chipContainer');
    const _textElt = getByText(props.title);

    checkOutlinedStyle(_viewElt, _textElt, Colors.primaryColor);
  });

  it('should not apply any elevation or shadow', () => {
    const {getByTestId} = setupChip();

    const _viewElt = getByTestId('chipContainer');

    expect(_viewElt).not.toHaveStyle({elevation: 4});
    expect(_viewElt).not.toHaveStyle({shadowOpacity: 0.25});
  });

  it('should apply custom marginHorizontal when provided', () => {
    const {getByTestId, props} = setupChip({marginHorizontal: 15});

    expect(getByTestId('chipTouchable')).toHaveStyle({
      marginHorizontal: props.marginHorizontal,
    });
  });

  it('should apply custom width when provided', () => {
    const {getByTestId, props} = setupChip({width: 200});

    expect(getByTestId('chipTouchable')).toHaveStyle({width: props.width});
  });

  it('should apply custom styles', () => {
    const {getByTestId, props} = setupChip({
      style: {backgroundColor: 'blue'},
    });

    expect(getByTestId('chipTouchable')).toHaveStyle(props.style);
  });
});
