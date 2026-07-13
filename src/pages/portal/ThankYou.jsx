import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle } from 'lucide-react';

import { fetchForms } from '../../features/forms/formsSlice';
import { fetchBrands } from '../../features/brands/brandsSlice';

export default function ThankYou() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { forms, loading: formsLoading } = useSelector((state) => state.forms);
  const { brands, loading: brandsLoading } = useSelector((state) => state.brands);

  useEffect(() => {
    dispatch(fetchForms());
    dispatch(fetchBrands());
  }, [dispatch]);

  const activeForm = forms.find(
    (form) => form.brandId === brandId && form.status === 'published'
  );

  const brandInfo = brands.find((b) => b.id === brandId);

  const loading = formsLoading || brandsLoading;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 min-h-[calc(100vh-5rem)]">
        <span className="text-sm text-slate-500">Yükleniyor...</span>
      </div>
    );
  }

  // Helper to determine if a color is light or dark (YIQ)
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

  const primaryColor = activeForm?.theme?.primaryColor || brandInfo?.themeColor || '#4F46E5';
  const secondaryColor = activeForm?.theme?.secondaryColor;
  const brandName = brandInfo?.name || activeForm?.brandId.toUpperCase() || 'Marka';
  const bgStyle = activeForm?.theme?.backgroundStyle;

  // Decide whether the background and/or primary brand color are light
  const isLightBrand = getIsLight(primaryColor);
  let isLightBackground = false;

  const themeStyles = {
    '--brand-color': primaryColor,
    '--brand-color-hover': secondaryColor || `${primaryColor}cc`,
    '--brand-color-glow': `${primaryColor}22`,
    '--secondary-color': secondaryColor || `${primaryColor}e6`,
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

  return (
    <div 
      style={outerStyles}
      className={`flex-1 flex flex-col justify-center items-center p-8 min-h-[calc(100vh-5rem)] ${
        isLightBackground ? 'text-slate-900' : 'text-white'
      }`}
    >
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-2xl hover:shadow-[var(--brand-color-glow)] transition-shadow duration-300">
        
        {/* Glow check icon container */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-[var(--brand-color-glow)] text-[var(--brand-color)] border border-[var(--brand-color)]/20 animate-pulse">
          <CheckCircle className="w-10 h-10" />
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Kaydınız Başarıyla Alındı!
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">{brandName}</span> katılım kaydı başarıyla oluşturulmuştur. Etkinlik ile ilgili güncellemeler ve detaylar için kayıt esnasında belirttiğiniz bilgileri takip edebilirsiniz.
          </p>
        </div>

        {/* Home Button */}
        <button
          onClick={() => navigate('/portal')}
          className={`w-full py-3.5 bg-[var(--brand-color)] hover:bg-[var(--brand-color-hover)] font-extrabold text-sm transition-all focus:outline-none focus:ring-4 focus:ring-[var(--brand-color-glow)] shadow-md shadow-[var(--brand-color-glow)] hover:translate-y-[-1px] cursor-pointer text-center ${
            isLightBrand ? 'text-slate-900' : 'text-white'
          } ${activeForm?.theme?.fieldShape || 'rounded-xl'}`}
        >
          Ana Sayfaya Dön
        </button>

      </div>
    </div>
  );
}
