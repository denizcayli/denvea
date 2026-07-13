import { configureStore } from '@reduxjs/toolkit';
import formsReducer from '../features/forms/formsSlice';
import formBuilderReducer from '../features/forms/formBuilderSlice';
import submissionsReducer from '../features/submissions/submissionsSlice';
import usersReducer from '../features/users/usersSlice';
import authReducer from '../features/auth/authSlice';
import brandsReducer from '../features/brands/brandsSlice';

export const store = configureStore({
  reducer: {
    forms: formsReducer,
    formBuilder: formBuilderReducer,
    submissions: submissionsReducer,
    users: usersReducer,
    auth: authReducer,
    brands: brandsReducer,
  },
});
