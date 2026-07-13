import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBrands } from '../../features/brands/brandsSlice';
import { fetchForms } from '../../features/forms/formsSlice';
import BrandCard from '../../components/portal/BrandCard';

export default function BrandSelect() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { brands, loading: brandsLoading } = useSelector((state) => state.brands);
  const { forms, loading: formsLoading } = useSelector((state) => state.forms);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchForms());
  }, [dispatch]);

  const hasPublishedForm = (brandId) => {
    return forms.some((form) => form.brandId === brandId && form.status === 'published');
  };

  const handleBrandClick = (brandId) => {
    if (brandId === 'denvea') {
      navigate('/login');
    } else {
      navigate(`/portal/form/${brandId}`);
    }
  };

  const loading = brandsLoading || formsLoading;

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 min-h-[calc(100vh-5rem)] text-slate-800">
      <div className="w-full max-w-6xl space-y-12 my-auto">
        {/* Title Section */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Etkinlik Portalı
          </h2>
          <p className="text-sm md:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Lütfen katılım kaydı oluşturmak istediğiniz markayı seçiniz.
          </p>
        </div>

        {/* Brands Grid */}
        {loading && brands.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm">Portallar yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isActive={brand.id === 'denvea' || hasPublishedForm(brand.id)}
                onClick={() => handleBrandClick(brand.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
