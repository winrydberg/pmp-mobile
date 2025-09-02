import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from "../helpers/constants";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, AppStackParamList, RootStackParamList, AppDrawerParamList } from "../types/navigation";
import { Alert } from "react-native";

type User = {
  id: number;
  equator_uuid: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  email: string;
  phone_no: string;
  is_verified: number;
  last_login_ip: string;
  last_login_location: string;
  last_login_at: string;
  id_type: string | null;
  id_number: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthData = {
  user: User;
  token: string;
};

type AuthContextType = {
  authData: AuthData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const appNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load auth data from storage on initial load
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedAuthData = await AsyncStorage.getItem('authData');
        if (storedAuthData) {
          const parsedData = JSON.parse(storedAuthData);
          setAuthData(parsedData);
          
          // Auto-navigate if user is already authenticated
          if (parsedData?.user?.is_verified === 1) {
            // appNavigation.navigate("MainTabs");
            appNavigation.reset({
              index: 0,
              routes: [{ name: 'AppStack' }],
            });
          }
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
        await clearAuthData();
      }
    };
    
    loadAuthData();
  }, []);

  const clearAuthData = async () => {
    await AsyncStorage.removeItem('authData');
    setAuthData(null);
  };

  const storeAuthData = async (data: AuthData) => {
    await AsyncStorage.setItem('authData', JSON.stringify(data));
    setAuthData(data);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });


      const responseData = await response.json();

      // Alert.alert("baseURL", JSON.stringify(responseData))

      
      if (!response.ok) {
        throw new Error(responseData.message || "Login failed");
      }

      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Login was not successful");
      }

      await storeAuthData(responseData.data);

      
      // Navigate based on verification status
      if (responseData.data.user.is_verified === true) {
        appNavigation.reset({
          index: 0,
          routes: [{ name: 'AppStack' }],
        });
      } else {
        navigation.navigate('OTPVerify', { email });
      }

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'You have been logged in successfully',
        position: 'bottom',
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: errorMessage,
        position: 'bottom',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });



      const responseData = await response.json();

      Alert.alert("Error", JSON.stringify(responseData));

      if (!response.ok) {
        throw new Error(responseData.message || "OTP verification failed");
      }

      if (responseData.status !== "success") {
        throw new Error(responseData.message || "OTP verification was not successful");
      }

      await storeAuthData(responseData.data);

      // Navigate to app stack after successful verification
      appNavigation.reset({
        index: 0,
        routes: [{ name: 'AppStack' }],
      });

      Toast.show({
        type: 'success',
        text1: 'Verification Successful',
        text2: responseData.message,
        position: 'bottom',
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "OTP verification failed";
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: errorMessage,
        position: 'bottom',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clearAuthData();
      // Reset navigation to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Failed to logout', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: 'Failed to logout properly',
        position: 'bottom',
      });
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ 
      authData, 
      login, 
      logout, 
      verifyOtp, 
      isLoading, 
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}