import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'Marka Sahibi') {
      toast.error('Marka Sahibi rolündeki kullanıcılar yönetim paneline erişemez.');
      dispatch(logout());
    }
  }, [isAuthenticated, user, dispatch]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role === 'Marka Sahibi') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
