import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, AlertTriangle, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchForms, deleteFormSchema } from '../../features/forms/formsSlice';

export default function FormList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { forms, loading } = useSelector((state) => state.forms);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchForms());
  }, [dispatch]);

  const handleDeleteClick = (e, formId) => {
    e.stopPropagation();
    setDeleteConfirmId(formId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      dispatch(deleteFormSchema(deleteConfirmId))
        .unwrap()
        .then(() => {
          toast.success('Form başarıyla silindi!');
          setDeleteConfirmId(null);
        })
        .catch((err) => {
          toast.error(`Form silinirken hata oluştu: ${err}`);
        });
    }
  };

  // Filter forms by brand and allowed brands
  const visibleForms = forms.filter((form) => 
    user?.role === 'Admin' || user?.allowedBrands?.includes(form.brandId)
  );

  const filteredForms = selectedBrand === 'all'
    ? visibleForms
    : visibleForms.filter((form) => form.brandId === selectedBrand);

  const brandOptions = [
    { id: 'all', name: 'Tüm Markalar', color: 'border-slate-200 bg-slate-50 text-slate-600' },
    { id: 'bioderma', name: 'Bioderma', color: 'border-red-200 bg-red-50 text-red-700' },
    { id: 'the-purest', name: 'The Purest', color: 'border-green-200 bg-green-50 text-green-700' },
    { id: 'laroche-posay', name: 'La Roche-Posay', color: 'border-sky-200 bg-sky-50 text-sky-700' },
    { id: 'cerave', name: 'CeraVe', color: 'border-blue-200 bg-blue-50 text-blue-700' }
  ].filter(opt => opt.id === 'all' || user?.role === 'Admin' || user?.allowedBrands?.includes(opt.id));

  // Map option colors to standard Tailwind classes to avoid invalid tones
  const getBrandBadgeColor = (brandId) => {
    const map = {
      bioderma: 'border-red-200 bg-red-50 text-red-700',
      'the-purest': 'border-green-200 bg-green-50 text-green-700',
      'laroche-posay': 'border-sky-200 bg-sky-50 text-sky-700',
      cerave: 'border-blue-200 bg-blue-50 text-blue-700',
    };
    return map[brandId] || 'border-slate-200 bg-slate-50 text-slate-600';
  };

  const getBrandName = (brandId) => {
    const map = {
      bioderma: 'Bioderma',
      'the-purest': 'The Purest',
      'laroche-posay': 'La Roche-Posay',
      cerave: 'CeraVe',
      denvea: 'Denvea (Çatı)',
    };
    return map[brandId] || brandId;
  };

  // Helper to count fields
  const getFieldsCount = (form) => {
    if (!form.sections) return 0;
    return form.sections.reduce((sum, sec) => sum + (sec.fields ? sec.fields.length : 0), 0);
  };

  return (
    <div className="w-full mx-auto p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Form Yönetimi</h2>
          <p className="text-xs text-slate-500 mt-1">
            Firma ve markalarınıza ait form şemalarını buradan oluşturabilir ve yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/forms/new')}
          className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Form Oluştur</span>
        </button>
      </div>

      {user?.role === 'Editor' && (!user.allowedBrands || user.allowedBrands.length === 0) ? (
        <div className="border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-500 bg-white shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700">Yetkili Marka Bulunmuyor</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Hesabınıza tanımlanmış herhangi bir marka yetkisi bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 pb-2">
            {brandOptions.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedBrand === brand.id
                    ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>

          {/* Forms Grid */}
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Formlar yükleniyor...</div>
          ) : filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => {
                const badgeColor = getBrandBadgeColor(form.brandId);
                const brandName = getBrandName(form.brandId);
                const fieldsCount = getFieldsCount(form);

                return (
                  <div
                    key={form.id}
                    onClick={() => navigate(`/admin/forms/edit/${form.id}`)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-md hover:scale-[1.01]"
                  >
                    <div>
                      {/* Card Header (Brand Badge & Status Badge) */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                          {brandName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                          form.status === 'published'
                            ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          {form.status === 'published' ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>

                      {/* Form Details */}
                      <h3 className="text-sm font-bold text-slate-850 group-hover:text-slate-900 transition-colors line-clamp-1 mb-1">
                        {form.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {fieldsCount} alan tanımlandı.
                      </p>
                    </div>

                    {/* Card Footer (Actions) */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/forms/analysis/${form.id}`);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        title="Form Analiz Raporu"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Analiz</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, form.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                        title="Formu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-500 bg-white shadow-sm">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">Form Bulunmuyor</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Bu marka için tanımlanmış herhangi bir form şeması bulunamadı. &quot;+ Yeni Form Oluştur&quot; butonunu kullanarak ekleyebilirsiniz.
              </p>
            </div>
          )}
        </>
      )}

      {/* Custom Confirmation Modal Overlay (No window.confirm!) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Form Silinecek</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bu form şemasını silmek istediğinize emin misiniz? Form silindiğinde bağlı tüm şema verileri kalıcı olarak kaldırılacaktır.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
              >
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
