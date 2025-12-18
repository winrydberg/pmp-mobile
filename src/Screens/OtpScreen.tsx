import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import {Input, Button, Icon, Image} from '@rneui/themed';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import {AuthStackParamList} from '../types/navigation';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {useAuth} from '../Context/AuthContext';
import {baseURL} from '../helpers/constants';

type OtpScreenRouteParams = {
  email: string;
};

const OtpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const route =
    useRoute<RouteProp<Record<string, OtpScreenRouteParams>, string>>();
  const {email} = route.params as OtpScreenRouteParams;
  const {verifyOtp, isLoading, error, clearError, handleResendOtp} = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string>('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // resend cooldown state
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const cooldownSeconds = 30;
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  // Show auth context errors in toast
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: error,
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        bottomOffset: 40,
      });
      clearError();
    }
  }, [error]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setLocalError('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !otp[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setLocalError('OTP must be 6 digits');
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a complete 6-digit OTP',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      await verifyOtp(email, otpValue);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP verified successfully!',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch {
      // Handled via useAuth error state and useEffect
    }
  };

  const startCooldown = () => {
    setResendCooldown(cooldownSeconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async (email: string) => {
    if (resendCooldown > 0) return;

    try {
      startCooldown();

      await handleResendOtp(email);

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Please check your connection and try again.',
        position: 'bottom',
      });
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/mobile_app_icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit OTP sent to {email}
              </Text>

              {/* Local validation error */}
              {localError ? (
                <View style={styles.errorContainer}>
                  <Icon
                    name="error-outline"
                    type="material"
                    color="#ff4444"
                    size={20}
                  />
                  <Text style={styles.errorText}>{localError}</Text>
                </View>
              ) : null}

              {/* OTP Input Fields */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    containerStyle={styles.otpInputContainer}
                    inputContainerStyle={[
                      styles.otpInput,
                      localError && styles.errorInput,
                    ]}
                    inputStyle={styles.otpInputText}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={({nativeEvent}) => {
                      if (nativeEvent.key === 'Backspace') {
                        handleBackspace(index);
                      }
                    }}
                    disabled={isLoading}
                  />
                ))}
              </View>

              {/* Verify Button */}
              <PrimaryBtn
                title={isLoading ? 'Verifying...' : 'Verify OTP'}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                loading={isLoading}
              />

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the OTP? </Text>
                <Button
                  type="clear"
                  title={
                    resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend OTP'
                  }
                  titleStyle={styles.resendButtonText}
                  onPress={() => resendOtp(email)}
                  disabled={isLoading || resendCooldown > 0}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  keyboardAvoidingView: {flex: 1},
  contentContainer: {flex: 1, justifyContent: 'center', paddingHorizontal: 20},
  formContainer: {width: '100%', maxWidth: 400, alignSelf: 'center'},
  logoContainer: {alignItems: 'center', marginBottom: 30},
  logo: {width: 150, height: 150},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {color: '#ff4444', marginLeft: 5},
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInputContainer: {width: '15%', paddingHorizontal: 0},
  otpInput: {
    borderBottomWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 50,
    justifyContent: 'center',
  },
  errorInput: {borderColor: '#ff4444'},
  otpInputText: {textAlign: 'center', fontSize: 20},
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {color: '#666'},
  resendButtonText: {color: '#2089dc', fontSize: 16, paddingHorizontal: 0},
});

export default OtpScreen;
