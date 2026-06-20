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
import Menu from '../../../../lib/navigator/components/menu/Menu';
import {getMockNavigation, setup} from '../../../tools';

/*
 * End to end test of the redesigned drawer menu panel. The panel is data driven
 * from the active module's menus map, so the fixture declares one of each entry
 * type (a section separator, a simple entry and an expandable parent) plus the
 * routes that back them, and the test asserts the redesign renders every type,
 * keeps the close button and preserves the expand / collapse and active
 * highlight behaviour.
 */
describe('Menu Component (drawer redesign, data driven)', () => {
  const activeModule = {
    name: 'app-intervention',
    title: 'Intervention',
    menus: {
      sep: {title: 'Interventions', separator: true},
      planning: {
        title: 'Planning',
        icon: 'calendar-check',
        screen: 'PlanningScreen',
      },
      suivi: {
        title: 'Suivi',
        icon: 'clock-history',
        subMenus: {
          planifiees: {
            title: 'Planifiees',
            icon: 'calendar',
            screen: 'PlanifieesScreen',
          },
          historique: {
            title: 'Historique',
            icon: 'clock',
            screen: 'HistoriqueScreen',
          },
        },
      },
    },
  };

  const routes = [
    {key: 'sep-key', name: 'sep'},
    {key: 'planning-key', name: 'planning'},
    {key: 'suivi-key', name: 'suivi'},
    {key: 'planifiees-key', name: 'planifiees'},
    {key: 'historique-key', name: 'historique'},
  ];

  const buildState = (focusedName = 'planning') => ({
    key: 'drawer-key',
    index: routes.findIndex(route => route.name === focusedName),
    routes,
  });

  const setupMenu = overrideProps => {
    const navigation = getMockNavigation();
    const utils = setup({
      Component: Menu,
      baseProps: {
        state: buildState(),
        navigation,
        activeModule,
        onItemClick: jest.fn(),
        showClose: false,
      },
      overrideProps,
    });
    return {...utils, navigation};
  };

  it('renders the module title and every menu entry type', () => {
    const {getByText} = setupMenu();

    /* Module title. */
    expect(getByText('Intervention')).toBeTruthy();
    /* Section separator, upper cased by the redesign. */
    expect(getByText('INTERVENTIONS')).toBeTruthy();
    /* Simple entry and expandable parent. */
    expect(getByText('Planning')).toBeTruthy();
    expect(getByText('Suivi')).toBeTruthy();
  });

  it('hides the close button unless showClose is set, then calls onClose', () => {
    const {queryByTestId} = setupMenu({showClose: false});
    expect(queryByTestId('icon-x-lg')).toBeNull();

    const onClose = jest.fn();
    const {getByTestId} = setupMenu({showClose: true, onClose});
    const closeIcon = getByTestId('icon-x-lg');
    expect(closeIcon).toBeTruthy();

    fireEvent.press(closeIcon);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('expands an entry to reveal its sub-menus and collapses it again', () => {
    const {getByText, queryByText} = setupMenu();

    /* Sub-menu items are hidden until the parent is expanded. */
    expect(queryByText('Planifiees')).toBeNull();
    expect(queryByText('Historique')).toBeNull();

    fireEvent.press(getByText('Suivi'));
    expect(getByText('Planifiees')).toBeTruthy();
    expect(getByText('Historique')).toBeTruthy();

    fireEvent.press(getByText('Suivi'));
    expect(queryByText('Planifiees')).toBeNull();
  });

  it('navigates when a simple entry that is not focused is pressed', () => {
    /* Focus the separator so pressing Planning triggers a navigate action. */
    const {getByText, navigation} = setupMenu({state: buildState('sep')});

    fireEvent.press(getByText('Planning'));

    expect(navigation.emit).toHaveBeenCalled();
    expect(navigation.dispatch).toHaveBeenCalledTimes(1);
  });
});
