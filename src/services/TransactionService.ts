// src/services/PaymentService.ts
import { BuyPowerResponse, PaymentConfirmationResponse, TransactionsResponse } from '../Types/Transaction';
import apiClient from './apiClient';
// import { ApiResponse } from '../types/api';

interface MakePaymentPayload {
    Amount: number;
    MeterNumber: string;
    paymentMode?: string;
    PhoneNumber: string;
    MeterCategory?: string;
    WalletId: string
}

interface PaymentConfirmationPayload {
    TxnID: string,
    PhoneNumber: string
}

export const MakePayment = async (
    payload: MakePaymentPayload,
): Promise<BuyPowerResponse> => {
    // export const MakePayment = async (payload: MakePaymentPayload) => {
    try {
        const response = await apiClient.post('/buy-credit', payload);

        if (
            response.data?.status === 'success'
        ) {
            return {
                status: 'success',
                message: response.data.message || 'Payment initiated successfully. Please approve payment',
                data: response.data.data,
            };
        }
        else {
            return {
                status: 'error',
                message: response.data.message || 'Error fetching meters',
                data: null,
            };
        }
    } catch (error: any) {
        console.error('MakePayment error:', error);

        let errorMessage = 'Payment processing failed';
        if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
        }

        return {
            status: "error",
            message: errorMessage,
            data: null,
        };
    }
};


export const ConfirmPayment = async (
    payload: PaymentConfirmationPayload,
): Promise<PaymentConfirmationResponse> => {

  
    // export const MakePayment = async (payload: MakePaymentPayload) => {
    try {
        const response = await apiClient.post('/confirm-payment', {
            transactionId: payload.TxnID,
            phoneNo: payload.PhoneNumber
        });

       console.log('ConfirmPayment response:', response.data);

        if (
            response.data?.status === 'success'
        ) {
            return {
                status: 'success',
                message: response.data.message,
                data: response.data.data,
            };
        }
        else {
            return {
                status: 'error',
                message: response.data.message || 'Error fetching payment status',
                data: null,
            };
        }
    } catch (error: any) {
        console.error('MakePayment error:', error);

        let errorMessage = 'Payment processing failed';
        if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
        }

        return {
            status: "error",
            message: errorMessage,
            data: null,
        };
    }
};


// Then create the function
export const getPendingTransactions = async (): Promise<TransactionsResponse> => {
  try {
    const response = await apiClient.get('/pending-transactions');
    
    // Validate response structure
    if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
      return {
        status: 'success',
        message: response.data.message || 'Transactions fetched successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('GetAllMeters error:', error);
    
    let errorMessage = 'Failed to fetch transactions';
    if (error.response) {
      // Handle different HTTP status codes
      if (error.response.status === 404) {
        errorMessage = 'No meters found for this user';
      } else if (error.response.status === 401) {
        errorMessage = 'Authentication required';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
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





// Then create the function
export const getCompletedTransactions = async (): Promise<TransactionsResponse> => {
  try {
    const response = await apiClient.get('/completed-transactions');
    
    // Validate response structure
    if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
      return {
        status: 'success',
        message: response.data.message || 'Transactions fetched successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('GetAllMeters error:', error);
    
    let errorMessage = 'Failed to fetch transactions';
    if (error.response) {
      // Handle different HTTP status codes
      if (error.response.status === 404) {
        errorMessage = 'No meters found for this user';
      } else if (error.response.status === 401) {
        errorMessage = 'Authentication required';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
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


export const CancelTransaction = async (
    payload: { TxnID: string }
): Promise<{
    status: 'success' | 'error';
    message: string;
    data: any;
}> => {
    try {
        const response = await apiClient.post('/cancel-transaction', {
            transactionId: payload.TxnID
        });

        if (response.data?.status === 'success') {
            return {
                status: 'success',
                message: response.data.message,
                data: response.data.data,
            };
        } else {
            return {
                status: 'error',
                message: response.data.message || 'Error cancelling transaction',
                data: null,
            };
        }
    } catch (error: any) {
        console.error('CancelTransaction error:', error);

        let errorMessage = 'Transaction cancellation failed';
        if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
        }

        return {
            status: 'error',
            message: errorMessage,
            data: null,
        };
    }
};




export const CheckMeterChargingStatus = async (
    payload: { TxnID: string }
): Promise<{
    status: 'success' | 'error';
    message: string;
    data: any;
}> => {
    try {
        const response = await apiClient.post('/meter-charge-status', {
            transactionId: payload.TxnID
        });

        if (response.data?.status === 'success') {
            return {
                status: 'success',
                message: response.data.message,
                data: response.data.data,
            };
        } else {
            return {
                status: 'error',
                message: response.data.message || 'Error getting meter charge status. Please check again in few minutes',
                data: null,
            };
        }
    } catch (error: any) {
        console.error('Meter Charge Status error:', error);

        let errorMessage = 'Meter charge status check failed. Please check again in few minutes';
        if (error.response) {
            errorMessage = error.response.data.message || errorMessage;
        } else if (error.request) {
            errorMessage = 'Network error - please check your connection';
        }

        return {
            status: 'error',
            message: errorMessage,
            data: null,
        };
    }
};