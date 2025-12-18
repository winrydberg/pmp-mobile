import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { Text, Avatar, Icon, Button, Divider, Card } from '@rneui/themed';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { Image } from '@rneui/base';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { primaryBtnColor, secondaryBtnColor } from '../helpers/colors';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchMeters } from '../store/slice/meterSlice';
import { Meter } from '../Types/Meter';
import { useAuth } from '../Context/AuthContext';
import { baseURL } from '../helpers/constants';
import Toast from 'react-native-toast-message';
import { getRecentTransactions } from '../services/TransactionService';
import { TransactionItem } from '../types/Transaction';
import { formatDateTime } from '../helpers/helpers';
import LinearGradient from 'react-native-linear-gradient';
import UserAvatar from '../components/UserAvatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type HomeScreenProps = StackScreenProps<MainTabParamList, 'Home'>;

// Color palettes for meter cards
const METER_COLOR_PALETTES = [
  { gradient: ['#4A90C4', '#34B87C'], shadow: '#4A90C4', icon: '#34B87C' }, // Blue to Green (Brand)
  { gradient: ['#8B5CF6', '#6366F1'], shadow: '#8B5CF6', icon: '#A78BFA' }, // Purple to Indigo
  { gradient: ['#F59E0B', '#F97316'], shadow: '#F59E0B', icon: '#FCD34D' }, // Amber to Orange
  { gradient: ['#EC4899', '#EF4444'], shadow: '#EC4899', icon: '#F9A8D4' }, // Pink to Red
  { gradient: ['#14B8A6', '#06B6D4'], shadow: '#14B8A6', icon: '#5EEAD4' }, // Teal to Cyan
  { gradient: ['#6366F1', '#8B5CF6'], shadow: '#6366F1', icon: '#C4B5FD' }, // Indigo to Purple
];

const getTransactionIcon = (name: string) => {
  if (name.includes('MTN')) return require('../assets/logos/mtn_logo.png');
  if (name.includes('Vodafone'))
    return require('../assets/logos/vodafone_logo.jpg');
  if (name.includes('Electricity') || name.includes('ECG'))
    return require('../assets/logos/ecg_logo.jpg');
  if (name.includes('Water Bill Payment') || name.includes('Water'))
    return require('../assets/logos/gwc_logo.jpg');
  if (name.includes('AirtelTigo'))
    return require('../assets/logos/airteltigo_logo.jpg');
  return require('../assets/mobile_app_icon.png');
};

