import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import Sidebar from '../components/admin/sidebar/Sidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar with mobile drawer support */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:my-4 lg:mr-4 lg:ml-2 lg:h-[calc(100vh-2rem)] lg:bg-white lg:rounded-[32px] lg:border lg:border-slate-200 lg:shadow-sm overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 bg-white px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 lg:hidden transition-colors cursor-pointer"
              title="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-slate-500">Yönetim Paneli</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors text-xs font-semibold select-none cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Etkinlik Portalını Görüntüle</span>
              <span className="inline sm:hidden">Portala Git</span>
            </a>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full font-semibold hidden sm:inline-block">
              v1.0.0
            </span>
          </div>
        </header>

        {/* Dynamic Outlet Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
