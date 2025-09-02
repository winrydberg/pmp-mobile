import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Tab, TabView} from '@rneui/themed';
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

// type TransactionScreenProps = {
//   // Add any props if needed
// };

type TransactionScreenProps = {
  navigation: StackNavigationProp<any>; // Add this line
};

type HomeScreenProps = StackScreenProps<MainTabParamList, 'Transactions'>;

const TransactionScreen: React.FC<HomeScreenProps> = () => {
  // const appNavigation = useNavigation<StackNavigationProp<TransactionStackParamList>>();
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

  // const handleRefresh = () => {
  //   setRefreshing(true);
  //   fetchTransactions();
  // };

  const handleRefresh = (val?: boolean) => {
    setRefreshing(val !== undefined ? val : true);
    fetchTransactions();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, []),
  );

  const formatPhoneNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    // Remove decimal part if exists
    const num = accountNumber.split('.')[0];
    // Format as phone number if it's 9-10 digits
    if (num.length === 9 || num.length === 10) {
      return `0${num.substring(num.length - 9)}`;
    }
    return num;
  };

  const getStatusText = (item: TransactionItem) => {
    // if (activeTab === 1) {
      // Completed tab
      if (item.PaymentStatus === 'SUCCESSFUL') {
        if (item.TxnStatus === 'COMPLETED') {
          return 'COMPLETED';
        } else if (item.TxnStatus === 'PENDING') {
          return 'PENDING METER DELIVERY';
        } else if (item.TxnStatus === 'FAILED') {
          return 'FAILED';
        } else {
          console.warn('Unknown TxnStatus:', item.TxnStatus);
          return 'UNKNOWN STATUS';
        }
      }
      else if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
        return item.PaymentStatus;
      }else{
        return item.PaymentStatus || 'UNKNOWN STATUS';
      }
    
  };

  const getStatusColor = (item: TransactionItem) => {
    // if (activeTab === 1) {
      // Completed tab
      if( item.PaymentStatus === 'SUCCESSFUL') {
        if (item.TxnStatus === 'COMPLETED') {
          return '#4CAF50'; // Green for completed
        }
        else if (item.TxnStatus === 'PENDING') {
          return '#007AFF'; // Orange for pending 
        }
        else if (item.TxnStatus === 'FAILED') {
          return '#F44336'; // Red for failed
        }else{
          console.warn('Unknown TxnStatus:', item.TxnStatus);
          // Default color if TxnStatus is unknown
          return '#9E9E9E'; // Grey for unknown
        }
      }else if (item.PaymentStatus === 'EXPIRED' || item.PaymentStatus === 'CANCELLED') {
        return '#F44336'; // Red for expired or cancelled
      }

    // }else{
    //   // Pending tab
    //   return '#FF9800'; // Orange for pending payment
    // }
  };

  const renderTransactionItem = ({item}: {item: TransactionItem}) => (
    <TouchableOpacity
      onPress={() =>
        appNavigation.navigate('TransactionDetails', {
          transaction: item,
          refetchFunc: handleRefresh, // Pass the handleRefresh function directly
        })
      }>
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <View>
            {/* <Text style={styles.transactionType}>
              {item.TxType === 'charge'
                ? 'Meter Charge'
                : 'Electricity Payment'}
            </Text> */}
             <Text style={styles.transactionType}>
              {'PREPAID ONLINE'}
            </Text>
            <Text style={styles.meterInfo}>
              METER NO: {item.MeterNumber || 'N/A'} ({item.MeterType || 'N/A'})
            </Text>
          </View>
          <Text style={[styles.transactionAmount, {color: '#007AFF'}]}>
            GHS {item.Amount}
          </Text>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.detailText}>
            {/* <Text style={styles.detailLabel}>Status: </Text> */}
            <Text style={[styles.detailValue, {color: getStatusColor(item)}]}>
              {getStatusText(item)}
            </Text>
          </Text>


          <Text style={styles.detailText}>
            {/* <Text style={styles.detailLabel}>Date: </Text> */}
            <Text style={[styles.detailValue, {fontSize: 10, color:'gray'}]}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Tab
        value={activeTab}
        onChange={e => setActiveTab(e)}
        indicatorStyle={styles.tabIndicator}>
        <Tab.Item
          title="PENDING"
          titleStyle={activeTab === 0 ? styles.activeTabTitle : styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
        <Tab.Item
          title="COMPLETED"
          titleStyle={activeTab === 1 ? styles.activeTabTitle : styles.tabTitle}
          containerStyle={styles.tabContainer}
        />
      </Tab>

      <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
        <TabView.Item style={styles.tabViewItem}>
          <FlatList
            data={pendingTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No pending transactions found
              </Text>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </TabView.Item>
        <TabView.Item style={styles.tabViewItem}>
          <FlatList
            data={completedTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No completed transactions found
              </Text>
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </TabView.Item>
      </TabView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIndicator: {
    backgroundColor: '#007AFF',
    height: 3,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tabContainer: {
    backgroundColor: 'transparent',
  },
  tabViewItem: {
    width: '100%',
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  meterInfo: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 13,
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize:13,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
});

export default TransactionScreen;
