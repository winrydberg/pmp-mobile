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


// helper (place inside your component file)
export const formatDateTime = (value: string | Date) => {
  const d = new Date(value);
  return d.toLocaleString('en-US', {
    month: 'short',   // e.g., Sep
    day: '2-digit',   // e.g., 14
    year: 'numeric',  // e.g., 2025
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,     // AM/PM
  });
};
