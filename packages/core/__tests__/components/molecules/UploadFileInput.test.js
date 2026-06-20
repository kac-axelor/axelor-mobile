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

import {UploadFileInput} from '@axelor/aos-mobile-core';
import {getComputedStyles, getDefaultThemeColors, setup} from '../../tools';

/*
 * UploadFileInput is the redesigned single-file picker row. It shows a
 * "choose a file" placeholder when empty, the selected file name once a file is
 * set, and a trailing action cluster (delete / view / camera / upload) whose
 * members depend on the current state (empty vs local file vs metafile,
 * readonly, document type). A thin vertical divider sits between the name and
 * the actions, and only when at least one action is visible. The empty +
 * required combination paints the row border with the error color.
 *
 * The component reads the ui theme and the core translator, plus the auth and
 * camera redux slices (through useMetafileUri / useCameraValueByKey), so the
 * harness supplies those slices and resolves the placeholder translation key.
 */
describe('UploadFileInput redesign', () => {
  const Colors = getDefaultThemeColors();

  const CHOOSE_FILE_LABEL = 'Choose a file';

  /* The trailing divider is the only View painted with the light secondary
   * color; the action icons and the row container use other tokens, so this
   * uniquely identifies it in the rendered tree. */
  const DIVIDER_COLOR = Colors.secondaryColor.background_light;

  const localFile = {name: 'contract.pdf'};
  const metaFile = {id: 42, fileName: 'invoice.png'};
  const metaPdfFile = {id: 43, fileName: 'report.pdf'};

  const setupInput = overrideProps =>
    setup({
      Component: UploadFileInput,
      baseProps: {title: 'Document', onUpload: jest.fn()},
      overrideProps,
      reduxState: {
        auth: {
          baseUrl: 'https://aos.test/',
          token: 'token',
          jsessionId: 'jsession',
        },
        camera: {cameraKey: null, photo: null},
      },
      translations: {Base_ChooseFile: CHOOSE_FILE_LABEL},
    });

  /* Resolve the trailing divider, identified by its light secondary background
   * together with the redesigned 1x28 dimensions, or null when it is absent. */
  const findDivider = root => {
    const matches = root.findAll(node => {
      if (typeof node.type !== 'string') {
        return false;
      }
      const style = getComputedStyles(node.props?.style);
      return (
        style.backgroundColor === DIVIDER_COLOR &&
        style.width === 1 &&
        style.height === 28
      );
    });

    return matches.length > 0 ? matches[0] : null;
  };

  describe('placeholder row (no file)', () => {
    it('renders the "choose a file" placeholder label', () => {
      const {getByText} = setupInput();

      expect(getByText(CHOOSE_FILE_LABEL)).toBeTruthy();
    });

    it('styles the placeholder with the dark secondary color and weight 600', () => {
      const {getByText} = setupInput();

      const placeholderStyle = getComputedStyles(
        getByText(CHOOSE_FILE_LABEL).props.style,
      );

      expect(placeholderStyle.color).toBe(
        Colors.secondaryColor_dark.background,
      );
      expect(placeholderStyle.fontWeight).toBe('600');
      expect(placeholderStyle.fontSize).toBe(15);
    });

    it('shows the camera and upload actions but not delete or view', () => {
      const {getByTestId, queryByTestId} = setupInput();

      expect(getByTestId('icon-camera-fill')).toBeTruthy();
      expect(getByTestId('icon-upload')).toBeTruthy();
      expect(queryByTestId('icon-x-lg')).toBeNull();
      expect(queryByTestId('icon-arrows-angle-expand')).toBeNull();
    });
  });

  describe('selected file row', () => {
    it('shows the local file name instead of the placeholder', () => {
      const {getByText, queryByText} = setupInput({defaultValue: localFile});

      expect(getByText(localFile.name)).toBeTruthy();
      expect(queryByText(CHOOSE_FILE_LABEL)).toBeNull();
    });

    it('shows the metafile fileName when the file has no name', () => {
      const {getByText} = setupInput({defaultValue: metaFile});

      expect(getByText(metaFile.fileName)).toBeTruthy();
    });

    it('styles the selected value with the text color and weight 700', () => {
      const {getByText} = setupInput({defaultValue: localFile});

      const valueStyle = getComputedStyles(
        getByText(localFile.name).props.style,
      );

      expect(valueStyle.color).toBe(Colors.text);
      expect(valueStyle.fontWeight).toBe('700');
      expect(valueStyle.fontSize).toBe(15);
    });
  });

  describe('action icons visibility per state', () => {
    it('shows only the delete action for a non-metafile local file', () => {
      const {getByTestId, queryByTestId} = setupInput({
        defaultValue: localFile,
      });

      expect(getByTestId('icon-x-lg')).toBeTruthy();
      expect(queryByTestId('icon-arrows-angle-expand')).toBeNull();
      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(queryByTestId('icon-upload')).toBeNull();
    });

    it('shows delete and view for a metafile', () => {
      const {getByTestId, queryByTestId} = setupInput({
        defaultValue: metaFile,
      });

      expect(getByTestId('icon-x-lg')).toBeTruthy();
      expect(getByTestId('icon-arrows-angle-expand')).toBeTruthy();
      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(queryByTestId('icon-upload')).toBeNull();
    });

    it('hides the delete action when canDeleteFile is false', () => {
      const {queryByTestId} = setupInput({
        defaultValue: localFile,
        canDeleteFile: false,
      });

      expect(queryByTestId('icon-x-lg')).toBeNull();
    });

    it('keeps only the view action for a readonly metafile', () => {
      const {getByTestId, queryByTestId} = setupInput({
        defaultValue: metaFile,
        readonly: true,
      });

      expect(getByTestId('icon-arrows-angle-expand')).toBeTruthy();
      expect(queryByTestId('icon-x-lg')).toBeNull();
      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(queryByTestId('icon-upload')).toBeNull();
    });

    it('drops the camera action when pictures are disabled', () => {
      const {queryByTestId, getByTestId} = setupInput({
        canTakePicture: false,
      });

      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(getByTestId('icon-upload')).toBeTruthy();
    });

    it('drops the camera action for pdf-only document types', () => {
      const {queryByTestId, getByTestId} = setupInput({
        documentTypesAllowed: 'pdf',
      });

      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(getByTestId('icon-upload')).toBeTruthy();
    });

    it('hides every action on an empty readonly input', () => {
      const {queryByTestId} = setupInput({readonly: true});

      expect(queryByTestId('icon-x-lg')).toBeNull();
      expect(queryByTestId('icon-arrows-angle-expand')).toBeNull();
      expect(queryByTestId('icon-camera-fill')).toBeNull();
      expect(queryByTestId('icon-upload')).toBeNull();
    });
  });

  describe('trailing divider', () => {
    it('renders the divider when an action is visible', () => {
      const {root} = setupInput({defaultValue: metaFile});

      expect(findDivider(root)).not.toBeNull();
    });

    it('does not render the divider when no action is visible', () => {
      const {root} = setupInput({readonly: true});

      expect(findDivider(root)).toBeNull();
    });
  });

  describe('required styling', () => {
    it('paints the row border with the error color when required and empty', () => {
      /* The placeholder text sits inside the bordered content row; walking up
       * from it is brittle, so locate the content View directly through its
       * 1px border carrying a border color token. */
      const {root, getByText} = setupInput({required: true});

      const borderedRow = root.findAll(node => {
        if (typeof node.type !== 'string') {
          return false;
        }
        const style = getComputedStyles(node.props?.style);
        return style.borderWidth === 1 && style.borderColor != null;
      });

      expect(borderedRow.length).toBeGreaterThan(0);
      expect(
        getComputedStyles(borderedRow[0].props.style).borderColor,
      ).toBe(Colors.errorColor.background);
      expect(getByText(CHOOSE_FILE_LABEL)).toBeTruthy();
    });

    it('uses the secondary border color when not required', () => {
      const {root} = setupInput();

      const borderedRow = root.findAll(node => {
        if (typeof node.type !== 'string') {
          return false;
        }
        const style = getComputedStyles(node.props?.style);
        return style.borderWidth === 1 && style.borderColor != null;
      });

      expect(borderedRow.length).toBeGreaterThan(0);
      expect(
        getComputedStyles(borderedRow[0].props.style).borderColor,
      ).toBe(Colors.secondaryColor.background);
    });

    it('uses the secondary border color when required but a file is set', () => {
      const {root} = setupInput({required: true, defaultValue: localFile});

      const borderedRow = root.findAll(node => {
        if (typeof node.type !== 'string') {
          return false;
        }
        const style = getComputedStyles(node.props?.style);
        return style.borderWidth === 1 && style.borderColor != null;
      });

      expect(borderedRow.length).toBeGreaterThan(0);
      expect(
        getComputedStyles(borderedRow[0].props.style).borderColor,
      ).toBe(Colors.secondaryColor.background);
    });
  });
});
