import { useState } from 'react';

export default function BrandCard({ brand, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Special layout for Denvea Admin entrance inside the Event Portal
  if (brand.id === 'denvea') {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={
          isHovered
            ? { 
                borderColor: '#14B8A6', 
                boxShadow: '0 10px 40px -15px rgba(20, 184, 166, 0.4)',
                transform: 'translateY(-6px)' 
              }
            : {}
        }
        className="border border-slate-200 bg-white hover:border-teal-500/50 rounded-3xl p-8 flex items-center justify-center h-64 transition-all duration-300 select-none cursor-pointer shadow-sm hover:shadow-md animate-fade-in"
      >
        <img 
          src="/logo/denvea logo.png" 
          alt="Denvea Admin" 
          className={`h-24 max-w-[85%] object-contain mix-blend-multiply transition-transform duration-300 ${
            isHovered ? 'scale-105' : ''
          }`}
        />
      </div>
    );
  }

  // Regular brand card layout (Only logo, no text, fits large inside the card)
  return (
    <div
      onClick={isActive ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        isActive && isHovered
          ? { 
              borderColor: brand.themeColor, 
              boxShadow: `0 10px 40px -15px ${brand.themeColor}55`,
              transform: 'translateY(-6px)' 
            }
          : {}
      }
      className={`border rounded-3xl p-8 flex items-center justify-center h-64 transition-all duration-300 select-none ${
        isActive
          ? 'bg-white border-slate-200 text-slate-800 cursor-pointer shadow-sm hover:shadow-md'
          : 'bg-slate-100/50 border-slate-200 text-slate-350 opacity-40 cursor-not-allowed grayscale'
      }`}
    >
      {brand.logoUrl ? (
        <img 
          src={brand.logoUrl} 
          alt={brand.name} 
          className={`h-24 max-w-[85%] object-contain mix-blend-multiply transition-all duration-300 ${
            isHovered && isActive ? 'scale-105' : ''
          }`}
        />
      ) : (
        <span className="text-2xl font-black tracking-wider uppercase text-slate-900">
          {brand.name}
        </span>
      )}
    </div>
  );
}
