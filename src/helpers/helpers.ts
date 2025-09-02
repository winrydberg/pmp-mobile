import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  const authData = await AsyncStorage.getItem('authData');
  if (authData != null) {
    return JSON.parse(authData).token;
  } else {
    return null;
  }
};

export const getAuthUser = async () => {
  const authData = await AsyncStorage.getItem('authData');
  if (authData != null) {
    return JSON.parse(authData).user;
  } else {
    return null;
  }
};
