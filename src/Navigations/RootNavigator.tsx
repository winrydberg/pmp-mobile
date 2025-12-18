import {createStackNavigator} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {View, Image, StyleSheet, ImageBackground} from 'react-native';
import {
  RootStackParamList,
  AuthStackParamList,
  AppDrawerParamList,
  MainTabParamList,
  AppStackParamList,
} from '../types/navigation';
import LoginScreen from '../Screens/LoginScreen';
import HelpScreen from '../Screens/HelpScreen';
import SignupScreen from '../Screens/SignupScreen';
import ForgotPasswordScreen from '../Screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../Screens/ResetPasswordScreen';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import SettingsScreen from '../Screens/SettingsScreen';
import {useAuth} from '../Context/AuthContext';
import AddPaymentMethod from '../Screens/AddPaymentMethod';
import MyMoneyMain from '../Screens/MyMoneyMain';
import {primaryBtnColor, primaryHeaderColor, secondaryColor} from '../helpers/colors';
import OtpScreen from '../Screens/OtpScreen';
import Toast from 'react-native-toast-message';
import AddMeterScreen from '../Screens/AddMeterScreen';
import {Avatar} from '@rneui/base';
import BuyPowerScreen from '../Screens/BuyPowerScreen';
import MakePaymentScreen from '../Screens/MakePaymentScreen';
import TransactionScreen from '../Screens/TransactionScreen';
import ProcessingPaymentScreen from '../Screens/ProcessingPaymentScreen';
import TransactionDetailsScreen from '../Screens/TransactionDetailsScreen';
import PersonalInfoScreen from '../Screens/PersonalInfoScreen';
import PasswordSecurityScreen from '../Screens/PasswordSecurityScreen';
import NotificationPreferencesScreen from '../Screens/NotificationPreferencesScreen';
import FAQScreen from '../Screens/FAQScreen';
import { Text } from '@rneui/themed';
import NewUserQueryScreen from '../Screens/NewUserQueryScreen';
import TransactionReceipt from "../Screens/TransactionReceipt.tsx";
import TransactionReceiptBase64 from "../Screens/TransactionReceiptBase64.tsx";
import UserAvatar from '../components/UserAvatar.tsx';
import React from 'react';
import PrivacyPolicyScreen from "../Screens/PrivacyPolicyScreen.tsx";
import PowerAppReceipt from '../Screens/PowerAppReceipt.tsx';


// Stacks & Navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();
const AppDrawer = createDrawerNavigator<AppDrawerParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

function CustomDrawerContent(props: any) {
  const {logout, authData} = useAuth(); // Assuming you have a logout function in your auth context

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/zig-zag-default.png')}
        style={styles.headerImage}>
        <View
          style={{
            // flexDirection: "row",
            // alignItems: "center",
            gap: 10,
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}>
          {/*<Avatar*/}
          {/*  containerStyle={{*/}
          {/*    backgroundColor: secondaryColor,*/}
          {/*    padding: 10,*/}
          {/*    borderRadius: 100,*/}
          {/*    marginTop: 10*/}
          {/*  }}*/}
          {/*  titleStyle={{fontFamily: 'Holgada-Regular', fontSize: 24}}*/}
          {/*  // icon={{ name: "user", type: "ionicons" }}*/}
          {/*  size={60}*/}
          {/*  // rounded*/}

          {/*  title={*/}
          {/*    authData?.user?.first_name && authData?.user?.last_name*/}
          {/*      ? `${authData?.user.first_name[0]}${authData?.user.last_name[0]}`*/}
          {/*      : 'G'*/}
          {/*  }*/}
          {/*/>*/}

          <UserAvatar
            firstName={authData?.user.first_name ?? 'Guest'}
            lastName={authData?.user.last_name ?? ''}
            size={60}
            style={{
              marginTop: 10
            }}
          />
          <View>
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white', fontFamily: 'Holgada-Regular'}}>
              {authData?.user?.first_name ?? 'Guest'}{' '}
              {authData?.user?.last_name ?? ''}
            </Text>
            <Text style={{ color: 'white', fontFamily: 'Holgada-Regular'}}>
              {authData?.user?.email ?? 'johndoe@gmail.com'}
            </Text>
          </View>
        </View>
        {/* Optional: Add profile image or other header content */}
      </ImageBackground>

      <DrawerContentScrollView {...props} style={{fontFamily: 'Holgada-Regular', color: 'gray'}}>
        <DrawerItemList {...props} />

        {/* Add Logout Button */}
        <DrawerItem
          label="Logout"
          onPress={() => {
            props.navigation.closeDrawer(); // Close drawer first
            logout(); // Then perform logout
          }}
          icon={({focused, color, size}) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          labelStyle={styles.drawerLabel}
        />
      </DrawerContentScrollView>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <MainTabs.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 20,
          // paddingTop: 5,
        },
        tabBarLabelStyle: { fontFamily: 'Holgada-Regular' },
        tabBarActiveTintColor: '#30a280',
        tabBarInactiveTintColor: 'gray',
      }}>
      <MainTabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={focused ? 24 : 20}
              color={focused ? '#30a280' : 'gray'}
            />
          ),
          tabBarLabel: ({focused}) => (
            <Text style={focused ? styles.tabLabelActive : styles.tabLabel}>
              Home
            </Text>
          ),
        }}
      />
      <MainTabs.Screen
        name="MyMoney"
        component={MyMoneyMain}
        options={{
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={focused ? 26 : 22}
              color={focused ? '#30a280' : 'gray'}
            />
          ),
          tabBarLabel: ({focused}) => (
            <Text style={focused ? styles.tabLabelActive : styles.tabLabel}>
              My Wallet
            </Text>
          ),
        }}
      />
      <MainTabs.Screen
        name="Transactions"
        component={TransactionScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'filter-circle' : 'filter'}
              size={focused ? 26 : 22}
              color={focused ? '#30a280' : 'gray'}
            />
          ),
          tabBarLabel: ({focused}) => (
            <Text style={focused ? styles.tabLabelActive : styles.tabLabel}>
              Transactions
            </Text>
          ),
        }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={focused ? 24 : 20}
              color={focused ? '#30a280' : 'gray'}
            />
          ),
          tabBarLabel: ({focused}) => (
            <Text style={focused ? styles.tabLabelActive : styles.tabLabel}>
              Settings
            </Text>
          ),
        }}
      />
    </MainTabs.Navigator>
  );
}

