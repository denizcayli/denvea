import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetchSubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/submissions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const submitFormAnswers = createAsyncThunk(
  'submissions/submitFormAnswers',
  async (submissionData, { rejectWithValue }) => {
    try {
      const payload = {
        ...submissionData,
        id: `sub_${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      const response = await axiosInstance.post('/submissions', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  'submissions/deleteSubmission',
  async (submissionId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/submissions/${submissionId}`);
      return submissionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  submissions: [],
  loading: false,
  error: null,
};

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Answers
      .addCase(submitFormAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitFormAnswers.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions.push(action.payload);
      })
      .addCase(submitFormAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Submission
      .addCase(deleteSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = state.submissions.filter((sub) => sub.id !== action.payload);
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default submissionsSlice.reducer;
