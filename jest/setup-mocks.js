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
/* eslint-disable no-undef */

import 'react-native-gesture-handler/jestSetup';
import 'react-native/jest/setup';

jest.useFakeTimers();

jest.mock('react-native/Libraries/Animated/nodes/AnimatedValue', () => {
  const Actual = jest.requireActual(
    'react-native/Libraries/Animated/nodes/AnimatedValue',
  );

  const AnimatedValue = Actual.default || Actual;
  const proto = AnimatedValue.prototype;
  const originalRemoveListener = proto.removeListener;

  proto.removeListener = function (id) {
    if (!this._listeners || !this._listeners[id]) return;

    return originalRemoveListener.call(this, id);
  };

  return AnimatedValue;
});

jest.mock('react-native/Libraries/BatchedBridge/NativeModules');
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  settings: {},
  getConstants: () => ({settings: {}}),
}));
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const turboModuleRegistry = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry',
  );
  return {
    ...turboModuleRegistry,
    getEnforcing: name => {
      try {
        return turboModuleRegistry.getEnforcing(name);
      } catch (e) {
        return {};
      }
    },
  };
});

jest.mock('react-native-blob-util', () => ({
  DocumentDir: 'FAKE-DIRECTORY-PATH',
}));

jest.mock('react-native-calendars', () => ({
  Agenda: jest.fn(),
  AgendaEntry: jest.fn(),
  DateData: jest.fn(),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({default: jest.fn()}));

jest.mock('@react-native-community/slider', () => 'RNSlider');

jest.mock('react-native-datawedge-intents', () => ({
  registerBroadcastReceiver: () => jest.fn(),
}));

jest.mock('react-native-date-picker', () => ({default: jest.fn()}));

jest.mock('react-native-device-info', () => ({
  getManufacturer: 'FAKE-MANUFACTURER',
}));

jest.mock('react-native-file-viewer', () => ({
  open: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: 'FAKE-DIRECTORY-PATH',
  downloadFile: jest.fn(),
}));

jest.mock('react-native-gifted-charts', () => ({
  LineChart: jest.fn(),
  BarChart: jest.fn(),
  PieChart: jest.fn(),
}));

jest.mock(
  'react-native-mmkv',
  () => ({
    MMKV: () => ({
      set: jest.fn(),
      getString: jest.fn(),
      clearAll: jest.fn(),
    }),
  }),
  {virtual: true},
);

jest.mock('react-native-pell-rich-editor', () => ({
  actions: jest.fn(),
  RichEditor: jest.fn(),
  RichToolbar: jest.fn(),
}));

require('react-native-reanimated').setUpTests();

jest.mock('react-native-share', () => ({
  turboModuleRegistry: jest.fn(),
}));

jest.mock('react-native-signature-canvas', () => ({Signature: jest.fn()}));

jest.mock('react-native-static-safe-area-insets', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getSafeAreaInsets: jest.fn(() => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })),
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const {View} = require('react-native');
  const createMock = () =>
    React.forwardRef((props, ref) => <View {...props} ref={ref} />);

  return {
    Circle: createMock(),
    Svg: createMock(),
    Path: createMock(),
  };
});

jest.mock('react-native-system-navigation-bar', () => ({
  default: jest.fn(),
  navigationHide: () => jest.fn(),
}));

jest.mock(
  'react-native-toast-message',
  () => ({
    show: jest.fn(),
    BaseToast: 'BaseToastMock',
    ErrorToast: 'ErrorToastMock',
  }),
  {virtual: true},
);

jest.mock('react-native-vision-camera', () => ({
  useCameraDevices: jest.fn(),
  useCameraFormat: jest.fn(),
  useCodeScanner: jest.fn(),
}));

jest.mock('react-native-webview', () => ({default: jest.fn()}));

jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);

jest.mock(
  'react-redux',
  () => {
    /*
     * Pass-through Provider so components/screens that wrap their tree in a
     * redux <Provider store={...}> can still be rendered. It renders children
     * directly; tests drive state through the mocked useSelector instead of a
     * real store.
     */
    const Provider = ({children}) => children;

    /*
     * Defensive identity HOC. No component uses react-redux connect() today,
     * but mocking it keeps the setup robust if a connected component is ever
     * added: the wrapped component renders unchanged, leaving prop control to
     * the test.
     */
    const connect = () => WrappedComponent => WrappedComponent;

    return {
      useSelector: jest.fn(),
      useDispatch: jest.fn(() => jest.fn()),
      useStore: jest.fn(),
      Provider,
      connect,
      batch: callback => callback(),
    };
  },
  {virtual: true},
);

