import React from 'react';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import { useAuth } from '../Context/AuthContext';
import { Input, Button, Icon, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { iconColor } from '../helpers/colors';
import { PrimaryBtn } from '../components/PrimaryBtn';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation';
import { LoadingModal } from '../components/LoadingModal';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({
    email: '',
    password: '',
  });

  // Show auth context errors in toast
  React.useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: error,
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        bottomOffset: 40,
      });
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
    };

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
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
      // Show validation errors in form fields
      return;
    }

    try {
      await login(email, password);
      // On success, navigation is handled by AuthContext
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (err) {
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        position: 'bottom',
        visibilityTime: 3000,
      });
      // Errors are already handled by AuthContext and useEffect hook
    }
  };

  const goToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Company Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logos/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Email Input */}
          <Input
            placeholder="Enter Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({...errors, email: ''});
              }
            }}
            leftIcon={
              <Feather
                name="user"
                color={iconColor}
                size={20}
              />
            }
            inputContainerStyle={[
              styles.inputContainer,
              errors.email && styles.errorInput,
            ]}
            inputStyle={styles.inputText}
            containerStyle={styles.inputWrapper}
            editable={!isLoading}
            errorMessage={errors.email}
            errorStyle={styles.errorText}
          />

          {/* Password Input */}
          <Input
            placeholder="Enter Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({...errors, password: ''});
              }
            }}
            secureTextEntry
            leftIcon={
              <Feather
                name="lock"
                color={iconColor}
                size={20}
              />
            }
            inputContainerStyle={[
              styles.inputContainer,
              errors.password && styles.errorInput,
            ]}
            inputStyle={styles.inputText}
            containerStyle={styles.inputWrapper}
            editable={!isLoading}
            errorMessage={errors.password}
            errorStyle={styles.errorText}
          />

          {/* Login Button */}
          <PrimaryBtn 
            title={isLoading ? 'Logging in...' : 'Login'} 
            onPress={loginUser} 
            disabled={isLoading}
            loading={isLoading}
          />

          <View style={styles.signupContainer}>
            <Text>Don't have an account? </Text>
            <Button
              type="clear"
              onPress={goToSignup}
              title="Sign Up"
              disabled={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <LoadingModal visible={isLoading} />

        <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 250,
    height: 250,
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  errorInput: {
    borderColor: '#ff4444',
  },
  inputText: {
    padding: 8,
  },
  signupContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LoginScreen;