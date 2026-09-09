import React, { useState } from 'react';
import { X, Plus, FolderPlus, Sparkles, Check } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: string[];
  onAddCategory: (newCategory: string) => Promise<void>;
}

const PRESET_SUGGESTIONS = [
  { name: 'Juguetes', emoji: '🧸' },
  { name: 'Cuadernos', emoji: '📓' },
  { name: 'Plumas', emoji: '✒️' },
  { name: 'Plumones', emoji: '🖍️' },
  { name: 'Lápices', emoji: '✏️' },
  { name: 'Washi Tapes', emoji: '🎀' },
  { name: 'Bolsas', emoji: '🛍️' },
  { name: 'Tijeras', emoji: '✂️' },
  { name: 'Estucheras', emoji: '👝' },
  { name: 'Sacapuntas', emoji: '✏️' },
  { name: 'Juegos de Geometría', emoji: '📐' },
  { name: 'Pritt y Pegamentos', emoji: '🧴' },
  { name: 'Correctores', emoji: '🩹' },
  { name: 'Peluches', emoji: '🐰' },
  { name: 'Stickers & Calcomanías', emoji: '✨' },
  { name: 'Acuarelas & Arte', emoji: '🎨' },
  { name: 'Calculadoras', emoji: '🔢' },
  { name: 'Folders & Carpetas', emoji: '📁' },
  { name: 'Llaveros & Pines', emoji: '🔑' },
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  existingCategories,
  onAddCategory,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setError('Por favor ingresa un nombre para el apartado o categoría.');
      return;
    }

    const exists = existingCategories.some(
      c => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError(`La categoría "${trimmed}" ya existe en la tienda.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddCategory(trimmed);
      setCategoryName('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (name: string) => {
    setCategoryName(name);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FEDEF1] via-[#E0C0FE]/40 to-[#CBFEDD]/50 p-5 border-b border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-pink-200 flex items-center justify-center text-pink-600">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#22201D]">
                  Nuevo Apartado / Categoría
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  Organiza tu catálogo por secciones
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white/60 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nombre del Apartado / Categoría
            </label>
            <input
              id="new-category-input"
              type="text"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Juguetes, Estucheras, Sacapuntas..."
              className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold text-slate-800"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-500 font-bold mt-1.5">{error}</p>
            )}
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              Sugerencias rápidas para agregar con 1 click:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {PRESET_SUGGESTIONS.filter(
                preset => !existingCategories.some(c => c.toLowerCase() === preset.name.toLowerCase())
              ).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.name)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                    categoryName.toLowerCase() === preset.name.toLowerCase()
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'bg-pink-50/60 hover:bg-pink-100 text-slate-700 border-pink-200'
                  }`}
                >
                  <span>{preset.emoji}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="save-new-category-btn"
              type="submit"
              disabled={isSubmitting || !categoryName.trim()}
              className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Agregar Apartado'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
