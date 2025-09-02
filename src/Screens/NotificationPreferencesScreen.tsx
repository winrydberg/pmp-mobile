import React, {useState} from 'react';
import {View, Text, StyleSheet, Switch, ScrollView, Alert} from 'react-native';
import {Button} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';

const NotificationPreferencesScreen = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    promotions: true,
    accountActivity: true,
  });

  const toggleSwitch = (key: keyof typeof notifications) => {
    setNotifications({...notifications, [key]: !notifications[key]});
  };

  const handleSave = () => {
    // Simulate saving preferences
    Alert.alert('Success', 'Notification preferences saved');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Notification Channels</Text>
      
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceText}>
          <Feather name="mail" size={20} style={styles.icon} />
          <Text style={styles.label}>Email Notifications</Text>
        </View>
        <Switch
          value={notifications.email}
          onValueChange={() => toggleSwitch('email')}
          thumbColor={notifications.email ? '#30a280' : '#f4f3f4'}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceText}>
          <Feather name="bell" size={20} style={styles.icon} />
          <Text style={styles.label}>Push Notifications</Text>
        </View>
        <Switch
          value={notifications.push}
          onValueChange={() => toggleSwitch('push')}
          thumbColor={notifications.push ? '#30a280' : '#f4f3f4'}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceText}>
          <Feather name="message-square" size={20} style={styles.icon} />
          <Text style={styles.label}>SMS Notifications</Text>
        </View>
        <Switch
          value={notifications.sms}
          onValueChange={() => toggleSwitch('sms')}
          thumbColor={notifications.sms ? '#30a280' : '#f4f3f4'}
        />
      </View>

      <Text style={styles.sectionTitle}>Notification Types</Text>
      
      <View style={styles.preferenceItem}>
        <View style={styles.preferenceText}>
          <Feather name="gift" size={20} style={styles.icon} />
          <Text style={styles.label}>Promotions & Offers</Text>
        </View>
        <Switch
          value={notifications.promotions}
          onValueChange={() => toggleSwitch('promotions')}
          thumbColor={notifications.promotions ? '#30a280' : '#f4f3f4'}
        />
      </View>

      <View style={styles.preferenceItem}>
        <View style={styles.preferenceText}>
          <Feather name="activity" size={20} style={styles.icon} />
          <Text style={styles.label}>Account Activity</Text>
        </View>
        <Switch
          value={notifications.accountActivity}
          onValueChange={() => toggleSwitch('accountActivity')}
          thumbColor={notifications.accountActivity ? '#30a280' : '#f4f3f4'}
        />
      </View>

      <Button
        title="Save Preferences"
        onPress={handleSave}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  preferenceText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  icon: {
    color: '#666',
  },
  button: {
    backgroundColor: '#30a280',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 30,
  },
});

export default NotificationPreferencesScreen;