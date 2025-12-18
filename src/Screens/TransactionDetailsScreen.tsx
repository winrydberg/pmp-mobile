import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Clipboard,
  Share,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {TransactionItem} from '../Types/Transaction';
import {PrimaryBtn} from '../components/PrimaryBtn';
import { Text } from '@rneui/themed';

import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
type RootStackParamList = {
  TransactionDetails: {transaction: TransactionItem; refetchFunc?: (reload?: boolean) => void };
  TransactionReceipt: {transaction: TransactionItem};
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
  const {transaction} = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    console.log("Transaction Details Loaded:", transaction);
  }, []);

  const formatPhoneNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'N/A';
    const num = accountNumber.split('.')[0];
    if (num.length === 9 || num.length === 10) {
      return `0${num.substring(num.length - 9)}`;
    }
    return num;
  };

  const getStatusText = () => {
    if (transaction.TxnStatus === 'COMPLETED') {
      return 'COMPLETED';
    } else if (transaction.TxnStatus === 'PENDING') {
      return 'PENDING METER DELIVERY';
    } else if (transaction.TxnStatus === 'FAILED') {
      return 'FAILED';
    } else if (transaction.PaymentStatus === 'EXPIRED' || transaction.PaymentStatus === 'CANCELLED') {
      return transaction.PaymentStatus;
    } else {
      return transaction.PaymentStatus || 'UNKNOWN STATUS';
    }
  };

  const getStatusColor = () => {
    if (transaction.PaymentStatus === 'SUCCESSFUL') {
      if (transaction.TxnStatus === 'COMPLETED' || transaction.TxnStatus === 'SUCCESSFUL') {
        return '#34B87C';
      } else if (transaction.TxnStatus === 'PENDING') {
        return '#4A90C4';
      } else if (transaction.TxnStatus === 'FAILED') {
        return '#EF4444';
      }
    } else if (transaction.PaymentStatus === 'EXPIRED' || transaction.PaymentStatus === 'CANCELLED') {
      return '#EF4444';
    }
    return '#9CA3AF';
  };

  const getStatusIcon = () => {
    if (transaction.PaymentStatus === 'SUCCESSFUL') {
      if (transaction.TxnStatus === 'COMPLETED' || transaction.TxnStatus === 'SUCCESSFUL') {
        return 'check-circle';
      } else if (transaction.TxnStatus === 'PENDING') {
        return 'clock';
      } else if (transaction.TxnStatus === 'FAILED') {
        return 'x-circle';
      }
    } else if (transaction.PaymentStatus === 'EXPIRED') {
      return 'alert-circle';
    } else if (transaction.PaymentStatus === 'CANCELLED') {
      return 'x-circle';
    }
    return 'help-circle';
  };

  const handlePrintReceipt = () => {
    navigation.navigate('TransactionReceipt', { transaction });
  };

  const handlePrintReceiptBase64 = () => {
    navigation.navigate('TransactionReceiptBase64', { transaction });
  };
  const handlePowerAppReceipt = () => {
    navigation.navigate('PowerAppReceipt', { transaction });
  };


  const handleCopyToClipboard = () => {
    Clipboard.setString(transaction.EcollectRechargeToken);
    Toast.show({
      text1: 'Token Copied',
      text2: 'Recharge token has been copied to clipboard.',
      type: 'success',
    });
  };

  const handleShareToken = async () => {
    try {
      await Share.share({
        message: `Your Recharge Token is: ${transaction.EcollectRechargeToken}`,
      });
      Toast.show({
        text1: 'Token Shared',
        text2: 'Recharge token has been shared successfully.',
        type: 'success',
      });
    } catch (error) {
      Toast.show({
        text1: 'Share Failed',
        text2: 'Failed to share the recharge token.',
        type: 'error',
      });
    }
  };

  // Check if we should show the Print PDF button
  const shouldShowPrintButton = () => {
    return (
      transaction.TxnStatus === 'SUCCESSFUL' ||
      transaction.TxnStatus === 'COMPLETED'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          !shouldShowPrintButton() && styles.scrollContainerNoPadding
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card with Gradient */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#4A90C4', '#34B87C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerIconContainer}>
              <Image
                source={require('../assets/logos/ecg_logo.jpg')}
                style={styles.headerIconImage}
              />
            </View>
            {
              transaction.MeterType === 'POSTPAID' ? (

                <Text style={styles.headerTitle}>POSTPAID ONLINE</Text>

              ) : (

                <Text style={styles.headerTitle}>PREPAID ONLINE</Text>

              )
            }
            <Text style={styles.headerAmount}>GHS {transaction.Amount}</Text>
          </LinearGradient>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor() + '15' }]}>
          <View style={styles.statusContent}>
            <Feather name={getStatusIcon()} size={24} color={getStatusColor()} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Recharge Token Card - Only show when SUCCESSFUL/COMPLETED and token exists */}
        {shouldShowPrintButton() && transaction.EcollectRechargeToken && (
          <View style={styles.tokenCard}>
            <LinearGradient
              colors={['#34B87C', '#2DA771']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tokenGradient}
            >
              <View style={styles.tokenHeader}>
                <Feather name="key" size={20} color="white" />
                <Text style={styles.tokenTitle}>Recharge Token</Text>
              </View>
              <View style={styles.tokenValueContainer}>
                <Text style={styles.tokenValue}>{transaction.EcollectRechargeToken}</Text>
              </View>

              {/* Copy and Share Buttons */}
              <View style={styles.tokenActionsRow}>
                <TouchableOpacity
                  style={styles.tokenActionButton}
                  onPress={handleCopyToClipboard}
                  activeOpacity={0.7}
                >
                  <Feather name="copy" size={18} color="white" />
                  <Text style={styles.tokenActionText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.tokenActionButton}
                  onPress={handleShareToken}
                  activeOpacity={0.7}
                >
                  <Feather name="share-2" size={18} color="white" />
                  <Text style={styles.tokenActionText}>Share</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tokenFooter}>
                <Feather name="info" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.tokenFooterText}>Use this token to recharge your meter</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Transaction Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={20} color="#4A90C4" />
            <Text style={styles.sectionTitle}>Transaction Details</Text>
          </View>
          <TransactionIDRow
            label="Transaction ID"
            value={transaction.EqUuid || 'N/A'}
            icon="hash"
          />
          <DetailRow
            label="Date"
            value={formatDate(transaction.created_at)}
            icon="calendar"
          />
          <DetailRow
            label="Payment Mode"
            value={transaction.PaymentMode || 'N/A'}
            icon="credit-card"
          />
          <DetailRow
            label="Payment Channel"
            value={transaction.PaymentChannel || 'N/A'}
            icon="smartphone"
          />
        </View>

        {/* Meter Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="zap" size={20} color="#34B87C" />
            <Text style={styles.sectionTitle}>Meter Information</Text>
          </View>
          <DetailRow
            label="Meter Number"
            value={transaction.MeterNumber || 'N/A'}
            icon="grid"
          />
          <DetailRow
            label="Meter Type"
            value={transaction.MeterType || 'N/A'}
            icon="box"
          />
          <DetailRow
            label="Meter Serial"
            value={transaction.MeterSerial || 'N/A'}
            icon="tag"
          />
          <DetailRow
            label="Customer Name"
            value={transaction.CustomerName || 'N/A'}
            icon="user"
          />
        </View>

        {/* Payment Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="dollar-sign" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Payment Information</Text>
          </View>
          <DetailRow
            label="Account Number"
            value={formatPhoneNumber(transaction.AccountNumber)}
            icon="phone"
          />
          <DetailRow
            label="Charge Value"
            value={`GHS ${transaction.ChargeValue || '0.00'}`}
            icon="trending-up"
          />
          {transaction.PaymentBy && (
            <DetailRow
              label="Payment By"
              value={transaction.PaymentBy}
              icon="user-check"
            />
          )}
          {transaction.PaymentNaration && (
            <DetailRow
              label="Narration"
              value={transaction.PaymentNaration}
              icon="message-square"
            />
          )}
        </View>
      </ScrollView>

      {/* Fixed bottom button - Only show when transaction is SUCCESSFUL and COMPLETED */}
      {shouldShowPrintButton() && (
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={styles.printButton}
            onPress={handlePowerAppReceipt}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4A90C4', '#34B87C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.printButtonGradient}
            >
              <Feather name="file-text" size={20} color="white" />
              <Text style={styles.printButtonText}>View Receipt</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const DetailRow = ({label, value, icon}: {label: string; value: string; icon?: string}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      {icon && <Feather name={icon} size={14} color="#6B7280" style={styles.detailIcon} />}
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={styles.detailValue}>
      {value}
    </Text>
  </View>
);

const TransactionIDRow = ({label, value, icon}: {label: string; value: string; icon?: string}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      {icon && <Feather name={icon} size={14} color="#6B7280" style={styles.detailIcon} />}
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, styles.transactionId]} numberOfLines={1} ellipsizeMode="middle">
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  scrollContainerNoPadding: {
    paddingBottom: 20,
  },
  headerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 0.5,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    borderRadius: 5
  },
  headerTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  statusCard: {
    // borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 0.5,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tokenCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 0.5,
  },
  tokenGradient: {
    padding: 16,
    paddingBottom: 24,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  tokenValueContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  tokenValue: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  tokenActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tokenActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tokenActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  tokenFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tokenFooterText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  transactionId: {
    textTransform: 'none',
    fontSize: 12,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  printButtonHalf: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0.5,
  },
  printButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 0.5,
  },
  printButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default TransactionDetailsScreen;
