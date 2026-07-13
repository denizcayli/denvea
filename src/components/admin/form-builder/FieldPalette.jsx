import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  Hash, 
  Mail, 
  Phone, 
  Calendar, 
  CircleDot, 
  Sparkles, 
  MapPin, 
  Upload, 
  ShieldCheck, 
  AlignLeft,
  Search,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { FIELD_TYPES } from '../../../lib/fieldTypes';
import { addField, setSelectedFieldId, setSelectedSectionId } from '../../../features/forms/formBuilderSlice';
import toast from 'react-hot-toast';

const iconMap = {
  Type,
  Hash,
  Mail,
  Phone,
  Calendar,
  CircleDot,
  Sparkles,
  MapPin,
  Upload,
  ShieldCheck,
  AlignLeft
};

const getFieldIcon = (type) => {
  const f = FIELD_TYPES.find(item => item.type === type);
  return iconMap[f?.iconName] || HelpCircle;
};

function DraggableFieldCard({ field, onAddField }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${field.type}`,
    data: {
      type: field.type,
      defaultProps: field.defaultProps,
      isPaletteItem: true,
    },
  });

  const IconComponent = iconMap[field.iconName] || HelpCircle;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onAddField(field)}
      className={`w-full text-left p-3 rounded-lg border flex items-start space-x-3 transition-all duration-200 cursor-pointer group select-none ${
        isDragging
          ? 'border-slate-800 bg-slate-100 opacity-50 scale-95 shadow-sm z-50'
          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="p-2 rounded bg-slate-50 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-100 transition-colors">
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
          {field.label}
        </p>
        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
          {field.description}
        </p>
      </div>
    </div>
  );
}

export default function FieldPalette() {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  
  const { currentForm, selectedFieldId, selectedSectionId } = useSelector((state) => state.formBuilder);

  const filteredFields = FIELD_TYPES.filter((field) =>
    field.label.toLowerCase().includes(search.toLowerCase()) ||
    field.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddField = (field) => {
    dispatch(addField({ type: field.type, defaultProps: field.defaultProps }));
    toast.success('Yeni alan eklendi', { id: 'field-added' });
  };

  const handleOutlineClick = (fieldId, sectionId) => {
    dispatch(setSelectedFieldId(fieldId));
    dispatch(setSelectedSectionId(sectionId));
    // Smooth scroll the center canvas to focus on the clicked element
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const totalFields = currentForm?.sections?.reduce((sum, s) => sum + (s.fields?.length || 0), 0) || 0;

  return (
    <div className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-4rem)] min-h-[350px] shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Alan ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Field Cards List */}
      <div className="h-[48%] overflow-y-auto p-4 space-y-2 bg-slate-50/30 border-b border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alan Tipleri</h3>
        {filteredFields.length > 0 ? (
          filteredFields.map((field) => (
            <DraggableFieldCard
              key={field.type}
              field={field}
              onAddField={handleAddField}
            />
          ))
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">Alan bulunamadı.</div>
        )}
      </div>

      {/* Form outline */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/10 p-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between shrink-0">
          <span>Form Yapısı (Özet)</span>
          <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
            {totalFields} Alan
          </span>
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {currentForm?.sections?.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <div className="flex items-center space-x-2 py-1 px-1.5 bg-slate-100/50 rounded-lg">
                <FolderOpen className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                <span className="text-xs font-bold text-slate-700 truncate">{section.title || 'Bölüm Başlığı Yok'}</span>
              </div>
              <div className="space-y-1 pl-3 border-l border-slate-200">
                {section.fields?.map((field) => {
                  const isSelected = selectedFieldId === field.id;
                  const Icon = getFieldIcon(field.type);
                  return (
                    <div
                      key={field.id}
                      onClick={() => handleOutlineClick(field.id, section.id)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-violet-50 border-violet-250 text-violet-750 font-bold'
                          : 'bg-white hover:bg-slate-50 border-slate-150 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                        <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{field.label || 'İsimsiz Alan'}</span>
                      </div>
                      <span className="text-[8px] uppercase px-1 rounded bg-slate-100 text-slate-400 font-semibold shrink-0 ml-1">
                        {field.type}
                      </span>
                    </div>
                  );
                })}
                {(!section.fields || section.fields.length === 0) && (
                  <p className="text-[10px] text-slate-400 italic p-1 select-none">Henüz alan eklenmedi.</p>
                )}
              </div>
            </div>
          ))}
          {(!currentForm?.sections || currentForm.sections.length === 0) && (
            <div className="text-center py-8 text-xs text-slate-450 italic">Henüz bölüm bulunmuyor.</div>
          )}
        </div>
      </div>
    </div>
  );
}
