import React from 'react';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Input, Button, Icon, Text} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import {iconColor} from '../helpers/colors';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {LoadingModal} from '../components/LoadingModal';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../types/navigation';
import {baseURL} from '../helpers/constants';
import {Divider} from '@rneui/base';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather'

const SignupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

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

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

    const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone_no: formData.phone,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show server error using toast
        const errorMessage = data.message || 'Registration failed';
     
        
        throw new Error(errorMessage);
      }

      if (data.status === 'success') {
        // Show success toast
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Account created successfully!',
          position: 'bottom',
        });
        // Navigate to verification screen
        navigation.navigate('OTPVerify', { email: formData.email });
      } else {
        const errorMessage = data.message || 'Registration was not successful';
        Toast.show({
          type: 'error',
          text1: 'Registration Error',
          text2: errorMessage,
          position: 'bottom',
        });

        throw new Error(errorMessage);
      }
    } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "error",
          position: 'bottom',
        });
      // console.error('Registration error:', error);
      // Generic error toast if something unexpected happens
      if (error instanceof Error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
          position: 'bottom',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Company Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/mobile_app_icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              {/* <Divider /> */}

              <View style={{marginTop: 20, alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontSize: 20, fontWeight:'bold'}}>Sign Up</Text>
                <Text>Register now to be part of the family</Text>
              </View>

              <Divider />

            </View>

            {/* First and Last Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameInputContainer}>
                <Input
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={text => handleChange('firstName', text)}
                  leftIcon={
                    <Icon
                      name="account-outline"
                      type="material-community"
                      color={iconColor}
                      size={20}
                    />
                  }
                  inputContainerStyle={[
                    styles.inputContainer,
                    errors.firstName && styles.errorInput,
                  ]}
                  inputStyle={styles.inputText}
                  containerStyle={styles.nameInputWrapper}
                  errorMessage={errors.firstName}
                  errorStyle={styles.errorText}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.nameInputContainer}>
                <Input
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={text => handleChange('lastName', text)}
                  leftIcon={
                    <Icon
                      name="account-outline"
                      type="material-community"
                      color={iconColor}
                      size={20}
                    />
                  }
                  inputContainerStyle={[
                    styles.inputContainer,
                    errors.lastName && styles.errorInput,
                  ]}
                  inputStyle={styles.inputText}
                  containerStyle={styles.nameInputWrapper}
                  errorMessage={errors.lastName}
                  errorStyle={styles.errorText}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email Input */}
            <Input
              placeholder="Email Address"
              value={formData.email}
              onChangeText={text => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Icon
                  name="email-outline"
                  type="material-community"
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
              errorMessage={errors.email}
              errorStyle={styles.errorText}
              editable={!isLoading}
            />

            {/* Phone Input */}
            <Input
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={text => handleChange('phone', text)}
              keyboardType="phone-pad"
              leftIcon={
                <Icon
                  name="phone-outline"
                  type="material-community"
                  color={iconColor}
                  size={20}
                />
              }
              inputContainerStyle={[
                styles.inputContainer,
                errors.phone && styles.errorInput,
              ]}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
              errorMessage={errors.phone}
              errorStyle={styles.errorText}
              editable={!isLoading}
            />

            {/* Password Input */}
            <Input
              placeholder="Password"
              value={formData.password}
              onChangeText={text => handleChange('password', text)}
              secureTextEntry
              leftIcon={
                <Feather name="lock" color={iconColor} size={20} />
              }
              inputContainerStyle={[
                styles.inputContainer,
                errors.password && styles.errorInput,
              ]}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
              errorMessage={errors.password}
              errorStyle={styles.errorText}
              editable={!isLoading}
            />

            {/* Confirm Password Input */}
            <Input
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={text => handleChange('confirmPassword', text)}
              secureTextEntry
              leftIcon={
                <Feather name="lock" color={iconColor} size={20} />
              }
              inputContainerStyle={[
                styles.inputContainer,
                errors.confirmPassword && styles.errorInput,
              ]}
              inputStyle={styles.inputText}
              containerStyle={styles.inputWrapper}
              errorMessage={errors.confirmPassword}
              errorStyle={styles.errorText}
              editable={!isLoading}
            />

            {/* Sign Up Button */}
            <PrimaryBtn
              title="Sign Up"
              onPress={handleSignup}
              disabled={isLoading}
            />

            {/* Already have an account? */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                type="clear"
                title="Login"
                titleStyle={styles.loginLink}
                onPress={() => navigation.goBack()}
                disabled={isLoading}
              />
            </View>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInputContainer: {
    width: '48%', // Slightly less than half to account for spacing
  },
  nameInputWrapper: {
    paddingHorizontal: 0,
    // marginBottom: 5,
  },
  inputWrapper: {
    paddingHorizontal: 0,
    // marginBottom: 5,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#1890ff',
    fontSize: 14,
    paddingHorizontal: 0,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
});

export default SignupScreen;
