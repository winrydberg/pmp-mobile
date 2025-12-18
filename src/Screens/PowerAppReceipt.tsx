import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Animated,
  Image
} from 'react-native';
import { Text } from '@rneui/themed';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../types/navigation';
import Toast from 'react-native-toast-message';
import { TransactionItem } from '../Types/Transaction';
import Share from 'react-native-share';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ViewShot from 'react-native-view-shot';

interface PowerAppReceiptProps {
  route: {
    params: {
      transaction: TransactionItem;
    };
  };
}

const PowerAppReceipt: React.FC<PowerAppReceiptProps> = ({ route }) => {
  const { transaction } = route.params;
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const viewShotRef = React.useRef<ViewShot>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${month} ${day}, ${year} | ${hours}:${minutes} AM`;
  };

  const getPaymentMethod = () => {
    const channel = transaction.PaymentChannel || 'Mobile Money';
    const accountNumber = transaction.AccountNumber || '';
    return `${channel} - ${accountNumber}`;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save the receipt',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleSaveToGallery = async () => {
    if (!viewShotRef.current) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to capture receipt',
      });
      return;
    }

    try {
      setSaving(true);

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Storage permission is required to save receipt',
        });
        setSaving(false);
        return;
      }

      const uri = await viewShotRef.current.capture();

      const { dirs } = ReactNativeBlobUtil.fs;
      const fileName = `receipt-${transaction.EqUuid}.jpg`;
      const filePath = `${dirs.PictureDir}/${fileName}`;

      await ReactNativeBlobUtil.fs.cp(uri, filePath);

      if (Platform.OS === 'android') {
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: 'image/jpeg',
          },
          'Pictures',
          filePath
        );
      }

      setSaving(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Receipt saved to gallery',
      });
    } catch (error: any) {
      console.error('Error saving to gallery:', error);
      setSaving(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save receipt',
      });
    }
  };

  const handleShareReceipt = async () => {
    if (!viewShotRef.current) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to capture receipt',
      });
      return;
    }

    try {
      setSharing(true);

      const uri = await viewShotRef.current.capture();

      const shareOptions = {
        title: 'Transaction Receipt',
        message: `BuyPower GH Receipt - ${transaction.EqUuid}`,
        url: Platform.OS === 'android' ? `file://${uri}` : uri,
        type: 'image/jpeg',
        subject: 'Transaction Receipt',
      };

      await Share.open(shareOptions);
      setSharing(false);
    } catch (error: any) {
      setSharing(false);
      if (error.message !== 'User did not share') {
        console.error('Error sharing receipt:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to share receipt',
        });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    // You'll need to import Clipboard from '@react-native-clipboard/clipboard'
    Toast.show({
      type: 'success',
      text1: 'Copied',
      text2: 'Token copied to clipboard',
    });
  };

  return (
    <SafeAreaView style={styles.container}>


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
            <View style={styles.receiptCard}>
              {/* Header Section */}
              <View style={styles.receiptHeader}>
                <View style={styles.logoContainer}>
                  <View style={styles.logo}>
                    {/* ECG Logo placeholder - you can add actual image */}
                    <Image source={require('../assets/logos/ecg.jpg')} style={{ height: 70, width: 70 }} />
                  </View>
                </View>
                <View style={styles.receiptTitleContainer}>
                  <Text style={styles.receiptTitle}>RECEIPT</Text>
                  <Text style={styles.receiptNumber}>{transaction.EcollectTransactionId}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Paid</Text>
                  </View>
                </View>
              </View>

              {/* Company Info */}
              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>

                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>Electricity Company of Ghana</Text>
                  <Text style={styles.companyAddress}>Electro-Volta House</Text>
                  <Text style={styles.companyAddress}>P. O. Box GP 521 - Accra</Text>
                  <Text style={styles.companyAddress}>GA-145-7445</Text>
                </View>
                <View style={styles.infoRight}>
                  <Text style={styles.customerName}>{transaction.CustomerName || 'N/A'}</Text>
                  <Text style={styles.customerPhone}>{transaction.AccountNumber}</Text>
                  <Text style={styles.statusLabel}>Status</Text>
                  <Text style={styles.statusValue}>{transaction.TxnStatus}</Text>
                </View>

              </View>

              {/* Customer Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Payment Method</Text>
                    <Text style={styles.infoValue}>{getPaymentMethod()}</Text>
                  </View>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Date & Time</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(transaction.EcollectResponseDate || transaction.created_at)}
                    </Text>
                  </View>
                </View>

              </View>

              {/* Transaction Details Table */}
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Description</Text>
                  <Text style={styles.tableHeaderText}>Amount</Text>
                </View>

                <View style={styles.tableRow}>
                  <View style={styles.tableDescriptionCell}>
                    <Text style={styles.tableDescription}>Smart meter topup</Text>
                    <Text style={styles.tableMeterInfo}>Meter no. ({transaction.MeterNumber})</Text>
                    <Text style={styles.tableMeterType}>({transaction.MeterType})</Text>
                  </View>
                  <Text style={styles.tableAmount}>GHS {parseFloat(transaction.Amount).toFixed(2)}</Text>
                </View>

                <View style={styles.tableDivider} />

                <View style={styles.tableRow}>
                  <Text style={styles.tableSubtotalLabel}>Subtotal</Text>
                  <Text style={styles.tableSubtotalAmount}>GHS {parseFloat(transaction.Amount).toFixed(2)}</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.tableServiceLabel}>Service Charge</Text>
                  <Text style={styles.tableServiceAmount}>GHS 0.00</Text>
                </View>

                <View style={styles.tableDivider} />

                <View style={styles.tableTotalRow}>
                  <Text style={styles.tableTotalLabel}>Amount Paid</Text>
                  <Text style={styles.tableTotalAmount}>GHS {parseFloat(transaction.Amount).toFixed(2)}</Text>
                </View>
              </View>

              {/* Additional Information */}
              <View style={styles.additionalInfo}>
                <View style={styles.additionalRow}>
                  <View style={styles.additionalLeft}>
                    <Text style={styles.additionalLabel}>Customer Address</Text>
                    <Text style={styles.additionalValue}>{transaction.Address || '6290-, St1 - Achimota - U...'}</Text>
                  </View>
                  <View style={styles.additionalRight}>
                    <Text style={styles.additionalLabel}>Account No</Text>
                    <Text style={styles.additionalValue}>{transaction.MeterNumber}</Text>
                  </View>
                </View>

                <View style={styles.additionalRow}>
                  <View style={styles.additionalLeft}>
                    <Text style={styles.additionalLabel}>Activity</Text>
                    <Text style={styles.additionalValue}>{transaction.AcitvityName || 'NA'}</Text>
                  </View>
                  <View style={styles.additionalRight}>
                    <Text style={styles.additionalLabel}>District</Text>
                    <Text style={styles.additionalValue}>Achimota</Text>
                  </View>
                </View>

                {
                  transaction.EcollectRechargeToken && (
                    <View style={styles.tokenSection}>
                      <Text style={styles.tokenLabel}>Recharge Token</Text>
                      <View style={styles.tokenContainer}>
                        <Text style={styles.tokenValue}>
                          {transaction.EcollectRechargeToken || '0231-1831-9808-7159-5202'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(transaction.EcollectRechargeToken || '')}
                          style={styles.copyIcon}
                        >
                          <Feather name="copy" size={18} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }


                <View style={styles.paymentIdRow}>
                  <Text style={styles.paymentIdLabel}>Payment ID</Text>
                  <Text style={styles.paymentIdValue}>{transaction.EqUuid}</Text>
                </View>
              </View>
            </View>
          </ViewShot>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveToGallery}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Text style={styles.saveButtonText}>SAVE TO GALLERY</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShareReceipt}
              disabled={sharing}
              activeOpacity={0.8}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#1F2937" />
              ) : (
                <Text style={styles.shareButtonText}>SHARE RECEIPT</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  header: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    // padding: 16,
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    overflow: 'hidden',
  },
  receiptHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  receiptTitleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  receiptTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  companyInfo: {
    // paddingHorizontal: 16,
    paddingVertical: 12,
  },
  companyName: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 1,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoLeft: {
    flex: 1,
  },
  infoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  tableContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableDescriptionCell: {
    flex: 1,
  },
  tableDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  tableMeterInfo: {
    fontSize: 12,
    color: '#6B7280',
  },
  tableMeterType: {
    fontSize: 12,
    color: '#6B7280',
  },
  tableAmount: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  tableSubtotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  tableSubtotalAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  tableServiceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  tableServiceAmount: {
    fontSize: 14,
    color: '#6B7280',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  tableTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  tableTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  additionalInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  additionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  additionalLeft: {
    flex: 1,
  },
  additionalRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  additionalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  additionalValue: {
    fontSize: 13,
    color: '#1F2937',
  },
  tokenSection: {
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tokenValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  copyIcon: {
    padding: 4,
  },
  paymentIdRow: {
    marginTop: 8,
  },
  paymentIdLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  paymentIdValue: {
    fontSize: 11,
    color: '#6B7280',
  },
  actionButtons: {
    marginLeft: 8,
    marginRight: 8,
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default PowerAppReceipt;
