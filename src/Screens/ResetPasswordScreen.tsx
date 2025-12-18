import React from 'react';
import {
  View,
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const route = useRoute<ResetPasswordRouteProp>();
  const { resetPassword, isLoading } = useAuth();

  const { email, resetToken } = route.params;

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({
    password: '',
    confirmPassword: '',
  });

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

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      password: '',
      confirmPassword: '',
    };

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(email, resetToken, password, confirmPassword);

      Toast.show({
        type: 'success',
        text1: 'Password Reset Successful',
        text2: 'You can now login with your new password',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });

      // Navigate back to login after a short delay
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 1500);
    } catch (err) {
      // Error already handled by AuthContext
      console.error('Failed to reset password:', err);
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
              {/* Icon Container */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Feather name="key" size={48} color="#4A90C4" />
                </View>
              </View>

              {/* Title Text */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Create a new secure password for your account
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
              {/* Email Display */}
              <View style={styles.emailDisplayContainer}>
                <Feather name="mail" size={16} color="#6B7280" />
                <Text style={styles.emailDisplayText}>{email}</Text>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  New Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.password && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Feather name="lock" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={styles.textInput}
                    editable={!isLoading}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      color="#9CA3AF"
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.password}</Text>
                  </View>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Confirm Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.confirmPassword && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.inputIconContainer}>
                    <Feather name="lock" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Confirm your new password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: '' });
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Feather
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      color="#9CA3AF"
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  </View>
                ) : null}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirementItem}>
                  <Feather
                    name={password.length >= 6 ? 'check-circle' : 'circle'}
                    size={14}
                    color={password.length >= 6 ? '#34B87C' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      password.length >= 6 && styles.requirementMet,
                    ]}
                  >
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Feather
                    name={password && confirmPassword && password === confirmPassword ? 'check-circle' : 'circle'}
                    size={14}
                    color={password && confirmPassword && password === confirmPassword ? '#34B87C' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      password && confirmPassword && password === confirmPassword && styles.requirementMet,
                    ]}
                  >
                    Passwords match
                  </Text>
                </View>
              </View>

              {/* Reset Password Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isLoading && styles.actionButtonDisabled,
                ]}
                onPress={handleResetPassword}
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
                        Resetting password...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="check" size={20} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Reset Password</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 24,
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
  emailDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  emailDisplayText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
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
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
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
  requirementsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
  },
  requirementMet: {
    color: '#34B87C',
    fontWeight: '500',
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

export default ResetPasswordScreen;

