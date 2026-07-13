import { Outlet } from 'react-router-dom';

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <header className="py-6 px-8 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3 select-none">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo/denvea logo.png" 
              alt="Denvea" 
              className="h-18 object-contain mix-blend-multiply shrink-0" 
            />
          </div>
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold">
            Etkinlik Portalı
          </span>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
