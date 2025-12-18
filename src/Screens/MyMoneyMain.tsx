import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Image} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
import {Wallet, WalletsResponse} from '../types/wallet';
import {GetWallets, SetDefaultWallet} from '../services/WalletService';
import Toast from 'react-native-toast-message';
import LinearGradient from 'react-native-linear-gradient';
import {Modal} from 'react-native';

const networkLogos: Record<string, any> = {
  MTN: require('../assets/logos/mtn_logo.png'),
  TELECEL: require('../assets/logos/vodafone_logo.jpg'),
  AIRTELTIGO: require('../assets/logos/airteltigo_logo.jpg'),
};

const networkColors: Record<string, string[]> = {
  MTN: ['#FFCC00', '#FFB300'],
  TELECEL: ['#E60000', '#C70000'],
  AIRTELTIGO: ['#ED1C24', '#B71C1C'],
};

interface MyMoneyMainProps {
  route: {
    params?: {
      user?: {
        first_name: string;
        last_name: string;
      };
    };
  };
}

const MyMoneyMain: React.FC<MyMoneyMainProps> = ({route}) => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [isLoading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Wallet[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
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

  const fetchWallets = async () => {
    try {
      setError(null);
      const response: WalletsResponse = await GetWallets();

      if (response.status === 'success') {
        setPaymentMethods(response.data);
      } else {
        setError(response.message || 'Failed to load payment methods');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWallets();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchWallets();
      setLoading(false);
    };
    loadData();
  }, []);

  const callbackRefresher = () => {
    fetchWallets();
  };

  const handleWalletPress = (wallet: Wallet) => {
    if (wallet.IsDefault) {
      Toast.show({
        type: 'info',
        text1: 'Default Payment',
        text2: 'This is already your default payment method',
        position: 'top',
        visibilityTime: 2000,
        topOffset: 60,
      });
      return;
    }
    setSelectedWallet(wallet);
    setIsModalVisible(true);
  };

  const handleSetDefault = async () => {
    if (!selectedWallet) return;

    try {
      setIsSettingDefault(true);

      const response = await SetDefaultWallet(selectedWallet.EqUuid);

      if (response.success === true) {
        await fetchWallets();
        setIsModalVisible(false);
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Default payment method updated',
          position: 'top',
          visibilityTime: 3000,
          topOffset: 60,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Failed to update default payment method',
          position: 'top',
          visibilityTime: 4000,
          topOffset: 60,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An error occurred while updating',
        position: 'top',
        visibilityTime: 4000,
        topOffset: 60,
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  const defaultPaymentMethod = paymentMethods.find(method => method.IsDefault);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90C4" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Feather name="alert-circle" size={64} color="#EF4444" />
        </View>
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRefresh}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#4A90C4', '#3B7FB5']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.retryGradient}>
            <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90C4']}
            tintColor="#4A90C4"
          />
        }>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>
            Manage your mobile money accounts
          </Text>
        </Animated.View>

        {/* Default Payment Card */}
        {defaultPaymentMethod && (
          <Animated.View
            style={[
              styles.defaultCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <LinearGradient
              colors={
                networkColors[defaultPaymentMethod.Network] || [
                  '#4A90C4',
                  '#34B87C',
                ]
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.defaultCard}>
              <View style={styles.defaultCardHeader}>
                <View style={styles.defaultBadge}>
                  <Feather name="star" size={14} color="#FCD34D" />
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
                <Image
                  source={networkLogos[defaultPaymentMethod.Network]}
                  style={styles.defaultCardLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.defaultCardBody}>
                <Text style={styles.defaultCardLabel}>Active Account</Text>
                <Text style={styles.defaultCardNumber}>
                  {defaultPaymentMethod.AccNumber}
                </Text>
                <Text style={styles.defaultCardNetwork}>
                  {defaultPaymentMethod.Network}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Add Payment Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.push('AddWallet', {
              callback: () => callbackRefresher(),
            })
          }
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#34B87C', '#2DA771']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.addGradient}>
            <Feather name="plus-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Wallet</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Payment Methods List */}
        <View style={styles.listSection}>
          <Text style={styles.listTitle}>All Payment Methods</Text>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather name="credit-card" size={64} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptyText}>
                You haven't added any payment methods yet. Add one to get
                started!
              </Text>
            </View>
          ) : (
            paymentMethods.map((method, index) => (
              <Animated.View
                key={method.id}
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 * (index + 1), 0],
                        }),
                      },
                    ],
                  },
                ]}>
                <TouchableOpacity
                  style={styles.methodCard}
                  onPress={() => handleWalletPress(method)}
                  activeOpacity={0.7}>
                  <View style={styles.methodIconContainer}>
                    <Image
                      source={networkLogos[method.Network]}
                      style={styles.methodIcon}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.methodContent}>
                    <Text style={styles.methodNetwork}>{method.Network}</Text>
                    <Text style={styles.methodNumber}>{method.AccNumber}</Text>
                  </View>

                  <View style={styles.methodRight}>
                    {method.IsDefault ? (
                      <View style={styles.defaultIndicator}>
                        <Feather name="check-circle" size={20} color="#34B87C" />
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={20} color="#D1D5DB" />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Set Default Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={32}
                  color="#4A90C4"
                />
              </View>
              <Text style={styles.modalTitle}>Set as Default?</Text>
              <Text style={styles.modalText}>
                Do you want to set {selectedWallet?.Network} (
                {selectedWallet?.AccNumber}) as your default payment method?
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isSettingDefault && styles.confirmButtonDisabled,
                ]}
                onPress={handleSetDefault}
                disabled={isSettingDefault}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={
                    isSettingDefault
                      ? ['#9CA3AF', '#6B7280']
                      : ['#34B87C', '#2DA771']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.confirmGradient}>
                  {isSettingDefault ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.confirmButtonText}>Setting...</Text>
                    </>
                  ) : (
                    <>
                      <Feather name="check" size={18} color="#FFFFFF" />
                      <Text style={styles.confirmButtonText}>
                        Set as Default
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSection: {
    marginBottom: 24,
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
  defaultCardWrapper: {
    marginBottom: 20,
  },
  defaultCard: {
    borderRadius: 16,
    padding: 20,
    minHeight: 150,
  },
  defaultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  defaultCardLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 6,
  },
  defaultCardBody: {
    marginTop: 8,
  },
  defaultCardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  defaultCardNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
  },
  defaultCardNetwork: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listSection: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  methodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIcon: {
    width: 40,
    height: 40,
  },
  methodContent: {
    flex: 1,
  },
  methodNetwork: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  methodNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  methodRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  defaultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34B87C',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MyMoneyMain;
