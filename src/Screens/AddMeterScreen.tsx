import React, {useState, useRef} from 'react';
import {SafeAreaView, StyleSheet, View, Alert} from 'react-native';
import {Input, Text, Button, Icon, BottomSheet} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {SecondaryBtn} from '../components/SecondaryBtn';
import axios from 'axios'; // or your preferred HTTP client
import {MeterFormData} from '../types/wallet';
import Toast from 'react-native-toast-message';
import {AddMeter} from '../services/MeterService';

// Define types for the navigation stack
type RootStackParamList = {
  AddMeter: undefined;
  // Add other screens here as needed
};

type AddMeterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddMeter'
>;

// Define the select option type
interface SelectOption {
  label: string;
  value: 'prepaid' | 'postpaid';
}

const AddMeterScreen: React.FC<{navigation: AddMeterScreenNavigationProp}> = ({
  navigation,
}) => {
  const [formData, setFormData] = useState<MeterFormData>({
    // PhoneNumber: '233244851097',
    MeterNumber: 'P15305491',
    MeterCategory: 'prepaid',
    // Alias: '',
    // AccountNumber: '',
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<MeterFormData>>({});

  const meterCategories: SelectOption[] = [
    {label: 'Prepaid', value: 'prepaid'},
    {label: 'Postpaid', value: 'postpaid'},
  ];

  const handleChange = <T extends keyof MeterFormData>(
    name: T,
    value: MeterFormData[T],
  ) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MeterFormData> = {};

    if (!formData.MeterNumber.trim()) {
      newErrors.MeterNumber = 'Meter number is required';
    }

    // if (!formData.PhoneNumber.trim()) {
    //   newErrors.PhoneNumber = 'Phone number is required';
    // } else if (!/^\d+$/.test(formData.PhoneNumber)) {
    //   newErrors.PhoneNumber = 'Invalid phone number format';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        // PhoneNumber: formData.PhoneNumber,
        MeterNumber: formData.MeterNumber,
        MeterCategory: formData.MeterCategory,
        // Alias: formData.Alias || undefined, // Send undefined if empty
        // AccountNumber: formData.AccountNumber || undefined,
      };

      const response = await AddMeter(payload);

      if (response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Payment Method',
          text2: 'Payment method has been saved succesfully',
          position: 'bottom',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: 'Unable to add payment method',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={{flex: 1, backgroundColor: 'white'}}>
      {/* Content */}
      <View style={{flex: 1, padding: 10, marginTop: 20}}>


        <Input
          label="Meter Number"
          placeholder="Enter meter number"
          value={formData.MeterNumber}
          onChangeText={value => handleChange('MeterNumber', value)}
          inputContainerStyle={[styles.inputContainer]}
          inputStyle={styles.inputText}
          containerStyle={styles.inputWrapper}
          errorStyle={styles.errorText}
          errorMessage={errors.MeterNumber}
        />

        <Input
          onPress={() => setIsVisible(true)}
          label="Meter Category"
          value={
            meterCategories.find(c => c.value === formData.MeterCategory)
              ?.label || ''
          }
          placeholder="Select meter category"
          rightIcon={<Icon name="arrow-drop-down" />}
          onFocus={() => setIsVisible(true)}
          inputContainerStyle={[styles.inputContainer]}
          inputStyle={styles.inputText}
          containerStyle={styles.inputWrapper}
          errorStyle={styles.errorText}
        />

        <SecondaryBtn
          title={isLoading ? 'Adding...' : 'Add Meter'}
          onPress={handleSubmit}
          icon={<Feather name="plus-circle" color="white" />}
          disabled={isLoading}
          loading={isLoading}
        />
      </View>

      {/* Bottom Sheet for Meter Category Selection */}
      <BottomSheet isVisible={isVisible} modalProps={{}}>
        <View style={{backgroundColor: 'white'}}>
          {meterCategories.map((category, index) => (
            <Button
              key={category.value}
              title={category.label}
              type="clear"
              titleStyle={{color: 'black'}}
              containerStyle={{width: '100%'}}
              onPress={() => {
                handleChange('MeterCategory', category.value);
                setIsVisible(false);
              }}
            />
          ))}
          <Button
            title="Cancel"
            type="clear"
            titleStyle={{color: 'red'}}
            containerStyle={{width: '100%'}}
            onPress={() => setIsVisible(false)}
          />
        </View>
      </BottomSheet>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    paddingHorizontal: 0,
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputText: {
    padding: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AddMeterScreen;
