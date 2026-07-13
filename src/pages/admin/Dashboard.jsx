import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Database, 
  Tag, 
  Clock, 
  Plus,
  ArrowRight,
  TrendingUp,
  Inbox,
  Download,
  BarChart3,
  MoreVertical
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

import { fetchSubmissions } from '../../features/submissions/submissionsSlice';
import { fetchForms } from '../../features/forms/formsSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { submissions, loading: subLoading } = useSelector((state) => state.submissions);
  const { forms, loading: formsLoading } = useSelector((state) => state.forms);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchForms());
  }, [dispatch]);

  const visibleForms = forms.filter((f) => 
    user?.role === 'Admin' || user?.allowedBrands?.includes(f.brandId)
  );

  const visibleSubmissions = submissions.filter((s) => 
    user?.role === 'Admin' || user?.allowedBrands?.includes(s.brandId)
  );

  const activeBrandsCount = Array.from(new Set(visibleForms.map(f => f.brandId))).length;

  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      
      const count = visibleSubmissions.filter((sub) => {
        const subDate = new Date(sub.submittedAt);
        return subDate.toDateString() === d.toDateString();
      }).length;

      data.push({ name: dateStr, 'Kayıt Sayısı': count });
    }
    return data;
  };

  const chartData = getChartData();

  const recentSubmissions = [...visibleSubmissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  const recentForms = [...visibleForms]
    .slice(0, 5);

  const getFormTitle = (formId) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.title : formId;
  };

  const BRANDS_LIST = [
    { id: 'bioderma', name: 'Bioderma', color: '#C41E3A' },
    { id: 'the-purest', name: 'The Purest', color: '#2E7D32' },
    { id: 'laroche-posay', name: 'La Roche-Posay', color: '#0077B6' },
    { id: 'cerave', name: 'CeraVe', color: '#0A2472' }
  ];

  const allowedBrands = BRANDS_LIST.filter(b => 
    user?.role === 'Admin' || user?.allowedBrands?.includes(b.id)
  );

  const brandSoftColors = {
    bioderma: '#ff8390', // Vibrant soft rose-pink
    'the-purest': '#2ec4b6', // Vibrant soft teal-mint
    'laroche-posay': '#3a86c8', // Vibrant soft blue
    cerave: '#4895ef' // Vibrant soft sky-indigo
  };

  const brandChartData = allowedBrands.map(b => ({
    name: b.name,
    'Form Sayısı': visibleForms.filter(f => f.brandId === b.id).length,
    'Kayıt Sayısı': visibleSubmissions.filter(s => s.brandId === b.id).length,
    color: brandSoftColors[b.id] || b.color
  }));

  const getBrandLogo = (brandId) => {
    const logos = {
      bioderma: '/logo/bioderma logo.png',
      'the-purest': '/logo/the purest logo.png',
      'laroche-posay': '/logo/la roche-posay logo.png',
      cerave: '/logo/cerave logo.jpg'
    };
    return logos[brandId];
  };

  const getBrandSubtitle = (brandId) => {
    const subs = {
      bioderma: 'Dermokozmetik',
      'the-purest': 'Saf & Doğal Cilt Bakımı',
      'laroche-posay': 'Dermatolojik Cilt Bakımı',
      cerave: 'Seramidli Genel Bakım'
    };
    return subs[brandId] || '';
  };

  const handleExportBrandCSV = (brandId, brandName) => {
    const brandSubs = visibleSubmissions.filter(s => s.brandId === brandId);
    if (brandSubs.length === 0) {
      toast.error(`${brandName} için henüz doldurulmuş form kaydı bulunmuyor.`);
      return;
    }

    const brandForms = visibleForms.filter(f => f.brandId === brandId);
    const fieldLabelMap = {};
    brandForms.forEach(form => {
      form.sections?.forEach(sec => {
        sec.fields?.forEach(field => {
          fieldLabelMap[field.id] = field.label || field.id;
        });
      });
    });

    const allAnswerKeys = new Set();
    brandSubs.forEach(sub => {
      Object.keys(sub.answers || {}).forEach(k => allAnswerKeys.add(k));
    });
    const answerKeysArray = Array.from(allAnswerKeys);

    const headers = ["Kayıt ID", "Form Başlığı", "Tarih"];
    answerKeysArray.forEach(k => {
      headers.push(fieldLabelMap[k] || k);
    });

    const rows = brandSubs.map(sub => {
      const formTitle = getFormTitle(sub.formId);
      const date = new Date(sub.submittedAt).toLocaleString('tr-TR');
      const row = [sub.id, `"${formTitle.replace(/"/g, '""')}"`, date];
      
      answerKeysArray.forEach(k => {
        let val = sub.answers[k];
        if (val === undefined || val === null) {
          row.push("");
        } else if (typeof val === 'object') {
          if (Array.isArray(val)) {
            row.push(`"${val.join(', ').replace(/"/g, '""')}"`);
          } else {
            row.push(`"${(val.name || JSON.stringify(val)).replace(/"/g, '""')}"`);
          }
        } else {
          row.push(`"${String(val).replace(/"/g, '""')}"`);
        }
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${brandId}_analiz_verileri.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${brandName} verileri başarıyla CSV olarak indirildi.`);
  };

  const loading = subLoading || formsLoading;

  if (loading) {
    return (
      <div className="w-full mx-auto p-4 md:p-8 space-y-6 overflow-y-auto h-full bg-white lg:bg-transparent animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-96 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-10 w-28 bg-slate-200 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                <div className="h-8 w-16 bg-slate-200 rounded-lg"></div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-96 flex flex-col justify-between">
          <div className="h-5 w-48 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-100 rounded-xl w-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="h-5 w-36 bg-slate-200 rounded"></div>
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-40 bg-slate-200 rounded"></div>
                      <div className="h-3 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 md:p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Genel Bakış</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sisteminizdeki form durumunu, katılım istatistiklerini ve son aktiviteleri buradan inceleyebilirsiniz.
          </p>
        </div>
        {user && (
          <button
            onClick={() => navigate('/admin/forms/new')}
            className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Form</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Toplam Form</span>
            <p className="text-3xl font-extrabold text-slate-900">{visibleForms.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Toplam Kayıt</span>
            <p className="text-3xl font-extrabold text-slate-900">{visibleSubmissions.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aktif Marka</span>
            <p className="text-3xl font-extrabold text-slate-900">{activeBrandsCount}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-700 border border-slate-100">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Katılım Trendi (Son 7 Gün)</h3>
        </div>
        
        {visibleSubmissions.length === 0 ? (
          <div className="h-72 w-full flex flex-col justify-center items-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Inbox className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700">Katılım Verisi Bulunmuyor</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mt-1">
              Son 7 gün içinde doldurulan herhangi bir form kaydı bulunmamaktadır. Portala gidip form kaydı oluşturarak veri akışı sağlayabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    fontSize: '11px',
                    color: '#0F172A',
                    boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="Kayıt Sayısı" 
                  stroke="#7C3AED" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <BarChart3 className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Şirket / Marka Analizi</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Marka Katılım Dağılımı</h3>
                <p className="text-[10px] text-slate-450 font-bold">
                  Toplam {visibleSubmissions.length} katılım kaydı
                </p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
              {brandChartData.map((entry, index) => {
                const totalSubs = brandChartData.reduce((sum, d) => sum + d['Kayıt Sayısı'], 0) || 1;
                const pct = ((entry['Kayıt Sayısı'] / totalSubs) * 100).toFixed(1);
                const currentBrand = allowedBrands[index];
                
                return (
                  <div key={entry.name} className="flex items-center justify-between py-3.5 first:pt-2 last:pb-2">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shadow-xs overflow-hidden shrink-0">
                        <img 
                          src={getBrandLogo(currentBrand.id)} 
                          alt={entry.name} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{entry.name}</h4>
                        <span className="text-[9px] text-slate-450 font-bold block truncate">
                          {getBrandSubtitle(currentBrand.id)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-[120px] md:max-w-[160px] mx-4 flex items-center shrink-0">
                      <div className="h-1.5 w-full bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${pct}%`,
                            backgroundColor: entry.color 
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-right shrink-0 min-w-[64px]">
                      <span className="text-xs font-bold text-slate-800 block">
                        {entry['Kayıt Sayısı']} Kayıt
                      </span>
                      <span className="text-[9px] text-slate-450 font-extrabold block">
                        %{pct}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
            <div className="pb-2 border-b border-slate-50 mb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Marka Performans Özetleri</h3>
              <p className="text-[10px] text-slate-450 font-bold">
                Marka bazlı aktif form ve kayıt sayıları
              </p>
            </div>
            
            <div className="overflow-x-auto flex-1 flex flex-col justify-center">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-1">Marka</th>
                    <th className="py-3 px-2 text-center">Form Sayısı</th>
                    <th className="py-3 px-2 text-center">Toplam Kayıt</th>
                    <th className="py-3 px-2 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {allowedBrands.map((b) => {
                    const fCount = visibleForms.filter(f => f.brandId === b.id).length;
                    const sCount = visibleSubmissions.filter(s => s.brandId === b.id).length;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/55 transition-colors group">
                        <td className="py-3.5 px-1 flex items-center space-x-2.5">
                          <span 
                            style={{ backgroundColor: brandSoftColors[b.id] || b.color }}
                            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse" 
                          />
                          <span className="font-bold text-slate-800 group-hover:text-slate-950">
                            {b.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center text-slate-600 font-semibold">{fCount}</td>
                        <td className="py-3.5 px-2 text-center text-slate-600 font-bold">{sCount}</td>
                        <td className="py-3.5 px-2 text-right">
                          <button
                            onClick={() => handleExportBrandCSV(b.id, b.name)}
                            className="inline-flex items-center space-x-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer shadow-xs hover:shadow-sm"
                            title="Tüm veriyi CSV olarak indir"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>CSV İndir</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Son Katılımlar</h3>
              <button 
                onClick={() => navigate('/admin/submissions')}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center space-x-1 transition-colors cursor-pointer select-none"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSubmissions.length > 0 ? (
              <div className="space-y-4">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between text-xs py-1">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {getFormTitle(sub.formId)}
                      </p>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        {sub.brandId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 text-[10px] shrink-0 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(sub.submittedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4">
                <Inbox className="w-6 h-6 text-slate-300 mb-1" />
                <p className="text-[11px] text-slate-500 font-medium">Henüz herhangi bir katılım kaydı bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Eklenen Formlar</h3>
              <button 
                onClick={() => navigate('/admin/forms')}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center space-x-1 transition-colors cursor-pointer select-none"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentForms.length > 0 ? (
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div key={form.id} className="flex items-center justify-between text-xs py-1">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{form.title}</p>
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        {form.brandId}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wide ${
                      form.status === 'published'
                        ? 'bg-slate-900 border-slate-800 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {form.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-4">
                <Inbox className="w-6 h-6 text-slate-300 mb-1" />
                <p className="text-[11px] text-slate-500 font-medium">Henüz herhangi bir form şeması oluşturulmadı.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
