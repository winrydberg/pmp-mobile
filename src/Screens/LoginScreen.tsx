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
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../Context/AuthContext';
import { Input, Button, Icon, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { iconColor } from '../helpers/colors';
import { PrimaryBtn } from '../components/PrimaryBtn';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { LoadingModal } from '../components/LoadingModal';
import Toast from 'react-native-toast-message';
import { baseURL } from '../helpers/constants.ts';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const { login, isLoading, error, clearError } = useAuth();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState({
    identifier: '',
    password: '',
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
        text1: 'Login Error',
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
      identifier: '',
      password: '',
    };

    // Email or Phone number validation
    if (!identifier) {
      newErrors.identifier = 'Email or phone number is required';
      valid = false;
    } else {
      // Check if it's an email
      const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(identifier);
      // Check if it's a phone number
      const isPhone = /^[0-9]{9,15}$/.test(identifier.replace(/[\s-]/g, ''));

      if (!isEmail && !isPhone) {
        newErrors.identifier = 'Please enter a valid email or phone number';
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

    setErrors(newErrors);
    return valid;
  };

  const loginUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(identifier, password);
      Toast.show({
        type: 'success',
        text1: 'Welcome Back!',
        text2: 'Login successful',
        position: 'top',
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (err) {
      // Errors are already handled by AuthContext and useEffect hook
    }
  };

  const goToSignup = () => {
    navigation.navigate('Signup');
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
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign in to continue to your account
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
              {/* Identifier Input (Email/Phone) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email or Phone Number</Text>
                <View
                  style={[
                    styles.modernInputContainer,
                    errors.identifier && styles.errorInputContainer,
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <Feather name="user" color="#9CA3AF" size={20} />
                  </View>
                  <TextInput
                    placeholder="john.doe@gmail.com or 0241234567"
                    placeholderTextColor="#9CA3AF"
                    value={identifier}
                    keyboardType="default"
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (errors.identifier) {
                        setErrors({ ...errors, identifier: '' });
                      }
                    }}
                    autoCapitalize="none"
                    style={styles.textInput}
                    editable={!isLoading}
                  />
                </View>
                {errors.identifier ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{errors.identifier}</Text>
                  </View>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
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
                    placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={loginUser}
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
                  style={styles.loginGradient}
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
                      <Text style={styles.loginButtonText}>
                        Signing in...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="log-in" size={20} color="#FFFFFF" />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={goToSignup} disabled={isLoading}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.3,
    // shadowRadius: 16,
    elevation: 1,
  },
  logo: {
    width: 90,
    height: 90,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90C4',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    // shadowColor: '#34B87C',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    elevation: 0,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A90C4',
  },
});

export default LoginScreen;
