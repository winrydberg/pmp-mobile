import React, {useState, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {Text} from '@rneui/themed';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AddWallet, requestWalletOTP, verifyWalletOTP} from '../services/WalletService';
import {AddWalletPayload} from '../Types/MainTypes';
import Toast from 'react-native-toast-message';
import {AppStackParamList} from '../types/navigation';
import LinearGradient from 'react-native-linear-gradient';
import {Image} from 'react-native';

type PaymentNetwork = 'MTN' | 'Telecel' | 'AirtelTigo';

interface PaymentMethod {
  network: PaymentNetwork;
  logo: any;
  gradientColors: string[];
  iconColor: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    network: 'MTN',
    logo: require('../assets/logos/mtn_logo.png'),
    gradientColors: ['#FFCC00', '#FFB300'],
    iconColor: '#000000',
  },
  {
    network: 'Telecel',
    logo: require('../assets/logos/vodafone_logo.jpg'),
    gradientColors: ['#E60000', '#C70000'],
    iconColor: '#FFFFFF',
  },
  {
    network: 'AirtelTigo',
    logo: require('../assets/logos/airteltigo_logo.jpg'),
    gradientColors: ['#ED1C24', '#B71C1C'],
    iconColor: '#FFFFFF',
  },
];

type AddWalletProps = StackScreenProps<AppStackParamList, 'AddWallet'>;