const HomeScreen: React.FC<HomeScreenProps> = ({ route, navigation }) => {
  const { authData } = useAuth();
  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const bottomNavigator = useNavigation<StackNavigationProp<MainTabParamList>>();

  const dispatch = useDispatch<AppDispatch>();
  const { meters, loading } = useSelector((state: RootState) => state.meters);

  const [recentTx, setRecentTx] = useState<TransactionItem[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    dispatch(fetchMeters());
    fetchLatestTransactions();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch]);

  const fetchLatestTransactions = async () => {
    try {
      setTxLoading(true);
      const res = await getRecentTransactions();
      if (res.status === 'success') {
        const list = (res.data as unknown as TransactionItem[]) || [];
        const top = [...list]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          .slice(0, 5);
        setRecentTx(top);
      } else {
        Toast.show({
          type: 'error',
          text1: res.message || 'Failed to load recent transactions',
        });
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load recent transactions',
      });
    } finally {
      setTxLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Fetch both meters and transactions
      await Promise.all([
        dispatch(fetchMeters()).unwrap(),
        fetchLatestTransactions(),
      ]);

      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: 'Data updated successfully',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh Failed',
        text2: 'Unable to update data. Please try again.',
        position: 'bottom',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusText = (item: TransactionItem) => {
    if (item.PaymentStatus === 'SUCCESSFUL') {
      if (item.TxnStatus === 'COMPLETED' || item.TxnStatus === 'SUCCESSFUL') return 'SUCCESSFUL';
      if (item.TxnStatus === 'PENDING') return 'PENDING';
      if (item.TxnStatus === 'FAILED') return 'FAILED';
      return 'UNKNOWN';
    }
    if (item.PaymentStatus === 'ACCEPTED' || item.PaymentStatus === 'PENDING') {
      return 'PENDING';
    }
    if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
      return item.PaymentStatus;
    }
    return item.PaymentStatus || 'UNKNOWN';
  };

  const getStatusColor = (item: TransactionItem) => {
    if (item.PaymentStatus === 'SUCCESSFUL') {
      if (item.TxnStatus === 'COMPLETED' || item.TxnStatus === 'SUCCESSFUL') return '#10B981';
      if (item.TxnStatus === 'PENDING') return '#3B82F6';
      if (item.TxnStatus === 'FAILED') return '#EF4444';
      return '#6B7280';
    }
    if (item.PaymentStatus === 'ACCEPTED' || item.PaymentStatus === 'PENDING') {
      return '#F59E0B';
    }
    if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
      return '#EF4444';
    }
    return '#6B7280';
  };

  const renderBalanceCard = ({ item, index }: { item: Meter, index: number }) => {
    // Get color palette for this meter (cycles through available palettes)
    const colorPalette = METER_COLOR_PALETTES[index % METER_COLOR_PALETTES.length];

    return (
      <View style={[styles.balanceCard, { shadowColor: colorPalette.shadow }]}>
        <LinearGradient
          colors={colorPalette.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={colorPalette.icon} />
              <Text style={styles.cardTitle}>Power Meter</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.meterNumberContainer}>
            <Text style={styles.meterLabel}>Meter Number</Text>
            <Text style={styles.meterNumber}>{item.MeterNumber}</Text>
          </View>

          <View style={styles.customerInfoContainer}>
            <Feather name="user" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.customerName}>{item.CustomerName}</Text>
          </View>

          <TouchableOpacity
            style={styles.buyPowerButton}
            onPress={() => appNavigation.navigate('NewPurchase', { meterNumber: item.MeterNumber })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buyPowerGradient}
            >
              <Feather name="zap" size={18} color={colorPalette.gradient[1]} />
              <Text style={[styles.buyPowerText, { color: colorPalette.gradient[1] }]}>Buy Power</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyStateContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.avatarWrapper}>
        <UserAvatar
          firstName={authData?.user.first_name ?? 'Guest'}
          lastName={authData?.user.last_name ?? ''}
          size={100}
        />
        <View style={styles.avatarBadge}>
          <Feather name="zap" size={16} color="#34B87C" />
        </View>
      </View>

      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeText}>
          Welcome back,
        </Text>
        <Text style={styles.userName}>
          {authData?.user.first_name ?? 'Guest'} {authData?.user.last_name ?? ''}
        </Text>
        <Text style={styles.userEmail}>
          {authData?.user.email ?? 'N/A'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={() => appNavigation.navigate('NewPurchase')}
      >
        <LinearGradient
          colors={['#4A90C4', '#34B87C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.getStartedGradient}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Feather name="arrow-right" size={18} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => appNavigation.navigate('NewPurchase')}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#34B87C', '#2DA771']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionGradient}
        >
          <View style={styles.actionIconContainer}>
            {/*<Feather name="zap" size={24} color="white" />*/}
            <Image
              source={getTransactionIcon('ECG')}
              style={styles.transactionIcon}
              PlaceholderContent={<ActivityIndicator size="small" />}
            />
          </View>
          <Text style={styles.actionTitle}>Buy Power</Text>
          <Text style={styles.actionSubtitle}>Quick purchase</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => bottomNavigator.navigate('Transactions')}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#4A90C4', '#3B7FB5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionGradient}
        >
          <View style={styles.actionIconContainer}>
            <Feather name="list" size={24} color="white" />
          </View>
          <Text style={styles.actionTitle}>History</Text>
          <Text style={styles.actionSubtitle}>View transactions</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderRecentTxItem = (tx: TransactionItem, index: number) => {
    const label = tx.MeterType === "POSTPAID" ? "Postpaid Bill" : "Prepaid Purchase";
    const amount = Number(tx.Amount) || 0;
    const statusText = getStatusText(tx);
    const statusColor = getStatusColor(tx);

    return (
      <TouchableOpacity
        key={tx.id.toString() + '' + tx.created_at}
        style={styles.transactionCard}
        activeOpacity={0.7}
        onPress={() => appNavigation.navigate('TransactionDetails', {
          transaction: tx,
          refetchFunc: fetchLatestTransactions
        })}
      >
        <View style={styles.transactionIconContainer}>
          <Image
            source={getTransactionIcon('ECG')}
            style={styles.transactionIcon}
            PlaceholderContent={<ActivityIndicator size="small" />}
          />
        </View>

        <View style={styles.transactionContent}>
          <Text style={styles.transactionTitle}>{label}</Text>
          <Text style={styles.transactionDate}>
            {formatDateTime(tx.created_at)}
          </Text>
        </View>

        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>GHS {amount.toFixed(2)}</Text>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDotSmall, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F9FAFB', '#FFFFFF']}
        style={[
          styles.headerGradient,
          meters.length === 0 && styles.headerGradientEmpty
        ]}
      >
        {meters.length > 0 && (
          <>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <UserAvatar
                  firstName={authData?.user.first_name ?? 'Guest'}
                  lastName={authData?.user.last_name ?? ''}
                  size={60}
                  style={styles.headerAvatar}
                />
                <View>
                  <Text style={styles.headerGreeting}>{getGreeting()}</Text>
                  <Text style={styles.headerName}>
                    {authData?.user.first_name ?? 'Guest'}
                  </Text>
                </View>
              </View>
              {/*<TouchableOpacity style={styles.notificationButton}>*/}
              {/*  <Feather name="bell" size={22} color="#1F2937" />*/}
              {/*  <View style={styles.notificationDot} />*/}
              {/*</TouchableOpacity>*/}
            </View>

            <Divider />
          </>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4A90C4', '#34B87C']}
            tintColor="#4A90C4"
            progressBackgroundColor="#FFFFFF"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
      >
        {/* Balance Cards Section */}
        <Animated.View
          style={[
            styles.metersSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          {meters.length > 0 ? (
            <FlatList
              horizontal
              data={meters}
              renderItem={renderBalanceCard}
              keyExtractor={item => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.metersList}
              snapToInterval={SCREEN_WIDTH - 60}
              decelerationRate="fast"
              pagingEnabled
            />
          ) : (
            renderEmptyState()
          )}
        </Animated.View>

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Recent Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Text style={styles.sectionSubtitle}>Your latest transactions</Text>
            </View>
            <TouchableOpacity
              onPress={() => bottomNavigator.navigate('Transactions')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Feather name="arrow-right" size={16} color="#667eea" />
            </TouchableOpacity>
          </View>

          {txLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90C4" />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : recentTx.length > 0 ? (
            <View style={styles.transactionsList}>
              {recentTx.map((tx, index) => renderRecentTxItem(tx, index))}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <View style={styles.emptyIconContainer}>
                <Feather name="inbox" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTransactionsTitle}>No transactions yet</Text>
              <Text style={styles.emptyTransactionsText}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    // paddingTop: 50,
    // paddingBottom: 20,
    minHeight: 20,
  },
  headerGradientEmpty: {
    paddingTop: 0,
    paddingBottom: 0,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'center',
    backgroundPosition: 'center',
    resizeMode:'contain',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    elevation: 0,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  metersSection: {
    marginTop: 20,
  },
  metersList: {
    paddingHorizontal: 10,
  },
  balanceCard: {
    width: SCREEN_WIDTH - 60,
    marginRight: 16,
    borderRadius: 10,
    overflow: 'hidden',
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.3,
    // shadowRadius: 16,
    elevation: 0,
  },
  gradientCard: {
    padding: 20,
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FB923C',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FB923C',
  },
  meterNumberContainer: {
    marginBottom: 16,
  },
  meterLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  meterNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  customerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  customerName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  buyPowerButton: {
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  buyPowerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buyPowerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarContainer: {
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImage: {
    resizeMode: 'cover',
    width: '120%',
    height: '120%',
    transform: [{ translateY: -12 }],
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    // shadowColor: '#4A90C4',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 12,
    elevation: 0,
  },
  getStartedGradient: {
    flexDirection: 'row',
    width: Dimensions.get('window').width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    paddingHorizontal: 32,
    gap: 8,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 24,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    elevation: 0,
  },
  actionGradient: {
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  transactionsSection: {
    marginTop: 32,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90C4',
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    borderRadius: 5
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTransactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyTransactionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default HomeScreen;
