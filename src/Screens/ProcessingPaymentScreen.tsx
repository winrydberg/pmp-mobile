// src/Screens/ProcessingPaymentScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, Alert, ScrollView, TouchableOpacity, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import {BottomSheet, ListItem} from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
import {primaryBtnColor, successColor, errorColor} from '../helpers/colors';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {LoadingModal} from '../components/LoadingModal';
import {CancelTransaction, ConfirmPayment} from '../services/TransactionService';
import Toast from 'react-native-toast-message';
import {SecondaryBtn} from '../components/SecondaryBtn';
import {CancelBtn} from '../components/CancelBtn';
import LinearGradient from 'react-native-linear-gradient';

interface ProcessingPaymentScreenProps {
  route: {
    params: {
      amount: string;
      meterNumber: string;
      transactionData: any;
    };
  };
}

const ProcessingPaymentScreen: React.FC<ProcessingPaymentScreenProps> = ({ route }) => {
  const {amount, meterNumber, transactionData} = route.params as { amount: string; meterNumber: string; transactionData: any };
  const txnId = transactionData && (transactionData.EqUuid || transactionData.id) ? (transactionData.EqUuid || transactionData.id) : null;

  console.log('ProcessingPaymentScreen - transactionData:', transactionData);
  console.log('ProcessingPaymentScreen - txnId:', txnId);

  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Payment is being processed... Please wait');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [completedTransactionData, setCompletedTransactionData] = useState<any>(null);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [lastPaymentStatus, setLastPaymentStatus] = useState<string | null>(null);
  const MAX_ATTEMPTS = 10;
  const CHECK_INTERVAL = 5000;

  const pollingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef(true);
  const attemptsRef = React.useRef<number>(0);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Start animations
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for pending state
    if (paymentStatus === 'pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [paymentStatus]);

  const updateStatusMessage = (incoming?: string) => {
    if (!incoming) { return; }
    setStatusMessage(prev => {
      if (!prev || prev.trim() === '' || prev === 'Payment is being processed... Please wait') { return incoming; }
      if (prev.includes(incoming)) { return prev; }
      return `${prev}\n${incoming}`;
    });
  };

  const pollTransactionStatus = async () => {
    if (!isMountedRef.current) { return; }

    if (attemptsRef.current >= MAX_ATTEMPTS) {
      setMaxAttemptsReached(true);
      updateStatusMessage('Maximum retry attempts reached. Please check your status manually or contact support.');
      setIsBottomSheetVisible(true);
      return;
    }

    try {
      attemptsRef.current += 1;

      const response = await ConfirmPayment({
        TxnID: txnId,
        PhoneNumber: '',
      });

      if (!isMountedRef.current) { return; }

      if (response?.message) { updateStatusMessage(response.message); }

      if (response?.status === 'success' && response.data) {
        const {PaymentStatus, TxnStatus} = response.data;
        setLastPaymentStatus(PaymentStatus);

        if (TxnStatus === 'FAILED') {
          setPaymentStatus('failed');
          setStatusMessage(response.message || response.data?.PaymentMessage || 'Payment confirmation failed');
          Toast.show({ type: 'error', text1: 'Payment Failed', text2: response.message || response.data?.PaymentMessage || 'Payment confirmation failed', position: 'top' });
          return;
        }

        if (PaymentStatus === 'EXPIRED') {
          setPaymentStatus('failed');
          setStatusMessage(response.message || 'Payment has expired');
          Toast.show({ type: 'error', text1: 'Payment Expired', text2: response.message || 'Your payment has expired', position: 'top' });
          return;
        }

        if (PaymentStatus === 'SUCCESSFUL' || PaymentStatus === 'success') {
          updateStatusMessage(response.data?.PaymentMessage || 'Payment successful');

          if (TxnStatus === 'COMPLETED' || TxnStatus === 'SUCCESSFUL') {
            setPaymentStatus('success');
            setStatusMessage('Meter charged successfully!');
            setCompletedTransactionData(response.data);
            Toast.show({ type: 'success', text1: 'Success!', text2: 'Meter charged successfully', position: 'top' });

            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            return;
          }

          if (attemptsRef.current < MAX_ATTEMPTS && isMountedRef.current) {
            pollingTimeoutRef.current = setTimeout(() => pollTransactionStatus(), CHECK_INTERVAL);
          } else {
            setMaxAttemptsReached(true);
            updateStatusMessage('Maximum retry attempts reached. Please check your meter status manually.');
            setIsBottomSheetVisible(true);
          }
          return;
        }

        if (attemptsRef.current < MAX_ATTEMPTS && isMountedRef.current) {
          pollingTimeoutRef.current = setTimeout(() => pollTransactionStatus(), CHECK_INTERVAL);
        } else {
          setMaxAttemptsReached(true);
          updateStatusMessage('Maximum retry attempts reached. Please check your status manually.');
          setIsBottomSheetVisible(true);
        }
      } else {
        if (attemptsRef.current < MAX_ATTEMPTS && isMountedRef.current) {
          pollingTimeoutRef.current = setTimeout(() => pollTransactionStatus(), CHECK_INTERVAL);
        } else {
          setMaxAttemptsReached(true);
          updateStatusMessage('Maximum retry attempts reached. Please check your status manually.');
          setIsBottomSheetVisible(true);
        }
      }
    } catch (error: any) {
      if (!isMountedRef.current) { return; }

      const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while checking status';
      updateStatusMessage(errorMessage);

      if (attemptsRef.current < MAX_ATTEMPTS && isMountedRef.current) {
        pollingTimeoutRef.current = setTimeout(() => pollTransactionStatus(), CHECK_INTERVAL);
      } else {
        setMaxAttemptsReached(true);
        updateStatusMessage('Maximum retry attempts reached. Please check your status manually.');
        setIsBottomSheetVisible(true);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    attemptsRef.current = 0;
    setMaxAttemptsReached(false);
    pollTransactionStatus();

    const timer = setTimeout(() => {
      if (paymentStatus === 'pending' && attemptsRef.current < MAX_ATTEMPTS && !maxAttemptsReached) {
        setIsBottomSheetVisible(true);
      }
    }, 15000);

    return () => {
      isMountedRef.current = false;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      clearTimeout(timer);
    };
  }, []);

  const handlePaymentConfirmation = async () => {
    try {
      setIsProcessing(true);
      setLoadingModalVisible(true);
      setIsBottomSheetVisible(false);

      const payload = { TxnID: txnId, PhoneNumber: '' };
      const response = await ConfirmPayment(payload);

      if (response?.message) { updateStatusMessage(response.message); }

      if (response?.status === 'success' && response.data) {
        const {PaymentStatus, TxnStatus} = response.data;
        setLastPaymentStatus(PaymentStatus);

        if (TxnStatus === 'FAILED') {
          setPaymentStatus('failed');
          Alert.alert('Payment Failed', response.message || response.data?.PaymentMessage || 'Payment confirmation failed. Please try again.', [{ text: 'Retry', onPress: () => appNavigation.popToTop() }]);
          return;
        }

        if (PaymentStatus === 'SUCCESSFUL' || PaymentStatus === 'success') {
          setStatusMessage('Payment confirmed! Charging meter...');
          if (TxnStatus === 'COMPLETED' || TxnStatus === 'SUCCESSFUL') {
            setPaymentStatus('success');
            setStatusMessage('Meter charged successfully!');
            setCompletedTransactionData(response.data);
          } else {
            attemptsRef.current = 0;
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
              pollingTimeoutRef.current = null;
            }
            pollTransactionStatus();
          }
        } else if (PaymentStatus === 'ACCEPTED') {
          setIsBottomSheetVisible(true);
          setStatusMessage(response.message || 'Payment is pending approval');
        } else if (PaymentStatus === 'EXPIRED') {
          Alert.alert('Payment Expired', response.message || 'Your payment has expired. Please try again.', [{ text: 'Retry', onPress: () => appNavigation.popToTop() }]);
        } else {
          Alert.alert('Payment Failed', response.message || 'Your payment could not be processed', [{ text: 'Retry', onPress: () => appNavigation.popToTop() }]);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.message || 'An error occurred while confirming the payment');
    } finally {
      setIsProcessing(false);
      setLoadingModalVisible(false);
    }
  };

  const handleManualStatusCheck = async () => {
    try {
      setIsProcessing(true);
      setLoadingModalVisible(true);
      setIsBottomSheetVisible(false);
      setMaxAttemptsReached(false);

      const payload = { TxnID: txnId, PhoneNumber: '' };
      const response = await ConfirmPayment(payload);

      if (response?.message) { updateStatusMessage(response.message); }

      if (response?.status === 'success' && response.data) {
        const {PaymentStatus, TxnStatus} = response.data;
        setLastPaymentStatus(PaymentStatus);

        if (TxnStatus === 'FAILED') {
          setPaymentStatus('failed');
          Alert.alert('Payment Failed', response.message || response.data?.PaymentMessage || 'Transaction failed');
          return;
        }

        if ((PaymentStatus === 'SUCCESSFUL' || PaymentStatus === 'success') && (TxnStatus === 'COMPLETED' || TxnStatus === 'SUCCESSFUL')) {
          setPaymentStatus('success');
          setStatusMessage('Meter charged successfully!');
          setCompletedTransactionData(response.data);
        } else if (PaymentStatus === 'SUCCESSFUL' || PaymentStatus === 'success') {
          setStatusMessage('Payment confirmed! Charging meter...');
          attemptsRef.current = 0;
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }
          pollTransactionStatus();
        } else {
          setStatusMessage(response.message || 'Transaction is still being processed');
          setIsBottomSheetVisible(true);
        }
      } else {
        Alert.alert('Status Check', response?.message || 'Could not retrieve transaction status');
        setIsBottomSheetVisible(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.message || 'An error occurred while checking status');
      setIsBottomSheetVisible(true);
    } finally {
      setIsProcessing(false);
      setLoadingModalVisible(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsProcessing(true);
      setIsBottomSheetVisible(false);
      const res = await CancelTransaction({ TxnID: txnId });

      if (res.status === 'success') {
        Alert.alert('Transaction Cancelled', res.message || 'Transaction cancelled successfully');
        appNavigation.popToTop();
      } else {
        Alert.alert('Error', res.message || 'Failed to cancel transaction');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while cancelling the transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewReceipt = () => {
    const payload = completedTransactionData || transactionData;
    if (!payload) {
      Toast.show({ type: 'error', text1: 'No receipt', text2: 'No transaction data available to build receipt.' });
      return;
    }
    appNavigation.navigate('PowerAppReceipt', { transaction: payload });
  };

  // Pop to root first, then navigate to NewPurchase
  const handleNewPurchase = () => {
    appNavigation.popToTop();
    // small delay to ensure popToTop completes before navigating
    setTimeout(() => {
      appNavigation.navigate('NewPurchase');
    }, 100);
  };

  // Pop to root without navigating
  const handleGoBack = () => {
    appNavigation.popToTop();
  };

  const renderStatusContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <Animated.View
            style={[
              styles.statusContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.successCard}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={['#34B87C', '#2DA771']}
                  style={styles.successIconGradient}
                >
                  <Feather name="check-circle" size={64} color="white" />
                </LinearGradient>
              </View>

              <Text style={styles.successTitle}>Transaction Successful!</Text>
              <Text style={styles.successSubtitle}>Your meter has been charged successfully</Text>

              <View style={styles.successButtonsContainer}>
                <TouchableOpacity
                  style={styles.receiptButton}
                  onPress={handleViewReceipt}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4A90C4', '#34B87C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.receiptButtonGradient}
                  >
                    <Feather name="file-text" size={20} color="white" />
                    <Text style={styles.receiptButtonText}>View Receipt</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={styles.newPurchaseButton}
                    onPress={handleNewPurchase}
                    activeOpacity={0.7}
                  >
                    <Feather name="plus-circle" size={20} color="#4A90C4" />
                    <Text style={styles.newPurchaseButtonText}>New Purchase</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                    activeOpacity={0.7}
                  >
                    <Feather name="arrow-left" size={20} color="#4A90C4" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        );

      case 'failed':
        return (
          <Animated.View
            style={[
              styles.statusContainer,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.failedCard}>
              <View style={styles.failedIconContainer}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.failedIconGradient}
                >
                  <Feather name="x-circle" size={64} color="white" />
                </LinearGradient>
              </View>

              <Text style={styles.failedTitle}>Payment Failed</Text>
              <Text style={styles.failedSubtitle}>{statusMessage || 'Payment could not be processed'}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => appNavigation.popToTop()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4A90C4', '#34B87C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.retryButtonGradient}
                >
                  <Feather name="refresh-cw" size={20} color="white" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      default:
        return (
          <Animated.View
            style={[
              styles.statusContainer,
              { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.processingCard}>
              <View style={styles.animationContainer}>
                <LottieView
                  source={require('../assets/animations/payment-processing.json')}
                  autoPlay
                  loop
                  style={styles.animation}
                />
              </View>

              <View style={styles.processingTextContainer}>
                <Text style={styles.processingTitle}>Processing Payment</Text>
                <Text style={styles.processingSubtitle}>{statusMessage}</Text>
              </View>

              <View style={styles.progressIndicator}>
                <View style={styles.progressDot} />
                <View style={[styles.progressDot, styles.progressDotDelay1]} />
                <View style={[styles.progressDot, styles.progressDotDelay2]} />
              </View>
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LoadingModal
        visible={loadingModalVisible}
        message={
          paymentStatus === 'pending' ?
            'Confirming Payment... Please wait...' :
            'Charging meter...'
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.detailsCard,
            { opacity: fadeAnim, transform: [{ translateY: scaleAnim.interpolate({ inputRange: [0.9, 1], outputRange: [20, 0] }) }] }
          ]}
        >
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailsGradient}
          >
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="dollar-sign" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailLabel}>Amount</Text>
              </View>
              <Text style={styles.detailValue}>GHS {amount}</Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="zap" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailLabel}>Meter Number</Text>
              </View>
              <Text style={styles.detailValue}>{meterNumber}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {renderStatusContent()}
      </ScrollView>

      {((paymentStatus === 'pending') || maxAttemptsReached) && (
        <BottomSheet
          isVisible={isBottomSheetVisible}
          containerStyle={styles.bottomSheetContainer}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Feather
                name={maxAttemptsReached ? "alert-circle" : "clock"}
                size={24}
                color="#4A90C4"
              />
              <Text style={styles.sheetTitle}>
                {maxAttemptsReached ? 'Status Check Required' : 'Payment Status'}
              </Text>
            </View>

            <View style={styles.sheetMessageContainer}>
              <Text style={styles.sheetMessage}>{statusMessage}</Text>
            </View>

            <View style={styles.sheetActions}>
              {maxAttemptsReached ? (
                lastPaymentStatus === 'SUCCESSFUL' || lastPaymentStatus === 'success' ? (
                  <TouchableOpacity
                    style={styles.fullWidthButton}
                    onPress={handleManualStatusCheck}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#4A90C4', '#34B87C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sheetButtonGradient}
                    >
                      <Feather name="refresh-cw" size={18} color="white" />
                      <Text style={styles.sheetButtonText}>Check Status</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.doubleButtonRow}>
                    <TouchableOpacity
                      style={styles.halfWidthButton}
                      onPress={handleCancel}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cancelButtonContent}>
                        <Feather name="x" size={18} color="#EF4444" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.halfWidthButton}
                      onPress={handleManualStatusCheck}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#4A90C4', '#34B87C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sheetButtonGradient}
                      >
                        <Feather name="refresh-cw" size={18} color="white" />
                        <Text style={styles.sheetButtonText}>Check Status</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                lastPaymentStatus === 'SUCCESSFUL' || lastPaymentStatus === 'success' ? (
                  <TouchableOpacity
                    style={styles.fullWidthButton}
                    onPress={handleManualStatusCheck}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#4A90C4', '#34B87C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.sheetButtonGradient}
                    >
                      <Feather name="refresh-cw" size={18} color="white" />
                      <Text style={styles.sheetButtonText}>Check Status</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.doubleButtonRow}>
                    <TouchableOpacity
                      style={styles.halfWidthButton}
                      onPress={handleCancel}
                      disabled={isProcessing}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cancelButtonContent}>
                        <Feather name="x" size={18} color="#EF4444" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.halfWidthButton}
                      onPress={handlePaymentConfirmation}
                      disabled={isProcessing}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#4A90C4', '#34B87C']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sheetButtonGradient}
                      >
                        <Feather name="check" size={18} color="white" />
                        <Text style={styles.sheetButtonText}>I have Paid</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          </View>
        </BottomSheet>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 10,
    paddingTop: 40,
  },
  detailsCard: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  detailsGradient: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  processingTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90C4',
  },
  progressDotDelay1: {
    opacity: 0.6,
  },
  progressDotDelay2: {
    opacity: 0.3,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  successButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  receiptButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  receiptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  receiptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // row containing New Purchase and Back
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  newPurchaseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#4A90C4',
    gap: 8,
  },
  newPurchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90C4',
  },
  backButton: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90C4',
  },
  newPurchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90C4',
  },
  failedCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  failedIconContainer: {
    marginBottom: 24,
  },
  failedIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  failedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    elevation: 4,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  sheetMessageContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sheetMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sheetActions: {
    gap: 12,
  },
  fullWidthButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  sheetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  doubleButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidthButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FEE2E2',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
});

export default ProcessingPaymentScreen;