/*
 * React Navigation mocks for the core package. UI tests never import these, so
 * the mocks are inert for them. Core components such as HeaderButton call
 * useNavigation() outside of a NavigationContainer, which would otherwise throw
 * "Couldn't find a navigation object". The action creators return plain marker
 * objects so navigation.dispatch(DrawerActions.toggleDrawer()) stays callable.
 */
jest.mock(
  '@react-navigation/native',
  () => {
    const createNavigationMock = () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      openDrawer: jest.fn(),
      closeDrawer: jest.fn(),
      toggleDrawer: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      removeListener: jest.fn(),
      reset: jest.fn(),
      emit: jest.fn(() => ({defaultPrevented: false})),
      isFocused: jest.fn(() => true),
    });

    return {
      useNavigation: jest.fn(() => createNavigationMock()),
      useRoute: jest.fn(() => ({
        params: {},
        key: 'mock-route',
        name: 'MockScreen',
      })),
      useIsFocused: jest.fn(() => true),
      useNavigationState: jest.fn(),
      useFocusEffect: jest.fn(),
      NavigationContainer: ({children}) => children,
      CommonActions: {
        navigate: payload => ({type: 'NAVIGATE', payload}),
        reset: payload => ({type: 'RESET', payload}),
        goBack: () => ({type: 'GO_BACK'}),
      },
      DrawerActions: {
        openDrawer: () => ({type: 'OPEN_DRAWER'}),
        closeDrawer: () => ({type: 'CLOSE_DRAWER'}),
        toggleDrawer: () => ({type: 'TOGGLE_DRAWER'}),
      },
      StackActions: {
        push: (name, params) => ({type: 'PUSH', payload: {name, params}}),
        pop: (count = 1) => ({type: 'POP', payload: {count}}),
        replace: (name, params) => ({type: 'REPLACE', payload: {name, params}}),
      },
    };
  },
  {virtual: true},
);

jest.mock(
  '@react-navigation/drawer',
  () => {
    const Screen = () => null;
    const Navigator = ({children}) => children;

    return {
      createDrawerNavigator: () => ({Navigator, Screen}),
    };
  },
  {virtual: true},
);

/*
 * react-i18next mock for the core package. UI tests never import it, so the mock
 * is inert for them. The core useTranslator() hook wraps useTranslation().t;
 * the default t is an identity function so I18n.t('Some_Key') returns the key,
 * which keeps translation-driven assertions stable without bundling locale
 * resources. initReactI18next is a benign i18next plugin so configI18n() does
 * not crash when a slice of core is imported transitively.
 */
jest.mock(
  'react-i18next',
  () => ({
    useTranslation: jest.fn(() => ({
      t: key => key,
      i18n: {language: 'en', changeLanguage: jest.fn()},
    })),
    initReactI18next: {type: '3rdParty', init: jest.fn()},
  }),
  {virtual: true},
);

/*
 * Break a pre-existing circular dependency inside the prebuilt core lib that
 * crashes any import from @axelor/aos-mobile-core under jest. The cycle is
 * lib/app <-> lib/models: app/modules pulls in models, while models/objectFields
 * imports schemaContructor from '../app' and calls schemaContructor.object(...)
 * at module-eval time, before the app barrel finishes initialising that binding
 * (so it is undefined). These
 * model field maps are only used for API field parsing, never at render time, so
 * stubbing the models barrel is inert for component tests. UI tests never import
 * core, so this mock does not affect them.
 *
 * The mock key must be the same specifier the internal lib import resolves to;
 * the relative path below resolves to packages/core/lib/models/index.js exactly
 * as the in-lib '../../models' import does.
 */
jest.mock('../packages/core/lib/models', () => ({
  core_modelAPI: {},
  core_searchFields: {},
  core_sortFields: {},
}));

/*
 * The core barrel transitively loads RootNavigator / Navigator, which call
 * createStackNavigator and createNativeStackNavigator at module scope. UI tests
 * never import these, so the pass-through mocks are inert there.
 */
jest.mock(
  '@react-navigation/stack',
  () => ({
    createStackNavigator: () => ({
      Navigator: ({children}) => children,
      Screen: () => null,
    }),
  }),
  {virtual: true},
);

jest.mock(
  '@react-navigation/native-stack',
  () => ({
    createNativeStackNavigator: () => ({
      Navigator: ({children}) => children,
      Screen: () => null,
    }),
  }),
  {virtual: true},
);
