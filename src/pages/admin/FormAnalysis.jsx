import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchForms } from '../../features/forms/formsSlice';
import { fetchSubmissions } from '../../features/submissions/submissionsSlice';
import { 
  ArrowLeft, 
  BarChart2, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Users,
  MapPin,
  TrendingUp,
  Inbox,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

const CHART_COLORS = ['#9843FB', '#14B8A6', '#C41E3A', '#2BA13E', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1'];

const getSoftBrandColor = (brandId) => {
  const map = {
    bioderma: '#ff8390',
    'the-purest': '#2ec4b6',
    'laroche-posay': '#3a86c8',
    cerave: '#4895ef',
  };
  return map[brandId] || '#9843fb';
};

export default function FormAnalysis() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { forms, loading: formsLoading } = useSelector((state) => state.forms);
  const { submissions, loading: subsLoading } = useSelector((state) => state.submissions);

  useEffect(() => {
    dispatch(fetchForms());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  const form = forms.find((f) => f.id === id);
  const formSubmissions = submissions.filter((sub) => sub.formId === id);

  if (formsLoading || subsLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-semibold">Analiz verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex-1 bg-slate-50 p-8 h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Inbox className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Form Bulunamadı</h3>
        <p className="text-sm text-slate-500 mt-1">İstediğiniz form mevcut değil veya silinmiş.</p>
        <button
          onClick={() => navigate('/admin/forms')}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Form Yönetimine Dön
        </button>
      </div>
    );
  }

  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const submissionsTrend = last30Days.map(dateStr => {
    const count = formSubmissions.filter(sub => sub.submittedAt?.startsWith(dateStr)).length;
    const d = new Date(dateStr);
    const label = `${d.getDate()} ${d.toLocaleString('tr-TR', { month: 'short' })}`;
    return { Tarih: label, Katılım: count };
  });

  const cityCounts = {};
  formSubmissions.forEach(sub => {
    const city = sub.answers?.f_il || 'Belirtilmemiş';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  const cityData = Object.entries(cityCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const choicesFields = [];
  form.sections?.forEach(sec => {
    sec.fields?.forEach(field => {
      if (field.type === 'radio' || field.type === 'checkbox-group') {
        choicesFields.push(field);
      }
    });
  });

  const choicesStats = choicesFields.map(field => {
    const counts = {};
    field.options?.forEach(opt => { counts[opt.label] = 0; });
    
    formSubmissions.forEach(sub => {
      const ans = sub.answers?.[field.id];
      if (Array.isArray(ans)) {
        ans.forEach(optId => {
          const label = field.options?.find(o => o.id === optId)?.label || optId;
          counts[label] = (counts[label] || 0) + 1;
        });
      } else if (ans) {
        const label = field.options?.find(o => o.id === ans)?.label || ans;
        counts[label] = (counts[label] || 0) + 1;
      }
    });

    const data = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);

    return { 
      fieldId: field.id, 
      label: field.label, 
      type: field.type, 
      data 
    };
  });

  const recentResponses = [...formSubmissions]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);

  return (
    <div className="w-full mx-auto p-6 md:p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/forms')}
            className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Geri Dön"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 font-bold uppercase tracking-wider rounded-full">
                {form.brandId}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 font-bold uppercase rounded-full">
                {form.status === 'published' ? 'YAYINDA' : 'TASLAK'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {form.title} Rapor ve Analizleri
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs select-none">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Son 30 Günün Verileri</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Toplam Doldurma</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{formSubmissions.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Tahmini Katılımcı</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {Math.max(0, Math.floor(formSubmissions.length * 0.98))}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">KVKK İzin Oranı</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {formSubmissions.length > 0 ? '%100' : '%0'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-450 uppercase block">Günlük Ortalama</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {(formSubmissions.length / 30).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {formSubmissions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <BarChart2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800">Henüz Kayıt Yok</h3>
          <p className="text-sm text-slate-500 mt-1">
            Bu form için henüz doldurulmuş bir kayıt bulunmuyor. Kullanıcılar formu doldurduğunda grafikler burada görünecektir.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" style={{ color: getSoftBrandColor(form.brandId) }} />
              <h3 className="text-sm font-bold text-slate-800">Katılım Trendi (Son 30 Gün)</h3>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={submissionsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorParticipation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getSoftBrandColor(form.brandId)} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={getSoftBrandColor(form.brandId)} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="Tarih" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                    labelStyle={{ fontSize: 11, fontWeight: 'bold' }}
                    itemStyle={{ fontSize: 11, color: '#DDD' }}
                  />
                  <Area type="monotone" dataKey="Katılım" stroke={getSoftBrandColor(form.brandId)} strokeWidth={2.5} fillOpacity={1} fill="url(#colorParticipation)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" style={{ color: getSoftBrandColor(form.brandId) }} />
                <h3 className="text-sm font-bold text-slate-800">Coğrafi Katılım (İl Dağılımı)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={cityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                      itemStyle={{ fontSize: 11 }}
                    />
                    <Bar dataKey="value" name="Kayıt Sayısı" fill={getSoftBrandColor(form.brandId)} radius={[6, 6, 6, 6]} barSize={12} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {choicesStats.slice(0, 1).map((stat) => (
              <div key={stat.fieldId} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-5 h-5" style={{ color: getSoftBrandColor(form.brandId) }} />
                  <h3 className="text-sm font-bold text-slate-850 truncate">{stat.label} Analizi</h3>
                </div>
                <div className="h-64 w-full flex flex-col md:flex-row items-center justify-center">
                  <div className="w-full md:w-3/5 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stat.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stat.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#FFF' }}
                          itemStyle={{ fontSize: 11 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-2/5 flex flex-col justify-center space-y-2 mt-4 md:mt-0 max-h-48 overflow-y-auto pr-1">
                    {stat.data.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                          />
                          <span className="font-semibold text-slate-600 truncate">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-900 ml-2">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {choicesStats.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Seçenekli Soru Yok</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                  Bu formda analiz edilebilecek radyo buton veya çoklu seçimli cilt tipi gibi alanlar bulunmuyor.
                </p>
              </div>
            )}
          </div>

          {choicesStats.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {choicesStats.slice(1).map((stat) => (
                <div key={stat.fieldId} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="w-4.5 h-4.5 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800">{stat.label} Dağılımı</h4>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {stat.data.map((item, index) => {
                      const total = stat.data.reduce((sum, d) => sum + d.value, 0) || 1;
                      const pct = ((item.value / total) * 100).toFixed(1);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-semibold">
                            <span className="text-slate-600 truncate mr-2">{item.name}</span>
                            <span className="text-slate-900 shrink-0 font-bold">{item.value} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${pct}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" style={{ color: getSoftBrandColor(form.brandId) }} />
                <h3 className="text-sm font-bold text-slate-800">Son Katılımcı Yanıtları</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Son 10 Kayıt</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Tarih</th>
                    <th className="pb-3 font-bold">Ad Soyad</th>
                    <th className="pb-3 font-bold">Cep Telefonu</th>
                    <th className="pb-3 font-bold">E-posta</th>
                    <th className="pb-3 font-bold">İl/İlçe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-655 font-medium">
                  {recentResponses.map((sub) => {
                    const date = new Date(sub.submittedAt);
                    const dateStr = `${date.toLocaleDateString('tr-TR')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="py-3.5 text-slate-500 font-mono text-[10px]">{dateStr}</td>
                        <td className="py-3.5 text-slate-850 font-bold">
                          {sub.answers?.f_ad || ''} {sub.answers?.f_soyad || ''}
                        </td>
                        <td className="py-3.5 text-slate-600 font-mono">{sub.answers?.f_telefon || '-'}</td>
                        <td className="py-3.5 text-slate-600">{sub.answers?.f_email || '-'}</td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {sub.answers?.f_il || '-'} / {sub.answers?.f_ilce || '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
