import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Eye, 
  Trash2, 
  Download, 
  Filter, 
  FileText,
  AlertTriangle,
  X,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchSubmissions, deleteSubmission } from '../../features/submissions/submissionsSlice';
import { fetchForms } from '../../features/forms/formsSlice';

export default function Submissions() {
  const dispatch = useDispatch();

  const { submissions, loading: subLoading } = useSelector((state) => state.submissions);
  const { forms, loading: formsLoading } = useSelector((state) => state.forms);
  const { user } = useSelector((state) => state.auth);

  // Filters State
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedFormId, setSelectedFormId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals State
  const [selectedSub, setSelectedSub] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchForms());
  }, [dispatch]);

  const brandOptions = [
    { id: 'all', name: 'Tüm Markalar' },
    { id: 'bioderma', name: 'Bioderma' },
    { id: 'the-purest', name: 'The Purest' },
    { id: 'laroche-posay', name: 'La Roche-Posay' },
    { id: 'cerave', name: 'CeraVe' }
  ].filter(opt => opt.id === 'all' || user?.role === 'Admin' || user?.allowedBrands?.includes(opt.id));

  // Get forms available for the selected brand
  const visibleForms = forms.filter((f) =>
    user?.role === 'Admin' || user?.allowedBrands?.includes(f.brandId)
  );

  const availableForms = selectedBrand === 'all'
    ? visibleForms
    : visibleForms.filter((f) => f.brandId === selectedBrand);

  const visibleSubmissions = submissions.filter((sub) =>
    user?.role === 'Admin' || user?.allowedBrands?.includes(sub.brandId)
  );

  // Filter logic
  const filteredSubmissions = visibleSubmissions.filter((sub) => {
    // Brand Filter
    if (selectedBrand !== 'all' && sub.brandId !== selectedBrand) return false;

    // Form Filter
    if (selectedFormId !== 'all' && sub.formId !== selectedFormId) return false;

    // Date Range Filter
    if (startDate || endDate) {
      const subDate = new Date(sub.submittedAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (subDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (subDate > end) return false;
      }
    }

    return true;
  });

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      dispatch(deleteSubmission(deleteConfirmId))
        .unwrap()
        .then(() => {
          toast.success('Kayıt başarıyla silindi!');
          setDeleteConfirmId(null);
        })
        .catch((err) => {
          toast.error(`Kayıt silinirken hata oluştu: ${err}`);
        });
    }
  };

  const getFormTitle = (formId) => {
    const form = forms.find((f) => f.id === formId);
    return form ? form.title : formId;
  };

  const getFieldLabel = (formId, fieldId) => {
    const form = forms.find((f) => f.id === formId);
    if (!form || !form.sections) return fieldId;
    let label = fieldId;
    form.sections.forEach((sec) => {
      if (sec.fields) {
        const field = sec.fields.find((f) => f.id === fieldId);
        if (field) {
          label = field.label || fieldId;
        }
      }
    });
    return label;
  };

  // Safe & BOM-enabled pure-JS CSV Export (zero dependencies)
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('Dışa aktarılacak kayıt bulunmuyor.');
      return;
    }

    // CSV Headers
    const headers = ['Kayıt ID', 'Marka', 'Form Adı', 'Kayıt Tarihi', 'Cevaplar'];

    // Generate CSV Rows
    const rows = filteredSubmissions.map((sub) => {
      const formTitle = getFormTitle(sub.formId);
      
      // Map answers to Label: Value string representation
      const answersList = Object.keys(sub.answers).map((fieldId) => {
        const label = getFieldLabel(sub.formId, fieldId);
        const val = sub.answers[fieldId];
        let valStr;

        if (typeof val === 'object' && val !== null) {
          if (Array.isArray(val)) {
            valStr = val.join(' - ');
          } else {
            valStr = val.name || JSON.stringify(val);
          }
        } else {
          valStr = String(val);
        }
        return `${label}: ${valStr}`;
      });

      const answersFlattened = answersList.join(' | ');

      return [
        sub.id,
        sub.brandId.toUpperCase(),
        formTitle,
        new Date(sub.submittedAt).toLocaleString('tr-TR'),
        `"${answersFlattened.replace(/"/g, '""')}"` // Wrap answers in quotes and escape internal quotes
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    // Excel UTF-8 BOM indicator (\uFEFF) ensures Turkish characters render correctly in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `form_kayitlari_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Kayıtlar CSV olarak indirildi!');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loading = subLoading || formsLoading;

  return (
    <div className="w-full mx-auto p-8 space-y-6 overflow-y-auto h-full text-slate-800 bg-white lg:bg-transparent">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Form Kayıtları</h2>
          <p className="text-xs text-slate-500 mt-1">
            Doldurulan form verilerini filtreleyebilir, detaylarını inceleyebilir ve CSV olarak dışa aktarabilirsiniz.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-400" />
          <span>CSV Olarak Dışa Aktar</span>
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-500 pb-2 border-b border-slate-100">
          <Filter className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Filtreleme Seçenekleri</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Brand Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Marka</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedFormId('all');
              }}
              className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>

          {/* Form Filter */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Form Şeması</label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Tüm Formlar</option>
              {availableForms.map((f) => (
                <option key={f.id} value={f.id}>{f.title}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Başlangıç Tarihi</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bitiş Tarihi</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-sm">Cevaplar yükleniyor...</div>
      ) : filteredSubmissions.length > 0 ? (
        <div className="space-y-2">
          {/* Mobile Scroll Indicator */}
          <div className="block md:hidden text-right text-[10px] font-bold text-slate-400 select-none animate-pulse">
            Yatay Kaydırılabilir ↔
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4 md:px-6">ID</th>
                    <th className="py-3 px-4 md:px-6">Marka</th>
                    <th className="py-3 px-4 md:px-6">Form Başlığı</th>
                    <th className="py-3 px-4 md:px-6">Kaydolma Tarihi</th>
                    <th className="py-3 px-4 md:px-6 text-right">Eylemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {filteredSubmissions.map((sub) => (
                    <tr 
                      key={sub.id}
                      className="hover:bg-slate-50/50 transition-all"
                    >
                      <td className="py-3.5 px-4 md:px-6 font-mono text-[10px] text-slate-400">
                        {sub.id}
                      </td>
                      <td className="py-3.5 px-4 md:px-6">
                        <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-semibold tracking-wide uppercase text-[9px]">
                          {sub.brandId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 md:px-6 font-bold text-slate-900">
                        {getFormTitle(sub.formId)}
                      </td>
                      <td className="py-3.5 px-4 md:px-6 text-slate-500">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(sub.submittedAt).toLocaleString('tr-TR')}</span>
                        </div>
                      </td>
                    <td className="py-3.5 px-4 md:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 transition-all cursor-pointer"
                          title="Detayları Gör"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sub.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 transition-all cursor-pointer"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ) : (
        <div className="border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-500 bg-white shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-700">Kayıt Bulunmuyor</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Seçili filtrelere uygun herhangi bir kullanıcı kaydı bulunamadı. Lütfen filtrelerinizi güncelleyin.
          </p>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full flex flex-col shadow-xl max-h-[85vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[9px] tracking-wider">
                  {selectedSub.brandId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">
                  {getFormTitle(selectedSub.formId)} Cevap Detayı
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl text-xs text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Kayıt ID</span>
                  <span className="font-mono text-slate-800 text-[11px]">{selectedSub.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Kayıt Tarihi</span>
                  <span className="text-slate-800">{new Date(selectedSub.submittedAt).toLocaleString('tr-TR')}</span>
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-200">Cevaplar</h4>
                <div className="divide-y divide-slate-100 space-y-4">
                  {Object.keys(selectedSub.answers).map((fieldId, idx) => {
                    const label = getFieldLabel(selectedSub.formId, fieldId);
                    const val = selectedSub.answers[fieldId];
                    let renderVal;

                    if (typeof val === 'object' && val !== null) {
                      if (Array.isArray(val)) {
                        // Checkbox list
                        renderVal = (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {val.map((item, i) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                {item}
                              </span>
                            ))}
                          </div>
                        );
                      } else {
                        // File metadata
                        renderVal = (
                          <div className="flex items-center space-x-3 bg-slate-50 p-3.5 border border-slate-200 rounded-xl mt-1.5">
                            <span className="text-2xl">📄</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 truncate">{val.name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {formatFileSize(val.size)} &bull; {val.type}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    } else if (typeof val === 'boolean') {
                      // Switch/Checkbox
                      renderVal = (
                        <span className={`inline-block px-2.5 py-1 mt-1 rounded-lg text-xs font-semibold border ${
                          val 
                            ? 'border-slate-200 bg-slate-100 text-slate-700' 
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}>
                          {val ? 'Kabul Edildi' : 'Kabul Edilmedi'}
                        </span>
                      );
                    } else {
                      // Standard string / number
                      renderVal = (
                        <p className="text-sm font-semibold text-slate-800 mt-1 whitespace-pre-wrap">{val}</p>
                      );
                    }

                    return (
                      <div key={fieldId} className={`pt-4 ${idx === 0 ? 'border-t-0 pt-0' : ''}`}>
                        <span className="text-xs text-slate-400 font-bold block">{label}</span>
                        {renderVal}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Kayıt Silinecek</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bu kullanıcı katılım kaydını silmek istediğinize emin misiniz? Kayıt silindiğinde bu cevap verileri kalıcı olarak yok olacaktır.
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
