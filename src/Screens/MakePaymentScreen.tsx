import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Button, Text, Input, Icon, BottomSheet, ListItem} from '@rneui/themed';
import {Wallet, WalletsResponse} from '../types/wallet';
import {GetWallets} from '../services/WalletService';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {Image} from '@rneui/base';
import {networkLogos} from '../helpers/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {AppStackParamList} from '../types/navigation';
import {primaryBtnColor} from '../helpers/colors';
import {MakePayment} from '../services/TransactionService';

interface MakePaymentScreenProps {
  route: {
    params: {
      meterNumber: string;
      customerName: string;
    };
  };
  navigation: any;
}

const MakePaymentScreen: React.FC<MakePaymentScreenProps> = ({
  route,
  navigation,
}) => {
  const {meterNumber, customerName} = route.params;
  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [paymentMethods, setPaymentMethods] = useState<Wallet[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
  const [isVisible, setIsVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  // const handlePayment = () => {
  //   Alert.alert(
  //     "Processing Payment",
  //     "Your payment is being processed...",
  //     [],
  //     { cancelable: false }
  //   );

  //   setTimeout(() => {
  //     Alert.alert(
  //       "Payment",
  //       `Payment of GHS ${amount} for meter ${meterNumber} was completed successfully via ${selectedMethod.AccNumber}`,
  //       [
  //         {
  //           text: "OK",
  //           onPress: () => {
  //             appNavigation.pop(2);
  //           }
  //         }
  //       ],
  //       { cancelable: false }
  //     );
  //   }, 3000);
  // };

  const toggleBottomSheet = () => {
    setIsVisible(!isVisible);
  };

  const selectPaymentMethod = (method: (typeof paymentMethods)[0]) => {
    setSelectedMethod(method);
    toggleBottomSheet();
  };

  const fetchWallets = async () => {
    try {
      const response: WalletsResponse = await GetWallets();

      if (response.status === 'success') {
        const defaultPaymentMethod = response.data.find(
          mt => mt.IsDefault == true,
        );
        if (defaultPaymentMethod != undefined) {
          setSelectedMethod(defaultPaymentMethod);
        } else {
          if (response.data.length > 0) {
            setSelectedMethod(response.data[0]);
          }
        }

        setPaymentMethods(response.data);
      }
    } catch (err) {}
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!amount || !validateAmount(amount)) {
      Alert.alert('Error', 'Please enter a valid amount (minimum GHS 1.00)');
      return;
    }

    setIsProcessing(true);

    const paymentPayload = {
      Amount: parseFloat(amount),
      MeterNumber: meterNumber,
      paymentMode: selectedMethod.Network, // or 'momo' if all are mobile money
      PhoneNumber: selectedMethod.AccNumber,
      MeterCategory: 'prepaid', // or get from meter info
      WalletId: selectedMethod.EqUuid,
    };

    const paymentResponse = await MakePayment(paymentPayload);

    setIsProcessing(false);

    // Alert.alert('Payment Response', JSON.stringify(paymentPayload));

    if (paymentResponse.status === 'success') {
      appNavigation.navigate('ProcessingPayment', {
        amount,
        meterNumber,
        transactionData: paymentResponse.data,
        message: paymentResponse.message,
      });
    } else {
      Alert.alert(
        'Payment Failed',
        paymentResponse.message || 'Payment could not be processed',
      );
    }
  };

  const validateAmount = (input: string): boolean => {
    // Check if input is a valid number
    if (!input || isNaN(parseFloat(input))) {
      return false;
    }

    // Check if amount is at least 1.00
    const amountValue = parseFloat(input);
    return amountValue >= 1.0;
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.header}>
        Make Payment
      </Text>

      <View style={styles.meterInfoContainer}>
        <Text style={styles.meterNumber}>{meterNumber}</Text>
        <Text style={styles.customerName}>{customerName}</Text>
      </View>

      <View style={styles.creditContainer}>
        <Text style={styles.creditLabel}>Available Credit</Text>
        <Text style={styles.creditAmount}>0.00</Text>
      </View>

      <View style={styles.minChargeContainer}>
        <Text style={styles.minChargeLabel}>Min. Charge Amount</Text>
        <Text style={styles.minChargeAmount}>1.00</Text>
      </View>

      <Text style={styles.label}>Enter Amount</Text>
      <Input
        placeholder="0.00"
        value={amount}
        onChangeText={text => {
          // Allow only numbers and one decimal point
          const validatedText = text.replace(/[^0-9.]/g, '');

          // Ensure only one decimal point
          const decimalCount = (validatedText.match(/\./g) || []).length;
          if (decimalCount <= 1) {
            setAmount(validatedText);
          }
        }}
        keyboardType="numeric"
        leftIcon={<Text style={{fontWeight: 'bold', fontSize: 20}}>GHS</Text>}
        inputContainerStyle={[
          styles.inputContainer,
          amount && !validateAmount(amount) && styles.invalidInput,
        ]}
        inputStyle={styles.inputText}
        containerStyle={styles.inputWrapper}
        errorMessage={
          amount && !validateAmount(amount)
            ? 'Amount must be at least GHS 1.00'
            : undefined
        }
        errorStyle={styles.errorText}
      />

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.paymentMethodContainer}
        onPress={toggleBottomSheet}>
        <Text style={styles.paymentMethodLabel}>
          Tap to change payment method
        </Text>
        <View style={styles.paymentMethodRow}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View>
              {selectedMethod?.Image != null ? (
                <Image
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                  source={{uri: selectedMethod?.Image}}
                />
              ) : (
                <Image
                  source={networkLogos[selectedMethod?.Network]}
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                  PlaceholderContent={<ActivityIndicator />}
                />
              )}
            </View>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.methodName}>{selectedMethod?.Name}</Text>
              <Text style={styles.paymentMethodValue}>
                {selectedMethod?.AccNumber === 'Add new'
                  ? selectedMethod?.AccNumber
                  : selectedMethod?.AccNumber}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" type="material-community" />
        </View>
      </TouchableOpacity>

      {/* <PrimaryBtn
        title={' Pay Now'}
        containerStyle={styles.payButtonContainer}
        icon={<Feather name="credit-card" size={16} color={'white'} />}
        onPress={handlePayment}
      /> */}

      <PrimaryBtn
        title={isProcessing ? 'Processing...' : 'Pay Now'}
        containerStyle={styles.payButtonContainer}
        icon={<Feather name="credit-card" size={16} color={'white'} />}
        onPress={handlePayment}
        disabled={isProcessing || !selectedMethod}
        loading={isProcessing}
      />

      {/* Payment Methods Bottom Sheet */}
      <BottomSheet
        isVisible={isVisible}
        containerStyle={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>
          <Text h4 style={styles.bottomSheetHeader}>
            Select Payment Method
          </Text>

          {paymentMethods.map(method => (
            <ListItem
              key={method?.id}
              containerStyle={styles.listItem}
              onPress={() => selectPaymentMethod(method)}>
              <ListItem.Content>
                <View
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <View>
                    {method?.Image != null ? (
                      <Image
                        style={{
                          height: 50,
                          width: 50,
                          borderRadius: 5,
                          marginRight: 10,
                        }}
                        source={{uri: method?.Image}}
                      />
                    ) : (
                      <Image
                        source={networkLogos[method.Network]}
                        style={{
                          height: 50,
                          width: 50,
                          borderRadius: 5,
                          marginRight: 10,
                        }}
                        PlaceholderContent={<ActivityIndicator />}
                      />
                    )}
                  </View>
                  <View>
                    <ListItem.Title style={styles.methodName}>
                      {method?.Name}
                    </ListItem.Title>
                    {method?.AccNumber !== 'Add new' && (
                      <ListItem.Subtitle style={styles.methodNumber}>
                        {method?.AccNumber}
                      </ListItem.Subtitle>
                    )}
                  </View>
                </View>
              </ListItem.Content>
              {selectedMethod?.id === method?.id && (
                <Icon
                  name="check"
                  type="material-community"
                  color={primaryBtnColor}
                />
              )}
            </ListItem>
          ))}

          <Button
            title="Cancel"
            type="clear"
            titleStyle={styles.cancelButtonText}
            containerStyle={styles.cancelButtonContainer}
            onPress={toggleBottomSheet}
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
    color: '#004d00',
    fontWeight: 'bold',
  },
  meterInfoContainer: {
    marginBottom: 20,
  },
  meterNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 16,
    color: '#555',
  },
  creditContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  creditLabel: {
    fontSize: 16,
    color: '#555',
  },
  creditAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  minChargeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  minChargeLabel: {
    fontSize: 16,
    color: '#555',
  },
  minChargeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
  },
  inputWrapper: {
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  inputContainer: {
    // borderBottomWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputText: {
    padding: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  paymentMethodContainer: {
    marginBottom: 30,
  },
  paymentMethodLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodValue: {
    fontSize: 16,
    color: '#333',
  },
  methodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  payButtonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeader: {
    marginBottom: 20,
    color: '#004d00',
    textAlign: 'center',
  },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  methodNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  cancelButtonContainer: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
  },
  invalidInput: {
  borderColor: 'red',
  borderWidth: 1,
},
errorText: {
  color: 'red',
  marginTop: 5,
  marginLeft: 0,
},
});

export default MakePaymentScreen;
