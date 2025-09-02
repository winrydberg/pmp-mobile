import React, {useEffect} from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Text, Avatar, Icon, Button, Divider, Header, Card} from '@rneui/themed';
import {NativeModules} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {AppStackParamList, MainTabParamList} from '../types/navigation';
import {Image} from '@rneui/base';
import Feather from 'react-native-vector-icons/Feather';
import {primaryBtnColor, secondaryBtnColor} from '../helpers/colors';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store/store';
import {fetchMeters} from '../store/slice/meterSlice';
import {Meter} from '../Types/Meter';
import {useAuth} from '../Context/AuthContext';
import {baseURL} from '../helpers/constants';

type User = {
  first_name?: string;
  last_name?: string;
};

type Transaction = {
  id: string;
  name: string;
  type: string;
  amount: string;
  date: string;
};

type HomeScreenProps = StackScreenProps<MainTabParamList, 'Home'>;

const transactions: Transaction[] = [];

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

const HomeScreen: React.FC<HomeScreenProps> = ({route, navigation}) => {
  const user = null;
  const {authData} = useAuth();
  const appNavigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const bottomNavigator =
    useNavigation<StackNavigationProp<MainTabParamList>>();

  const dispatch = useDispatch<AppDispatch>();
  const {meters, loading, error} = useSelector(
    (state: RootState) => state.meters,
  );

  useEffect(() => {
    dispatch(fetchMeters());
  }, [dispatch]);

  useEffect(() => {
    // Alert.alert("Data", JSON.stringify(meters))
  }, [meters]);

  const renderBalanceCard = ({item}: {item: Meter}) => (
    <View style={styles.balanceCard}>
      <ImageBackground
        source={require('../assets/bg/1.jpg')}
        style={styles.imageBackground}
        imageStyle={{borderRadius: 10}}
        resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.balanceContent}>
          <Text style={styles.meterStatus}>Meter Info</Text>

          <Text style={[styles.meterStatus, {marginTop: 10}]}>
            Number: {item.MeterNumber}:{' '}
            <Text style={{color: 'lime'}}>Active</Text>
          </Text>

          <Text style={{color: 'white'}}>Name: {item.CustomerName}</Text>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>
              GHS {item.AvailableCredit ?? '0.00'}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Horizontal Scrollable Balance Cards */}
      <View style={styles.balanceCardsContainer}>
        {meters.length > 0 ? (
          <FlatList
            horizontal
            data={meters}
            renderItem={renderBalanceCard}
            keyExtractor={item => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.balanceCardsContent}
            snapToInterval={Dimensions.get('window').width - 40}
            decelerationRate="fast"
          />
        ) : (
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              paddingHorizontal: 20,
              paddingVertical: 24,
            }}>
            <Avatar
              source={{uri: `${baseURL}/storage/avatar.png`}}
              size={100}
              rounded
            />
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              <Text style={{fontSize: 20, fontWeight: '500'}}>
                Welcome, {authData?.user.first_name ?? 'Guest'}{' '}
                {authData?.user.last_name ?? ''}
              </Text>
              <Text style={{fontSize: 16, color: 'gray'}}>
                {authData?.user.email ?? 'johndoe@gmail.com'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <Divider style={{marginVertical: 20}} />

      <View style={styles.actionsContainer}>
        <Button
          size="lg"
          title=" BUY POWER NOW"
          icon={<Feather name="credit-card" color={'white'} size={16} />}
          buttonStyle={[
            styles.quickButton,
            {backgroundColor: secondaryBtnColor},
          ]}
          onPress={() => appNavigation.navigate('NewPurchase')}
        />
      </View>

      <Divider style={{marginTop: 50, marginBottom: 10}} />

      {/* <View style={{margin: 10}}>
      <ImageBackground
        source={require('../assets/bg.jpeg')}
        style={[styles.imageBackground,{height: (Dimensions.get('window').height / 2.5)}]}
        imageStyle={{borderRadius: 10 }}
        resizeMode="cover">
        <View style={styles.overlayBg} />
        <View style={styles.balanceContent}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}></Text>
          </View>
        </View>
      </ImageBackground>
    </View> */}

      <View style={{margin: 10}}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingRight: 20}} // Add some right padding for better scrolling
        >
          {/* First ImageBackground (existing one) */}
          <ImageBackground
            source={require('../assets/bg.jpeg')}
            style={[
              styles.imageBackground,
              {
                height: Dimensions.get('window').height / 2.5,
                width: Dimensions.get('window').width - 40,
              },
            ]}
            imageStyle={{borderRadius: 10}}
            resizeMode="cover">
            <View style={styles.overlayBg} />
            <View style={styles.balanceContent}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceText}></Text>
              </View>
            </View>
          </ImageBackground>

          {/* Add more ImageBackground components here for future elements */}
          {/* Example of additional item: */}
          <ImageBackground
            source={require('../assets/bg/buypower.jpeg')} // Different image
            style={[
              styles.imageBackground,
              {
                height: Dimensions.get('window').height / 2.5,
                width: Dimensions.get('window').width - 40,
                marginLeft: 10,
              },
            ]}
            imageStyle={{borderRadius: 10}}
            resizeMode="cover">
            <View style={[styles.overlay]} />
            <View style={styles.balanceContent}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceText}>Join The Family Of Convenience</Text>
              </View>
            </View>
          </ImageBackground>

          {/* Another example item */}
          <ImageBackground
            source={require('../assets/bg/2.jpg')} // Different image
            style={[
              styles.imageBackground,
              {
                height: Dimensions.get('window').height / 2.5,
                width: Dimensions.get('window').width - 40,
                marginLeft: 10,
                flex: 1,
                alignContent:'center',
                justifyContent:'center'
              },
            ]}
            imageStyle={{borderRadius: 10}}
            resizeMode="cover">
            <View style={styles.overlayBg} />
            <View style={[styles.balanceContent, {alignItems:'center', justifyContent:'center', alignSelf:'center'}]}>
              <View style={[styles.balanceRow, {alignItems:'center', justifyContent:'center', alignSelf:'center'}]}>
                <Text style={[styles.balanceText, {textAlign:'center', }]}>Start Buying Power Today!</Text>
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
      </View>

      <Divider style={{marginTop: 50, marginBottom: 10}} />

      <View style={styles.transactionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity
          onPress={() => bottomNavigator.navigate('Transactions')}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: '#30a280'}}>See Details</Text>
            <Icon name="keyboard-arrow-right" type="material" color="#30a280" />
          </View>
        </TouchableOpacity>
      </View>

      {transactions.length > 0 ? (
        transactions.map(tx => (
          <Card key={tx.id} containerStyle={styles.txCard}>
            <View style={styles.txRow}>
              <Image
                source={getTransactionIcon(tx.name)}
                style={styles.imageStyle}
                PlaceholderContent={<ActivityIndicator />}
              />
              <View style={{marginLeft: 10}}>
                <Text>{tx.name}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={{marginLeft: 'auto', alignItems: 'flex-end'}}>
                <Text>{tx.amount}</Text>
                <Text style={styles.txType}>{tx.type}</Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 100,
            marginBottom: 20, // Added marginBottom for better spacing
          }}>
          <Feather name="smile" color={'brown'} size={40} />
          <Text>No Transactions available now.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  balanceCardsContainer: {
    height: Dimensions.get('window').height * 0.22,
    marginTop: 10,
  },
  balanceCardsContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  balanceCard: {
    width: Dimensions.get('window').width - 40,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  imageBackground: {
    padding: 20,
    justifyContent: 'center',
    borderRadius: 10,
    height: Dimensions.get('window').height * 0.2,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 10,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 57, 57, 0)',
    borderRadius: 10,
  },
  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  meterStatus: {
    color: 'white',
  },
  balanceRow: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 'bold',
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  quickButton: {
    borderRadius: 30,
    height: 50,
    width: Dimensions.get('window').width - 100,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  txCard: {
    borderRadius: 5,
    padding: 10,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txDate: {
    color: 'gray',
    fontSize: 12,
  },
  txType: {
    color: 'gray',
    fontSize: 12,
  },
  imageStyle: {
    aspectRatio: 1,
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default HomeScreen;
