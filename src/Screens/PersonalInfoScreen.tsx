import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Alert, ScrollView} from 'react-native';
import {Button} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import {useAuth} from '../Context/AuthContext';

const PersonalInfoScreen = () => {
  const {authData} = useAuth();
  const [formData, setFormData] = useState({
    firstName: authData?.user?.first_name || '',
    lastName: authData?.user?.last_name || '',
    email: authData?.user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Your information has been updated');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={text => setFormData({...formData, firstName: text})}
          placeholder="Enter your first name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={text => setFormData({...formData, lastName: text})}
          placeholder="Enter your last name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={text => setFormData({...formData, email: text})}
          placeholder="Enter your email"
          keyboardType="email-address"
          editable={false} // Email typically shouldn't be editable
        />
      </View>

      <Button
        title="Update Information"
        loading={isLoading}
        onPress={handleUpdate}
        buttonStyle={styles.button}
        icon={<Feather name="save" size={20} color="white" style={styles.icon} />}
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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

export default PersonalInfoScreen;