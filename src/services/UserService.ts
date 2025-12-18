// src/services/UserService.ts
import apiClient from './apiClient';

export interface SubmitQueryPayload {
  subject: string;
  message: string;
}

export interface SubmitQueryResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export const submitUserQuery = async (
  payload: SubmitQueryPayload
): Promise<SubmitQueryResponse> => {
  try {
    const response = await apiClient.post('/submit-query', payload);
    if (response.data?.status === 'success') {
      return {
        status: 'success',
        message: response.data.message || 'Query submitted successfully',
        data: response.data.data,
      };
    } else {
      return {
        status: 'error',
        message: response.data.message || 'Failed to submit query',
      };
    }
  } catch (error: any) {
    let errorMessage = 'Failed to submit query';
    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = 'Network error - please check your connection';
    }
    return {
      status: 'error',
      message: errorMessage,
    };
  }
};


export interface UserQuery  {
    id: number;
    ticketNo: string;
    user_id: number;
    Title: string;
    PhoneNumber: string;
    Message: string;
    Status: 'open' | 'replied' | 'customer_reply' | 'closed';
    created_at: string | null;
    updated_at: string | null;
};

export interface GetUserQueriesResponse {
    status: 'success' | 'error';
    message: string;
    data: UserQuery[];
}

export const getUserQueries = async (): Promise<GetUserQueriesResponse> => {
    try {
        const response = await apiClient.get('/user-contacts');
        if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
            return {
                status: 'success',
                message: response.data.message || 'Queries fetched successfully',
                data: response.data.data,
            };
        }
        throw new Error('Invalid response structure');
    } catch (error: any) {
        let errorMessage = 'Failed to fetch queries';
        if (error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return {
            status: 'error',
            message: errorMessage,
            data: [],
        };
    }
};
