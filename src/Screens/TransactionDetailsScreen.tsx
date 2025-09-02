import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {TransactionItem} from '../Types/Transaction';
import {CancelTransaction} from '../services/TransactionService';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {CancelBtn} from '../components/CancelBtn';
import {primaryBtnColor} from '../helpers/colors';

type RootStackParamList = {
  TransactionDetails: {transaction: TransactionItem};
};

type TransactionDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'TransactionDetails'
>;
type TransactionDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TransactionDetails'
>;

type Props = {
  route: TransactionDetailsScreenRouteProp;
  navigation: TransactionDetailsScreenNavigationProp;
};

const TransactionDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {transaction, refetchFunc} = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatPhoneNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    const num = accountNumber.split('.')[0];
    if (num.length === 9 || num.length === 10) {
      return `0${num.substring(num.length - 9)}`;
    }
    return num;
  };

const getStatusText = () => {
      // Completed tab      if (item.PaymentStatus === 'SUCCESSFUL') {
        if (transaction.TxnStatus === 'COMPLETED') {
          return 'COMPLETED';
        } else if (transaction.TxnStatus === 'PENDING') {
          return 'PENDING METER DELIVERY';
        } else if (transaction.TxnStatus === 'FAILED') {
          return 'FAILED';
        } else if (transaction.PaymentStatus === 'EXPIRED' || transaction.PaymentStatus === 'CANCELLED') {
        return transaction.PaymentStatus;
      }else{
        return transaction.PaymentStatus || 'UNKNOWN STATUS';
      }
    
  };

    const getStatusColor = () => {
        if( transaction.PaymentStatus === 'SUCCESSFUL') {
          if (transaction.TxnStatus === 'COMPLETED') {
            return '#4CAF50'; // Green for completed
          }
          else if (transaction.TxnStatus === 'PENDING') {
            return '#007AFF'; // Orange for pending 
          }
          else if (transaction.TxnStatus === 'FAILED') {
            return '#F44336'; // Red for failed
          }
        }
        else if (transaction.PaymentStatus === 'EXPIRED' || transaction.PaymentStatus === 'CANCELLED') {
          return '#F44336'; // Red for expired or cancelled
        }

    };

  const isPendingPayment = () => {
    return (
      transaction.PaymentStatus !== 'success' &&
      transaction.PaymentStatus !== 'cancelled'
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Transaction',
      'Are you sure you want to cancel this transaction?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const res = await CancelTransaction({
                TxnID: transaction.EqUuid,
              });

              if (res.status === 'success') {
                refetchFunc(true); // Call the refetch function
                Alert.alert('Success', 'Transaction cancelled successfully');
                navigation.goBack();
              } else {
                Alert.alert(
                  'Error',
                  res.message || 'Failed to cancel transaction',
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'An error occurred while cancelling the transaction',
              );
              console.error(error);
            }
          },
        },
      ],
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          {/* <Text style={styles.title}>
            {transaction.TxType === 'charge'
              ? 'Meter Charge'
              : 'Power Purchase'}
          </Text> */}

           <Text style={styles.title}>
            {'PREPAID ONLINE'}
          </Text>
          <Text style={[styles.amount, {color: '#007AFF'}]}>
            GHS {transaction.Amount}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {getStatusText()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <TransactionIDRow
            label="Transaction ID"
            value={transaction.EqUuid || 'N/A'}
          />
          <DetailRow label="Date" value={formatDate(transaction.created_at)} />
          <DetailRow
            label="Payment Mode"
            value={transaction.PaymentMode || 'N/A'}
          />
          <DetailRow
            label="Payment Channel"
            value={transaction.PaymentChannel || 'N/A'}
          />
          {/* {transaction.AsyncId && <DetailRow label="Async ID" value={transaction.AsyncId} />}
          {transaction.ExternalTransactionId && (
            <DetailRow label="External Transaction ID" value={transaction.ExternalTransactionId} />
          )}
          {transaction.InstitutionApprovalCode && (
            <DetailRow label="Approval Code" value={transaction.InstitutionApprovalCode} />
          )} */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meter Information</Text>
          <DetailRow
            label="Meter Number"
            value={transaction.MeterNumber || 'N/A'}
          />
          <DetailRow
            label="Meter Type"
            value={transaction.MeterType || 'N/A'}
          />
          <DetailRow
            label="Meter Serial"
            value={transaction.MeterSerial || 'N/A'}
          />
          <DetailRow
            label="Customer Name"
            value={transaction.CustomerName || 'N/A'}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <DetailRow
            label="Account Number"
            value={formatPhoneNumber(transaction.AccountNumber)}
          />
          <DetailRow
            label="Charge Value"
            value={`GHS ${transaction.ChargeValue || '0.00'}`}
          />
          {transaction.PaymentBy && (
            <DetailRow label="Payment By" value={transaction.PaymentBy} />
          )}
          {transaction.PaymentNaration && (
            <DetailRow label="Narration" value={transaction.PaymentNaration} />
          )}
        </View>

        {/* {transaction.PaymentMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message</Text>
            <Text style={styles.messageText}>{transaction.PaymentMessage}</Text>
          </View>
        )} */}

        {/* {isPendingPayment() && transaction.TxnStatus != 'cancelled' && (
          <View style={styles.buttonContainer}>
            <CancelBtn
              color={'red'}
              onPress={handleCancel}
              style={{flex: 1, width: '90%'}}
              title={'Cancel '}
            />

            <CancelBtn
              onPress={() => {
                handleRetry();
              }}
              style={{flex: 1, backgroundColor: primaryBtnColor, width: '80%'}}
              title={'Retry Payment'}
            />
          </View>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, {textTransform: 'uppercase'}]}>
      {value}
    </Text>
  </View>
);

const TransactionIDRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    // fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  amount: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0.5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    // width: '100%',
    flex: 1,
  },
  button: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#FF5722',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TransactionDetailsScreen;
