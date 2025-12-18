import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Button, Input, Text, Tab, TabView, BottomSheet } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import { GetMeter } from '../services/MeterService';
import { MeterFormData } from '../types/wallet';
import { Meter } from '../Types/Meter';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../types/navigation';
import { PrimaryBtn } from '../components/PrimaryBtn';
import { primaryBtnColor } from '../helpers/colors';
import { CancelBtn } from '../components/CancelBtn';
import LottieView from 'lottie-react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

type NewPurchaseRouteProp = RouteProp<AppStackParamList, 'NewPurchase'>;

const BuyPowerScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<NewPurchaseRouteProp>();

  const [index, setIndex] = useState(0);
  const [meterNumber, setMeterNumber] = useState(route.params?.meterNumber ?? '');
  const [category, setCategory] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [loading, setLoading] = useState(false);
  const [meterInfo, setMeterInfo] = useState<Meter | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  useEffect(() => {
    if (route.params?.meterNumber) {
      setMeterNumber(route.params.meterNumber);
      setError(undefined);
    }
  }, [route.params?.meterNumber]);

  const fetchMeterInfo = async () => {
    if (!meterNumber.trim()) {
      setError('Please enter a meter number');
      return;
    }
    setLoading(true);
    setError(undefined);
    const payload: MeterFormData = {
      MeterNumber: meterNumber,
      MeterCategory: category,
    };
    const response = await GetMeter(payload);

    if (response.status === 'success') {
      setLoading(false);
      setMeterInfo(response.data as Meter);
      setIsBottomSheetVisible(true);
    } else {
      setLoading(false);
      setError('Error: Unable to get meter info');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to get meter info',
        position: 'bottom',
      });
    }
  };

  const handleContinue = () => {
    setIsBottomSheetVisible(false);
    navigation.navigate('MakePayment', {
      meterNumber: meterNumber,
      customerName: meterInfo?.CustomerName || 'Customer',
    });
  };

  const handleCancel = () => {
    setIsBottomSheetVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={styles.indicator}
        containerStyle={styles.tabContainer}
      >
        <Tab.Item
          title="Buy With Meter No"
          titleStyle={index === 0 ? styles.activeTabTitle : styles.inactiveTabTitle}
          icon={<Feather name="zap" size={18} color={index === 0 ? '#4A90C4' : '#9CA3AF'} />}
        />
        <Tab.Item
          title="Buy With Card"
          titleStyle={index === 1 ? styles.activeTabTitle : styles.inactiveTabTitle}
          icon={<Feather name="credit-card" size={18} color={index === 1 ? '#4A90C4' : '#9CA3AF'} />}
        />
      </Tab>

      {/* Tab Views */}
      <TabView
        value={index}
        onChange={setIndex}
        animationType="spring"
        containerStyle={styles.tabView}>
        {/* Buy With Meter Number Tab */}
        <TabView.Item style={styles.tabContent}>
          <Animated.View
            style={[
              styles.inner,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#4A90C4', '#34B87C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoGradient}
              >
                <View style={styles.infoIconContainer}>
                  <Feather name="zap" size={32} color="white" />
                </View>
                <Text style={styles.infoTitle}>Buy Prepaid Power</Text>
                <Text style={styles.infoSubtitle}>
                  Enter your meter number to get started
                </Text>
              </LinearGradient>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meter Number / ID</Text>
                <View style={[styles.inputContainer, error && styles.errorInput]}>
                  <Feather name="hash" size={18} color="#6B7280" />
                  <Input
                    value={meterNumber}
                    onChangeText={text => {
                      setMeterNumber(text);
                      setError(undefined);
                    }}
                    placeholder="e.g., 24107682320"
                    inputStyle={styles.input}
                    inputContainerStyle={styles.inputInner}
                    containerStyle={styles.inputWrapper}
                    errorMessage={error}
                    errorStyle={styles.errorText}
                  />
                </View>
                <View style={styles.helperContainer}>
                  <Feather name="info" size={14} color="#6B7280" />
                  <Text style={styles.helperText}>
                    Find your meter number on an old receipt
                  </Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meter Category</Text>
                <View style={styles.pickerContainer}>
                  <Feather name="layers" size={18} color="#6B7280" style={styles.pickerIcon} />
                  <Picker
                    selectedValue={category}
                    onValueChange={itemValue => setCategory(itemValue)}
                    style={styles.picker}>
                    <Picker.Item label="Prepaid" value="prepaid" />
                    <Picker.Item label="Postpaid" value="postpaid" />
                  </Picker>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={fetchMeterInfo}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#9CA3AF', '#6B7280'] : ['#4A90C4', '#34B87C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.confirmButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={20} color="white" />
                      <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TabView.Item>

        {/* Buy With Card Tab */}
        <TabView.Item style={styles.tabContent}>
          <View style={styles.comingSoonContainer}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../assets/animations/coming-soon.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
            <View style={styles.comingSoonCard}>
              <View style={styles.comingSoonIconContainer}>
                <Feather name="clock" size={48} color="#4A90C4" />
              </View>
              <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
              <Text style={styles.comingSoonText}>
                This feature is currently in development and will be available soon.
              </Text>
              <Text style={styles.comingSoonSubtext}>
                Please use "Buy With Meter No" for now.
              </Text>
            </View>
          </View>
        </TabView.Item>
      </TabView>

      {/* Bottom Sheet for Meter Info */}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        containerStyle={styles.bottomSheetContainer}
        onBackdropPress={handleCancel}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetIconContainer}>
              <Feather name="check-circle" size={24} color="#34B87C" />
            </View>
            <Text style={styles.sheetTitle}>Meter Information</Text>
          </View>

          {meterInfo ? (
            <>
              <View style={styles.meterInfoCard}>
                <View style={styles.meterInfoRow}>
                  <View style={styles.meterInfoLabelContainer}>
                    <Feather name="user" size={16} color="#6B7280" />
                    <Text style={styles.meterInfoLabel}>Customer Name</Text>
                  </View>
                  <Text style={styles.meterInfoValue}>
                    {meterInfo.CustomerName}
                  </Text>
                </View>

                <View style={styles.meterInfoDivider} />

                <View style={styles.meterInfoRow}>
                  <View style={styles.meterInfoLabelContainer}>
                    <Feather name="zap" size={16} color="#6B7280" />
                    <Text style={styles.meterInfoLabel}>Meter Number</Text>
                  </View>
                  <Text style={styles.meterInfoValue}>
                    {meterInfo.MeterNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.sheetButtons}>
                <TouchableOpacity
                  style={styles.cancelSheetButton}
                  onPress={handleCancel}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color="#6B7280" />
                  <Text style={styles.cancelSheetButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.continueSheetButton}
                  onPress={handleContinue}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4A90C4', '#34B87C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.continueSheetButtonGradient}
                  >
                    <Feather name="arrow-right" size={18} color="white" />
                    <Text style={styles.continueSheetButtonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.noInfoText}>No meter information available</Text>
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    backgroundColor: '#fff',
    elevation: 0.5,
  },
  indicator: {
    backgroundColor: '#4A90C4',
    height: 3,
  },
  activeTabTitle: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 14,
  },
  inactiveTabTitle: {
    fontWeight: '600',
    color: '#9CA3AF',
    fontSize: 14,
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 0.5,
  },
  infoGradient: {
    padding: 24,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 0.5,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 0,
    minHeight: 50,
  },
  errorInput: {
    borderColor: '#EF4444',
  },
  inputWrapper: {
    flex: 1,
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: 0,
    height: 50,
  },
  inputInner: {
    borderBottomWidth: 0,
    paddingVertical: 0,
    height: 50,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    paddingLeft: 8,
    paddingVertical: 0,
    margin: 0,
    textAlignVertical: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingLeft: 12,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#1F2937',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 0.5,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  animationContainer: {
    width: 300,
    height: 200,
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  comingSoonCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 0.5,
  },
  comingSoonIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 24,
  },
  comingSoonSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9CA3AF',
    lineHeight: 20,
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
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
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  meterInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  meterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meterInfoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meterInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  meterInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  meterInfoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelSheetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  cancelSheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  continueSheetButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0.5,
  },
  continueSheetButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueSheetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  noInfoText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
});
export default BuyPowerScreen;
