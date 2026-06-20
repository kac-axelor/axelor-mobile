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
import {render, RenderResult} from '@testing-library/react-native';
import {mockReduxState, MockReduxState} from './redux';
import {mockTranslator, TranslationOverrides} from './translation';

/*
 * Props passed to the component under test are an open record: each component
 * declares its own prop shape, and a test only needs to provide the props that
 * component reads.
 */
type ComponentProps = Record<string, unknown>;

interface SetupProps {
  Component: React.ComponentType<ComponentProps>;
  baseProps?: ComponentProps;
  overrideProps?: ComponentProps;
  /* Redux slice values the mocked useSelector should resolve against. */
  reduxState?: MockReduxState;
  /* Translation key to value overrides; unlisted keys resolve to themselves. */
  translations?: TranslationOverrides;
}

/*
 * Return type of setup: the testing-library render utilities (with the default
 * rerender replaced by a props based one) plus the merged props the component
 * was rendered with.
 */
type SetupResult = Omit<RenderResult, 'rerender'> & {
  rerender: (rerenderProps?: ComponentProps) => void;
  props: ComponentProps;
};

/*
 * Render a core component with its cross cutting dependencies already mocked.
 * ui contexts (useThemeColor / useConfig) resolve through their default context
 * values exactly as in the ui test suite, so no provider wrapper is needed; this
 * helper only arranges redux, navigation and translation. Navigation hooks are
 * mocked globally with sensible defaults, so a test only needs to call
 * mockNavigation() explicitly when it wants to assert on navigation calls.
 *
 * The signature stays compatible with the ui setup ({Component, baseProps,
 * overrideProps}) and adds optional reduxState and translations fields.
 */
export function setup({
  Component,
  baseProps,
  overrideProps,
  reduxState,
  translations,
}: SetupProps): SetupResult {
  mockReduxState(reduxState ?? {});
  mockTranslator(translations ?? {});

  const props: ComponentProps = {...baseProps, ...overrideProps};
  const utils = render(React.createElement(Component, props));

  const rerender = (rerenderProps?: ComponentProps): void =>
    utils.rerender(
      React.createElement(Component, {...props, ...rerenderProps}),
    );

  return {...utils, rerender, props};
}
