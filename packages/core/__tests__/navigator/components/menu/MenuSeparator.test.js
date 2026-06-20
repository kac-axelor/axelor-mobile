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
import {StyleSheet} from 'react-native';
import MenuSeparator from '../../../../lib/navigator/components/menu/MenuSeparator';
import {setup} from '../../../tools';

/*
 * MenuSeparator is the drawer section header. The redesign drops the leading
 * chevron icon, upper cases the label and stretches the rule to the full width
 * so the header reads as a grouping divider.
 */
describe('MenuSeparator Component (drawer redesign)', () => {
  const setupSeparator = overrideProps =>
    setup({
      Component: MenuSeparator,
      baseProps: {title: 'Interventions'},
      overrideProps,
    });

  it('renders the title in upper case', () => {
    const {getByText, queryByText} = setupSeparator();

    expect(getByText('INTERVENTIONS')).toBeTruthy();
    expect(queryByText('Interventions')).toBeNull();
  });

  it('no longer renders the leading chevron icon', () => {
    const {queryByTestId} = setupSeparator();

    expect(queryByTestId('icon-chevron-right')).toBeNull();
  });

  it('renders a full width rule beneath the label', () => {
    const {getByTestId} = setupSeparator();

    const ruleStyle = StyleSheet.flatten(
      getByTestId('horizontalRule').props.style,
    );

    expect(ruleStyle.width).toBe('100%');
  });
});
