import React, {useState} from 'react';
import {
  View,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Input, Button, Card, Image, Text, Icon, Switch} from '@rneui/themed';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import {Picker} from '@react-native-picker/picker';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {SecondaryBtn} from '../components/SecondaryBtn';
import {iconColor} from '../helpers/colors';
import {AddWallet} from '../services/WalletService';
import {AddWalletPayload} from '../Types/MainTypes';
import Toast from 'react-native-toast-message';
import { AppStackParamList } from '../types/navigation';

type PaymentNetwork = 'MTN' | 'Telecel' | 'AirtelTigo';

interface PaymentMethod {
  network: PaymentNetwork;
  logo: any;
  color: string;
}

interface Props {
  navigation: StackNavigationProp<any>;
}

const paymentMethods: PaymentMethod[] = [
  {
    network: 'Telecel',
    logo: require('../assets/logos/vodafone_logo.jpg'),
    color: '#e51d2a', // Red
  },
  {
    network: 'MTN',
    logo: require('../assets/logos/mtn_logo.png'),
    color: '#fcc200', // Yellow
  },
  {
    network: 'AirtelTigo',
    logo: require('../assets/logos/airteltigo_logo.jpg'),
    color: '#ed1c24', // Red/Blue
  },
];

type AddWalletProps = StackScreenProps<AppStackParamList, 'AddWallet'>;

const AddPaymentMethod: React.FC<AddWalletProps> = ({route, navigation}) => {
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    paymentMethods[0],
  );
  const [defaultPayment, setDefaultPayment] = useState(false);

  const [errors, setErrors] = React.useState({
    name: '',
    number: '',
  });

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      setErrors({...errors, name: 'Name Required'});
      return;
    }

    if (!number.trim() || !/^\d{10}$/.test(number)) {
      setErrors({...errors, number: 'Please enter valid phone'});
      return;
    }

    // Prepare the payment method data
    const paymentMethodData: AddWalletPayload = {
      Name: name.trim(),
      AccNumber: number.trim(),
      Type: 'momo', // Fixed as mobile money
      Network: selectedMethod.network.toUpperCase(), // Convert to uppercase to match your API format
    };

    try {
      // Here you would typically call your API
      const response = await AddWallet(paymentMethodData);

      // For now, we'll simulate a successful response
      console.log('Submitting payment method:', paymentMethodData);

      // Reset form after successful submission
      setName('');
      setNumber('');
      setSelectedMethod(paymentMethods[0]);
      setDefaultPayment(false);

      Toast.show({
        type: 'success',
        text1: 'Payment Method',
        text2: 'Payment method has been saved succesfully',
        position: 'bottom',
      });

      route.params?.callback?.();

      navigation.goBack();
    } catch (error) {
      console.error('Error adding payment method:', error);

      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'Unable to add payment method',
        position: 'bottom',
      });
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.container}>
              {/* Payment Card Preview */}
              <Card
                containerStyle={[
                  styles.cardContainer,
                  {backgroundColor: selectedMethod.color},
                ]}>
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.cardNetwork}>
                      {selectedMethod.network}
                    </Text>
                    <Text style={styles.cardNumber}>
                      {number || 'Enter Number'}
                    </Text>
                  </View>
                  <Image
                    source={selectedMethod.logo}
                    style={styles.cardLogo}
                    resizeMode="contain"
                  />
                </View>
              </Card>

              {/* Provider Selection */}
              <Text style={styles.sectionTitle}>Select Provider</Text>
              <View style={styles.dropdownContainer}>
                <Picker
                  selectedValue={selectedMethod.network}
                  onValueChange={itemValue => {
                    const method = paymentMethods.find(
                      m => m.network === itemValue,
                    );
                    if (method) setSelectedMethod(method);
                  }}
                  style={styles.picker}
                  dropdownIconColor="#333">
                  {paymentMethods.map(method => (
                    <Picker.Item
                      key={method.network}
                      label={method.network}
                      value={method.network}
                    />
                  ))}
                </Picker>
                <View
                  style={[
                    styles.dropdownLogoContainer,
                    {backgroundColor: selectedMethod.color + '20'},
                  ]}>
                  <Image
                    source={selectedMethod.logo}
                    style={styles.dropdownLogo}
                  />
                </View>
              </View>

              {/* Input Fields */}
              <Input
                placeholder="Enter Name"
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) {
                    setErrors({...errors, name: ''});
                  }
                }}
                leftIcon={<Feather name="user" color={iconColor} size={20} />}
                inputContainerStyle={[
                  styles.inputContainer,
                  errors.name && styles.errorInput,
                ]}
                inputStyle={styles.inputText}
                containerStyle={styles.inputWrapper}
                errorMessage={errors.name}
                errorStyle={styles.errorText}
              />

              {/* Input Fields */}
              <Input
                placeholder="Phone Number"
                value={number}
                keyboardType="phone-pad"
                onChangeText={text => {
                  setNumber(text);
                  if (errors.number) {
                    setErrors({...errors, number: ''});
                  }
                }}
                leftIcon={<Feather name="phone" color={iconColor} size={20} />}
                inputContainerStyle={[
                  styles.inputContainer,
                  errors.number && styles.errorInput,
                ]}
                inputStyle={styles.inputText}
                containerStyle={styles.inputWrapper}
                errorMessage={errors.number}
                errorStyle={styles.errorText}
              />

              {/* Default Payment Toggle */}
              {/* <View style={styles.defaultContainer}>
                <Text style={styles.defaultText}>
                  Set as Default Payment Method
                </Text>
                <Switch
                  value={defaultPayment}
                  onValueChange={setDefaultPayment}
                  color={selectedMethod.color}
                />
              </View> */}

              {/* Save Button */}
              <SecondaryBtn
                title=" Payment Method"
                icon={<Ionicons name="add-circle" color={'white'} />}
                onPress={handleSave}
              />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    borderRadius: 5,
    padding: 20,
    margin: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    // shadowRadius: 4,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNetwork: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    opacity: 0.9,
  },
  cardLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  providerContainer: {
    marginBottom: 20,
  },
  providerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    position: 'relative',
  },
  selectedProvider: {
    borderWidth: 2,
    borderColor: 'white',
  },
  providerLogo: {
    width: 30,
    height: 30,
    marginRight: 12,
    borderRadius: 6,
  },
  providerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
  },

  defaultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 5,
  },
  defaultText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  dropdownLogoContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 6,
  },
  dropdownLogo: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  inputContainer: {
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
  inputWrapper: {
    paddingHorizontal: 0,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AddPaymentMethod;
