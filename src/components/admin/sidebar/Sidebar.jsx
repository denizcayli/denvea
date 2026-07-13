import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users as UsersIcon,
  Settings,
  UserCheck,
  X,
  LogOut
} from 'lucide-react';
import { switchUser, logout } from '../../../features/auth/authSlice';
import { fetchUsers } from '../../../features/users/usersSlice';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Collapsed state defaults to true on desktop, controlled by mouse hover
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Load users list for switcher
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Grouped Navigation Items
  const menuGroups = [
    {
      title: 'Ana Menü',
      items: [
        {
          path: '/admin/dashboard',
          label: 'Genel Bakış',
          icon: LayoutDashboard,
        },
        {
          path: '/admin/forms',
          label: 'Form Yönetimi',
          icon: FileText,
        },
      ]
    },
    {
      title: 'Araçlar & Yönetim',
      items: [
        {
          path: '/admin/users',
          label: 'Kullanıcılar',
          icon: UsersIcon,
        },
        {
          path: '/admin/settings',
          label: 'Ayarlar',
          icon: Settings,
        },
      ]
    }
  ];

  const handleUserSwitch = (userId) => {
    const selected = users.find((u) => u.id === Number(userId) || u.id === userId);
    if (selected) {
      dispatch(switchUser(selected));
      toast.success(`Oturum ${selected.name} (${selected.role}) olarak değiştirildi.`);
      if (onClose) onClose();
      navigate('/admin/dashboard');
    }
  };

  return (
    <aside
      style={{ fontFamily: 'Satoshi, sans-serif' }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`bg-white text-slate-700 flex flex-col transition-all duration-300 z-50 fixed inset-y-0 left-0 h-screen lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 lg:mr-2 lg:rounded-[32px] lg:border lg:border-slate-200 lg:shadow-sm overflow-hidden ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-64 lg:w-20' : 'w-64'}`}
    >
      {/* Logo & Close Button */}
      <div className={`p-5 border-b border-slate-100 flex items-center ${isCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
        <div className="flex items-center justify-center select-none w-full">
          {isCollapsed ? (
            <img
              src="/logo/denvea symbol.png"
              alt="Denvea"
              className="h-10 w-10 object-contain mix-blend-multiply shrink-0 animate-fade-in"
            />
          ) : (
            <img
              src="/logo/denvea logo.png"
              alt="Denvea"
              className="h-16 w-full px-2 object-contain mix-blend-multiply shrink-0 animate-fade-in"
            />
          )}
        </div>

        {(!isCollapsed) && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-55 text-slate-550 hover:text-slate-800 lg:hidden transition-colors cursor-pointer"
            title="Menüyü Kapat"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Grouped Navigation Menu */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {menuGroups.map((group) => {
          // Filter items by user role
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || (user && user.role === 'Admin')
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {/* Group Heading */}
              <span className={`text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block px-3.5 pt-2 pb-1.5 select-none transition-all duration-300 origin-top ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:scale-90 lg:pointer-events-none lg:overflow-hidden' : 'opacity-100 h-auto scale-100'
                }`}>
                {group.title}
              </span>

              {/* Items List */}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center transition-all duration-300 ${isCollapsed
                        ? 'lg:justify-center lg:p-3.5 lg:w-12 lg:h-12 lg:mx-auto rounded-full'
                        : 'space-x-3 px-4 py-3 rounded-full mx-1.5'
                      } ${isActive
                        ? 'bg-violet-50 text-violet-700 font-extrabold shadow-sm'
                        : 'text-slate-655 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={`transition-all duration-300 origin-left text-[11px] uppercase tracking-wider font-extrabold ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:scale-90 lg:pointer-events-none' : 'opacity-100 w-auto scale-100'
                      }`}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div className="p-3 border-t border-slate-100 mt-auto shrink-0 bg-slate-50/20 space-y-2">
          <div 
            className={`flex items-center transition-all duration-300 ${
              isCollapsed 
                ? 'lg:justify-center lg:p-3.5 lg:w-12 lg:h-12 lg:mx-auto rounded-full bg-slate-50' 
                : 'space-x-3 px-4 py-3 rounded-full mx-1.5 bg-slate-50'
            }`}
          >
            <UsersIcon className="w-5 h-5 shrink-0 text-slate-550" />
            <span className={`transition-all duration-300 origin-left text-[11px] uppercase tracking-wider font-extrabold text-slate-800 ${
              isCollapsed ? 'lg:opacity-0 lg:w-0 lg:scale-90 lg:pointer-events-none' : 'opacity-100 w-auto scale-100'
            }`}>
              {user.name} ({user.role})
            </span>
          </div>

          <button
            onClick={() => {
              dispatch(logout());
              toast.success('Oturum kapatıldı.');
              navigate('/login');
            }}
            className={`flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 cursor-pointer ${
              isCollapsed
                ? 'lg:justify-center lg:p-3.5 lg:w-12 lg:h-12 lg:mx-auto rounded-full'
                : 'space-x-3 px-4 py-3 rounded-full w-[calc(100%-12px)] mx-1.5 text-left'
            }`}
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`transition-all duration-300 origin-left text-[11px] uppercase tracking-wider font-extrabold ${
              isCollapsed ? 'lg:opacity-0 lg:w-0 lg:scale-90 lg:pointer-events-none' : 'opacity-100 w-auto scale-100'
            }`}>
              Çıkış Yap
            </span>
          </button>
        </div>
      )}

    </aside>
  );
}
