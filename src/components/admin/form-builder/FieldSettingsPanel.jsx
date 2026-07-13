import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  X,
  Settings
} from 'lucide-react';
import { 
  updateFieldProps, 
  addOption, 
  deleteOption, 
  updateOptionLabel, 
  reorderOptions,
  moveFieldUpDown
} from '../../../features/forms/formBuilderSlice';

export default function FieldSettingsPanel() {
  const { currentForm, selectedFieldId } = useSelector((state) => state.formBuilder);
  const dispatch = useDispatch();

  let selectedField = null;
  currentForm.sections.forEach((section) => {
    const found = section.fields.find((f) => f.id === selectedFieldId);
    if (found) selectedField = found;
  });

  if (!selectedField) {
    return (
      <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-6 flex flex-col justify-center items-center h-auto lg:h-[calc(100vh-4rem)] min-h-[250px] shrink-0">
        <div className="text-center">
          <Settings className="w-8 h-8 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Ayar Paneli</p>
          <p className="text-xs text-slate-500 mt-2 max-w-[200px] leading-relaxed font-medium">
            Düzenlemek ve detaylarını ayarlamak için canvas üzerindeki bir alana tıklayın.
          </p>
        </div>
      </div>
    );
  }

  const handlePropChange = (key, value) => {
    dispatch(updateFieldProps({ fieldId: selectedField.id, props: { [key]: value } }));
  };

  const handleMultiToggle = (checked) => {
    dispatch(updateFieldProps({
      fieldId: selectedField.id,
      props: {
        type: checked ? 'checkbox-group' : 'radio',
        multi: checked
      }
    }));
  };

  const handleAddOption = () => {
    dispatch(addOption({ fieldId: selectedField.id }));
  };

  const handleDeleteOption = (optionId) => {
    dispatch(deleteOption({ fieldId: selectedField.id, optionId }));
  };

  const handleOptionLabelChange = (optionId, value) => {
    dispatch(updateOptionLabel({ fieldId: selectedField.id, optionId, label: value }));
  };

  const handleReorderOption = (optionId, direction) => {
    dispatch(reorderOptions({ fieldId: selectedField.id, optionId, direction }));
  };

  const handleMoveField = (direction) => {
    dispatch(moveFieldUpDown({ fieldId: selectedField.id, direction }));
  };

  const supportsOptions = selectedField.type === 'radio' || selectedField.type === 'checkbox-group';
  const supportsMultiSelect = selectedField.type === 'radio' || selectedField.type === 'checkbox-group';
  const supportsRequired = selectedField.type !== 'info-text';
  const supportsPlaceholder = ['text', 'number', 'email'].includes(selectedField.type);

  const typeLabels = {
    'text': 'Kısa Metin',
    'number': 'Sayı Girişi',
    'email': 'E-posta',
    'phone': 'Telefon',
    'date': 'Tarih Seçici',
    'radio': 'Radyo Butonlar (Tek Seçim)',
    'checkbox-group': 'Cilt Tipi (Çoklu Seçim)',
    'select-linked': 'İl / İlçe Seçimi',
    'file': 'Dosya Yükleme',
    'checkbox': 'KVKK Onay / Checkbox',
    'info-text': 'Bilgi Metni'
  };

  return (
    <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-4rem)] text-slate-800 shrink-0 min-h-[350px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center space-x-3 bg-slate-50/50 shrink-0">
        <Settings className="w-5 h-5 text-violet-600" />
        <div>
          <h3 className="text-sm font-bold text-slate-800">Alan Ayarları</h3>
          <p className="text-[10px] text-slate-500 font-medium">
            {typeLabels[selectedField.type] || 'Bilinmeyen Tip'}
          </p>
        </div>
      </div>

      {/* Settings Form Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Alan Sıralama (Aşağı / Yukarı Taşı) */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-700 block font-sans">Alan Sırası</span>
            <span className="text-[10px] text-slate-500 block font-medium">Alanı aşağı/yukarı taşıyın.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleMoveField('up')}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 text-slate-650 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              title="Yukarı Taşı"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMoveField('down')}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-violet-50 text-slate-650 hover:text-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              title="Aşağı Taşı"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Soru Metni / Başlık */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {selectedField.type === 'info-text' ? 'Açıklama / Bilgi Metni' : 'Soru Metni / Başlık'}
          </label>
          {selectedField.type === 'info-text' ? (
            <textarea
              value={selectedField.label || ''}
              onChange={(e) => handlePropChange('label', e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors resize-none"
              placeholder="Bilgilendirme veya yasal metin içeriğini yazınız..."
            />
          ) : (
            <input
              type="text"
              value={selectedField.label || ''}
              onChange={(e) => handlePropChange('label', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
              placeholder="Soru başlığını giriniz..."
            />
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          {supportsRequired && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 animate-fade-in">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Zorunlu Alan</span>
                <span className="text-[10px] text-slate-500 block">Form doldurulurken zorunlu olsun.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedField.required || false}
                  onChange={(e) => handlePropChange('required', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
              </label>
            </div>
          )}

          {supportsMultiSelect && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 animate-fade-in">
              <div>
                <span className="text-xs font-semibold text-slate-700 block">Çoklu Seçim</span>
                <span className="text-[10px] text-slate-500 block">Çoklu seçime izin ver (Checkbox).</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selectedField.type === 'checkbox-group'}
                  onChange={(e) => handleMultiToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
              </label>
            </div>
          )}
        </div>

        {/* Placeholder */}
        {supportsPlaceholder && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Placeholder</label>
            <input
              type="text"
              value={selectedField.placeholder || ''}
              onChange={(e) => handlePropChange('placeholder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
              placeholder="Placeholder giriniz..."
            />
          </div>
        )}

        {/* Date Format */}
        {selectedField.type === 'date' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tarih Formatı</label>
            <input
              type="text"
              value={selectedField.format || ''}
              onChange={(e) => handlePropChange('format', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
              placeholder="dd.mm.yyyy"
            />
          </div>
        )}

        {/* Phone Mask */}
        {selectedField.type === 'phone' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Telefon Maskı</label>
            <input
              type="text"
              value={selectedField.mask || ''}
              onChange={(e) => handlePropChange('mask', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
              placeholder="0 (5__) ___ __ __"
            />
          </div>
        )}

        {/* Sayı Min/Max */}
        {selectedField.type === 'number' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Minimum</label>
              <input
                type="number"
                value={selectedField.min !== null && selectedField.min !== undefined ? selectedField.min : ''}
                onChange={(e) => handlePropChange('min', e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
                placeholder="Yok"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Maximum</label>
              <input
                type="number"
                value={selectedField.max !== null && selectedField.max !== undefined ? selectedField.max : ''}
                onChange={(e) => handlePropChange('max', e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
                placeholder="Yok"
              />
            </div>
          </div>
        )}

        {/* Seçenekler Listesi */}
        {supportsOptions && (
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Seçenekler</label>
            <div className="space-y-2">
              {selectedField.options?.map((opt, idx) => (
                <div key={opt.id} className="flex items-center space-x-1.5 animate-fade-in">
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleReorderOption(opt.id, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 rounded border border-slate-200 bg-white hover:bg-violet-50 text-slate-500 hover:text-violet-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleReorderOption(opt.id, 'down')}
                      disabled={idx === selectedField.options.length - 1}
                      className="p-0.5 rounded border border-slate-200 bg-white hover:bg-violet-50 text-slate-500 hover:text-violet-600 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionLabelChange(opt.id, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-50 transition-colors"
                    placeholder={`Seçenek ${idx + 1}`}
                  />

                  {selectedField.options.length > 1 && (
                    <button
                      onClick={() => handleDeleteOption(opt.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAddOption}
              className="w-full mt-2 py-2 border border-dashed border-slate-200 hover:border-violet-300 rounded-lg flex items-center justify-center space-x-1.5 text-xs text-slate-500 hover:text-violet-700 hover:bg-violet-50/50 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Seçenek Ekle</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
