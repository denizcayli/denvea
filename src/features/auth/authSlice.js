import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

// Fetch users from server and validate password for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      const users = response.data;
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('E-posta adresi veya şifre hatalı.');
      }
      
      // Exclude password from Redux state and localStorage to comply with security rules
      const safeUser = { ...foundUser };
      delete safeUser.password;
      
      localStorage.setItem('admin_user', JSON.stringify(safeUser));
      return safeUser;
    } catch (error) {
      return rejectWithValue(error.message || 'Giriş yapılamadı.');
    }
  }
);

const savedUser = localStorage.getItem('admin_user');
const parsedUser = savedUser ? JSON.parse(savedUser) : null;

const initialState = {
  user: parsedUser,
  isAuthenticated: !!parsedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('admin_user');
    },
    switchUser: (state, action) => {
      if (action.payload) {
        const safeUser = { ...action.payload };
        delete safeUser.password;
        state.user = safeUser;
        state.isAuthenticated = true;
        localStorage.setItem('admin_user', JSON.stringify(safeUser));
      } else {
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('admin_user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, switchUser } = authSlice.actions;
export default authSlice.reducer;
