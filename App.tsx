import './gesture-handler';
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {Button, lightColors, createTheme, ThemeProvider} from '@rneui/themed';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './src/Context/AuthContext';
import RootNavigator from './src/Navigations/RootNavigator';
import Toast from 'react-native-toast-message';
import {Provider} from 'react-redux';
import {store} from './src/store/store';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

// const theme = createTheme({
//   lightColors: {
//     ...Platform.select({
//       default: lightColors.platform.android,
//       ios: lightColors.platform.ios,
//     }),
//   },
// });

const theme = createTheme({
  components: {
    Button: {
      buttonStyle: {
        // borderRadius: 8,
      },
      titleStyle: {
        fontWeight: 'normal',
      },
      // Different types of buttons
      // raised: true,
      type: 'solid', // 'solid' | 'clear' | 'outline'
    },
    // colors: {
    //   primary: '#4a8cff',
    //   secondary: '#ff8c4a',
    // },
    lightColors: {
      primary: 'red',
    },
    darkColors: {
      primary: 'green',
    },
    mode: 'light', // or 'dark'
  },
});

function App(): React.JSX.Element {
  /*
   * To keep the template simple and small we're adding padding to prevent view
   * from rendering under the System UI.
   * For bigger apps the recommendation is to use `react-native-safe-area-context`:
   * https://github.com/AppAndFlow/react-native-safe-area-context
   *
   * You can read more about it here:
   * https://github.com/react-native-community/discussions-and-proposals/discussions/827
   */

      //   <!-- android:networkSecurityConfig="@xml/network_security_config" -->
      // <!-- android:usesCleartextTraffic="true" -->


  const safePadding = '5%';

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Toast />
        <NavigationContainer>
          <AuthProvider>
            <Toast />
            <RootNavigator />
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
