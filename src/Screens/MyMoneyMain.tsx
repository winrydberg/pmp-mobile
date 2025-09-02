import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {Avatar, Divider, ListItem, BottomSheet} from '@rneui/themed';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
// import {SecondaryBtn, PrimaryBtn} from '../components';
import {Wallet, WalletsResponse} from '../types/wallet';
import {GetWallets, SetDefaultWallet} from '../services/WalletService';
import {Image} from '@rneui/base';
import { SecondaryBtn } from '../components/SecondaryBtn';
import { PrimaryBtn } from '../components/PrimaryBtn';

const networkLogos: Record<string, any> = {
  MTN: require('../assets/logos/mtn_logo.png'),
  TELECEL: require('../assets/logos/vodafone_logo.jpg'),
  AIRTELTIGO: require('../assets/logos/airteltigo_logo.jpg'),
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
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

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
      Alert.alert('Info', 'This is already your default payment method');
      return;
    }
    setSelectedWallet(wallet);
    setIsBottomSheetVisible(true);
  };

  const handleSetDefault = async () => {
    if (!selectedWallet) return;
    
    try {
      setIsBottomSheetVisible(false);
      setLoading(true);
      
      const response = await SetDefaultWallet(selectedWallet.EqUuid);
      
      if (response.success === true) {
        await fetchWallets(); // Refresh the list
        Alert.alert('Success', 'Default payment method updated');
      } else {
        Alert.alert('Error', response.message || 'Failed to update default payment method');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating default payment method');
    } finally {
      setLoading(false);
    }
  };

  const defaultPaymentMethod = paymentMethods.find(method => method.IsDefault);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <SecondaryBtn
          onPress={onRefresh}
          icon={<Ionicons name="refresh" color={'white'} size={16} />}
          loading={refreshing}
          title="Try Again"
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#30a280']}
            tintColor="#30a280"
          />
        }>
        {/* Active Account */}
        <View style={styles.activeAccountContainer}>
          <View>
            <Text style={styles.activeAccountLabel}>Active Account:</Text>
            {defaultPaymentMethod ? (
              <Text style={styles.activeAccountNumber}>
                {defaultPaymentMethod.AccNumber}
              </Text>
            ) : (
              <Text style={styles.noAccountText}>N/A</Text>
            )}
          </View>
          <SecondaryBtn
            onPress={() =>
              navigation.push('AddWallet', {
                callback: () => callbackRefresher(),
              })
            }
            icon={<Ionicons name="add-circle" color={'white'} size={16} />}
            loading={false}
            title="Add Payment Method"
          />
        </View>

        <Divider style={styles.divider} />

        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <View style={styles.noMethodsContainer}>
            <Text style={styles.noMethodsTitle}>No payment methods found</Text>
            <Text style={styles.noMethodsText}>
              You haven't added any payment methods yet.
            </Text>
          </View>
        ) : (
          paymentMethods.map(method => (
            <ListItem
              key={method.id}
              bottomDivider
              onPress={() => handleWalletPress(method)}>
              <Image
                source={networkLogos[method.Network]}
                style={styles.imageStyle}
                PlaceholderContent={<ActivityIndicator />}
              />
              <ListItem.Content>
                <ListItem.Title style={styles.listItemTitle}>
                  {method.Network}
                </ListItem.Title>
                <ListItem.Subtitle style={styles.listItemSubtitle}>
                  {method.AccNumber}
                </ListItem.Subtitle>
              </ListItem.Content>
              {method.IsDefault && (
                <Ionicons name="checkmark-circle" size={20} color="green" />
              )}
              <ListItem.Chevron />
            </ListItem>
          ))
        )}
      </ScrollView>

      {/* Bottom Sheet for setting default wallet */}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onBackdropPress={() => setIsBottomSheetVisible(false)}
        containerStyle={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Set as Default?</Text>
          <Text style={styles.bottomSheetText}>
            Do you want to set {selectedWallet?.Network} ({selectedWallet?.AccNumber}) 
            as your default payment method?
          </Text>
          
          <View style={styles.bottomSheetButtons}>
            <SecondaryBtn
              title="Cancel"
              onPress={() => setIsBottomSheetVisible(false)}
              containerStyle={styles.bottomSheetButton}
            />
            <PrimaryBtn
              title="Set as Default"
              onPress={handleSetDefault}
              containerStyle={styles.bottomSheetButton}
              loading={isLoading}
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  activeAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeAccountLabel: {
    fontSize: 16,
    color: '#666',
  },
  activeAccountNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noAccountText: {
    color: 'gray',
    fontStyle: 'italic',
  },
  divider: {
    backgroundColor: '#ddd',
    marginVertical: 20,
    height: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  noMethodsContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  noMethodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noMethodsText: {
    textAlign: 'center',
    color: '#666',
  },
  listItemTitle: {
    fontWeight: 'bold',
  },
  listItemSubtitle: {
    color: '#666',
  },
  imageStyle: {
    aspectRatio: 1,
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  bottomSheetContainer: {
    // backgroundColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // padding: 20,
  },
  bottomSheetContent: {
    backgroundColor: 'white',
    padding: 10,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  bottomSheetText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  bottomSheetButton: {
    width: '48%',
  },
});

export default MyMoneyMain;