import React from 'react';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../Context/AuthContext';
import { Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const { sendPasswordResetOtp, validateResetOtp, isLoading } = useAuth();

  const [identifier, setIdentifier] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState('');
  const [step, setStep] = React.useState<'identifier' | 'otp'>('identifier');

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateIdentifier = (identifierText: string) => {
    if (!identifierText.trim()) {
      return 'Email or phone number is required';
    }

    // Check if it's an email
    const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(identifierText);
    // Check if it's a phone number
    const isPhone = /^[0-9]{9,15}$/.test(identifierText.replace(/[\s-]/g, ''));

    if (!isEmail && !isPhone) {
      return 'Please enter a valid email or phone number';
    }

    return '';
  };

  const handleSendOtp = async () => {
    const identifierError = validateIdentifier(identifier);
    if (identifierError) {
      setError(identifierError);
      return;
    }

    try {
      await sendPasswordResetOtp(identifier.trim());
      setStep('otp');
      setError('');
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Please check your email/phone for the verification code',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (err) {
      // Error already handled by AuthContext
      console.error('Failed to send OTP:', err);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (otp.length < 4) {
      setError('Please enter a valid OTP code');
      return;
    }

    try {
      const result = await validateResetOtp(identifier.trim(), otp.trim());

      if (result?.resetToken) {
        // Show success message before navigation
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Please set your new password',
          position: 'top',
          visibilityTime: 2000,
          topOffset: 60,
        });

        // Navigate to reset password screen
        setTimeout(() => {
          navigation.navigate('ResetPassword', {
            email: identifier.trim(),
            resetToken: result.resetToken,
          });
        }, 500);
      } else {
        setError('Failed to get reset token. Please try again.');
      }
    } catch (err) {
      // Error already handled by AuthContext
      console.error('Failed to verify OTP:', err);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendPasswordResetOtp(identifier.trim());
      Toast.show({
        type: 'success',
        text1: 'OTP Resent',
        text2: 'A new verification code has been sent',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (err) {
      console.error('Failed to resend OTP:', err);
    }
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('identifier');
      setOtp('');
      setError('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <LinearGradient
        colors={['#4A90C4', '#34B87C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Decorative Section */}
            <Animated.View
              style={[
                styles.topSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Feather name="arrow-left" size={24} color="white" />
              </TouchableOpacity>

              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Feather name="lock" size={48} color="#4A90C4" />
                </View>
              </View>

              {/* Title Text */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>
                  {step === 'identifier' ? 'Forgot Password?' : 'Verify OTP'}
                </Text>
                <Text style={styles.subtitle}>
                  {step === 'identifier'
                    ? 'Enter your email address or phone number and we\'ll send you a code to reset your password'
                    : `Enter the 6-digit code sent to ${identifier}`}
                </Text>
              </View>
            </Animated.View>

            {/* Form Container */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {step === 'identifier' ? (
                <>
                  {/* Identifier Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email or Phone Number</Text>
                    <View
                      style={[
                        styles.modernInputContainer,
                        error && styles.errorInputContainer,
                      ]}
                    >
                      <View style={styles.inputIconContainer}>
                        <Feather name="mail" color="#9CA3AF" size={20} />
                      </View>
                      <TextInput
                        placeholder="your.email@example.com or 1234567890"
                        placeholderTextColor="#9CA3AF"
                        value={identifier}
                        keyboardType="default"
                        onChangeText={(text) => {
                          setIdentifier(text);
                          if (error) setError('');
                        }}
                        autoCapitalize="none"
                        style={styles.textInput}
                        editable={!isLoading}
                        autoFocus
                      />
                    </View>
                    {error ? (
                      <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Send OTP Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isLoading && styles.actionButtonDisabled,
                    ]}
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLoading
                          ? ['#9CA3AF', '#6B7280']
                          : ['#34B87C', '#2DA771']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionGradient}
                    >
                      {isLoading ? (
                        <>
                          <Feather name="loader" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>
                            Sending code...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Feather name="send" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Send Code</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* OTP Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter 6-digit Verification Code</Text>
                    <View
                      style={[
                        styles.modernInputContainer,
                        error && styles.errorInputContainer,
                      ]}
                    >
                      <View style={styles.inputIconContainer}>
                        <Feather name="shield" color="#9CA3AF" size={20} />
                      </View>
                      <TextInput
                        placeholder="Enter code"
                        placeholderTextColor="#9CA3AF"

                        value={otp}
                        keyboardType="number-pad"
                        maxLength={6}
                        onChangeText={(text) => {
                          setOtp(text);
                          if (error) setError('');
                        }}
                        style={[styles.textInput, styles.otpInput]}
                        editable={!isLoading}
                        autoFocus
                      />
                    </View>
                    {error ? (
                      <View style={styles.errorContainer}>
                        <Feather name="alert-circle" size={14} color="#EF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Verify Button */}
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      isLoading && styles.actionButtonDisabled,
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLoading
                          ? ['#9CA3AF', '#6B7280']
                          : ['#34B87C', '#2DA771']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionGradient}
                    >
                      {isLoading ? (
                        <>
                          <Feather name="loader" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>
                            Verifying...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Feather name="check-circle" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Verify Code</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Resend OTP */}
                  <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code? </Text>
                    <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
                      <Text style={styles.resendLink}>Resend</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  disabled={isLoading}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 30,
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    height: 56,
  },
  inputIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorInputContainer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  otpInput: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90C4',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A90C4',
  },
});

export default ForgotPasswordScreen;
