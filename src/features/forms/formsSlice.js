import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const fetchForms = createAsyncThunk('forms/fetchForms', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/forms');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const saveFormSchema = createAsyncThunk(
  'forms/saveFormSchema',
  async (formSchema, { rejectWithValue }) => {
    try {
      let response;
      if (formSchema.id) {
        response = await axiosInstance.put(`/forms/${formSchema.id}`, formSchema);
      } else {
        const newForm = {
          ...formSchema,
          id: `form_${Date.now()}`,
        };
        response = await axiosInstance.post('/forms', newForm);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteFormSchema = createAsyncThunk(
  'forms/deleteFormSchema',
  async (formId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/forms/${formId}`);
      return formId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  forms: [],
  loading: false,
  error: null,
};

const formsSlice = createSlice({
  name: 'forms',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Forms
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Form Schema
      .addCase(saveFormSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveFormSchema.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.forms.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.forms[index] = action.payload;
        } else {
          state.forms.push(action.payload);
        }
      })
      .addCase(saveFormSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Form Schema
      .addCase(deleteFormSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFormSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = state.forms.filter((f) => f.id !== action.payload);
      })
      .addCase(deleteFormSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default formsSlice.reducer;
