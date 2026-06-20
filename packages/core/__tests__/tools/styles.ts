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

import {screen} from '@testing-library/react-native';

/* The resolved, flattened style object. */
type ComputedStyle = Record<string, unknown>;

/*
 * Recursively flatten an arbitrarily nested style value into the flat list of
 * its leaf style objects, dropping null/undefined holes. Written by hand rather
 * than via Array.prototype.flat(Infinity) because a recursive style type makes
 * flat's typings instantiate infinitely under ts-jest.
 */
function flattenStyles(value: unknown, accumulator: ComputedStyle[]): void {
  if (value == null) {
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      flattenStyles(entry, accumulator);
    }
    return;
  }

  accumulator.push(value as ComputedStyle);
}

/*
 * Flatten a React Native style prop (which may be a deeply nested array) into a
 * single merged style object, with later entries overriding earlier ones. A non
 * array, non null value is returned as a single entry object.
 */
export function getComputedStyles(componentStyles: unknown): ComputedStyle {
  const entries: ComputedStyle[] = [];
  flattenStyles(componentStyles, entries);

  return entries.reduce<ComputedStyle>(
    (previous, current) => ({...previous, ...current}),
    {},
  );
}

/*
 * Resolve the merged styles of the element matching testId, reading the given
 * style prop name (defaults to "style").
 */
export function getTestIdStyles(
  testId: string,
  styleName: string = 'style',
): ComputedStyle {
  const element = screen.getByTestId(testId);
  const props = element.props as Record<string, unknown>;
  return getComputedStyles(props?.[styleName]);
}
