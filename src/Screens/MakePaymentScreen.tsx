// src/Screens/MakePaymentScreen.tsx
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Button, Text, Input, Icon, BottomSheet, ListItem} from '@rneui/themed';
import {Wallet, WalletsResponse} from '../types/wallet';
import {GetWallets, requestWalletOTP, verifyWalletOTP} from '../services/WalletService';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {Divider, Image} from '@rneui/base';
import {networkLogos} from '../helpers/constants';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {AppStackParamList} from '../types/navigation';
import {primaryBtnColor} from '../helpers/colors';
import {MakePayment} from '../services/TransactionService';
import Toast from 'react-native-toast-message';
import {TransactionItem} from '../types/Transaction';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const paymentNetworks = [
  { label: 'MTN', value: 'MTN' },
  { label: 'Telecel', value: 'TELECEL' },
  { label: 'AirtelTigo', value: 'AIRTELTIGO' },
];

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
  const [showAddWalletSheet, setShowAddWalletSheet] = useState(false);
  const [addWalletName, setAddWalletName] = useState('');
  const [addWalletNumber, setAddWalletNumber] = useState('');
  const [addWalletNetwork, setAddWalletNetwork] = useState(paymentNetworks[0].value);
  const [addWalletLoading, setAddWalletLoading] = useState(false);
  const [addWalletErrors, setAddWalletErrors] = useState({ name: '', number: '', otp: '' });

  // OTP states
  const [walletOtpStep, setWalletOtpStep] = useState<'details' | 'otp'>('details');
  const [walletOtp, setWalletOtp] = useState('');
  const [walletOtpTimer, setWalletOtpTimer] = useState(600); // 10 minutes in seconds
  const [canResendWalletOtp, setCanResendWalletOtp] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fetchWallets();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (walletOtpStep === 'otp' && walletOtpTimer > 0) {
      interval = setInterval(() => {
        setWalletOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendWalletOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [walletOtpStep, walletOtpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      paymentMode: selectedMethod.Network,
      PhoneNumber: selectedMethod.AccNumber,
      MeterCategory: 'prepaid',
      WalletId: selectedMethod.EqUuid,
    };

    const paymentResponse = await MakePayment(paymentPayload);

    setIsProcessing(false);

    if (paymentResponse.status === 'success') {
      const transactionData: TransactionItem = paymentResponse.data as TransactionItem;

      appNavigation.navigate('ProcessingPayment', {
        amount,
        meterNumber,
        transactionData: transactionData,
        message: paymentResponse.message,
      });
    } else {
      Alert.alert(
        'Payment Failed',
        paymentResponse.message || 'Payment could not be processed',
      );
    }
  };

  const validateAddWalletDetails = () => {
    let hasError = false;
    let errors = { name: '', number: '', otp: '' };

    if (!addWalletName.trim()) {
      errors.name = 'Name is required';
      hasError = true;
    }

    if (!addWalletNumber.trim()) {
      errors.number = 'Phone number is required';
      hasError = true;
    } else if (!/^\d{10}$/.test(addWalletNumber)) {
      errors.number = 'Please enter a valid 10-digit phone number';
      hasError = true;
    }

    setAddWalletErrors(errors);
    return !hasError;
  };

  const validateWalletOtp = () => {
    let errors = { name: '', number: '', otp: '' };
    let valid = true;

    if (!walletOtp.trim()) {
      errors.otp = 'OTP is required';
      valid = false;
    } else if (walletOtp.length !== 6) {
      errors.otp = 'OTP must be 6 digits';
      valid = false;
    }

    setAddWalletErrors(errors);
    return valid;
  };

  const handleRequestWalletOtp = async () => {
    if (!validateAddWalletDetails()) {
      return;
    }

    const payload = {
      Name: addWalletName.trim(),
      AccNumber: addWalletNumber.trim(),
      Type: 'momo',
      Network: addWalletNetwork,
    };

    try {
      setAddWalletLoading(true);
      const response = await requestWalletOTP(payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Please check your phone for the verification code',
          position: 'bottom',
        });
        setWalletOtpStep('otp');
        setWalletOtpTimer(600);
        setCanResendWalletOtp(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Failed to send OTP',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to send OTP. Please try again.',
        position: 'bottom',
      });
    } finally {
      setAddWalletLoading(false);
    }
  };

  const handleVerifyWalletOtp = async () => {
    if (!validateWalletOtp()) {
      return;
    }

    try {
      setAddWalletLoading(true);
      const response = await verifyWalletOTP(walletOtp.trim());

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Payment method added successfully',
          position: 'bottom',
        });

        // Reset form
        setAddWalletName('');
        setAddWalletNumber('');
        setAddWalletNetwork(paymentNetworks[0].value);
        setWalletOtp('');
        setWalletOtpStep('details');
        setShowAddWalletSheet(false);

        // Refresh wallets
        fetchWallets();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Invalid OTP',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to verify OTP. Please try again.',
        position: 'bottom',
      });
    } finally {
      setAddWalletLoading(false);
    }
  };

  const handleResendWalletOtp = async () => {
    if (!canResendWalletOtp) return;

    const payload = {
      Name: addWalletName.trim(),
      AccNumber: addWalletNumber.trim(),
      Type: 'momo',
      Network: addWalletNetwork,
    };

    try {
      setAddWalletLoading(true);
      const response = await requestWalletOTP(payload);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: 'A new verification code has been sent',
          position: 'bottom',
        });
        setWalletOtpTimer(600);
        setCanResendWalletOtp(false);
        setWalletOtp('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Failed to resend OTP',
          position: 'bottom',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to resend OTP',
        position: 'bottom',
      });
    } finally {
      setAddWalletLoading(false);
    }
  };

  const handleBackToWalletDetails = () => {
    setWalletOtpStep('details');
    setWalletOtp('');
    setAddWalletErrors({ name: '', number: '', otp: '' });
  };

  const handleCloseAddWalletSheet = () => {
    setShowAddWalletSheet(false);
    setWalletOtpStep('details');
    setWalletOtp('');
    setAddWalletName('');
    setAddWalletNumber('');
    setAddWalletNetwork(paymentNetworks[0].value);
    setAddWalletErrors({ name: '', number: '', otp: '' });
  };

  const validateAmount = (input: string): boolean => {
    if (!input || isNaN(parseFloat(input))) {
      return false;
    }
    const amountValue = parseFloat(input);
    return amountValue >= 1.0;
  };

  const renderAddWalletDetailsStep = () => (
    <>
      <Input
        placeholder="Enter Name"
        value={addWalletName}
        onChangeText={text => {
          setAddWalletName(text);
          if (addWalletErrors.name) {
            setAddWalletErrors({...addWalletErrors, name: ''});
          }
        }}
        errorMessage={addWalletErrors.name}
        autoCapitalize="words"
        leftIcon={<Feather name="user" size={18} color="#888" />}
        inputContainerStyle={styles.sheetInputContainer}
        containerStyle={styles.sheetInputWrapper}
        editable={!addWalletLoading}
      />

      <Input
        placeholder="Enter Phone Number"
        value={addWalletNumber}
        onChangeText={text => {
          setAddWalletNumber(text);
          if (addWalletErrors.number) {
            setAddWalletErrors({...addWalletErrors, number: ''});
          }
        }}
        keyboardType="phone-pad"
        errorMessage={addWalletErrors.number}
        leftIcon={<Feather name="phone" size={18} color="#888" />}
        maxLength={10}
        inputContainerStyle={styles.sheetInputContainer}
        containerStyle={styles.sheetInputWrapper}
        editable={!addWalletLoading}
      />

      <View style={styles.networkSelector}>
        <Text style={styles.networkLabel}>Select Network</Text>
        <View style={styles.networkButtons}>
          {paymentNetworks.map(net => (
            <TouchableOpacity
              key={net.value}
              style={[
                styles.networkButton,
                addWalletNetwork === net.value && styles.networkButtonActive
              ]}
              onPress={() => setAddWalletNetwork(net.value)}
              activeOpacity={0.7}
              disabled={addWalletLoading}
            >
              <Text style={[
                styles.networkButtonText,
                addWalletNetwork === net.value && styles.networkButtonTextActive
              ]}>
                {net.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.otpInfoCard}>
        <View style={styles.otpInfoIconContainer}>
          <Feather name="shield" size={18} color="#4A90C4" />
        </View>
        <Text style={styles.otpInfoText}>
          We'll send a verification code to confirm your phone number
        </Text>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleRequestWalletOtp}
        disabled={addWalletLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={addWalletLoading ? ['#9CA3AF', '#6B7280'] : ['#4A90C4', '#34B87C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          {addWalletLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Feather name="arrow-right" size={20} color="white" />
          )}
          <Text style={styles.buttonText}>
            {addWalletLoading ? 'Sending...' : 'Continue'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCloseAddWalletSheet}
        disabled={addWalletLoading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </>
  );

  const renderAddWalletOtpStep = () => (
    <>
      <View style={styles.otpHeaderSection}>
        <View style={styles.otpIconContainer}>
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            style={styles.otpIconGradient}
          >
            <Feather name="lock" size={28} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.otpTitle}>Verify Your Phone</Text>
        <Text style={styles.otpSubtitle}>
          We've sent a 6-digit code to
        </Text>
        <Text style={styles.otpPhoneNumber}>{addWalletNumber}</Text>
      </View>

      <View style={styles.otpInputGroup}>
        <Text style={styles.otpInputLabel}>Verification Code</Text>
        <View style={[
          styles.otpInputContainer,
          addWalletErrors.otp && styles.otpInputError
        ]}>
          <TextInput
            placeholder="000000"
            placeholderTextColor="#9CA3AF"
            value={walletOtp}
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={text => {
              setWalletOtp(text);
              if (addWalletErrors.otp) {
                setAddWalletErrors({...addWalletErrors, otp: ''});
              }
            }}
            style={styles.otpInput}
            editable={!addWalletLoading}
          />
        </View>
        {addWalletErrors.otp ? (
          <View style={styles.otpErrorContainer}>
            <Feather name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.otpErrorText}>{addWalletErrors.otp}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.otpTimerContainer}>
        {walletOtpTimer > 0 ? (
          <View style={styles.timerRow}>
            <Feather name="clock" size={14} color="#6B7280" />
            <Text style={styles.timerText}>
              Code expires in {formatTime(walletOtpTimer)}
            </Text>
          </View>
        ) : (
          <Text style={styles.expiredText}>Code expired</Text>
        )}

        <TouchableOpacity
          onPress={handleResendWalletOtp}
          disabled={!canResendWalletOtp || addWalletLoading}
          style={styles.resendButton}
        >
          <Text style={[
            styles.resendText,
            (!canResendWalletOtp || addWalletLoading) && styles.resendTextDisabled
          ]}>
            Resend Code
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.otpButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToWalletDetails}
          disabled={addWalletLoading}
        >
          <Feather name="arrow-left" size={18} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerifyWalletOtp}
          disabled={addWalletLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={addWalletLoading ? ['#9CA3AF', '#6B7280'] : ['#34B87C', '#2DA771']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {addWalletLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Feather name="check" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {addWalletLoading ? 'Verifying...' : 'Verify & Add'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Meter Info Card */}
        <Animated.View
          style={[
            styles.meterCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.meterGradient}
          >
            <View style={styles.meterIconContainer}>
              <Image
                source={require('../assets/logos/ecg.jpg')}
                style={styles.meterIconImage}
              />
            </View>
            <Text style={styles.meterLabel}>Meter Number</Text>
            <Text style={styles.meterNumber}>{meterNumber}</Text>
            <View style={styles.customerInfoRow}>
              <Feather name="user" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.customerName}>{customerName}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Amount Input Card */}
        <Animated.View
          style={[
            styles.amountCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Enter Amount</Text>
            <View style={styles.minChargeContainer}>
              <Text style={styles.minChargeLabel}>Min. GHS</Text>
              <Text style={styles.minChargeAmount}>1.00</Text>
            </View>
          </View>

          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>GHS</Text>
            <Input
              placeholder="0.00"
              value={amount}
              onChangeText={text => {
                const validatedText = text.replace(/[^0-9.]/g, '');
                const decimalCount = (validatedText.match(/\./g) || []).length;
                if (decimalCount <= 1) {
                  setAmount(validatedText);
                }
              }}
              keyboardType="numeric"
              inputContainerStyle={styles.amountInputInner}
              inputStyle={styles.amountInputText}
              containerStyle={styles.amountInputWrapper}
              errorMessage={
                amount && !validateAmount(amount)
                  ? 'Amount must be at least GHS 1.00'
                  : undefined
              }
              errorStyle={styles.errorText}
            />
          </View>
        </Animated.View>

        {/* Payment Method Card */}
        {paymentMethods.length > 0 ? (
          <Animated.View
            style={[
              styles.paymentMethodCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              style={styles.selectedMethodContainer}
              onPress={toggleBottomSheet}
              activeOpacity={0.7}
            >
              <View style={styles.methodInfoRow}>
                <View style={styles.methodImageContainer}>
                  {selectedMethod?.Image != null ? (
                    <Image
                      style={styles.methodImage}
                      source={{uri: selectedMethod?.Image}}
                    />
                  ) : (
                    <Image
                      source={networkLogos[selectedMethod?.Network]}
                      style={styles.methodImage}
                      PlaceholderContent={<ActivityIndicator />}
                    />
                  )}
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{selectedMethod?.Name}</Text>
                  <Text style={styles.methodNumber}>{selectedMethod?.AccNumber}</Text>
                </View>
              </View>
              <View style={styles.changeButton}>
                <Text style={styles.changeButtonText}>Change</Text>
                <Feather name="chevron-right" size={18} color="#4A90C4" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.emptyPaymentCard,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <Feather name="wallet" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to continue</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {paymentMethods.length === 0 ? (
          <TouchableOpacity
            style={styles.addWalletButton}
            onPress={() => setShowAddWalletSheet(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90C4', '#34B87C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Feather name="plus-circle" size={20} color="white" />
              <Text style={styles.buttonText}>Add Payment Method</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={isProcessing || !selectedMethod}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isProcessing ? ['#9CA3AF', '#6B7280'] : ['#34B87C', '#2DA771']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Feather name="credit-card" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Methods Bottom Sheet */}
      <BottomSheet
        isVisible={isVisible}
        containerStyle={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>
          <View style={styles.sheetHandle} />
          <Text style={styles.bottomSheetHeader}>Select Payment Method</Text>

          <ScrollView style={styles.methodsList} showsVerticalScrollIndicator={false}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method?.id}
                style={[
                  styles.methodItem,
                  selectedMethod?.id === method?.id && styles.methodItemSelected
                ]}
                onPress={() => selectPaymentMethod(method)}
                activeOpacity={0.7}
              >
                <View style={styles.methodItemContent}>
                  <View style={styles.methodImageContainer}>
                    {method?.Image != null ? (
                      <Image
                        style={styles.methodImage}
                        source={{uri: method?.Image}}
                      />
                    ) : (
                      <Image
                        source={networkLogos[method.Network]}
                        style={styles.methodImage}
                        PlaceholderContent={<ActivityIndicator />}
                      />
                    )}
                  </View>
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodItemName}>{method?.Name}</Text>
                    <Text style={styles.methodItemNumber}>{method?.AccNumber}</Text>
                  </View>
                </View>
                {selectedMethod?.id === method?.id && (
                  <View style={styles.checkContainer}>
                    <Feather name="check-circle" size={22} color="#34B87C" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addMethodButton}
            onPress={() => {
              setIsVisible(false);
              setShowAddWalletSheet(true);
            }}
            activeOpacity={0.7}
          >
            <Feather name="plus-circle" size={20} color="#4A90C4" />
            <Text style={styles.addMethodText}>Add New Payment Method</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={toggleBottomSheet}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Add Wallet Bottom Sheet with OTP */}
      <BottomSheet
        isVisible={showAddWalletSheet}
        containerStyle={styles.bottomSheetContainer}
        onBackdropPress={handleCloseAddWalletSheet}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.sheetHandle} />
          <Text style={styles.bottomSheetHeader}>
            {walletOtpStep === 'details' ? 'Add Payment Method' : 'Verify Phone Number'}
          </Text>

          {walletOtpStep === 'details'
            ? renderAddWalletDetailsStep()
            : renderAddWalletOtpStep()
          }
        </View>
      </BottomSheet>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 100,
  },
  meterCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 1,
  },
  meterGradient: {
    padding: 24,
  },
  meterIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  meterIconImage: {
    width: 48,
    height: 48,
    resizeMode: 'cover',
    borderRadius: 5
  },
  meterLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  meterNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  customerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  amountCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  minChargeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  minChargeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  minChargeAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 0,
    paddingTop: 5,
    paddingBottom: 5,
    minHeight: 50,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A90C4',
    marginRight: 8,
    lineHeight: 40,
  },
  amountInputWrapper: {
    flex: 1,
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: 0,
    height: 50,
  },
  amountInputInner: {
    borderBottomWidth: 0,
    paddingVertical: 0,
    border: 2,
    height: 50,
    justifyContent: 'center',
  },
  amountInputText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    padding: 0,
    margin: 0,
    lineHeight: 40,
    textAlignVertical: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  paymentMethodCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  selectedMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  methodImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90C4',
  },
  emptyPaymentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addWalletButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  payButton: {
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 0,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_WIDTH * 1.5,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  methodsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodItemSelected: {
    borderColor: '#34B87C',
    backgroundColor: '#F0FDF4',
  },
  methodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodItemNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkContainer: {
    marginLeft: 12,
  },
  addMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#4A90C4',
    marginBottom: 12,
    gap: 8,
  },
  addMethodText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90C4',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  sheetInputContainer: {
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  sheetInputWrapper: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  networkSelector: {
    marginBottom: 20,
  },
  networkLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  networkButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  networkButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  networkButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#4A90C4',
  },
  networkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  networkButtonTextActive: {
    color: '#4A90C4',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
  },
  invalidInput: {
    borderColor: '#EF4444',
  },
  // OTP Styles
  otpInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  otpInfoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  otpHeaderSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpIconContainer: {
    marginBottom: 16,
  },
  otpIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
  },
  otpPhoneNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  otpInputGroup: {
    marginBottom: 20,
  },
  otpInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  otpInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 6,
    width: '100%',
  },
  otpErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  otpErrorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  otpTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  expiredText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90C4',
  },
  resendTextDisabled: {
    color: '#9CA3AF',
  },
  otpButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  verifyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
});

export default MakePaymentScreen;
