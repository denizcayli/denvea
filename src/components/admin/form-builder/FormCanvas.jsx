import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Trash2, 
  Plus, 
  FolderOpen,
  Palette,
  Check,
  RotateCcw,
  Info,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  setSelectedFieldId, 
  setSelectedSectionId, 
  deleteField, 
  addSection, 
  deleteSection, 
  updateSectionTitle,
  updateFormTheme
} from '../../../features/forms/formBuilderSlice';
import SortableFieldWrapper from './SortableFieldWrapper';
import toast from 'react-hot-toast';

const GRADIENT_TEMPLATES = [
  { name: 'Gün Batımı', value: 'linear-gradient(135deg, #F97316 0%, #EC4899 100%)', preview: 'bg-gradient-to-br from-orange-500 to-pink-500', isLight: false },
  { name: 'Okyanus', value: 'linear-gradient(135deg, #0284C7 0%, #0D9488 100%)', preview: 'bg-gradient-to-br from-sky-500 to-teal-500', isLight: false },
  { name: 'Orman', value: 'linear-gradient(135deg, #059669 0%, #16A34A 100%)', preview: 'bg-gradient-to-br from-emerald-500 to-green-600', isLight: false },
  { name: 'Gece Yarısı', value: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)', preview: 'bg-gradient-to-br from-indigo-900 to-slate-950', isLight: false },
  { name: 'Bahar', value: 'linear-gradient(135deg, #FCD34D 0%, #F472B6 100%)', preview: 'bg-gradient-to-br from-amber-300 to-pink-400', isLight: true },
  { name: 'Lavanta', value: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', preview: 'bg-gradient-to-br from-violet-500 to-pink-500', isLight: false },
  { name: 'Gökkuşağı', value: 'linear-gradient(135deg, #FF007A 0%, #7928CA 50%, #00DFD8 100%)', preview: 'bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-400', isLight: false },
  { name: 'Altın Güneş', value: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', preview: 'bg-gradient-to-br from-amber-400 to-amber-700', isLight: false }
];

const parseGradientValue = (gradStr) => {
  if (!gradStr || !gradStr.startsWith('linear-gradient')) {
    return { start: '#F97316', end: '#EC4899', angle: '135deg' };
  }
  const match = gradStr.match(/\(([^)]+)\)/);
  if (!match) return { start: '#F97316', end: '#EC4899', angle: '135deg' };
  
  const parts = match[1].split(',').map(p => p.trim());
  if (parts.length < 3) return { start: '#F97316', end: '#EC4899', angle: '135deg' };
  
  const angle = parts[0];
  const start = parts[1].split(' ')[0];
  const end = parts[2].split(' ')[0];
  return { start, end, angle };
};

const SWATCHES = [
  '#FACC15', // Sarı
  '#FA6F57', // Mercan
  '#F97316', // Turuncu
  '#EF4444', // Kırmızı
  '#582259', // Bordo
  '#EC4899', // Pembe
  '#8B5CF6', // Mor
  '#4978F9', // Mavi
  '#06B6D4', // Turkuaz
  '#10B981', // Yeşil
  '#171717'  // Siyah
];

const getIsLight = (hexColor) => {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  const c = hexColor.substring(1);
  if (c.length !== 6 && c.length !== 3) return false;
  const cleanHex = c.length === 3 
    ? c[0] + c[0] + c[1] + c[1] + c[2] + c[2] 
    : c;
  const rgb = parseInt(cleanHex, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180;
};

const getBrandLogo = (brandId) => {
  const map = {
    bioderma: '/logo/bioderma logo.png',
    'the-purest': '/logo/the purest logo.png',
    'laroche-posay': '/logo/la roche-posay logo.png',
    cerave: '/logo/cerave logo.jpg'
  };
  return map[brandId] || '';
};

function DroppableSection({ section, selectedSectionId, handleSectionSelect, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      sectionId: section.id,
    },
  });

  const isSectionActive = selectedSectionId === section.id;

  return (
    <div
      ref={setNodeRef}
      onClick={() => handleSectionSelect(section.id)}
      className={`border rounded-2xl p-6 transition-all duration-200 ${
        isOver
          ? 'border-violet-600 bg-slate-100/50 shadow-sm scale-[1.01]'
          : isSectionActive
          ? 'border-violet-600 bg-white shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      {children}
    </div>
  );
}

export default function FormCanvas({ mode, setMode }) {
  const { currentForm, selectedFieldId, selectedSectionId } = useSelector((state) => state.formBuilder);
  const dispatch = useDispatch();

  const [startColor, setStartColor] = useState('#F97316');
  const [endColor, setEndColor] = useState('#EC4899');
  const [angle, setAngle] = useState('135deg');

  const [templates, setTemplates] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('custom_gradient_templates') || '[]');
    return [...GRADIENT_TEMPLATES, ...saved];
  });

  const handleSaveAsPreset = () => {
    const name = window.prompt('Yeni hazır şablon için bir isim girin:');
    if (!name) return;
    const cleanName = name.trim();
    if (!cleanName) return;

    const value = `linear-gradient(${angle}, ${startColor} 0%, ${endColor} 100%)`;
    
    // Average YIQ brightness calculation
    const r1 = parseInt(startColor.slice(1, 3), 16) || 0;
    const g1 = parseInt(startColor.slice(3, 5), 16) || 0;
    const b1 = parseInt(startColor.slice(5, 7), 16) || 0;
    const r2 = parseInt(endColor.slice(1, 3), 16) || 0;
    const g2 = parseInt(endColor.slice(3, 5), 16) || 0;
    const b2 = parseInt(endColor.slice(5, 7), 16) || 0;
    
    const avgR = (r1 + r2) / 2;
    const avgG = (g1 + g2) / 2;
    const avgB = (b1 + b2) / 2;
    const yiq = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
    const isLight = yiq >= 180;

    const newTemplate = {
      name: cleanName,
      value,
      preview: 'bg-gradient-to-br',
      isLight
    };

    const saved = JSON.parse(localStorage.getItem('custom_gradient_templates') || '[]');
    const updated = [...saved, newTemplate];
    localStorage.setItem('custom_gradient_templates', JSON.stringify(updated));
    setTemplates([...GRADIENT_TEMPLATES, ...updated]);

    dispatch(updateFormTheme({
      key: 'backgroundStyle',
      value: {
        type: 'gradient',
        value,
        isLight,
        customGrad: { start: startColor, end: endColor, angle }
      }
    }));

    toast.success(`"${cleanName}" şablonu başarıyla kaydedildi ve uygulandı!`);
  };

  useEffect(() => {
    if (currentForm.theme?.backgroundStyle?.type === 'gradient' && currentForm.theme.backgroundStyle.value) {
      const parsed = parseGradientValue(currentForm.theme.backgroundStyle.value);
      setStartColor(parsed.start);
      setEndColor(parsed.end);
      setAngle(parsed.angle);
    }
  }, [currentForm.theme?.backgroundStyle?.value]);

  const handleCustomGradientChange = (start, end, ang) => {
    const gradientValue = `linear-gradient(${ang}, ${start} 0%, ${end} 100%)`;
    
    // Average YIQ brightness calculation
    const r1 = parseInt(start.slice(1, 3), 16) || 0;
    const g1 = parseInt(start.slice(3, 5), 16) || 0;
    const b1 = parseInt(start.slice(5, 7), 16) || 0;
    
    const r2 = parseInt(end.slice(1, 3), 16) || 0;
    const g2 = parseInt(end.slice(3, 5), 16) || 0;
    const b2 = parseInt(end.slice(5, 7), 16) || 0;
    
    const avgR = (r1 + r2) / 2;
    const avgG = (g1 + g2) / 2;
    const avgB = (b1 + b2) / 2;
    
    const yiq = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;
    const isLight = yiq >= 180;

    dispatch(updateFormTheme({
      key: 'backgroundStyle',
      value: {
        type: 'gradient',
        value: gradientValue,
        isLight,
        customGrad: { start, end, angle: ang }
      }
    }));
    toast.success('Özel degrade tema uygulandı!', { id: 'theme-changed' });
  };

  const handleFieldSelect = (fieldId, e) => {
    e.stopPropagation();
    dispatch(setSelectedFieldId(fieldId));
  };

  const handleSectionSelect = (sectionId) => {
    dispatch(setSelectedSectionId(sectionId));
  };

  const handleDeleteField = (fieldId, e) => {
    e.stopPropagation();
    dispatch(deleteField(fieldId));
    toast.success('Alan başarıyla silindi.', { id: 'field-deleted' });
  };

  const handleSectionTitleChange = (sectionId, value) => {
    dispatch(updateSectionTitle({ sectionId, title: value }));
  };

  const activeBg = currentForm.theme?.backgroundStyle;
  const primaryColor = currentForm.theme?.primaryColor || '#C41E3A';
  const secondaryColor = currentForm.theme?.secondaryColor || '#4978F9';
  const componentColor = currentForm.theme?.componentColor || primaryColor;
  const isPrimaryLight = getIsLight(primaryColor);
  const isSecondaryLight = getIsLight(secondaryColor);
  const fieldShape = currentForm.theme?.fieldShape || 'rounded-xl';

  const handleGradientSelect = (tpl) => {
    dispatch(updateFormTheme({
      key: 'backgroundStyle',
      value: {
        type: 'gradient',
        value: tpl.value,
        isLight: tpl.isLight
      }
    }));
    toast.success(`${tpl.name} şablonu uygulandı!`, { id: 'theme-changed' });
  };

  const handleSolidSelect = (hex) => {
    dispatch(updateFormTheme({
      key: 'backgroundStyle',
      value: {
        type: 'solid',
        value: hex,
        isLight: getIsLight(hex)
      }
    }));
    toast.success('Düz renk tema uygulandı!', { id: 'theme-changed' });
  };

  const handleResetTheme = () => {
    dispatch(updateFormTheme({ key: 'backgroundStyle', value: null }));
    toast.success('Tema varsayılana sıfırlandı.', { id: 'theme-changed' });
  };

  const handlePrimarySelect = (hex) => {
    dispatch(updateFormTheme({ key: 'primaryColor', value: hex }));
    toast.success('Ana renk güncellendi.', { id: 'theme-changed' });
  };

  const handleSecondarySelect = (hex) => {
    dispatch(updateFormTheme({ key: 'secondaryColor', value: hex }));
    toast.success('İkincil renk güncellendi.', { id: 'theme-changed' });
  };

  const handleComponentSelect = (hex) => {
    dispatch(updateFormTheme({ key: 'componentColor', value: hex }));
    toast.success('Bileşen rengi güncellendi.', { id: 'theme-changed' });
  };

  const renderInteractiveField = (field) => {
    let inputComponent;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        inputComponent = (
          <input
            type="text"
            placeholder={field.placeholder || ''}
            className={`w-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400 ${fieldShape}`}
          />
        );
        break;
      case 'phone':
        inputComponent = (
          <input
            type="text"
            placeholder={field.mask || '0 (5__) ___ __ __'}
            className={`w-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400 ${fieldShape}`}
          />
        );
        break;
      case 'date':
        inputComponent = (
          <div className="relative">
            <input
              type="date"
              className={`w-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer ${fieldShape}`}
            />
          </div>
        );
        break;
      case 'radio':
        inputComponent = (
          <div className="space-y-2.5">
            {field.options?.map((opt, idx) => {
              const isChecked = idx === 0;
              return (
                <div key={opt.id} className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <div 
                    className="w-4.5 h-4.5 border rounded-full flex items-center justify-center transition-all shrink-0 bg-white"
                    style={{
                      borderColor: isChecked ? componentColor : '#cbd5e1',
                      borderWidth: '1.5px'
                    }}
                  >
                    {isChecked && (
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: componentColor }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-slate-650 font-medium">{opt.label}</span>
                </div>
              );
            })}
          </div>
        );
        break;
      case 'checkbox-group':
        inputComponent = (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white p-4 border border-slate-200 rounded-lg">
            {field.options?.map((opt, idx) => {
              const isChecked = idx === 0;
              return (
                <div key={opt.id} className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <div 
                    className={`w-4.5 h-4.5 border flex items-center justify-center transition-all shrink-0 ${
                      fieldShape === 'rounded-none' ? 'rounded-none' : fieldShape === 'rounded-full' ? 'rounded-full' : 'rounded'
                    } ${
                      isChecked ? 'text-white' : 'border-slate-300 bg-white'
                    }`}
                    style={{
                      backgroundColor: isChecked ? componentColor : 'white',
                      borderColor: isChecked ? componentColor : '#cbd5e1'
                    }}
                  >
                    {isChecked && (
                      <svg className="w-2.5 h-2.5 stroke-current" strokeWidth={3} fill="none" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-650 font-medium">{opt.label}</span>
                </div>
              );
            })}
          </div>
        );
        break;
      case 'select-linked':
        inputComponent = (
          <div className="space-y-2">
            <select className={`w-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer ${fieldShape}`}>
              <option value="">Seçiniz...</option>
              <option value="ist">İstanbul</option>
              <option value="ank">Ankara</option>
              <option value="izmir">İzmir</option>
            </select>
          </div>
        );
        break;
      case 'file':
        inputComponent = (
          <div className={`border border-dashed border-slate-300 p-6 text-center bg-white cursor-pointer hover:bg-slate-50 transition-colors ${fieldShape}`}>
            <span className="text-xs text-slate-500">Dosya yüklemek için tıklayın veya sürükleyin</span>
          </div>
        );
        break;
      case 'checkbox':
        inputComponent = (
          <div className="flex items-start space-x-2.5 cursor-pointer select-none">
            <div 
              className={`w-4.5 h-4.5 border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                fieldShape === 'rounded-none' ? 'rounded-none' : fieldShape === 'rounded-full' ? 'rounded-full' : 'rounded'
              } text-white`}
              style={{ backgroundColor: componentColor, borderColor: componentColor }}
            >
              <svg className="w-2.5 h-2.5 stroke-current" strokeWidth={3.5} fill="none" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-xs text-slate-650 leading-tight font-medium">{field.label}</span>
          </div>
        );
        break;
      case 'info-text':
        inputComponent = (
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-655 whitespace-pre-line">{field.label}</p>
            {field.links && field.links.length > 0 && (
              <div className="mt-2 space-y-1">
                {field.links.map((link, idx) => (
                  <a key={idx} href="#" className="text-xs text-slate-700 hover:text-slate-950 underline block font-semibold">
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
        break;
      default:
        inputComponent = null;
    }

    return (
      <div key={field.id} className="p-4 rounded-xl border border-slate-200 bg-white">
        {field.type !== 'checkbox' && field.type !== 'info-text' && (
          <label className="block text-xs font-bold text-slate-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {inputComponent}
      </div>
    );
  };

  const renderFieldPreview = (field) => {
    const isSelected = selectedFieldId === field.id;
    
    let inputComponent;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        inputComponent = (
          <input
            type="text"
            disabled
            placeholder={field.placeholder || ''}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-500 focus:outline-none"
          />
        );
        break;
      case 'phone':
        inputComponent = (
          <input
            type="text"
            disabled
            placeholder={field.mask || '0 (5__) ___ __ __'}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-500 focus:outline-none"
          />
        );
        break;
      case 'date':
        inputComponent = (
          <div className="relative">
            <input
              type="text"
              disabled
              placeholder={field.format || 'dd.mm.yyyy'}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-500 focus:outline-none text-left"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-xs">📅</span>
          </div>
        );
        break;
      case 'radio':
        inputComponent = (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <input type="radio" disabled className="w-4 h-4 text-slate-900 border-slate-300 bg-slate-50" />
                <span className="text-sm text-slate-600">{opt.label}</span>
              </div>
            ))}
          </div>
        );
        break;
      case 'checkbox-group':
        inputComponent = (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-lg animate-fade-in">
            {field.options?.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="w-4 h-4 text-slate-900 border-slate-300 rounded bg-slate-50" />
                <span className="text-sm text-slate-600">{opt.label}</span>
              </div>
            ))}
          </div>
        );
        break;
      case 'select-linked':
        inputComponent = (
          <div className="space-y-2">
            <select disabled className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-500 appearance-none cursor-not-allowed">
              <option>{field.label} - Liste</option>
            </select>
          </div>
        );
        break;
      case 'file':
        inputComponent = (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50">
            <span className="text-xs text-slate-500">Dosya yüklemek için tıklayın veya sürükleyin</span>
          </div>
        );
        break;
      case 'checkbox':
        inputComponent = (
          <div className="flex items-start space-x-2">
            <input type="checkbox" disabled className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded bg-slate-50" />
            <span className="text-sm text-slate-600 leading-tight">{field.label}</span>
          </div>
        );
        break;
      case 'info-text':
        inputComponent = (
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-600 whitespace-pre-line">{field.label}</p>
            {field.links && field.links.length > 0 && (
              <div className="mt-2 space-y-1">
                {field.links.map((link, idx) => (
                  <a key={idx} href="#" className="text-xs text-slate-700 hover:text-slate-950 underline block font-semibold">
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
        break;
      default:
        inputComponent = null;
    }

    return (
      <div
        key={field.id}
        id={field.id}
        onClick={(e) => handleFieldSelect(field.id, e)}
        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer relative group flex-1 ${
          isSelected 
            ? 'border-violet-600 bg-violet-50/20 shadow-sm animate-pulse-subtle' 
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        {field.type !== 'checkbox' && field.type !== 'info-text' && (
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {inputComponent}

        {isSelected && (
          <div className="absolute -top-3 -right-2 flex items-center space-x-1.5 z-10 bg-violet-600 rounded-lg p-1 shadow-md">
            <button
              onClick={(e) => handleDeleteField(field.id, e)}
              className="p-1 rounded text-white hover:bg-violet-700 transition-colors cursor-pointer"
              title="Alanı Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const wrapperClass = mode === 'preview'
    ? `flex-1 py-12 px-4 md:px-8 overflow-y-auto h-auto lg:h-[calc(100vh-4rem)] flex flex-col items-center justify-start transition-all duration-300 w-full ${
        getIsLight(activeBg?.value || primaryColor) ? 'text-slate-900' : 'text-white'
      }`
    : "flex-1 bg-slate-50 p-6 md:p-8 overflow-y-auto h-auto lg:h-[calc(100vh-4rem)] flex flex-col items-center w-full";

  const themeStyles = {
    '--brand-color': primaryColor,
    '--brand-color-hover': secondaryColor,
    '--brand-color-glow': `${primaryColor}22`,
    '--secondary-color': secondaryColor,
  };

  const outerStyles = { ...themeStyles };
  if (activeBg) {
    if (activeBg.type === 'gradient') {
      outerStyles.backgroundImage = activeBg.value;
    } else if (activeBg.type === 'solid') {
      outerStyles.backgroundColor = activeBg.value;
    }
  } else {
    outerStyles.backgroundColor = primaryColor;
  }

  return (
    <div 
      style={mode === 'preview' ? outerStyles : {}}
      className={wrapperClass}
    >
      <div className="w-full max-w-3xl space-y-6">
        
        {mode === 'preview' ? (
          /* Portal Önizleme Görünümü */
          <div className="w-full bg-white rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-fade-in text-slate-800 border border-slate-100">
            {/* Önizleme Başlığı */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setMode('build')}
                style={{ '--hover-color': secondaryColor }}
                className="flex items-center space-x-2 text-slate-500 hover:text-[var(--hover-color)] transition-colors text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Önizlemeden Çık</span>
              </button>

              <div className="flex items-center space-x-2.5 select-none">
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="w-3 h-3 rounded-full" 
                />
                <span className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
                  {currentForm.brandId.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Brand Logo Header */}
            {getBrandLogo(currentForm.brandId) && (
              <div className="flex justify-center pt-2 select-none mb-4">
                <img 
                  src={getBrandLogo(currentForm.brandId)} 
                  alt={currentForm.brandId} 
                  className="h-20 max-w-full object-contain mix-blend-multiply"
                />
              </div>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentForm.title} Katılım Formu
              </h2>
              <p className="text-xs text-slate-500">
                Bu canlı bir önizlemedir. Doldurulan veriler kaydedilmez.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Form önizleme kaydı başarılı! (Simülasyon)', { id: 'preview-submit' });
              }} 
              className="space-y-8"
            >
              {currentForm.sections.map((section) => (
                <div 
                  key={section.id} 
                  className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 md:p-8 space-y-6"
                >
                  <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-200 flex items-center">
                    <span 
                      style={{ backgroundColor: primaryColor }}
                      className="w-1.5 h-4 rounded-full mr-2.5 inline-block" 
                    />
                    {section.title}
                  </h3>
                  <div className="space-y-5">
                    {section.fields?.map((field) => renderInteractiveField(field))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                style={{ backgroundColor: primaryColor }}
                className={`w-full py-4 font-extrabold text-sm transition-all focus:outline-none shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer text-center ${
                  isPrimaryLight ? 'text-slate-900' : 'text-white'
                } ${fieldShape}`}
              >
                Kaydı Tamamla (Simülasyon)
              </button>
            </form>
          </div>
        ) : (
          /* Düzenleme (Build) Canvası */
          <>
            {/* Tema & Tasarım Ayarları Kartı */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-violet-600" />
                  <h3 className="text-sm font-bold text-slate-800">Tema ve Tasarım Seçenekleri</h3>
                </div>
                {(activeBg || currentForm.theme?.secondaryColor) && (
                  <button
                    onClick={handleResetTheme}
                    className="text-[10px] text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ayarları Sıfırla</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Arka Plan Şablonları & Rengi */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Arka Plan Görünümü</span>
                    <div className="flex space-x-2 p-0.5 bg-slate-105 rounded-lg border border-slate-200 w-fit mb-3">
                      <button
                        onClick={() => {
                          if (activeBg?.type !== 'gradient') {
                            handleGradientSelect(GRADIENT_TEMPLATES[0]);
                          }
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          activeBg?.type === 'gradient'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Degrade
                      </button>
                      <button
                        onClick={() => {
                          if (activeBg?.type !== 'solid') {
                            handleSolidSelect('#FFFFFF');
                          }
                        }}
                        className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          activeBg?.type === 'solid'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Düz Renk
                      </button>
                      <button
                        onClick={handleResetTheme}
                        className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          !activeBg
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Varsayılan
                      </button>
                    </div>
                  </div>

                  {activeBg?.type === 'gradient' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Temalar</span>
                      <div className="grid grid-cols-4 gap-2">
                        {templates.map((tpl) => {
                          const isSelected = activeBg?.type === 'gradient' && activeBg.value === tpl.value;
                          return (
                            <button
                              key={tpl.name}
                              onClick={() => handleGradientSelect(tpl)}
                              style={{ backgroundImage: tpl.value }}
                              className={`h-9 rounded-lg relative cursor-pointer border hover:scale-105 transition-all flex items-center justify-center ${
                                isSelected ? 'border-violet-600 ring-2 ring-violet-100' : 'border-slate-250'
                              }`}
                              title={tpl.name}
                            >
                              {isSelected && (
                                <div className={`p-0.5 rounded-full ${tpl.isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} shadow-sm`}>
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Özel Degrade Ayarları */}
                      <div className="space-y-3 mt-3 pt-3 border-t border-slate-100 animate-fade-in text-slate-800">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Özel Renkler</span>
                        
                        {/* Live Color Gradient Preview Swatch */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Canlı Temalar</span>
                            <button
                              type="button"
                              onClick={handleSaveAsPreset}
                              className="text-[9px] text-violet-600 hover:text-violet-750 font-extrabold flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <span>+ Şablon Olarak Kaydet</span>
                            </button>
                          </div>
                          <div 
                            style={{ backgroundImage: `linear-gradient(${angle}, ${startColor} 0%, ${endColor} 100%)` }}
                            className="h-10 w-full rounded-xl border border-slate-200 shadow-inner transition-all duration-300 flex items-center justify-center"
                          >
                            <span className="text-[9px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-100 uppercase tracking-wider">
                              {startColor} → {endColor}
                            </span>
                          </div>
                        </div>

                        {/* Pickers Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Start Color Picker */}
                          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Başlangıç:</span>
                            <input
                              type="color"
                              value={startColor}
                              onChange={(e) => {
                                setStartColor(e.target.value);
                                handleCustomGradientChange(e.target.value, endColor, angle);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0 overflow-hidden bg-transparent shrink-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={startColor}
                              onChange={(e) => {
                                setStartColor(e.target.value);
                                handleCustomGradientChange(e.target.value, endColor, angle);
                              }}
                              className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono text-center text-slate-700 uppercase focus:outline-none font-bold shrink-0"
                            />
                          </div>

                          {/* End Color Picker */}
                          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <span className="text-[9px] text-slate-400 font-bold uppercase shrink-0">Bitiş:</span>
                            <input
                              type="color"
                              value={endColor}
                              onChange={(e) => {
                                setEndColor(e.target.value);
                                handleCustomGradientChange(startColor, e.target.value, angle);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0 overflow-hidden bg-transparent shrink-0"
                            />
                            <input
                              type="text"
                              maxLength={7}
                              value={endColor}
                              onChange={(e) => {
                                setEndColor(e.target.value);
                                handleCustomGradientChange(startColor, e.target.value, angle);
                              }}
                              className="w-16 bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono text-center text-slate-700 uppercase focus:outline-none font-bold shrink-0"
                            />
                          </div>
                        </div>


                      </div>
                    </div>
                  )}

                  {activeBg?.type === 'solid' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Düz Renk Seçici</span>
                      <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <input
                          type="color"
                          value={activeBg.value}
                          onChange={(e) => handleSolidSelect(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-250 p-0 overflow-hidden bg-transparent"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                            {activeBg.value}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {activeBg.isLight ? 'Açık Zemin (Koyu Yazı)' : 'Koyu Zemin (Açık Yazı)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!activeBg && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start space-x-2">
                      <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        Varsayılan zemin seçilidir. Portal, seçtiğiniz markanın kendi rengini zemin olarak kullanacaktır.
                      </p>
                    </div>
                  )}

                  {/* Form Alanı Şekli */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Form Alanı Şekli (Field Shape)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => dispatch(updateFormTheme({ key: 'fieldShape', value: 'rounded-none' }))}
                        className={`py-2 px-3 border text-xs font-bold transition-all cursor-pointer rounded-none text-center ${
                          fieldShape === 'rounded-none'
                            ? 'border-violet-600 bg-violet-50/30 text-violet-750 font-extrabold shadow-xs'
                            : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        Kare
                      </button>
                      <button
                        onClick={() => dispatch(updateFormTheme({ key: 'fieldShape', value: 'rounded-xl' }))}
                        className={`py-2 px-3 border text-xs font-bold transition-all cursor-pointer rounded-lg text-center ${
                          fieldShape === 'rounded-xl'
                            ? 'border-violet-600 bg-violet-50/30 text-violet-750 font-extrabold shadow-xs'
                            : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        Yuvarlak
                      </button>
                      <button
                        onClick={() => dispatch(updateFormTheme({ key: 'fieldShape', value: 'rounded-full' }))}
                        className={`py-2 px-3 border text-xs font-bold transition-all cursor-pointer rounded-full text-center ${
                          fieldShape === 'rounded-full'
                            ? 'border-violet-600 bg-violet-50/30 text-violet-750 font-extrabold shadow-xs'
                            : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        Kapsül
                      </button>
                    </div>

                    {/* Unified Example Preview Row (Input, Checkbox, Button in selected shape) */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200/50 rounded-xl mt-2.5">
                      {/* Checkbox preview */}
                      <div 
                        className={`w-5 h-5 border flex items-center justify-center text-white shrink-0 ${
                          fieldShape === 'rounded-none' ? 'rounded-none' : fieldShape === 'rounded-full' ? 'rounded-full' : 'rounded'
                        }`}
                        style={{ backgroundColor: componentColor, borderColor: componentColor }}
                      >
                        <svg className="w-3 h-3 stroke-current" strokeWidth={3.5} fill="none" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>

                      {/* Small mock text input */}
                      <div 
                        className={`flex-1 h-8 bg-white border border-slate-200 px-2 flex items-center text-[10px] text-slate-400 select-none ${fieldShape}`}
                      >
                        Metin girişi...
                      </div>

                      {/* Small mock button */}
                      <div 
                        className={`px-3 h-8 flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${fieldShape}`}
                        style={{ backgroundColor: primaryColor }}
                      >
                        Gönder
                      </div>
                    </div>
                  </div>

                </div>

                {/* Portal Renk Paleti (Primary & Secondary) */}
                <div className="space-y-4">
                  
                  {/* Primary Color row */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ana Renk (Primary Color)</span>
                    
                    {/* Swatches Grid */}
                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 w-full">
                      {SWATCHES.map((color) => {
                        const isSelected = primaryColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={`p-${color}`}
                            onClick={() => handlePrimarySelect(color)}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0 border border-slate-200/50 ${
                              isSelected ? 'ring-2 ring-violet-500 ring-offset-1 scale-105' : ''
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Custom Input Block */}
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => handlePrimarySelect(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-slate-250 p-0 overflow-hidden bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={primaryColor}
                        onChange={(e) => handlePrimarySelect(e.target.value)}
                        className="w-14 bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono text-center text-slate-700 uppercase focus:outline-none font-bold shrink-0"
                      />
                    </div>
                  </div>

                  {/* Secondary Color row */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">İkincil Renk (Secondary Color)</span>
                    
                    {/* Swatches Grid */}
                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 w-full">
                      {SWATCHES.map((color) => {
                        const isSelected = secondaryColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={`s-${color}`}
                            onClick={() => handleSecondarySelect(color)}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0 border border-slate-200/50 ${
                              isSelected ? 'ring-2 ring-violet-500 ring-offset-1 scale-105' : ''
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Custom Input Block */}
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => handleSecondarySelect(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-slate-250 p-0 overflow-hidden bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={secondaryColor}
                        onChange={(e) => handleSecondarySelect(e.target.value)}
                        className="w-14 bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono text-center text-slate-700 uppercase focus:outline-none font-bold shrink-0"
                      />
                    </div>
                  </div>

                  {/* Component Color row */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bileşen Rengi (Component Color)</span>
                    
                    {/* Swatches Grid */}
                    <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 w-full">
                      {SWATCHES.map((color) => {
                        const isSelected = componentColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={`c-${color}`}
                            onClick={() => handleComponentSelect(color)}
                            style={{ backgroundColor: color }}
                            className={`w-5 h-5 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0 border border-slate-200/50 ${
                              isSelected ? 'ring-2 ring-violet-500 ring-offset-1 scale-105' : ''
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Custom Input Block */}
                    <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
                      <input
                        type="color"
                        value={componentColor}
                        onChange={(e) => handleComponentSelect(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-slate-250 p-0 overflow-hidden bg-transparent shrink-0"
                      />
                      <input
                        type="text"
                        maxLength={7}
                        value={componentColor}
                        onChange={(e) => handleComponentSelect(e.target.value)}
                        className="w-14 bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono text-center text-slate-700 uppercase focus:outline-none font-bold shrink-0"
                      />
                    </div>
                  </div>

                  {/* Previews block */}
                  <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      type="button"
                      disabled
                      style={{ backgroundColor: primaryColor, color: isPrimaryLight ? '#0F172A' : '#FFFFFF' }}
                      className={`flex-1 py-2.5 px-4 text-xs font-extrabold shadow-xs cursor-default text-center select-none ${fieldShape}`}
                    >
                      Ana Buton
                    </button>
                    <button
                      type="button"
                      disabled
                      style={{ backgroundColor: secondaryColor, color: isSecondaryLight ? '#0F172A' : '#FFFFFF' }}
                      className={`flex-1 py-2.5 px-4 text-xs font-extrabold shadow-xs cursor-default text-center select-none border border-slate-150 ${fieldShape}`}
                    >
                      İkincil Buton
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Başlık Kartı */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-bold uppercase tracking-wide">
                  {currentForm.brandId.toUpperCase()}
                </span>
                <span className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-500 rounded-full font-semibold">
                  {currentForm.status === 'published' ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-950 tracking-tight">{currentForm.title}</h2>
            </div>

            {/* Bölümler Konteyneri */}
            <div className="space-y-8">
              {currentForm.sections.map((section) => {
                const isSectionActive = selectedSectionId === section.id;
                return (
                  <DroppableSection
                    key={section.id}
                    section={section}
                    selectedSectionId={selectedSectionId}
                    handleSectionSelect={handleSectionSelect}
                  >
                    {/* Bölüm Başlığı */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-3 flex-1 mr-4">
                        <FolderOpen className={`w-5 h-5 ${isSectionActive ? 'text-violet-600' : 'text-slate-400'}`} />
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-violet-650 focus:outline-none text-base font-bold text-slate-850 pb-0.5 w-full transition-colors"
                          placeholder="Bölüm Başlığı"
                        />
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {currentForm.sections.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(deleteSection(section.id));
                              toast.success('Bölüm başarıyla silindi.', { id: 'section-action' });
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Bölümü Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bölüm Alanları */}
                    <div className="space-y-4 min-h-[100px] flex flex-col justify-center">
                      {section.fields.length > 0 ? (
                        <SortableContext
                          items={section.fields.map((f) => f.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {section.fields.map((field) => (
                            <SortableFieldWrapper key={field.id} id={field.id}>
                              {renderFieldPreview(field)}
                            </SortableFieldWrapper>
                          ))}
                        </SortableContext>
                      ) : (
                        <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-xs select-none bg-slate-50/50">
                          {isSectionActive 
                            ? 'Soldaki paletten sürükleyip veya tıklayarak bu bölüme alan ekleyin.' 
                            : 'Bu bölüme alan eklemek için sürükleyin veya önce bölümü seçin.'}
                        </div>
                      )}
                    </div>
                  </DroppableSection>
                );
              })}
            </div>

            {/* Bölüm Ekle Butonu */}
            <button
              onClick={() => {
                dispatch(addSection());
                toast.success('Yeni bölüm eklendi.', { id: 'section-action' });
              }}
              className="w-full py-4 border border-dashed border-slate-300 hover:border-slate-400 rounded-2xl flex items-center justify-center space-x-2 text-sm text-slate-500 hover:text-slate-800 hover:bg-white transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Bölüm Ekle</span>
            </button>
          </>
        )}

      </div>
    </div>
  );
}
