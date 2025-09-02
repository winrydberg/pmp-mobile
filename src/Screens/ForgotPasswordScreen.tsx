import React from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Text
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../Context/AuthContext';

import { iconColor } from '../helpers/colors';

const ForgotPasswordScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View>
            <Text>HelpScreen</Text>
          </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
  },
  input: {
    padding: 8,
    borderColor: "#eee",
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  button: {
    marginTop: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordButton: {
    borderWidth: 0,
  },
  forgotPasswordText: {
    color: '#1890ff',
  },
});

export default ForgotPasswordScreen;