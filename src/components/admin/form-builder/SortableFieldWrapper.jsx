import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableFieldWrapper({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center group/sortable rounded-xl transition-shadow ${
        isDragging 
          ? 'z-40 opacity-40 border border-slate-300 shadow-md bg-white/80' 
          : ''
      }`}
    >
      {/* Drag Handle (Grip Icon) */}
      <div
        {...listeners}
        {...attributes}
        className="absolute left-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 opacity-0 group-hover/sortable:opacity-100 transition-opacity z-10"
        title="Taşımak için sürükleyin"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Field Content Wrapper */}
      <div className="flex-1 pl-9">
        {children}
      </div>
    </div>
  );
}