const AddPaymentMethod: React.FC<AddWalletProps> = ({route, navigation}) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const [errors, setErrors] = React.useState({
    name: '',
    number: '',
    otp: '',
  });

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
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
    if (step === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateDetailsForm = () => {
    let valid = true;
    const newErrors = {name: '', number: '', otp: ''};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!number.trim()) {
      newErrors.number = 'Phone number is required';
      valid = false;
    } else {
      const digitsOnly = number.replace(/\D/g, '');
      if (digitsOnly.length < 9 || digitsOnly.length > 15) {
        newErrors.number = 'Please enter a valid phone number';
        valid = false;
      }
    }

    if (!selectedMethod) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a payment provider',
        position: 'bottom',
      });
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateOTPForm = () => {
    const newErrors = {name: '', number: '', otp: ''};
    let valid = true;

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
      valid = false;
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRequestOTP = async () => {
    if (!validateDetailsForm()) {
      return;
    }

    const paymentMethodData = {
      Name: name.trim(),
      AccNumber: number.trim(),
      Type: 'momo',
      Network: selectedMethod!.network.toUpperCase(),
    };

    try {
      setIsLoading(true);
      const response = await requestWalletOTP(paymentMethodData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: 'Please check your phone for the verification code',
          position: 'bottom',
        });
        setStep('otp');
        setOtpTimer(600); // Reset timer to 10 minutes
        setCanResend(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Failed to send OTP',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to send OTP. Please try again.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateOTPForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyWalletOTP(otp.trim());

      if (response.success) {
        setName('');
        setNumber('');
        setSelectedMethod(null);
        setOtp('');
        setStep('details');

        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Payment method added successfully',
          position: 'bottom',
        });

        route.params?.callback?.();
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.error || 'Invalid OTP',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to verify OTP. Please try again.',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    const paymentMethodData = {
      Name: name.trim(),
      AccNumber: number.trim(),
      Type: 'momo',
      Network: selectedMethod!.network.toUpperCase(),
    };

    try {
      setIsLoading(true);
      const response = await requestWalletOTP(paymentMethodData);

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'OTP Resent',
          text2: 'A new verification code has been sent',
          position: 'bottom',
        });
        setOtpTimer(600);
        setCanResend(false);
        setOtp('');
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
      setIsLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOtp('');
    setErrors({name: '', number: '', otp: ''});
  };

  const renderDetailsStep = () => (
    <>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>
            Choose your mobile money provider
          </Text>
        </View>
      </Animated.View>

      {/* Payment Card Preview */}
      {selectedMethod && (
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <LinearGradient
            colors={selectedMethod.gradientColors}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.paymentCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardChip}>
                <MaterialCommunityIcons
                  name="chip"
                  size={22}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <Image
                source={selectedMethod.logo}
                style={styles.cardLogo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.cardLabel}>Account Name</Text>
              <Text style={styles.cardName}>{name || 'Your Name'}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardLabel}>Phone Number</Text>
                <Text style={styles.cardNumber}>
                  {number || '0XX XXX XXXX'}
                </Text>
              </View>
              <View style={styles.networkBadge}>
                <Text style={styles.networkText}>{selectedMethod.network}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Provider Selection */}
      <Animated.View
        style={[
          styles.formSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.sectionTitle}>Select Provider</Text>
        <View style={styles.providersGrid}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.network}
              style={[
                styles.providerCard,
                selectedMethod?.network === method.network &&
                styles.providerCardSelected,
              ]}
              onPress={() => setSelectedMethod(method)}
              activeOpacity={0.7}>
              <LinearGradient
                colors={
                  selectedMethod?.network === method.network
                    ? method.gradientColors
                    : ['#FFFFFF', '#FFFFFF']
                }
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.providerGradient}>
                <Image
                  source={method.logo}
                  style={[
                    styles.providerLogo,
                    selectedMethod?.network === method.network &&
                    styles.providerLogoSelected,
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.providerName,
                    selectedMethod?.network === method.network &&
                    styles.providerNameSelected,
                  ]}>
                  {method.network}
                </Text>
                {selectedMethod?.network === method.network && (
                  <View style={styles.checkIconContainer}>
                    <Feather name="check-circle" size={20} color="#FFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Form Inputs */}
      <Animated.View
        style={[
          styles.formSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Account Name</Text>
          <View
            style={[
              styles.inputContainer,
              errors.name && styles.inputContainerError,
            ]}>
            <View style={styles.iconContainer}>
              <Feather name="user" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={text => {
                setName(text);
                if (errors.name) {
                  setErrors({...errors, name: ''});
                }
              }}
              style={styles.input}
              editable={!isLoading}
            />
          </View>
          {errors.name ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{errors.name}</Text>
            </View>
          ) : null}
        </View>

        {/* Phone Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View
            style={[
              styles.inputContainer,
              errors.number && styles.inputContainerError,
            ]}>
            <View style={styles.iconContainer}>
              <Feather name="phone" size={20} color="#9CA3AF" />
            </View>
            <TextInput
              placeholder="0XX XXX XXXX"
              placeholderTextColor="#9CA3AF"
              value={number}
              keyboardType="phone-pad"
              onChangeText={text => {
                setNumber(text);
                if (errors.number) {
                  setErrors({...errors, number: ''});
                }
              }}
              style={styles.input}
              editable={!isLoading}
            />
          </View>
          {errors.number ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{errors.number}</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Feather name="shield" size={20} color="#4A90C4" />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Phone Verification Required</Text>
          <Text style={styles.infoText}>
            We'll send a verification code to your phone number to confirm your
            identity
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleRequestOTP}
        disabled={isLoading}
        activeOpacity={0.8}>
        <LinearGradient
          colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#4A90C4', '#34B87C']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.saveGradient}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Continue</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderOTPStep = () => (
    <>
      {/* OTP Header */}
      <Animated.View
        style={[
          styles.otpHeaderSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.otpIconContainer}>
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            style={styles.otpIconGradient}>
            <Feather name="lock" size={32} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.otpTitle}>Verify Your Phone</Text>
        <Text style={styles.otpSubtitle}>
          We've sent a 6-digit verification code to
        </Text>
        <Text style={styles.otpPhoneNumber}>{number}</Text>
      </Animated.View>

      {/* OTP Input */}
      <Animated.View
        style={[
          styles.otpFormSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Verification Code</Text>
          <View
            style={[
              styles.otpInputContainer,
              errors.otp && styles.inputContainerError,
            ]}>
            <TextInput
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              value={otp}
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={text => {
                setOtp(text);
                if (errors.otp) {
                  setErrors({...errors, otp: ''});
                }
              }}
              style={styles.otpInput}
              editable={!isLoading}
            />
          </View>
          {errors.otp ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{errors.otp}</Text>
            </View>
          ) : null}
        </View>

        {/* Timer and Resend */}
        <View style={styles.otpTimerContainer}>
          {otpTimer > 0 ? (
            <View style={styles.timerRow}>
              <Feather name="clock" size={16} color="#6B7280" />
              <Text style={styles.timerText}>
                Code expires in {formatTime(otpTimer)}
              </Text>
            </View>
          ) : (
            <Text style={styles.expiredText}>Code expired</Text>
          )}

          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canResend || isLoading}
            style={styles.resendButton}>
            <Text
              style={[
                styles.resendText,
                (!canResend || isLoading) && styles.resendTextDisabled,
              ]}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.otpButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToDetails}
          disabled={isLoading}>
          <Feather name="arrow-left" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.verifyButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              isLoading ? ['#9CA3AF', '#6B7280'] : ['#34B87C', '#2DA771']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.saveGradient}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Verify & Add</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {step === 'details' ? renderDetailsStep() : renderOTPStep()}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 14,
  },
  headerTextContainer: {
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  cardWrapper: {
    marginBottom: 24,
  },
  paymentCard: {
    borderRadius: 14,
    padding: 16,
    minHeight: 150,
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardChip: {
    width: 36,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 5,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  networkBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  networkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  providersGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  providerCard: {
    flex: 1,
    borderRadius: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0.4,
  },
  providerCardSelected: {
    elevation: 6,
  },
  providerGradient: {
    padding: 12,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerLogo: {
    width: 40,
    height: 40,
    marginBottom: 6,
    borderRadius: 6,
  },
  providerLogoSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 3,
  },
  providerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerNameSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  checkIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    height: 56,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    height: '100%',
    paddingVertical: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // OTP Step Styles
  otpHeaderSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  otpIconContainer: {
    marginBottom: 24,
  },
  otpIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  otpSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpPhoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  otpFormSection: {
    marginBottom: 32,
  },
  otpInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 8,
    width: '100%',
  },
  otpTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  expiredText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90C4',
  },
  resendTextDisabled: {
    color: '#9CA3AF',
  },
  otpButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  verifyButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0,
  },
});

export default AddPaymentMethod;
