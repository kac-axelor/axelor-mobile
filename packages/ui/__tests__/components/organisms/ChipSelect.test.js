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
import {ChipSelect} from '@axelor/aos-mobile-ui';
import {getDefaultThemeColors, setup} from '../../tools';

describe('ChipSelect Component', () => {
  const Colors = getDefaultThemeColors();

  const setupChipSelect = overrideProps =>
    setup({
      Component: ChipSelect,
      baseProps: {
        selectionItems: [
          {
            isActive: true,
            color: Colors.primaryColor,
            title: 'Item 1',
            key: 1,
          },
          {
            isActive: false,
            color: Colors.cautionColor,
            title: 'Item 2',
            key: 2,
          },
          {
            isActive: false,
            color: Colors.errorColor,
            title: 'Item 3',
            key: 3,
          },
        ],
        mode: 'multi',
      },
      overrideProps,
    });

  /*
   * Toggle variant per chip redesign: active chips show a flat
   * selectedColor.background_light fill with a 2px saturated border (radius 13,
   * height 44) and a bold label coloured with the saturated background; inactive
   * chips show a flat screenBackgroundColor fill with no border and a muted
   * secondaryColor_dark label.
   */
  function checkToggleStyle(viewElt, textElt, color, isSelected) {
    if (isSelected) {
      expect(viewElt).toHaveStyle({
        backgroundColor: color.background_light,
        borderColor: color.background,
        borderWidth: 2,
        borderRadius: 13,
        height: 44,
      });
      expect(textElt).toHaveStyle({
        color: color.background,
        fontWeight: 'bold',
      });
    } else {
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

  function checkChipSelected(elt, item, isSelected) {
    const _viewElt = within(elt).getByTestId('chipContainer');
    const _textElt = within(_viewElt).getByText(item.title);

    expect(_viewElt).toBeTruthy();
    expect(_textElt).toBeTruthy();
    checkToggleStyle(
      _viewElt,
      _textElt,
      item.color ?? Colors.primaryColor,
      isSelected,
    );
  }

  it('renders without crashing', () => {
    const {getByTestId} = setupChipSelect();

    expect(getByTestId('chipSelectContainer')).toBeTruthy();
  });

  it('should lay the row out left-aligned', () => {
    const {getByTestId} = setupChipSelect();

    expect(getByTestId('chipSelectContainer')).toHaveStyle({
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    });
  });

  it('should not render if props mode is unknown', () => {
    const {queryByTestId} = setupChipSelect({mode: ''});

    expect(queryByTestId('chipSelectContainer')).toBeFalsy();
  });

  it('should render the right number of Chip component', () => {
    const {getAllByTestId} = setupChipSelect();

    expect(getAllByTestId('chipTouchable')).toHaveLength(3);
  });

  it('should render Chip with the right props', () => {
    const {getAllByTestId, props} = setupChipSelect();

    const _chipElts = getAllByTestId('chipTouchable');

    props.selectionItems.forEach((_i, idx) => {
      checkChipSelected(_chipElts.at(idx), _i, _i.isActive);
    });
  });

  it('should space chips apart with the default gap', () => {
    const {getAllByTestId} = setupChipSelect();

    getAllByTestId('chipTouchable').forEach(_elt => {
      expect(_elt).toHaveStyle({marginHorizontal: 6});
    });
  });

  it('should render chips with the toggle variant by default', () => {
    const {getAllByTestId, props} = setupChipSelect();

    const _chipElts = getAllByTestId('chipTouchable');

    props.selectionItems.forEach((_i, idx) => {
      const _viewElt = within(_chipElts.at(idx)).getByTestId('chipContainer');
      const _textElt = within(_viewElt).getByText(_i.title);

      checkToggleStyle(_viewElt, _textElt, _i.color, _i.isActive);
    });
  });

  it('should pass the variant through to every Chip', () => {
    const {getAllByTestId, props} = setupChipSelect({variant: 'outlined'});

    const _chipElts = getAllByTestId('chipTouchable');

    props.selectionItems.forEach((_i, idx) => {
      const _viewElt = within(_chipElts.at(idx)).getByTestId('chipContainer');
      const _textElt = within(_viewElt).getByText(_i.title);

      checkOutlinedStyle(_viewElt, _textElt, _i.color);
    });
  });

  it('should call onChangeValue when Chip is pressed', () => {
    const {getAllByTestId, props} = setupChipSelect({onChangeValue: jest.fn()});

    const _chipElts = getAllByTestId('chipTouchable');

    fireEvent.press(_chipElts.at(0));
    checkChipSelected(_chipElts.at(0), props.selectionItems[0], false);
    expect(props.onChangeValue).toHaveBeenCalledTimes(1);
  });

  it('should render ChipSelect with more than one Chip activable if mode is multi', () => {
    const {getAllByTestId, props} = setupChipSelect({onChangeValue: jest.fn()});

    const _chipElts = getAllByTestId('chipTouchable');

    fireEvent.press(_chipElts.at(1));
    expect(props.onChangeValue).toHaveBeenCalledWith([
      props.selectionItems[0],
      props.selectionItems[1],
    ]);

    checkChipSelected(_chipElts.at(0), props.selectionItems[0], true);
    checkChipSelected(_chipElts.at(1), props.selectionItems[1], true);
    checkChipSelected(_chipElts.at(2), props.selectionItems[2], false);

    fireEvent.press(_chipElts.at(2));
    expect(props.onChangeValue).toHaveBeenCalledWith([]);

    checkChipSelected(_chipElts.at(0), props.selectionItems[0], false);
    checkChipSelected(_chipElts.at(1), props.selectionItems[1], false);
    checkChipSelected(_chipElts.at(2), props.selectionItems[2], false);
  });

  it('should render ChipSelect with only one Chip activable if mode is switch', () => {
    const {getAllByTestId, props} = setupChipSelect({
      mode: 'switch',
      onChangeValue: jest.fn(),
    });

    const _chipElts = getAllByTestId('chipTouchable');

    fireEvent.press(_chipElts.at(1));
    expect(props.onChangeValue).toHaveBeenCalledWith([props.selectionItems[1]]);

    checkChipSelected(_chipElts.at(0), props.selectionItems[0], false);
    checkChipSelected(_chipElts.at(1), props.selectionItems[1], true);
    checkChipSelected(_chipElts.at(2), props.selectionItems[2], false);

    fireEvent.press(_chipElts.at(2));
    expect(props.onChangeValue).toHaveBeenCalledWith([props.selectionItems[2]]);

    checkChipSelected(_chipElts.at(0), props.selectionItems[0], false);
    checkChipSelected(_chipElts.at(1), props.selectionItems[1], false);
    checkChipSelected(_chipElts.at(2), props.selectionItems[2], true);

    fireEvent.press(_chipElts.at(2));
    expect(props.onChangeValue).toHaveBeenCalledWith([]);

    checkChipSelected(_chipElts.at(0), props.selectionItems[0], false);
    checkChipSelected(_chipElts.at(1), props.selectionItems[1], false);
    checkChipSelected(_chipElts.at(2), props.selectionItems[2], false);
  });

  it('should apply custom style when provided', () => {
    const {getByTestId, props} = setupChipSelect({style: {height: 200}});

    expect(getByTestId('chipSelectContainer')).toHaveStyle(props.style);
  });

  it('should apply custom width when provided', () => {
    const {getAllByTestId, props} = setupChipSelect({width: 200});

    getAllByTestId('chipTouchable').forEach(_elt => {
      expect(_elt).toHaveStyle({width: props.width});
    });
  });

  it('should apply custom marginHorizontal when provided', () => {
    const {getAllByTestId, props} = setupChipSelect({marginHorizontal: 50});

    getAllByTestId('chipTouchable').forEach(_elt => {
      expect(_elt).toHaveStyle({marginHorizontal: props.marginHorizontal});
    });
  });

  it('should not render clear all button when option is disabled', () => {
    const {queryByTestId} = setupChipSelect({showClearButton: false});

    expect(queryByTestId('chipSelectClearButton')).toBeFalsy();
  });

  it('should clear all selected chips when clear all button is pressed', () => {
    const {getByTestId, getAllByTestId, props} = setupChipSelect({
      onChangeValue: jest.fn(),
      showClearButton: true,
    });

    expect(getByTestId('chipSelectClearButton')).toBeTruthy();

    const _chipElts = getAllByTestId('chipTouchable');

    fireEvent.press(getByTestId('chipSelectClearButton'));
    expect(props.onChangeValue).toHaveBeenCalledWith([]);

    fireEvent.press(_chipElts.at(1));
    expect(props.onChangeValue).toHaveBeenCalledWith([props.selectionItems[1]]);

    fireEvent.press(_chipElts.at(2));
    expect(props.onChangeValue).toHaveBeenCalledWith([
      props.selectionItems[1],
      props.selectionItems[2],
    ]);

    fireEvent.press(getByTestId('chipSelectClearButton'));
    expect(props.onChangeValue).toHaveBeenCalledWith([]);
  });
});
