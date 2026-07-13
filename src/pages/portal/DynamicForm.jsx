import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { fetchForms } from '../../features/forms/formsSlice';
import { fetchBrands } from '../../features/brands/brandsSlice';
import { submitFormAnswers } from '../../features/submissions/submissionsSlice';
import { buildDynamicZodSchema } from '../../lib/validationSchemas';
import DynamicFieldRenderer from '../../components/portal/DynamicFieldRenderer';

export default function DynamicForm() {
  const { brandId, formId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { forms, loading: formsLoading } = useSelector((state) => state.forms);
  const { brands, loading: brandsLoading } = useSelector((state) => state.brands);
  const { loading: submissionsLoading } = useSelector((state) => state.submissions);

  useEffect(() => {
    dispatch(fetchForms());
    dispatch(fetchBrands());
  }, [dispatch]);

  const activeForms = forms.filter(
    (form) => form.brandId === brandId && form.status === 'published'
  );

  const activeForm = formId
    ? activeForms.find((f) => f.id === formId)
    : activeForms.length === 1 ? activeForms[0] : null;

  const brandInfo = brands.find((b) => b.id === brandId);

  // Dynamically build schema and initialize react-hook-form
  const schema = activeForm ? buildDynamicZodSchema(activeForm.sections) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onTouch',
  });

  const onSubmit = (data) => {
    // Convert FileList objects to file metadata objects before sending to mock API
    const cleanedAnswers = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (val instanceof FileList) {
        if (val.length > 0) {
          cleanedAnswers[key] = {
            name: val[0].name,
            size: val[0].size,
            type: val[0].type,
          };
        } else {
          cleanedAnswers[key] = null;
        }
      } else {
        cleanedAnswers[key] = val;
      }
    });

    const submissionPayload = {
      formId: activeForm.id,
      brandId: brandId,
      answers: cleanedAnswers,
    };

    dispatch(submitFormAnswers(submissionPayload))
      .unwrap()
      .then(() => {
        toast.success('Form kaydı başarıyla alındı!');
        navigate(`/portal/thank-you/${brandId}`);
      })
      .catch((err) => {
        toast.error(`Form gönderilirken hata oluştu: ${err}`);
      });
  };

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

  const handleGoBack = () => {
    if (formId && activeForms.length > 1) {
      navigate(`/portal/form/${brandId}`);
    } else {
      navigate('/portal');
    }
  };

  const loading = formsLoading || brandsLoading;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[calc(100vh-5rem)]">
        <span className="text-sm text-slate-500">Form yükleniyor...</span>
      </div>
    );
  }

  // Setup CSS Variable theme styles dynamically
  const primaryColor = activeForm?.theme?.primaryColor || brandInfo?.themeColor || '#4F46E5';
  const secondaryColor = activeForm?.theme?.secondaryColor || `${primaryColor}cc`;
  const bgStyle = activeForm?.theme?.backgroundStyle;
  const logoSrc = brandInfo?.logoUrl || activeForm?.theme?.logoUrl;
  
  // Decide whether the background and/or primary brand color are light
  const isLightBrand = getIsLight(primaryColor);
  let isLightBackground = false;
  
  const themeStyles = {
    '--brand-color': primaryColor,
    '--brand-color-hover': secondaryColor,
    '--brand-color-glow': `${primaryColor}22`,
    '--secondary-color': secondaryColor,
  };

  const outerStyles = { ...themeStyles };
  if (bgStyle) {
    if (bgStyle.type === 'gradient') {
      outerStyles.backgroundImage = bgStyle.value;
      isLightBackground = bgStyle.isLight || false;
    } else if (bgStyle.type === 'solid') {
      outerStyles.backgroundColor = bgStyle.value;
      isLightBackground = getIsLight(bgStyle.value);
    }
  } else {
    outerStyles.backgroundColor = primaryColor;
    isLightBackground = isLightBrand;
  }

  // If there are multiple active forms and none is selected, show list
  if (!formId && activeForms.length > 1) {
    return (
      <div 
        style={outerStyles} 
        className={`flex-1 min-h-[calc(100vh-5rem)] py-12 px-4 md:px-8 flex justify-center items-center ${
          isLightBackground ? 'text-slate-900' : 'text-white'
        }`}
      >
        <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-fade-in text-slate-800">
          {/* Back and Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <button
              onClick={handleGoBack}
              style={{ '--hover-color': secondaryColor }}
              className="flex items-center space-x-2 text-slate-500 hover:text-[var(--hover-color)] transition-colors text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri Dön</span>
            </button>

            <div className="flex items-center space-x-2.5 select-none">
              <div 
                style={{ backgroundColor: primaryColor }}
                className="w-3 h-3 rounded-full" 
              />
              <span className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
                {brandInfo?.name || brandId.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Katılım Formları
            </h2>
            <p className="text-xs text-slate-500">
              Lütfen katılım sağlamak istediğiniz etkinliği/formu seçin.
            </p>
          </div>

          {/* Forms List */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            {activeForms.map((form) => (
              <div 
                key={form.id}
                onClick={() => navigate(`/portal/form/${brandId}/${form.id}`)}
                className="group border border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-slate-50 p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-950 group-hover:text-slate-800 transition-colors">
                    {form.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {form.sections?.length || 0} Bölüm • {form.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0} Soru
                  </p>
                </div>
                <div 
                  style={{ backgroundColor: primaryColor }}
                  className="flex items-center justify-center p-2.5 rounded-xl text-white opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-sm"
                >
                  <ArrowRight className="w-4.5 h-4.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activeForm) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center bg-slate-50 min-h-[calc(100vh-5rem)] p-8 text-center text-slate-800">
        <div className="max-w-md space-y-6">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-xl font-bold text-slate-900">Bu Marka İçin Aktif Form Bulunmuyor</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seçtiğiniz markaya ait yayında olan herhangi bir form şeması bulunamadı. Lütfen daha sonra tekrar deneyin veya başka bir marka seçin.
          </p>
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marka Seçimine Dön</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={outerStyles} 
      className={`flex-1 min-h-[calc(100vh-5rem)] py-12 px-4 md:px-8 flex justify-center items-center ${
        isLightBackground ? 'text-slate-900' : 'text-white'
      }`}
    >
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 animate-fade-in">
        
        {/* Back and Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <button
            onClick={handleGoBack}
            style={{ '--hover-color': secondaryColor || '#0f172a' }}
            className="flex items-center space-x-2 text-slate-500 hover:text-[var(--hover-color)] transition-colors text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>

          <div className="flex items-center space-x-2.5 select-none">
            <div 
              style={{ backgroundColor: primaryColor }}
              className="w-3 h-3 rounded-full" 
            />
            <span className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
              {brandInfo?.name || activeForm.brandId.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Brand Logo Header */}
        {logoSrc && (
          <div className="flex justify-center pt-2 select-none">
            <img 
              src={logoSrc} 
              alt={brandInfo?.name || 'Brand Logo'} 
              className="h-20 max-w-full object-contain mix-blend-multiply"
            />
          </div>
        )}

        {/* Title Section */}
        <div className="space-y-2 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeForm.title} Katılım Formu
          </h2>
          <p className="text-xs text-slate-500">
            Lütfen aşağıdaki formu eksiksiz ve doğru şekilde doldurarak kaydınızı tamamlayın.
          </p>
        </div>

        {/* Dynamic Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          
          {activeForm.sections.map((section) => (
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
                 {section.fields?.map((field) => (
                  <DynamicFieldRenderer
                    key={field.id}
                    field={field}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    theme={{
                      primaryColor,
                      secondaryColor,
                      fieldShape: activeForm.theme?.fieldShape || 'rounded-xl',
                      componentColor: activeForm.theme?.componentColor || primaryColor
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button with loading protection */}
          <button
            type="submit"
            disabled={submissionsLoading}
            className={`w-full py-4 bg-[var(--brand-color)] hover:bg-[var(--brand-color-hover)] font-extrabold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[var(--brand-color-glow)] shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isLightBrand ? 'text-slate-900' : 'text-white'
            } ${activeForm.theme?.fieldShape || 'rounded-xl'}`}
          >
            {submissionsLoading ? 'Gönderiliyor...' : 'Kaydı Tamamla'}
          </button>

        </form>

      </div>
    </div>
  );
}
