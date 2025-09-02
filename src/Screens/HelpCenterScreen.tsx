import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView} from 'react-native';
import {Button} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HelpCenterScreen = () => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      Alert.alert('Success', 'Your message has been sent to our support team');
      setMessage('');
      setIsSubmitting(false);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Ionicons name="mail" size={24} color="#30a280" />,
      label: 'Email Us',
      value: 'support@example.com',
    },
    {
      icon: <Ionicons name="call" size={24} color="#30a280" />,
      label: 'Call Us',
      value: '+1 (555) 123-4567',
    },
    {
      icon: <Ionicons name="time" size={24} color="#30a280" />,
      label: 'Hours',
      value: 'Mon-Fri: 9AM-5PM',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How can we help you?</Text>
      
      <View style={styles.contactMethods}>
        {contactMethods.map((method, index) => (
          <View key={index} style={styles.contactMethod}>
            <View style={styles.contactIcon}>{method.icon}</View>
            <View>
              <Text style={styles.contactLabel}>{method.label}</Text>
              <Text style={styles.contactValue}>{method.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Send us a message</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your issue..."
          multiline
          numberOfLines={4}
        />
      </View>

      <Button
        title="Send Message"
        loading={isSubmitting}
        onPress={handleSubmit}
        buttonStyle={styles.button}
        icon={<Feather name="send" size={20} color="white" style={styles.icon} />}
      />

      <TouchableOpacity style={styles.faqLink}>
        <Text style={styles.faqLinkText}>
          <Feather name="help-circle" size={16} /> Check our FAQ for quick answers
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  contactMethods: {
    marginBottom: 25,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIcon: {
    marginRight: 15,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#30a280',
    borderRadius: 8,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 10,
  },
  faqLink: {
    marginTop: 20,
    alignSelf: 'center',
  },
  faqLinkText: {
    color: '#30a280',
    fontSize: 16,
  },
});

export default HelpCenterScreen;