import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, Alert, Dimensions, ActivityIndicator} from 'react-native';
import LottieView from 'lottie-react-native';
import {Button, BottomSheet, ListItem} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
import {primaryBtnColor, successColor, errorColor} from '../helpers/colors';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {LoadingModal} from '../components/LoadingModal';
import {CancelTransaction, ConfirmPayment, CheckMeterChargingStatus} from '../services/TransactionService';
import Toast from 'react-native-toast-message';
import {SecondaryBtn} from '../components/SecondaryBtn';
import {CancelBtn} from '../components/CancelBtn';
import {Divider} from '@rneui/base';

interface ProcessingPaymentScreenProps {
  route: {
    params: {
      amount: string;
      meterNumber: string;
      transactionData: object;
      message?: string;
    };
  };
  navigation: any;
}

const ProcessingPaymentScreen: React.FC<ProcessingPaymentScreenProps> = ({
  route,
  navigation,
}) => {
  const {amount, meterNumber, transactionData, message} = route.params;
  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    'Payment is being processed... Please wait',
  );
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'charging'>('pending');
  const [meterChargingStatus, setMeterChargingStatus] = useState<string>('');
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Background check for payment confirmation
  const checkPaymentStatus = async () => {
    try {
      const payload = {
        TxnID: transactionData.EqUuid,
        PhoneNumber: '',
      };

      const response = await ConfirmPayment(payload);

      if (response?.status === 'success') {
        if (response.data?.PaymentStatus === 'SUCCESSFUL' || 
            response.data?.PaymentStatus === 'success') {
          setPaymentStatus('success');
          clearInterval(checkInterval as NodeJS.Timeout);
          startMeterCharging();
        } else if (response.data?.PaymentStatus === 'ACCEPTED') {
          setStatusMessage(response.message || 'Payment is pending approval');
          setIsBottomSheetVisible(true);
        } else if (response.data?.PaymentStatus === 'EXPIRED') {
          setPaymentStatus('failed');
          clearInterval(checkInterval as NodeJS.Timeout);

          appNavigation.navigate('NewPurchase')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  // Check meter charging status
  const startMeterCharging = async () => {
    setPaymentStatus('charging');
    setStatusMessage('Meter is being charged...');
    
    try {
      const response = await CheckMeterChargingStatus({
        TxnID: transactionData.EqUuid
      });

      if (response?.status === 'success') {

        setMeterChargingStatus(response.message || 'Charging in Progress');
        
        if (response.data?.TxnStatus === 'COMPLETED') {
          Alert.alert(
            'Mater Charge Complete',
            'Your meter has been successfully recharged',
            [{
              text: 'OK',
              onPress: () => appNavigation.popToTop()
            }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking meter status:', error);
    }
  };

  useEffect(() => {
    // Start background check every 10 seconds
    const interval = setInterval(checkPaymentStatus, 10000);
    setCheckInterval(interval);

    // Show bottom sheet after 15 seconds if payment is still pending
    const timer = setTimeout(() => {
      if (paymentStatus === 'pending') {
        setIsBottomSheetVisible(true);
        setStatusMessage(message || 'Please confirm your payment status');
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handlePaymentConfirmation = async () => {
    try {
      setIsProcessing(true);
      setLoadingModalVisible(true);
      setIsBottomSheetVisible(false);

      const payload = {
        TxnID: transactionData.EqUuid,
        PhoneNumber: '',
      };

      const response = await ConfirmPayment(payload);

      if (response?.status === 'success') {
        if (response.data?.PaymentStatus === 'SUCCESSFUL' || 
            response.data?.PaymentStatus === 'success') {
          setPaymentStatus('success');
          startMeterCharging();
        } else if (response.data?.PaymentStatus === 'ACCEPTED') {
          setIsBottomSheetVisible(true)
          setStatusMessage(response.message || 'Payment is pending approval');
        } else if (response.data?.PaymentStatus === 'EXPIRED') {
          Alert.alert(
            'Payment Expired',
            response.message || 'Your payment has expired. Please try again.',
            [{
              text: 'Retry',
              onPress: () => appNavigation.popToTop(),
            }]
          );
        } else {
          Alert.alert(
            'Payment Failed',
            response.message || 'Your payment could not be processed',
            [{
              text: 'Retry',
              onPress: () => appNavigation.popToTop(),
            }]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.message || 'An error occurred while confirming the payment',
      );
      console.error('Payment confirmation error:', error);
    } finally {
      setIsProcessing(false);
      setLoadingModalVisible(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      setIsBottomSheetVisible(false);
      const res = await CancelTransaction({
        TxnID: transactionData.EqUuid,
      });

      if (res.status === 'success') {
        Alert.alert('Transaction Cancelled', res.message || 'Transaction cancelled successfully');
        appNavigation.popToTop();
      } else {
        Alert.alert('Error', res.message || 'Failed to cancel transaction');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while cancelling the transaction');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStatusContent = () => {
    switch (paymentStatus) {
      case 'charging':
        return (
          <>
            <View style={styles.chargingContainer}>
              <ActivityIndicator size="large" color={primaryBtnColor} />
              {/* <LottieView
                source={require('../assets/animations/meter-charging.json')}
                autoPlay
                loop
                style={styles.chargingAnimation}
              /> */}
              <Text style={{color:'green', fontWeight:'bold'}}>PAYMENT CONFIRMED SUCCESSFULLY</Text>
              <Text style={styles.chargingText}>{meterChargingStatus || 'Charging meter...'}</Text>
            </View>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </>
        );
      case 'success':
        return (
          <>
            <View style={[styles.statusIconContainer, {backgroundColor: successColor}]}>
              <Feather name="check" size={40} color="white" />
            </View>
            <Text style={styles.statusText}>Payment successful! Meter charging in progress...</Text>
          </>
        );
      case 'failed':
        return (
          <>
            <View style={[styles.statusIconContainer, {backgroundColor: errorColor}]}>
              <Feather name="x" size={40} color="white" />
            </View>
            <Text style={[styles.statusText, {color: errorColor}]}>
              {statusMessage || 'Payment failed. Please try again.'}
            </Text>
          </>
        );
      default:
        return (
          <>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../assets/animations/payment-processing.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LoadingModal 
        visible={loadingModalVisible} 
        message={
          paymentStatus === 'charging' ? 
          'Charging meter...' : 
          'Confirming Payment... Please wait...'
        } 
      />

      <View style={styles.content}>
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>GHS {amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Meter Number:</Text>
            <Text style={styles.detailValue}>{meterNumber}</Text>
          </View>
        </View>

        {renderStatusContent()}
      </View>

      {paymentStatus === 'pending' && (
        <BottomSheet
          isVisible={isBottomSheetVisible}
          containerStyle={styles.bottomSheetContainer}
        >
          <ListItem>
            <ListItem.Content>
              <ListItem.Title style={{fontWeight: 'bold', fontSize: 18}}>
                Payment Status
              </ListItem.Title>
              <ListItem.Subtitle style={{marginTop: 10}}>
                {statusMessage}
              </ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>

          <ListItem>
            <ListItem.Content>
              <View style={styles.buttonPaymentGroup}>
                <CancelBtn
                  title="Cancel"
                  onPress={handleCancel}
                  containerStyle={{width: '45%'}}
                  disabled={isProcessing}
                />
                <PrimaryBtn
                  title="I have Paid"
                  onPress={handlePaymentConfirmation}
                  containerStyle={{width: '45%'}}
                  icon={<Feather name="check" size={16} color={'white'} />}
                  disabled={isProcessing}
                />
              </View>
            </ListItem.Content>
          </ListItem>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  chargingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  chargingAnimation: {
    width: 150,
    height: 150,
  },
  chargingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: primaryBtnColor,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonPaymentGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  bottomSheetContainer: {
    // backgroundColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // padding: 20,
  },
});

export default ProcessingPaymentScreen;