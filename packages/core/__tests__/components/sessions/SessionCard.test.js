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
import {SessionCard, SessionListCard} from '@axelor/aos-mobile-core';
import {getComputedStyles, getDefaultThemeColors, setup} from '../../tools';

/*
 * SessionCard and SessionListCard are the redesigned session screen building
 * blocks. The card renders a single connection session (logo, name, url) with a
 * default-session border highlight and swipe-revealed edit/delete actions; the
 * list card stacks the cards and exposes the "+ Add" button. Both consume only
 * the ui theme and the core translator, so the harness covers their needs
 * without redux or navigation.
 */
describe('Session screen redesign', () => {
  const Colors = getDefaultThemeColors();

  const defaultSession = {
    id: 'session-default',
    name: 'dev',
    url: 'open-suite-dev.test.axelor.dev',
    username: 'admin',
    isDefault: true,
  };

  const secondarySession = {
    id: 'session-wip',
    name: 'wip',
    url: 'https://open-suite-wip.test.axelor.dev',
    username: 'admin',
    isDefault: false,
  };

  describe('SessionCard', () => {
    const setupCard = overrideProps =>
      setup({
        Component: SessionCard,
        baseProps: {
          session: defaultSession,
          changeActiveSession: jest.fn(),
          openConnection: jest.fn(),
          openEdition: jest.fn(),
          isUnactive: false,
        },
        overrideProps,
      });

    it('shows the session name and the bare url without an "Url:" prefix', () => {
      const {getByText, queryByText} = setupCard();

      expect(getByText(defaultSession.name)).toBeTruthy();
      expect(getByText(defaultSession.url)).toBeTruthy();
      expect(queryByText(`Url: ${defaultSession.url}`)).toBeNull();
    });

    it('renders the card as a rounded container', () => {
      const {getByTestId} = setupCard();

      const cardStyle = getComputedStyles(
        getByTestId('cardContainer').props.style,
      );

      expect(cardStyle.borderRadius).toBe(16);
      expect(cardStyle.borderWidth).toBe(1);
    });

    it('highlights the default session with the primary border color', () => {
      const {getByTestId} = setupCard();

      const cardStyle = getComputedStyles(
        getByTestId('cardContainer').props.style,
      );

      expect(cardStyle.borderColor).toBe(Colors.primaryColor.background);
    });

    it('uses the dark secondary border color for a non-default session', () => {
      const {getByTestId} = setupCard({session: secondarySession});

      const cardStyle = getComputedStyles(
        getByTestId('cardContainer').props.style,
      );

      expect(cardStyle.borderColor).toBe(
        Colors.secondaryColor_dark.background,
      );
    });

    it('still opens the connection when the card is pressed', () => {
      const changeActiveSession = jest.fn();
      const openConnection = jest.fn();
      const {getByText} = setupCard({changeActiveSession, openConnection});

      fireEvent.press(getByText(defaultSession.name));

      expect(changeActiveSession).toHaveBeenCalledWith(defaultSession);
      expect(openConnection).toHaveBeenCalledTimes(1);
    });
  });

  describe('SessionListCard', () => {
    const setupList = overrideProps =>
      setup({
        Component: SessionListCard,
        baseProps: {
          sessionList: [defaultSession, secondarySession],
          changeActiveSession: jest.fn(),
          openConnection: jest.fn(),
          openEdition: jest.fn(),
          openCreation: jest.fn(),
          session: defaultSession,
        },
        overrideProps,
        translations: {Base_Add: 'Add'},
      });

    it('shows a labelled add button', () => {
      const {getByText} = setupList();

      expect(getByText('Add')).toBeTruthy();
    });

    it('opens the creation popup when the add button is pressed', () => {
      const openCreation = jest.fn();
      const {getByText} = setupList({openCreation});

      fireEvent.press(getByText('Add'));

      expect(openCreation).toHaveBeenCalledTimes(1);
    });

    it('renders one card per session in the list', () => {
      const {getAllByTestId} = setupList();

      expect(getAllByTestId('cardContainer')).toHaveLength(2);
    });

    it('renders no cards when the list is empty', () => {
      const {queryAllByTestId} = setupList({sessionList: []});

      expect(queryAllByTestId('cardContainer')).toHaveLength(0);
    });
  });
});
