// WalletService.ts
import { AddWalletPayload } from '../Types/MainTypes';
import apiClient from './apiClient';
// api/WalletService.ts
import { MeterFormData, MeterResponse, WalletsResponse } from '../types/wallet';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Request OTP for wallet verification
 * @param payload Wallet details (Name, AccNumber, Type, Network)
 * @returns ApiResponse with OTP request status
 */
export const requestWalletOTP = async (payload: AddWalletPayload): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post('/request-wallet-otp', payload);

    return {
      success: true,
      message: response.data.message || 'OTP sent successfully',
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Request Wallet OTP error:', error);

    let errorMessage = 'Failed to send OTP';
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Verify OTP and add wallet
 * @param otp 6-digit OTP code
 * @returns ApiResponse with wallet creation status
 */
export const verifyWalletOTP = async (otp: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post('/verify-wallet-otp', { otp });

    return {
      success: true,
      message: response.data.message || 'Wallet added successfully',
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Verify Wallet OTP error:', error);

    let errorMessage = 'Failed to verify OTP';
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Add wallet without OTP verification (legacy/admin use)
 * @param payload Wallet details
 * @returns ApiResponse with wallet creation status
 */
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

/**
 * Get all wallets for authenticated user
 * @returns WalletsResponse with list of wallets
 */
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

/**
 * Set a wallet as default
 * @param wallet_id Wallet UUID
 * @returns ApiResponse with updated wallet status
 */
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
