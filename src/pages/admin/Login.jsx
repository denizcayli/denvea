import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser, logout } from '../../features/auth/authSlice';

const loginSchema = z.object({
  email: z.string().nonempty('E-posta adresi zorunludur.').email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().nonempty('Şifre zorunludur.').min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Marka Sahibi') {
        dispatch(logout());
        return;
      }
      const origin = location.state?.from?.pathname || '/admin/dashboard';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location, dispatch]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouch',
  });

  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then((loggedInUser) => {
        if (loggedInUser.role === 'Marka Sahibi') {
          toast.error('Marka Sahibi rolündeki kullanıcılar yönetim paneline giriş yapamaz.');
          dispatch(logout());
          return;
        }
        toast.success(`Hoş geldiniz, ${loggedInUser.name}!`);
        navigate('/admin/dashboard', { replace: true });
      })
      .catch((err) => {
        toast.error(err || 'Giriş yapılamadı.');
      });
  };

  const handleDemoLogin = () => {
    dispatch(loginUser({ email: 'deniz@denvea.com', password: 'admin123' }))
      .unwrap()
      .then((loggedInUser) => {
        toast.success(`Hızlı Giriş Başarılı! Hoş geldiniz, ${loggedInUser.name}!`);
        navigate('/admin/dashboard', { replace: true });
      })
      .catch((err) => {
        toast.error(err || 'Giriş yapılamadı.');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 font-sans animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl space-y-8">
        
        {/* Header/Logo */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="flex flex-col items-center select-none">
            <img 
              src="/logo/denvea logo.png" 
              alt="Denvea" 
              className="h-28 object-contain mix-blend-multiply" 
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Yönetim Paneli Girişi</h2>
            <p className="text-xs text-slate-400">Lütfen sisteme erişmek için kimlik bilgilerinizi giriniz.</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">E-posta Adresi</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="deniz@denvea.com"
                {...register('email')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-violet-600 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all placeholder:text-slate-350"
              />
            </div>
            {errors.email && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Şifre</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-violet-600 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all placeholder:text-slate-350"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-600 font-semibold mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:bg-slate-350 disabled:cursor-not-allowed text-white font-extrabold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-violet-100/50 shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer text-center mt-2"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>

          {/* Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-sm transition-all focus:outline-none cursor-pointer text-center mt-2 flex items-center justify-center space-x-2"
          >
            <span>Hızlı Demo Girişi (Admin)</span>
          </button>

        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-3">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Denvea Dinamik Form Yönetim Sistemi © 2026. <br />
            Demo Hesabı: deniz@denvea.com (admin123) / elif@denvea.com (editor123)
          </p>
          <div className="pt-1">
            <Link 
              to="/portal" 
              className="text-xs text-violet-650 hover:text-violet-800 font-bold underline underline-offset-4 transition-colors"
            >
              Etkinlik Portalına Git →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
