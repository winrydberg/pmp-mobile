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
import {RegisterPayload, useAuth} from '../Context/AuthContext';
import {Divider, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { LoadingModal } from '../components/LoadingModal';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';

const SignupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const { register, isLoading, error, clearError } = useAuth();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [errors, setErrors] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
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

  // Show auth context errors in toast
  React.useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Signup Error',
        text2: error,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 60,
      });
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    // // Email validation
    // if (!email) {
    //   newErrors.email = 'Email is required';
    //   valid = false;
    // } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    //   newErrors.email = 'Please enter a valid email';
    //   valid = false;
    // }

    // Phone validation
    if (!phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else {
      // Remove all non-digit characters for validation
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        newErrors.phone = 'Please enter a valid phone number (9-15 digits)';
        valid = false;
      }
    }

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

  const handleSignup = async () => {
    console.log('handleSignup called');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, attempting signup...');

    try {
      // alert(firstName.trim()+''+lastName.trim()+''+phone+''+email+''+password);
      const registerPayload : RegisterPayload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_no: phone.trim(),
        password: password,
        password_confirmation: confirmPassword
      };
      // return;
      const result = await register(registerPayload);
      console.log('Signup result:', result);

      // Check if signup was successful
      if (result && result.success !== false) {
        Toast.show({
          type: 'success',
          text1: 'Account Created!',
          text2: 'Welcome to BuyPower GH',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
      }
    } catch (err: any) {
      // Show error toast if not already handled by context
      console.error('Signup error:', err);
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: err?.message || 'Something went wrong. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  const goToLogin = () => {
    navigation.goBack();
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
              {/* Logo Container */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../assets/logos/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Welcome Text */}
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Create Account</Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign up to start buying power
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
              {/* Required Fields Indicator */}
              <View style={styles.requiredFieldsNotice}>
                <Text style={styles.requiredFieldsText}>
                  Fields marked with <Text style={styles.requiredAsterisk}>*</Text> are required
                </Text>
              </View>

              {/* First Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  First Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.firstName && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="user" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Enter your first name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName) {
                        setErrors({ ...errors, firstName: '' });
                      }
                    }}
                    autoCapitalize="words"
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                </View>
                {errors.firstName ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  </View>
                ) : null}
              </View>

              {/* Last Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Last Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.lastName && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="user" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Enter your last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName) {
                        setErrors({ ...errors, lastName: '' });
                      }
                    }}
                    autoCapitalize="words"
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                </View>
                {errors.lastName ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  </View>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.email && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="mail" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    keyboardType="email-address"
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    autoCapitalize="none"
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                </View>
                {errors.email ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                ) : null}
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Phone Number <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.phone && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="phone" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="0241234567"
                    placeholderTextColor="#9CA3AF"
                    value={phone}
                    keyboardType="phone-pad"
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) {
                        setErrors({ ...errors, phone: '' });
                      }
                    }}
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                </View>
                {errors.phone ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  </View>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.password && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="lock" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Create a password"
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
                  <View style={styles.iconContainer}>
                    <Feather name="lock" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="Confirm your password"
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

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  isLoading && styles.signupButtonDisabled,
                ]}
                onPress={handleSignup}
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
                  style={styles.signupGradient}
                >
                  {isLoading ? (
                    <>
                      <Animated.View
                        style={{
                          transform: [
                            {
                              rotate: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        }}
                      >
                        <Feather name="loader" size={20} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.signupButtonText}>
                        Creating account...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="user-plus" size={20} color="#FFFFFF" />
                      <Text style={styles.signupButtonText}>Create Account</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>

              <Divider style={{marginBottom: 16, marginTop: 16}}/>

              <View style={[styles.loginContainer, { marginTop: 20, marginBottom: 20 }]}>
                <Text style={styles.loginText}>Read our privacy policy here... </Text>
                <TouchableOpacity onPress={() => {
                  appN.navigate("PrivacyPolicyScreen");
                }} disabled={isLoading}>
                  <Text style={styles.loginLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/*<LoadingModal visible={isLoading} />*/}

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
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.3,
    // shadowRadius: 16,
    elevation: 0,
  },
  logo: {
    width: 75,
    height: 75,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 30,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    elevation: 0,
  },
  requiredFieldsNotice: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  requiredFieldsText: {
    fontSize: 14,
    color: '#6B7280',
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
  iconContainer: {
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
  signupButton: {
    borderRadius: 12,
    overflow: 'hidden',
    // shadowColor: '#34B87C',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    elevation: 0,
    marginTop: 8,
  },
  signupButtonDisabled: {
    shadowOpacity: 0.1,
  },
  signupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  signupButtonText: {
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

export default SignupScreen;
