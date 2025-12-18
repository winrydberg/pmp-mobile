import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL } from "../helpers/constants";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, RootStackParamList } from "../types/navigation";

type User = {
  id: number;
  equator_uuid: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  email: string;
  phone_no: string;
  // API sometimes sends 0/1 or boolean; keep type as number but check flexibly
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
  // token may be absent/null for not-verified logins
  token: string | null;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  other_names?: string | null;
  email: string;
  phone_no: string;
  password: string;
  password_confirmation: string;
};

type AuthContextType = {
  authData: AuthData | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  handleResendOtp: (email: string) => Promise<void>;
  // password reset flows
  sendPasswordResetOtp: (identifier: string) => Promise<void>;
  validateResetOtp: (identifier: string, otp: string) => Promise<{ resetToken?: string } | void>;
  resetPassword: (identifier: string, resetToken: string, password: string, password_confirmation: string) => Promise<void>;
  isLoading: boolean;
  isResending: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isUserVerified(u?: User | null): boolean {
  if (!u) return false;
  // Consider verified if explicit flag or email_verified_at is present
  return u.is_verified === 1 || (u as any).is_verified === true || !!u.email_verified_at;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const appNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // make clearAuthData and storeAuthData stable so they can be referenced in useEffect
  const clearAuthData = useCallback(async () => {
    await AsyncStorage.removeItem('authData');
    setAuthData(null);
  }, []);

  const storeAuthData = useCallback(async (data: AuthData) => {
    await AsyncStorage.setItem('authData', JSON.stringify(data));
    setAuthData(data);
  }, []);

  // Load auth data from storage on initial load
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedAuthData = await AsyncStorage.getItem('authData');
        if (storedAuthData) {
          const parsedData: AuthData = JSON.parse(storedAuthData);
          setAuthData(parsedData);

          // Auto-navigate if user is already authenticated and verified
          if (isUserVerified(parsedData?.user) && parsedData?.token) {
            appNavigation.reset({ index: 0, routes: [{ name: 'AppStack' }] });
          }
        }
      } catch (err) {
        console.error('Failed to load auth data', err);
        await clearAuthData();
      }
    };

    loadAuthData();
  }, [appNavigation, clearAuthData]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: identifier, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Login failed");
      }
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Login was not successful");
      }

      const data = responseData.data;

      // If not verified (token might be null or user flag false), route to OTP
      if (!data?.token || !isUserVerified(data?.user)) {
        // Do not persist partial auth with null token
        setAuthData(null);

        // Navigate to OTP screen - use email or phone number
        const otpIdentifier = data?.user?.email || data?.user?.phone_no || identifier;
        navigation.navigate('OTPVerify', { email: otpIdentifier });

        Toast.show({
          type: 'info',
          text1: 'Verification Required',
          text2: responseData.message || 'Your account is not verified. A new OTP has been sent.',
          position: 'bottom',
        });
        return;
      }

      // Verified: persist and go to app
      await storeAuthData({ user: data.user, token: data.token });

      appNavigation.reset({ index: 0, routes: [{ name: 'AppStack' }] });

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

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If backend returns 409 for already verified account
        if (response.status === 409) {
          throw new Error(responseData.message || "Email already registered.");
        }
        throw new Error(responseData.message || "Registration failed");
      }
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "Registration was not successful");
      }

      // For both: new registration OR existing-unverified, backend returns success
      // Navigate to OTP screen using the email from payload
      navigation.navigate('OTPVerify', { email: payload.email });

      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: responseData.message || 'A verification code has been sent to your contact.',
        position: 'bottom',
      });

      // Do not store auth until verified
      setAuthData(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          otp: otp,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "OTP verification failed");
      }
      if (responseData.status !== "success") {
        throw new Error(responseData.message || "OTP verification was not successful");
      }

      // After verification, backend returns full auth payload with token
      await storeAuthData({
        user: responseData.data.user,
        token: responseData.data.token ?? null,
      });

      appNavigation.reset({ index: 0, routes: [{ name: 'AppStack' }] });

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
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
        position: 'bottom',
      });
    } catch (err) {
      console.error('Failed to logout', err);
      Toast.show({
        type: 'error',
        text1: 'Logout Error',
        text2: 'Failed to logout properly',
        position: 'bottom',
      });
    }
  };

  // Fix handleResendOtp to accept an email and post { email }
  const handleResendOtp = async (email: string) => {
    if (isResending) return;

    setIsResending(true);

    try {
      const response = await fetch(`${baseURL}/api/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to resend OTP');
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Resend OTP was not successful');
      }

      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: responseData.message || `A new OTP has been sent to ${email}`,
        position: 'bottom',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP';
      Toast.show({
        type: 'error',
        text1: 'Resend Error',
        text2: errorMessage,
        position: 'bottom',
      });
    } finally {
      setIsResending(false);
    }
  };

  // POST /password-reset/send-otp
  const sendPasswordResetOtp = async (identifier: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/password-reset/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ identifier: identifier }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to send password reset OTP');
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Password reset OTP not sent');
      }

      Toast.show({
        type: 'success',
        text1: 'Reset OTP Sent',
        text2: responseData.message || `If an account exists for ${identifier}, a reset code has been sent.`,
        position: 'bottom',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset OTP';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Reset OTP Error',
        text2: errorMessage,
        position: 'bottom',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // POST /password-reset/validate-otp
  const validateResetOtp = async (identifier: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = { identifier: identifier, otp };
      console.log('Validating OTP with body:', requestBody);

      const response = await fetch(`${baseURL}/api/password-reset/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('OTP validation response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to validate reset OTP');
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Reset OTP validation failed');
      }

      // Backend returns data: null, so we'll use the OTP as the reset token
      // or just return success to indicate OTP is valid
      const resetToken = responseData.data?.reset_token || otp;

      // Don't show toast here - let the screen handle navigation first
      // Toast will be shown in the ForgotPasswordScreen after navigation

      return { resetToken };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate reset OTP';
      console.error('OTP validation error:', err);
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Validate OTP Error',
        text2: errorMessage,
        position: 'bottom',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // POST /password-reset/reset
  const resetPassword = async (identifier: string, resetToken: string, password: string, password_confirmation: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        identifier: identifier,
        otp: resetToken, // Use 'otp' instead of 'reset_token' since backend expects the OTP
        password,
        password_confirmation,
      };
      console.log('Reset password with body:', requestBody);

      const response = await fetch(`${baseURL}/api/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      console.log('Reset password response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Unable to reset password');
      }
      if (responseData.status !== 'success') {
        throw new Error(responseData.message || 'Password reset failed');
      }

      Toast.show({
        type: 'success',
        text1: 'Password Reset',
        text2: responseData.message || 'Your password has been reset successfully.',
        position: 'bottom',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      console.error('Reset password error:', err);
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Reset Error',
        text2: errorMessage,
        position: 'bottom',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      authData,
      login,
      register,
      logout,
      verifyOtp,
      handleResendOtp,
      sendPasswordResetOtp,
      validateResetOtp,
      resetPassword,
      isLoading,
      isResending,
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
