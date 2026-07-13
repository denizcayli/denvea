import { useState } from 'react';
import { Save, Cpu, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  // Local state for system configurations
  const [systemActive, setSystemActive] = useState(true);
  const [kvkkStrict, setKvkkStrict] = useState(true);
  const [syncRate, setSyncRate] = useState('30s');
  const [logRetention, setLogRetention] = useState('90');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('Sistem genel ayarları başarıyla güncellendi!', { id: 'settings-saved' });
  };

  return (
    <div className="w-full mx-auto p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">Sistem Ayarları</h2>
          <p className="text-xs text-slate-500 mt-1">
            Firma ve form altyapısına ait genel sistem ve sunucu çalışma parametrelerini buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        
        {/* Sunucu & Çalışma Modu Kartı */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <Cpu className="w-5 h-5 text-violet-650" />
              <h3 className="text-sm font-bold text-slate-900">Sunucu Çalışma Modu</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">Sistem Durumu (Aktif)</span>
                  <p className="text-[10px] text-slate-400 max-w-[250px] leading-relaxed">
                    Kapalı durumdayken kullanıcılar portal formlarına erişemez ve bakım sayfası gösterilir.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={systemActive}
                    onChange={(e) => setSystemActive(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800">Sıkı KVKK Denetimi</span>
                  <p className="text-[10px] text-slate-400 max-w-[250px] leading-relaxed">
                    KVKK onay kutusu doldurulmadan form yanıtlarının sunucuya iletilmesi engellenir.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={kvkkStrict}
                    onChange={(e) => setKvkkStrict(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Eşleme ve Veri Tabanı Kartı */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-violet-650" />
              <h3 className="text-sm font-bold text-slate-900">Veri Tabanı ve API Ayarları</h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">API Senkronizasyon Sıklığı</label>
                <select
                  value={syncRate}
                  onChange={(e) => setSyncRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 cursor-pointer"
                >
                  <option value="10s">10 Saniye (Gerçek Zamanlıya Yakın)</option>
                  <option value="30s">30 Saniye (Önerilen)</option>
                  <option value="60s">60 Saniye (Düşük Sunucu Yükü)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Log Saklama Süresi (Gün)</label>
                <select
                  value={logRetention}
                  onChange={(e) => setLogRetention(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 cursor-pointer"
                >
                  <option value="30">30 Gün</option>
                  <option value="90">90 Gün</option>
                  <option value="180">180 Gün</option>
                  <option value="365">365 Gün</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu Satırı */}
        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
          >
            <Save className="w-4 h-4" />
            <span>Sistem Ayarlarını Kaydet</span>
          </button>
        </div>

      </form>
    </div>
  );
}
