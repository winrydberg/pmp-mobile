
import { Text } from '@rneui/themed';
import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { secondaryColor } from '../helpers/colors';

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message="Loading... Please wait..." }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color={secondaryColor} />
          <Text>{message}</Text>
        </View>
        
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: 'white',
    height: 100,
    width: Dimensions.get('window').width - 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});