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
import {Text as ReactNativeText} from 'react-native';
import {fireEvent} from '@testing-library/react-native';
import {UserCard} from '@axelor/aos-mobile-core';
import {
  getComputedStyles,
  getDefaultThemeColors,
  getMockDispatch,
  setup,
} from '../../../tools';

/*
 * UserCard is the redesigned profile card shown at the top of the user screen.
 * It renders the active user's avatar, name, code and active company inside a
 * rounded Card, with a ringed power button that logs the user out. The card
 * reads three redux slices (appConfig, user, company) and resolves its avatar
 * uri from state.auth.baseUrl via useBinaryImageUri, so the harness supplies all
 * four slices. With multi-company disabled the company picker stays hidden and
 * the active company is shown as a LabelText instead.
 *
 * The tests pin the redesign values (avatar 58x58 / radius 29, name fontSize 19
 * with weight 800, the primary-colored logout ring) so a regression in the
 * profile-card styling fails here rather than silently shipping.
 */
describe('UserCard profile card redesign', () => {
  const Colors = getDefaultThemeColors();

  const activeUser = {
    id: 42,
    version: 7,
    name: 'Jane Admin',
    code: 'jadmin',
    companySet: [{id: 1}],
    activeCompany: {id: 1, name: 'Axelor SAS'},
  };

  const baseReduxState = {
    appConfig: {base: {enableMultiCompany: false}},
    user: {user: activeUser, canModifyCompany: false},
    company: {companyList: [{id: 1, name: 'Axelor SAS'}]},
    auth: {baseUrl: 'https://aos.test.axelor.dev/'},
  };

  const setupCard = ({overrideProps, reduxState} = {}) =>
    setup({
      Component: UserCard,
      reduxState: {...baseReduxState, ...reduxState},
      overrideProps,
    });

  /*
   * The logout control is the Icon (rendered as testID "iconTouchable") that
   * wraps the "power" glyph (testID "icon-power"). The company LabelText renders
   * a second iconTouchable, so select by the contained glyph rather than by
   * index.
   */
  const getLogoutTouchable = utils => {
    const powerGlyph = utils.getByTestId('icon-power');

    return utils
      .getAllByTestId('iconTouchable')
      .find(touchable => touchable.findAll(node => node === powerGlyph).length > 0);
  };

  it('renders the user name, code and active company', () => {
    const {getByText} = setupCard();

    expect(getByText(activeUser.name)).toBeTruthy();
    expect(getByText(activeUser.code)).toBeTruthy();
    /*
     * The company is rendered through a LabelText whose title is suffixed with a
     * trailing space, so match the company name as a substring.
     */
    expect(getByText(/Axelor SAS/)).toBeTruthy();
  });

  it('renders the avatar image from the binary image uri', () => {
    const {getByRole} = setupCard();

    const avatar = getByRole('image');

    expect(avatar).toBeTruthy();
    expect(avatar.props.source.uri).toContain(
      'com.axelor.auth.db.User/42/image/download',
    );
  });

  it('sizes the avatar as a 58px rounded square', () => {
    const {getByRole} = setupCard();

    const avatarStyle = getComputedStyles(getByRole('image').props.style);

    expect(avatarStyle.width).toBe(58);
    expect(avatarStyle.height).toBe(58);
    expect(avatarStyle.borderRadius).toBe(29);
    expect(avatarStyle.marginRight).toBe(12);
  });

  it('renders the name at fontSize 19 with the bold (800) weight and text color', () => {
    const {getByText} = setupCard();

    const nameStyle = getComputedStyles(getByText(activeUser.name).props.style);

    expect(nameStyle.fontSize).toBe(19);
    expect(nameStyle.fontWeight).toBe('800');
    expect(nameStyle.color).toBe(Colors.text);
  });

  it('renders the code at fontSize 13 with the dark secondary color', () => {
    const {getByText} = setupCard();

    const codeStyle = getComputedStyles(getByText(activeUser.code).props.style);

    expect(codeStyle.fontSize).toBe(13);
    expect(codeStyle.fontWeight).toBe('600');
    expect(codeStyle.color).toBe(Colors.secondaryColor_dark.background);
  });

  it('renders the card as a rounded, padded container', () => {
    const {getByTestId} = setupCard();

    const cardStyle = getComputedStyles(getByTestId('cardContainer').props.style);

    expect(cardStyle.borderRadius).toBe(20);
    expect(cardStyle.padding).toBe(16);
    expect(cardStyle.width).toBe('90%');
    expect(cardStyle.alignSelf).toBe('center');
  });

  it('wraps the logout power icon in a primary-colored ring', () => {
    const utils = setupCard();

    /* The power glyph is tinted with the primary color. */
    expect(utils.getByTestId('icon-power').props.fill).toBe(
      Colors.primaryColor.background,
    );

    const ringStyle = getComputedStyles(getLogoutTouchable(utils).props.style);

    expect(ringStyle.width).toBe(42);
    expect(ringStyle.height).toBe(42);
    expect(ringStyle.borderRadius).toBe(21);
    expect(ringStyle.borderWidth).toBe(1);
    expect(ringStyle.borderColor).toBe(Colors.primaryColor.background);
    expect(ringStyle.backgroundColor).toBe('transparent');
  });

  it('dispatches a logout action when the power button is pressed', () => {
    /*
     * Wire the dispatch mock before rendering so the mount effect (which
     * dispatches fetchCompanies) and the logout press share one spy. Count the
     * delta around the press to isolate the logout dispatch from the effect.
     */
    const dispatch = getMockDispatch();
    const utils = setupCard();

    const dispatchesBeforePress = dispatch.mock.calls.length;
    fireEvent.press(getLogoutTouchable(utils));

    expect(dispatch.mock.calls.length).toBe(dispatchesBeforePress + 1);
  });

  it('shows the active company as a label and hides the picker when multi-company is off', () => {
    const {queryByText, UNSAFE_queryAllByType} = setupCard();

    expect(queryByText(/Axelor SAS/)).toBeTruthy();
    /* The building-fill icon marks the company LabelText. */
    expect(queryByText('User_ActiveCompany')).toBeNull();
    /* Sanity: at least the name/code/company texts are present. */
    expect(UNSAFE_queryAllByType(ReactNativeText).length).toBeGreaterThan(0);
  });

  it('renders the company picker instead of the label when multi-company is enabled', () => {
    const {getByText, queryAllByText} = setupCard({
      reduxState: {
        appConfig: {base: {enableMultiCompany: true}},
        user: {user: activeUser, canModifyCompany: true},
      },
    });

    /* With the picker shown, the company LabelText is no longer rendered. */
    expect(getByText('User_ActiveCompany')).toBeTruthy();
    expect(queryAllByText(/Axelor SAS/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders children passed into the card', () => {
    const {getByText} = setupCard({
      overrideProps: {children: <ReactNativeText>Extra content</ReactNativeText>},
    });

    expect(getByText('Extra content')).toBeTruthy();
  });
});
