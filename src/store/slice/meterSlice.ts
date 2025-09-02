import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GetAllMetersResponse, Meter} from '../../Types/Meter';
import {GetAllMeters} from '../../services/MeterService';
import {MeterResponse} from '../../types/wallet';

interface MeterState {
  meters: Array<Meter>;
  loading: boolean;
  error: string | null;
}

const initialState: MeterState = {
  meters: [],
  loading: false,
  error: '',
};

// Async thunk
export const fetchMeters = createAsyncThunk(
  'meters/fetchMeters',
  async (_, thunkAPI) => {
    try {
      // const response = await axios.get('/api/meters'); // replace with your actual API
      const response: GetAllMetersResponse = await GetAllMeters();
      if (response.status == 'success') {
        return response.data as Meter[];
      } else {
        return [];
      }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  },
);

const meterSlice = createSlice({
  name: 'meter',
  initialState,
  reducers: {
    // addMeters: (state, action) => {
    //   state.meters = action.payload;
    // },
    // decrement: state => {
    //   state.value -= 1;
    // },
    addMeters: (state, action: PayloadAction<Array<Meter>>) => {
      state.meters = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(fetchMeters.pending, (state: any) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMeters.fulfilled,
        (state: MeterState, action: PayloadAction<Array<Meter>>) => {
          state.meters = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchMeters.rejected, (state: MeterState, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {addMeters} = meterSlice.actions;
export default meterSlice.reducer;
