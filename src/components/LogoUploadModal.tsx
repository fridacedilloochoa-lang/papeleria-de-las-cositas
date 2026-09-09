import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  RotateCcw,
  Link as LinkIcon
} from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  onSaveLogo: (url: string) => Promise<void> | void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  onSaveLogo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>(currentLogoUrl || '/bow-icon.jpg');
  const [urlInput, setUrlInput] = useState<string>(currentLogoUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');

  if (!isOpen) return null;

  const defaultPresets = [
    { name: 'Mochila Kawaii', url: '/bow-icon.jpg', icon: '🎒' },
    { name: 'Peluche Menta', url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=400&auto=format&fit=crop&q=80', icon: '🧸' },
    { name: 'Conejito Pastel', url: 'https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=400&auto=format&fit=crop&q=80', icon: '🐰' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setUrlInput(result);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setLogoPreview(urlInput.trim());
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveLogo(logoPreview);
      onClose();
    } catch (err) {
      console.error('Error guardando logo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setLogoPreview('/bow-icon.jpg');
    setUrlInput('/bow-icon.jpg');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-50 via-teal-50 to-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-base sm:text-lg">
                Cambiar Imagen de la Tienda
              </h3>
              <p className="text-xs text-slate-500">
                Personaliza el logo que aparece en el encabezado y notas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Current Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Vista previa actual
            </span>
            <div className="w-24 h-24 rounded-3xl bg-white p-1 border-2 border-pink-300 shadow-md flex items-center justify-center overflow-hidden">
              <img 
                src={logoPreview} 
                alt="Vista previa logo" 
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerHTML = '<span class="text-4xl">🎀</span>';
                  }
                }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600 mt-2">
              Así se verá en la cabecera y en los comprobantes
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeMode === 'upload' 
                  ? 'bg-white text-pink-600 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Archivo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeMode === 'url' 
                  ? 'bg-white text-teal-600 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Pegar URL</span>
            </button>
          </div>

          {/* Upload mode */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl bg-pink-50/40 hover:bg-pink-50/80 transition flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 group-hover:bg-pink-200 text-pink-600 flex items-center justify-center transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800">
                    Haz clic aquí para seleccionar imagen
                  </p>
                  <p className="text-[11px] text-slate-500">
                    PNG, JPG, WebP desde tu dispositivo
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* URL mode */}
          {activeMode === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Enlace directo a la imagen
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/mi-logo.jpg"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Probar
                </button>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Opciones Predeterminadas
            </span>
            <div className="grid grid-cols-3 gap-2">
              {defaultPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setLogoPreview(preset.url);
                    setUrlInput(preset.url);
                  }}
                  className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    logoPreview === preset.url 
                      ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-300' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer logo actual</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Aplicar Logo'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