function AppDrawerNavigator() {
  return (
    <AppDrawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitleStyle: {fontWeight: 'bold', color: 'white'},
        headerStyle: {
          backgroundColor: primaryHeaderColor,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#fff',
      }}>
      <AppDrawer.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          title: 'Home',
          drawerLabelStyle: {fontFamily: 'Holgada-Regular'},
          drawerIcon: ({focused, color, size}) => (
            <Feather
              name={focused ? 'home' : 'home'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <AppDrawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerLabelStyle: {fontFamily: 'Holgada-Regular'},
          title: 'Help Center',
          drawerIcon: ({focused, color, size}) => (
            <Feather
              name={focused ? 'help-circle' : 'help-circle'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </AppDrawer.Navigator>
  );
}

function AppStackNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="AppDrawer"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: 'white',
        },
        cardOverlayEnabled: true,
      }}>
      <AppStack.Screen
        name="AppDrawer"
        component={AppDrawerNavigator}
        options={{headerShown: false}}
      />
      <AppStack.Screen
        name="AddWallet"
        component={AddPaymentMethod}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Add Payment Method',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="AddMeter"
        component={AddMeterScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Add Meter',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="NewPurchase"
        component={BuyPowerScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Buy Power',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="MakePayment"
        component={MakePaymentScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Make Payment',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="ProcessingPayment"
        component={ProcessingPaymentScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Payment Confirmation',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Transaction Details',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Personal Information',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="PasswordSecurity"
        component={PasswordSecurityScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Password Security',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Notification Preferences',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="FAQ"
        component={FAQScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'FAQ',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="HelpCenter"
        component={HelpScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Help Center',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

      <AppStack.Screen
        name="NewUserQueryScreen"
        component={NewUserQueryScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'New Query',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />

        <AppStack.Screen
            name="TransactionReceipt"
            component={TransactionReceipt}
            options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Transaction Receipt',
                headerStyle: {
                    backgroundColor: primaryHeaderColor,
                },
                headerTintColor: '#fff',
            }}
        />

        <AppStack.Screen
            name="TransactionReceiptBase64"
            component={TransactionReceiptBase64}
            options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Transaction Receipt',
                headerStyle: {
                    backgroundColor: primaryHeaderColor,
                },
                headerTintColor: '#fff',
            }}
        />

      <AppStack.Screen
        name="PowerAppReceipt"
        component={PowerAppReceipt}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Transaction Receipt',
          headerStyle: {
            backgroundColor: primaryHeaderColor,
          },
          headerTintColor: '#fff',
        }}
      />


        <AppStack.Screen
            name="PrivacyPolicyScreen"
            component={PrivacyPolicyScreen}
            options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Privacy Policy',
                headerStyle: {
                    backgroundColor: primaryHeaderColor,
                },
                headerTintColor: '#fff',
            }}
        />

      {/* Add other modal screens here as needed */}
    </AppStack.Navigator>
  );
}

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="OTPVerify" component={OtpScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

const RootStack = createStackNavigator<RootStackParamList>();
export default function RootNavigator() {
  const {authData} = useAuth();

  return (
    <>
      {/* <NavigationContainer> */}
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {authData?.user ? (
          <RootStack.Screen name="AppStack" component={AppStackNavigator} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
      {/* </NavigationContainer> */}
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: 'Holgada-Regular',
    fontSize: 5
  },
  headerImage: {
    height: 150,
    width: '100%',
  },
  tabLabel: {
    fontSize: 12,
    color: 'gray',
  },
  tabLabelActive: {
    fontSize: 14,
    color: '#30a280',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  drawerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  drawerLabel: {
    fontFamily: 'Holgada-Regular',
    color: 'gray',
  },
});
