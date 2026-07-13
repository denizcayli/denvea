import { useEffect } from 'react';
import { TURKEY_CITIES, CITIES_LIST } from '../../lib/turkeyData';

export default function DynamicFieldRenderer({ field, register, errors, watch, setValue, theme = {} }) {
  const fieldShape = theme.fieldShape || 'rounded-xl';
  const primaryColor = theme.componentColor || theme.primaryColor || '#C41E3A';
  
  const isLinked = field.type === 'select-linked';
  const hasParent = isLinked && field.dependsOn;

  const parentValue = hasParent ? watch(field.dependsOn) : null;
  const watchedFiles = field.type === 'file' ? watch(field.id) : null;
  const selectedValue = watch(field.id);

  useEffect(() => {
    if (hasParent) {
      setValue(field.id, '');
    }
  }, [parentValue, field.id, hasParent, setValue]);

  let inputComponent = null;

  switch (field.type) {
    case 'text':
    case 'number':
    case 'date':
      inputComponent = (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          placeholder={field.placeholder || ''}
          {...register(field.id)}
          className={`w-full bg-slate-50 border border-slate-200 focus:border-[var(--brand-color)] px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-glow)] transition-all ${fieldShape}`}
        />
      );
      break;

    case 'phone':
      inputComponent = (
        <input
          type="text"
          placeholder={field.mask || '0 (5__) ___ __ __'}
          {...register(field.id)}
          className={`w-full bg-slate-50 border border-slate-200 focus:border-[var(--brand-color)] px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-glow)] transition-all ${fieldShape}`}
        />
      );
      break;

    case 'radio':
      inputComponent = (
        <div className="space-y-2.5">
          {field.options?.map((opt) => {
            const isSelected = selectedValue === opt.label;
            return (
              <label key={opt.id} className="relative flex items-center space-x-3 cursor-pointer select-none text-slate-700 hover:text-slate-900 transition-colors">
                <input
                  type="radio"
                  value={opt.label}
                  {...register(field.id)}
                  className="sr-only"
                />
                <div 
                  className="w-4.5 h-4.5 border rounded-full flex items-center justify-center transition-all shrink-0 bg-white"
                  style={{
                    borderColor: isSelected ? primaryColor : '#cbd5e1',
                    borderWidth: '1.5px'
                  }}
                >
                  {isSelected && (
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
      break;

    case 'checkbox-group':
      inputComponent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-5 border border-slate-200 rounded-2xl">
          {field.options?.map((opt) => {
            const isSelected = Array.isArray(selectedValue) && selectedValue.includes(opt.label);
            return (
              <label key={opt.id} className="relative flex items-center space-x-3 cursor-pointer select-none text-slate-700 hover:text-slate-950 transition-colors">
                <input
                  type="checkbox"
                  value={opt.label}
                  {...register(field.id)}
                  className="sr-only"
                />
                <div 
                  className={`w-4.5 h-4.5 border flex items-center justify-center transition-all shrink-0 ${
                    fieldShape === 'rounded-none' ? 'rounded-none' : fieldShape === 'rounded-full' ? 'rounded-full' : 'rounded'
                  } ${
                    isSelected ? 'text-white animate-scale-up' : 'border-slate-300 bg-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? primaryColor : 'white',
                    borderColor: isSelected ? primaryColor : '#cbd5e1'
                  }}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 stroke-current" strokeWidth={3.5} fill="none" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="text-sm leading-none">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
      break;

    case 'select-linked':
      if (!field.dependsOn) {
        inputComponent = (
          <div className="relative">
            <select
              {...register(field.id)}
              className={`w-full bg-slate-50 border border-slate-200 focus:border-[var(--brand-color)] px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-glow)] transition-all appearance-none cursor-pointer ${fieldShape}`}
            >
              <option value="">Lütfen il seçiniz</option>
              {CITIES_LIST.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <span className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</span>
          </div>
        );
      } else {
        const districts = parentValue ? TURKEY_CITIES[parentValue] : [];
        inputComponent = (
          <div className="relative">
            <select
              disabled={!parentValue}
              {...register(field.id)}
              className={`w-full bg-slate-50 border border-slate-200 focus:border-[var(--brand-color)] px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-glow)] transition-all disabled:opacity-40 disabled:cursor-not-allowed appearance-none cursor-pointer ${fieldShape}`}
            >
              <option value="">Lütfen ilçe seçiniz</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
            <span className="absolute right-4 top-3.5 pointer-events-none text-slate-400 text-xs">▼</span>
          </div>
        );
      }
      break;

    case 'file':
      inputComponent = (
        <div className={`relative border border-dashed border-slate-300 bg-slate-50/50 hover:border-[var(--brand-color)] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${fieldShape}`}>
          <input
            type="file"
            {...register(field.id)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <span className="text-2xl mb-2">📁</span>
          <p className="text-xs text-slate-600 font-medium">
            {watchedFiles && watchedFiles.length > 0
              ? `Seçilen Dosya: ${watchedFiles[0].name}`
              : 'Dosya yüklemek için tıklayın veya bu alana sürükleyin'}
          </p>
        </div>
      );
      break;

    case 'checkbox':
      {
        const isSelected = !!selectedValue;
        inputComponent = (
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id={field.id}
              {...register(field.id)}
              className="sr-only"
            />
            <div 
              className={`w-4.5 h-4.5 border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                fieldShape === 'rounded-none' ? 'rounded-none' : fieldShape === 'rounded-full' ? 'rounded-full' : 'rounded'
              } ${
                isSelected ? 'text-white animate-scale-up' : 'border-slate-300 bg-white'
              }`}
              style={{
                backgroundColor: isSelected ? primaryColor : 'white',
                borderColor: isSelected ? primaryColor : '#cbd5e1'
              }}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5 stroke-current" strokeWidth={3.5} fill="none" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-xs text-slate-705 hover:text-slate-900 leading-relaxed cursor-pointer select-none">
              {field.label}
            </span>
          </label>
        );
      }
      break;

    case 'info-text':
      inputComponent = (
        <div className="bg-slate-50 p-5 border border-slate-100 rounded-2xl space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {field.label}
          </p>
          {field.links && field.links.length > 0 && (
            <div className="flex flex-col space-y-1.5 pt-3 border-t border-slate-200/60 mt-3">
              {field.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--brand-color)] hover:underline font-semibold block"
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </div>
      );
      break;

    default:
      break;
  }

  return (
    <div className="space-y-1.5">
      {field.type !== 'checkbox' && field.type !== 'info-text' && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {inputComponent}

      {errors[field.id] && (
        <span className="text-xs text-red-500 font-semibold mt-1 block">
          {errors[field.id].message}
        </span>
      )}
    </div>
  );
}
