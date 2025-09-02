// import { NavigatorScreenParams } from "@react-navigation/native";

// type TabIconProps = {
//     color: string;
//     size: number;
//   };

// // Auth Stack
// export type AuthStackParamList = {
//   Login: undefined;
//   Signup: undefined;
//   ForgotPassword: undefined;
//   OTPVerify: { email: string };
// };

// // Auth Stack
// export type AppStackParamList = {
//   MainTabs: NavigatorScreenParams<MainTabParamList>;
//   AddWallet: undefined;
// };

// // Main Tabs (nested inside Drawer)
// export type MainTabParamList = {
//   Home: { icon?: (props: TabIconProps) => React.ReactNode };
//   MyMoney: undefined;
//   Settings: undefined;
//   // AppStack: undefined;
// };

// // Drawer Navigator
// export type AppDrawerParamList = {
//   // MainTabs: NavigatorScreenParams<MainTabParamList>;
//   AppStack: NavigatorScreenParams<AppStackParamList>;
//   Help: undefined;
// };

// // Root Stack (combines Auth + App)
// export type RootStackParamList = {
//   AuthStack: undefined;
//   AppDrawer: undefined;
//   AddWallet: undefined;
// };

import {NavigatorScreenParams} from '@react-navigation/native';
import {TransactionItem} from './Transaction';

type TabIconProps = {
  color: string;
  size: number;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OTPVerify: {email: string};
};

// App Stack (now parent of Drawer)
export type AppStackParamList = {
  AppDrawer: NavigatorScreenParams<AppDrawerParamList>; // Changed from MainTabs
  AddWallet: {callback?: () => void};
  AddMeter: undefined;
  NewPurchase: undefined;
  MakePayment: {meterNumber: string; customerName: string};
  ProcessingPayment: {
    meterNumber: string;
    amount: string;
    customerName?: string;
    transactionData: object | null;
    message: string;
  };
  // Add other modal screens here
  // TransactionDetails: {transaction: any, refetchFunc: (val:boolean) => void};
  TransactionDetails: {
    transaction: TransactionItem;
    refetchFunc: (val: boolean) => void; // Add this
  };
   PersonalInfo: undefined;
   PasswordSecurity: undefined;
   NotificationPreferences: undefined;
   FAQ: undefined;
   HelpCenter: undefined;
};

// App Stack (now parent of Drawer)
export type TransactionStackParamList = {
  TransactionDetails: {transaction: any};
};
// Main Tabs (nested inside Drawer)
export type MainTabParamList = {
  Home: {icon?: (props: TabIconProps) => React.ReactNode};
  MyMoney: undefined;
  Transactions: undefined;
  // Transactions: NavigatorScreenParams<TransactionStackParamList>;
  Settings: undefined;
};

// Drawer Navigator (now nested in AppStack)
export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>; // Changed from AppStack
  Help: undefined;
};

// Root Stack (combines Auth + App)
export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined; // Changed from AppDrawer
  // AddWallet is no longer needed here as it's in AppStack
};
