import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Monitor, Palette, Check, RotateCcw, Info } from 'lucide-react';

import FieldPalette from '../../components/admin/form-builder/FieldPalette';
import FormCanvas from '../../components/admin/form-builder/FormCanvas';
import FieldSettingsPanel from '../../components/admin/form-builder/FieldSettingsPanel';
import { 
  addFieldToSection, 
  moveField, 
  setCurrentForm, 
  resetFormBuilder, 
  updateFormMeta,
  updateFormTheme
} from '../../features/forms/formBuilderSlice';
import { saveFormSchema } from '../../features/forms/formsSlice';
import axiosInstance from '../../lib/axiosInstance';

// Pre-defined premium gradient templates
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

// Swatch colors from reference
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

// Hex to RGB YIQ Luminance contrast logic
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

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentForm } = useSelector((state) => state.formBuilder);
  const { user } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('build');

  // PointerSensor with distance constraint ensures clicks are preserved
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleBrandChange = (brandId) => {
    dispatch(updateFormMeta({ key: 'brandId', value: brandId }));
    
    // Auto-update theme color based on brand selection
    const colors = {
      'bioderma': '#C41E3A',
      'the-purest': '#2E7D32',
      'laroche-posay': '#0077B6',
      'cerave': '#0A2472'
    };
    dispatch(updateFormMeta({ key: 'primaryColor', value: colors[brandId] || '#0F172A' }));
    
    // Auto-update secondary color if none selected
    const secondaryColors = {
      'bioderma': '#E23B5A',
      'the-purest': '#4CAF50',
      'laroche-posay': '#00B4D8',
      'cerave': '#2A4365'
    };
    dispatch(updateFormTheme({ key: 'secondaryColor', value: secondaryColors[brandId] || '#4978F9' }));
  };

  // Load existing form or reset builder
  useEffect(() => {
    if (user?.role === 'Editor' && (!user.allowedBrands || user.allowedBrands.length === 0)) {
      toast.error('Yetkili markanız bulunmadığı için form oluşturamazsınız.');
      navigate('/admin/forms');
      return;
    }

    if (id) {
      axiosInstance.get(`/forms/${id}`)
        .then((res) => {
          const loadedForm = res.data;
          // Check if Editor has permission to edit this form
          if (user?.role === 'Editor' && !user.allowedBrands.includes(loadedForm.brandId)) {
            toast.error('Bu markanın formunu düzenleme yetkiniz bulunmamaktadır.');
            navigate('/admin/forms');
            return;
          }
          dispatch(setCurrentForm(loadedForm));
        })
        .catch((err) => {
          toast.error(`Form yüklenirken hata oluştu: ${err}`);
          navigate('/admin/forms');
        });
    } else {
      dispatch(resetFormBuilder());
      // Set initial brand if Editor
      if (user?.role === 'Editor' && user?.allowedBrands?.length > 0) {
        handleBrandChange(user.allowedBrands[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch, user, navigate]);

  const handleSave = () => {
    if (!currentForm.title.trim()) {
      toast.error('Lütfen geçerli bir form başlığı giriniz.');
      return;
    }

    dispatch(saveFormSchema(currentForm))
      .unwrap()
      .then(() => {
        toast.success('Form şeması başarıyla kaydedildi!');
        navigate('/admin/forms');
      })
      .catch((err) => {
        toast.error(`Form kaydedilirken hata oluştu: ${err}`);
      });
  };

  // Drag and drop helper to find section id
  const findSectionId = (itemId) => {
    if (itemId.toString().startsWith('section_')) {
      return itemId;
    }
    for (const section of currentForm.sections) {
      if (section.fields.some((f) => f.id === itemId)) {
        return section.id;
      }
    }
    return null;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Case A: Dragging from Palette into Canvas Section
    if (activeId.toString().startsWith('palette_')) {
      const fieldType = activeId.toString().replace('palette_', '');
      const overSectionId = findSectionId(overId);

      if (overSectionId) {
        dispatch(
          addFieldToSection({
            type: fieldType,
            sectionId: overSectionId,
            overId: overId.toString().startsWith('section_') ? null : overId,
          })
        );
        toast.success('Yeni alan eklendi', { id: 'field-added' });
      }
    }
    // Case B: Reordering fields within Canvas
    else if (activeId.toString().startsWith('f_') && activeId !== overId) {
      const sourceSectionId = findSectionId(activeId);
      const targetSectionId = findSectionId(overId);

      if (sourceSectionId && targetSectionId) {
        dispatch(
          moveField({
            activeId,
            overId,
            overSectionId: overId.toString().startsWith('section_') ? overId : null,
          })
        );
      }
    }
  };

  // Custom Theme Handlers
  const handleGradientSelect = (tpl) => {
    dispatch(updateFormTheme({
      key: 'backgroundStyle',
      value: {
        type: 'gradient',
        value: tpl.value,
        isLight: tpl.isLight
      }
    }));
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
  };

  const handleResetTheme = () => {
    dispatch(updateFormTheme({ key: 'backgroundStyle', value: null }));
  };

  const handlePrimarySelect = (hex) => {
    dispatch(updateFormTheme({ key: 'primaryColor', value: hex }));
  };

  const handleSecondarySelect = (hex) => {
    dispatch(updateFormTheme({ key: 'secondaryColor', value: hex }));
  };

  const activeBg = currentForm.theme?.backgroundStyle;
  const primaryColor = currentForm.theme?.primaryColor || '#C41E3A';
  const secondaryColor = currentForm.theme?.secondaryColor || '#4978F9';

  // YIQ brightness checkers for preview contrast
  const isPrimaryLight = getIsLight(primaryColor);
  const isSecondaryLight = getIsLight(secondaryColor);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden text-slate-800">
      
      {/* Main Form Builder Layout (Responsive stacking for tablets and mobile) */}
      <div className="flex flex-col flex-1 overflow-hidden w-full bg-slate-50 animate-fade-in">
        {/* Form Builder Header Bar */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 py-4 px-6 border-b border-slate-200 bg-white shrink-0 z-30 w-full shadow-xs">
          
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <button 
              onClick={() => navigate('/admin/forms')}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="Geri Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 flex-1 lg:max-w-xs min-w-0">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0">Başlık:</span>
              <input
                type="text"
                value={currentForm.title}
                onChange={(e) => dispatch(updateFormMeta({ key: 'title', value: e.target.value }))}
                placeholder="Form Adı"
                className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-violet-600 focus:outline-none text-base font-bold text-slate-800 pb-0.5 w-full transition-colors truncate"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto lg:justify-end">
            {/* Brand Selection */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Marka:</span>
              {user?.role === 'Editor' && (!user.allowedBrands || user.allowedBrands.length === 0) ? (
                <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  Yetkili marka yok
                </span>
              ) : (
                <select
                  value={currentForm.brandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 cursor-pointer"
                >
                  {['bioderma', 'the-purest', 'laroche-posay', 'cerave']
                    .filter((b) => user?.role === 'Admin' || user?.allowedBrands?.includes(b))
                    .map((b) => (
                      <option key={b} value={b}>
                        {b === 'bioderma' ? 'Bioderma' :
                         b === 'the-purest' ? 'The Purest' :
                         b === 'laroche-posay' ? 'La Roche-Posay' :
                         b === 'cerave' ? 'CeraVe' : b}
                      </option>
                    ))
                  }
                </select>
              )}
            </div>

            {/* Durum Selection */}
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Durum:</span>
              <select
                value={currentForm.status}
                onChange={(e) => dispatch(updateFormMeta({ key: 'status', value: e.target.value }))}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-800 cursor-pointer"
              >
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
              </select>
            </div>

            {/* Build / Preview Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 select-none shrink-0">
              <button
                type="button"
                onClick={() => setMode('build')}
                className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                  mode === 'build' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                  mode === 'preview' 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Önizleme
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer select-none shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        </header>

        {/* Main Drag-and-Drop Area */}
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden w-full">
            {/* Sol Panel: Alan Paleti */}
            {mode === 'build' && <FieldPalette />}

            {/* Orta Panel: Canlı Form Önizleme Canvası */}
            <FormCanvas mode={mode} setMode={setMode} />

            {/* Sağ Panel: Ayar Paneli */}
            {mode === 'build' && <FieldSettingsPanel />}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
