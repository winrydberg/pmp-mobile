import { GetAllMetersResponse } from "../Types/Meter";
import { MeterFormData, MeterResponse } from "../types/wallet";
import apiClient from "./apiClient";

// Then create the function
export const GetAllMeters = async (): Promise<GetAllMetersResponse> => {
  try {
    const response = await apiClient.get('/my-meters');
    
    // Validate response structure
    if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
      return {
        status: 'success',
        message: response.data.message || 'Meters fetched successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('GetAllMeters error:', error);
    
    let errorMessage = 'Failed to fetch meters';
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


// Then create the submission function
export const AddMeter = async (formData: MeterFormData): Promise<MeterResponse> => {
  try {
    const payload = {
    //   PhoneNumber: formData.PhoneNumber,
      MeterNumber: formData.MeterNumber,
      MeterCategory: formData.MeterCategory,
    //   Alias: formData.Alias || undefined, // Exclude if empty
    //   AccountNumber: formData.AccountNumber || undefined
    };

    const response = await apiClient.post('/add-meter', payload);
    
    // Validate response structure
    if (response.data?.status === 'success' && response.data.data) {
      return {
        status: 'success',
        message: response.data.message || 'Meter added successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('AddMeter error:', error);
    
    let errorMessage = 'Failed to add meter';
    if (error.response) {
      // Handle different HTTP status codes if needed
      if (error.response.status === 400) {
        errorMessage = 'Validation error: ' + 
          (error.response.data?.message || 'Invalid data provided');
      } else if (error.response.status === 409) {
        errorMessage = 'Meter already exists';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: 'error',
      message: errorMessage,
      data: null
    };
  }
};



// Then create the submission function
export const GetMeter = async (formData: MeterFormData): Promise<MeterResponse> => {
  try {
    const payload = {
    //   PhoneNumber: formData.PhoneNumber,
      MeterNumber: formData.MeterNumber,
      MeterCategory: formData.MeterCategory,
    //   Alias: formData.Alias || undefined, // Exclude if empty
    //   AccountNumber: formData.AccountNumber || undefined
    };

    const response = await apiClient.post('/add-meter', payload);
    
    // Validate response structure
    if (response.data?.status === 'success' && response.data.data) {
      return {
        status: 'success',
        message: response.data.message || 'Meter added successfully',
        data: response.data.data
      };
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error: any) {
    console.log('AddMeter error:', error);
    
    let errorMessage = 'Failed to add meter';
    if (error.response) {
      // Handle different HTTP status codes if needed
      if (error.response.status === 400) {
        errorMessage = 'Validation error: ' + 
          (error.response.data?.message || 'Invalid data provided');
      } else if (error.response.status === 409) {
        errorMessage = 'Meter already exists';
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      status: 'error',
      message: errorMessage,
      data: null
    };
  }
};


