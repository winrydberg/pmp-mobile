// walletApi.ts
import { AddWalletPayload } from '../Types/MainTypes';
import apiClient from './apiClient';
// api/walletApi.ts
import { MeterFormData, MeterResponse, WalletsResponse } from '../types/wallet';



interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export const AddWallet = async (payload: AddWalletPayload): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post('/add-wallet', payload);
    
    return {
      success: true,
      message: response.data.message || 'Wallet added successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('AddWallet error:', error);
    
    // Handle different error scenarios
    let errorMessage = 'Failed to add wallet';
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error - please check your connection';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};




export const GetWallets = async (): Promise<WalletsResponse> => {
  try {
    const response = await apiClient.get('/get-wallets');
    
    // Validate response structure
    if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
      return {
        status: 'success',
        message: response.data.message || 'Wallets fetched successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('getWallets error:', error);
    
    let errorMessage = 'Failed to fetch wallets';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: 'error',
      message: errorMessage,
      data: []
    };
  }
};


export const SetDefaultWallet = async (wallet_id: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post('/set-default-wallet', {
      WalletId: wallet_id
    });
    
    return {
      success: true,
      message: response.data.message || 'Wallet set to default successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('Set Default Wallet error:', error);
    
    // Handle different error scenarios
    let errorMessage = 'Failed to set default wallet';
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error - please check your connection';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};



