import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Tab, TabView, Text} from '@rneui/themed';
import {TransactionItem} from '../Types/Transaction';
import {
  getPendingTransactions,
  getCompletedTransactions,
} from '../services/TransactionService';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {
  AppStackParamList,
  MainTabParamList,
  TransactionStackParamList,
} from '../types/navigation';
import { primaryBtnColor, secondaryColor } from '../helpers/colors';
import { formatDateTime } from '../helpers/helpers';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

type TransactionScreenProps = {
  navigation: StackNavigationProp<any>;
};

type HomeScreenProps = StackScreenProps<MainTabParamList, 'Transactions'>;

const TransactionScreen: React.FC<HomeScreenProps> = () => {
  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pendingTransactions, setPendingTransactions] = useState<
    TransactionItem[]
  >([]);
  const [completedTransactions, setCompletedTransactions] = useState<
    TransactionItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const [pendingData, completedData] = await Promise.all([
        getPendingTransactions(),
        getCompletedTransactions(),
      ]);

      if (pendingData.status === 'success') {
        setPendingTransactions(pendingData.data || []);
      } else {
        Toast.show({
          type: 'error',
          text1: pendingData.message || 'Failed to load pending transactions',
        });
      }

      if (completedData.status === 'success') {
        setCompletedTransactions(completedData.data || []);
      } else {
        Toast.show({
          type: 'error',
          text1:
            completedData.message || 'Failed to load completed transactions',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An error occurred while fetching transactions',
      });
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = (val?: boolean) => {
    setRefreshing(val !== undefined ? val : true);
    fetchTransactions();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, []),
  );

  const getStatusText = (item: TransactionItem) => {
    if (item.PaymentStatus === 'SUCCESSFUL') {
      if (item.TxnStatus === 'COMPLETED' || item.TxnStatus === 'SUCCESSFUL') {
        return 'COMPLETED';
      } else if (item.TxnStatus === 'PENDING') {
        return 'PENDING';
      } else if (item.TxnStatus === 'FAILED') {
        return 'FAILED';
      } else {
        return 'UNKNOWN';
      }
    }
    else if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
      return item.PaymentStatus;
    } else {
      return item.PaymentStatus || 'UNKNOWN';
    }
  };

  const getStatusColor = (item: TransactionItem) => {
    if (item.PaymentStatus === 'SUCCESSFUL') {
      if (item.TxnStatus === 'COMPLETED' || item.TxnStatus === 'SUCCESSFUL') {
        return '#34B87C'; // Brand green
      }
      else if (item.TxnStatus === 'PENDING') {
        return '#FB923C'; // Orange
      }
      else if (item.TxnStatus === 'FAILED') {
        return '#EF4444'; // Red
      } else {
        return '#9CA3AF'; // Grey
      }
    } else if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
      return '#EF4444'; // Red
    }
    return '#9CA3AF'; // Grey default
  };

  const getStatusIcon = (item: TransactionItem) => {
    if (item.PaymentStatus === 'SUCCESSFUL') {
      if (item.TxnStatus === 'COMPLETED' || item.TxnStatus === 'SUCCESSFUL') {
        return 'check-circle';
      } else if (item.TxnStatus === 'PENDING') {
        return 'clock';
      } else if (item.TxnStatus === 'FAILED') {
        return 'x-circle';
      }
    } else if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
      return 'x-circle';
    }
    return 'alert-circle';
  };

  const renderTransactionItem = ({item, index}: {item: TransactionItem, index: number}) => (
    <TouchableOpacity
      onPress={() =>
        appNavigation.navigate('TransactionDetails', {
          transaction: item,
          refetchFunc: handleRefresh,
        })
      }
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.transactionCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Left accent border */}
        <View
          style={[
            styles.accentBorder,
            { backgroundColor: getStatusColor(item) }
          ]}
        />

        <View style={styles.cardContent}>
          {/* Header Section */}
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color="#4A90C4"
              />
            </View>
            <View style={styles.headerInfo}>
              {
                item.MeterType === 'POSTPAID' ? (
                  <Text style={styles.transactionType}>Postpaid Bill</Text>
                ) : (
                  <Text style={styles.transactionType}>Prepaid Purchase</Text>
                )
              }
              <View style={styles.meterRow}>
                <Feather name="zap" size={12} color="#6B7280" />
                <Text style={styles.meterInfo}>
                  {item.MeterNumber || 'N/A'} • {item.MeterType || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.currencyLabel}>GHS</Text>
              <Text style={styles.transactionAmount}>
                {Number(item.Amount).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Status and Date Section */}
          <View style={styles.cardFooter}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) + '20' }]}>
              <Feather
                name={getStatusIcon(item)}
                size={12}
                color={getStatusColor(item)}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item) }]}>
                {getStatusText(item)}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Feather name="calendar" size={12} color="#9CA3AF" />
              <Text style={styles.dateText}>
                {formatDateTime(item.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Feather name="chevron-right" size={20} color="#D1D5DB" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Feather name="inbox" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90C4" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/*<LinearGradient*/}
      {/*  colors={['#F9FAFB', '#FFFFFF']}*/}
      {/*  style={styles.headerGradient}*/}
      {/*>*/}
      {/*  <View style={styles.header}>*/}
      {/*    <Text style={styles.headerTitle}>Transactions</Text>*/}
      {/*    <TouchableOpacity style={styles.filterButton}>*/}
      {/*      <Feather name="filter" size={20} color="#4A90C4" />*/}
      {/*    </TouchableOpacity>*/}
      {/*  </View>*/}
      {/*</LinearGradient>*/}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Tab
          value={activeTab}
          onChange={e => setActiveTab(e)}
          indicatorStyle={styles.tabIndicator}
          containerStyle={styles.tabBar}
        >
          <Tab.Item
            title={`PENDING (${pendingTransactions.length})`}
            titleStyle={activeTab === 0 ? styles.activeTabTitle : styles.tabTitle}
            containerStyle={styles.tabItemContainer}
          />
          <Tab.Item
            title={`COMPLETED (${completedTransactions.length})`}
            titleStyle={activeTab === 1 ? styles.activeTabTitle : styles.tabTitle}
            containerStyle={styles.tabItemContainer}
          />
        </Tab>
      </View>

      {/* Tab Content */}
      <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <FlatList
            data={pendingTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            ListEmptyComponent={renderEmptyState('No pending transactions found')}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </TabView.Item>
        <TabView.Item style={styles.tabViewItem}>
          <FlatList
            data={completedTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            ListEmptyComponent={renderEmptyState('No completed transactions found')}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBar: {
    backgroundColor: 'transparent',
  },
  tabIndicator: {
    backgroundColor: '#4A90C4',
    height: 3,
  },
  tabItemContainer: {
    backgroundColor: 'transparent',
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  tabViewItem: {
    width: '100%',
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 5,
    paddingBottom: 32,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 0.5,
    overflow: 'hidden',
  },
  accentBorder: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meterInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  currencyLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
});

export default TransactionScreen;
