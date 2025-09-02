import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Alert, ScrollView} from 'react-native';
import {Button} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PasswordSecurityScreen = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = () => {
    setIsLoading(true);
    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            value={formData.currentPassword}
            onChangeText={text => setFormData({...formData, currentPassword: text})}
            placeholder="Enter current password"
            secureTextEntry={!showCurrent}
          />
          <Ionicons
            name={showCurrent ? 'eye-off' : 'eye'}
            size={20}
            onPress={() => setShowCurrent(!showCurrent)}
            style={styles.eyeIcon}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            value={formData.newPassword}
            onChangeText={text => setFormData({...formData, newPassword: text})}
            placeholder="Enter new password"
            secureTextEntry={!showNew}
          />
          <Ionicons
            name={showNew ? 'eye-off' : 'eye'}
            size={20}
            onPress={() => setShowNew(!showNew)}
            style={styles.eyeIcon}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={text => setFormData({...formData, confirmPassword: text})}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirm}
          />
          <Ionicons
            name={showConfirm ? 'eye-off' : 'eye'}
            size={20}
            onPress={() => setShowConfirm(!showConfirm)}
            style={styles.eyeIcon}
          />
        </View>
      </View>

      <Button
        title="Change Password"
        loading={isLoading}
        onPress={handleChangePassword}
        buttonStyle={styles.button}
        icon={<Feather name="lock" size={20} color="white" style={styles.icon} />}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#30a280',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 20,
  },
  icon: {
    marginRight: 10,
  },
});

export default PasswordSecurityScreen;