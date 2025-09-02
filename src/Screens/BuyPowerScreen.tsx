import React, {useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {Button, Input, Text, Tab, TabView, BottomSheet} from '@rneui/themed';
import {Picker} from '@react-native-picker/picker';
import {GetMeter} from '../services/MeterService';
import {MeterFormData} from '../types/wallet';
import {Meter} from '../Types/Meter';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppStackParamList} from '../types/navigation';
import {PrimaryBtn} from '../components/PrimaryBtn';
import {primaryBtnColor} from '../helpers/colors';
import {CancelBtn} from '../components/CancelBtn';

const BuyPowerScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [index, setIndex] = useState(0);
  const [meterNumber, setMeterNumber] = useState('24107682320');
  const [category, setCategory] = useState<'prepaid'>('prepaid');
  const [loading, setLoading] = useState(false);
  const [meterInfo, setMeterInfo] = useState<Meter | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const [errors, setErrors] = React.useState({
    meter_number: '',
    category: '',
  });

  const fetchMeterInfo = async () => {
    if (!meterNumber.trim()) {
      setError('Please enter a meter number');
      return;
    }

    // 24107682320

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
    <View style={{flex: 1}}>
      {/* Tabs */}
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={styles.indicator}
        containerStyle={styles.tabContainer}
        titleStyle={styles.tabTitle}>
        <Tab.Item title="Buy With Meter No" />
        <Tab.Item title="Buy With Card" />
      </Tab>

      {/* Tab Views */}
      <TabView
        value={index}
        onChange={setIndex}
        animationType="spring"
        containerStyle={styles.tabView}>
        {/* Buy With Meter Number Tab */}
        <TabView.Item style={styles.tabContent}>
          <View style={styles.inner}>
            <Input
              label="Enter meter number / ID"
              value={meterNumber}
              onChangeText={text => {
                setMeterNumber(text);
                setError(undefined);
              }}
              placeholder="24107682320"
              labelStyle={styles.label}
              inputStyle={styles.input}
              inputContainerStyle={[
                styles.inputContainer,
                errors.meter_number && styles.errorInput,
              ]}
              containerStyle={styles.inputWrapper}
              errorMessage={error}
            />
            <Text style={styles.helperText}>
              You can find your meter number on an old receipt
            </Text>

            <Text style={styles.label}>Select meter category</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={category}
                onValueChange={itemValue => setCategory(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Prepaid" value="prepaid" />
              </Picker>
            </View>

            <PrimaryBtn
              title={
                loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  'Confirm & Continue'
                )
              }
              disabled={loading}
              containerStyle={styles.buttonContainer}
              onPress={fetchMeterInfo}
            />
          </View>
        </TabView.Item>

        {/* Buy With Card Tab */}
        <TabView.Item style={styles.tabContent}>
          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonText}>
              This feature is coming soon and currently in development.
            </Text>
            <Text style={styles.comingSoonSubtext}>
              Please use the "Buy With Meter No" option for now.
            </Text>
          </View>
        </TabView.Item>
      </TabView>

      {/* Bottom Sheet for Meter Info */}
      <BottomSheet
        isVisible={isBottomSheetVisible}
        containerStyle={styles.bottomSheetContainer}>
        <View style={styles.bottomSheetContent}>
          <Text h4 style={styles.bottomSheetHeading}>
            Meter Information
          </Text>

          {meterInfo ? (
            <>
              <View style={styles.meterInfoRow}>
                <Text style={styles.meterInfoLabel}>Customer Name:</Text>
                <Text style={styles.meterInfoValue}>
                  {meterInfo.CustomerName}
                </Text>
              </View>
              <View style={styles.meterInfoRow}>
                <Text style={styles.meterInfoLabel}>Meter Number:</Text>
                <Text style={styles.meterInfoValue}>
                  {meterInfo.MeterNumber}
                </Text>
              </View>

              <View style={styles.bottomSheetButtons}>
                {/* <Button
                  title="Cancel"
                  containerStyle={styles.bottomSheetButton}
                  buttonStyle={[
                    styles.bottomSheetButtonInner,
                    styles.cancelButton,
                  ]}
                  titleStyle={styles.cancelButtonText}
                  onPress={handleCancel}
                /> */}

                <CancelBtn
                  color={'brown'}
                  title="Cancel"
                  onPress={handleCancel}
                  style={{paddingVertical: 10}}
                  containerStyle={styles.bottomSheetButton}
                  disabled={loading}
                />

                <PrimaryBtn
                  title="Continue"
                  containerStyle={styles.bottomSheetButton}
                  onPress={handleContinue}
                />
                {/* <Button
                  title="Continue"
                  containerStyle={styles.bottomSheetButton}
                  buttonStyle={[
                    styles.bottomSheetButtonInner,
                    styles.continueButton,
                  ]}
                  onPress={handleContinue}
                /> */}
              </View>
            </>
          ) : (
            <Text>No meter information available</Text>
          )}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: '#fff',
  },
  indicator: {
    backgroundColor: primaryBtnColor,
    height: 3,
  },
  tabTitle: {
    fontWeight: 'bold',
  },
  tabView: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  comingSoonSubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
  },
  heading: {
    marginBottom: 20,
    color: '#004d00',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    paddingLeft: 5,
  },
  helperText: {
    color: 'gray',
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginBottom: 30,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#1c653a',
  },
  // Bottom sheet styles
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeading: {
    marginBottom: 20,
    color: '#004d00',
    textAlign: 'center',
  },
  meterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  meterInfoLabel: {
    fontWeight: '600',
    color: '#555',
  },
  meterInfoValue: {
    fontWeight: '400',
    color: '#333',
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  bottomSheetButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  bottomSheetButtonInner: {
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#1c653a',
  },
  inputWrapper: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 10,

    borderWidth: 1,
    borderColor: '#eee',
  },
  errorInput: {
    borderColor: '#ff4444',
  },
});

export default BuyPowerScreen;
