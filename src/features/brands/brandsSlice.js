import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const fetchBrands = createAsyncThunk('brands/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/brands');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateBrandColor = createAsyncThunk(
  'brands/updateBrandColor',
  async ({ id, themeColor }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/brands/${id}`, { themeColor });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBrandColor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBrandColor.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.brands.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.brands[index] = action.payload;
        }
      })
      .addCase(updateBrandColor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default brandsSlice.reducer;
