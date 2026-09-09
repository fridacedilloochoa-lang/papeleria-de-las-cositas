import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  User, 
  MessageSquare, 
  Phone, 
  Package, 
  DollarSign, 
  Check,
  Layers,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, Apartado, ApartadoItem } from '../types';

interface ApartadoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  currency: string;
  nextFolio?: string;
  initialItems?: ApartadoItem[];
  onSaveManualApartado: (data: {
    clientName: string;
    clientNote: string;
    clientPhone?: string;
    productId?: string;
    productName?: string;
    productImage?: string;
    selectedDesign?: string;
    selectedColor?: string;
    selectedFormat?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
    initialAbono: number;
    initialAbonoNote?: string;
    decrementStock?: boolean;
    folioRemision?: string;
    items?: ApartadoItem[];
  }) => Promise<Apartado | void>;
  onOpenNotaRemision?: (apartado: Apartado) => void;
}

export const ApartadoFormModal: React.FC<ApartadoFormModalProps> = ({
  isOpen,
  onClose,
  products,
  currency,
  nextFolio,
  initialItems,
  onSaveManualApartado,
  onOpenNotaRemision,
}) => {
  // Client info state - phone is strictly optional
  const [clientName, setClientName] = useState('');
  const [clientNote, setClientNote] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Cart / Multi-Product items list for this client
  const [cartItems, setCartItems] = useState<ApartadoItem[]>(() => (initialItems && initialItems.length > 0 ? initialItems : []));

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setCartItems(initialItems);
    }
  }, [initialItems]);

  // Current product picker state
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [pickerQuantity, setPickerQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number | ''>('');

  // Financials
  const [initialAbono, setInitialAbono] = useState<number | ''>('');
  const [abonoNote, setAbonoNote] = useState('Anticipo inicial');
  const [decrementStock, setDecrementStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Calculate items total
  const itemsTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const numericAbono = Number(initialAbono) || 0;
  const saldoPendiente = Math.max(0, itemsTotal - numericAbono);

  // Add current picked product to items list
  const handleAddItem = () => {
    if (!selectedProduct) return;

    const unitPrice = customPrice !== '' ? Number(customPrice) : selectedProduct.price;
    const activeDesign = selectedProduct.designs?.[0];
    const itemImage = activeDesign?.imageUrl || '';

    const newItem: ApartadoItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: itemImage,
      selectedDesign: activeDesign?.name,
      quantity: Math.max(1, pickerQuantity),
      unitPrice,
      subtotal: unitPrice * Math.max(1, pickerQuantity),
    };

    setCartItems(prev => [...prev, newItem]);
    setPickerQuantity(1);
    setCustomPrice('');
    setErrorMessage(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(it => it.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim()) {
      setErrorMessage('Por favor ingresa el nombre del cliente.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Agrega al menos un producto a la lista de apartado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const firstItem = cartItems[0];
      const savedApartado = await onSaveManualApartado({
        clientName: clientName.trim(),
        clientNote: clientNote.trim() || 'Apartado registrado en mostrador',
        clientPhone: clientPhone.trim() || undefined, // Teléfono opcional
        productId: firstItem.productId,
        productName: cartItems.length > 1 ? `${firstItem.productName} (+${cartItems.length - 1} más)` : firstItem.productName,
        productImage: firstItem.productImage,
        selectedDesign: firstItem.selectedDesign,
        selectedColor: firstItem.selectedColor,
        selectedFormat: firstItem.selectedFormat,
        quantity: cartItems.reduce((s, it) => s + it.quantity, 0),
        unitPrice: firstItem.unitPrice,
        totalPrice: itemsTotal,
        initialAbono: numericAbono,
        initialAbonoNote: abonoNote.trim() || 'Anticipo al crear apartado',
        decrementStock,
        items: cartItems,
      });

      onClose();

      // If callback provided, immediately view the generated Nota de Remisión
      if (savedApartado && onOpenNotaRemision) {
        onOpenNotaRemision(savedApartado);
      }
    } catch (err) {
      console.error('Error al guardar apartado:', err);
      setErrorMessage('Ocurrió un error al guardar el apartado. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn no-print">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-50 via-teal-50 to-pink-50 border-b border-pink-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-xs overflow-hidden border border-white">
              <img 
                src="/bow-icon.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-lg">🎀</span>';
                }}
              />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>Registrar Apartado & Remisión</span>
                {nextFolio && (
                  <span className="text-[10px] font-mono font-bold bg-pink-100 text-pink-900 px-2 py-0.5 rounded-full">
                    {nextFolio}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                Aparta uno o varios productos para el mismo cliente y genera su nota de remisión en imagen.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Client Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-pink-500" />
              <span>1. Datos del Cliente</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre del Cliente <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Ana Martínez, Sra. Paty"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Teléfono / WhatsApp <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678 (no obligatorio)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Referencia / Nota <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  placeholder="Ej. Vecina del local 4, mamá de Sofía, apartó en feria"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Multi-Product Selector */}
          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-pink-600" />
                <span>2. Agregar Productos al Apartado</span>
              </h4>
              <span className="text-[11px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                Multi-Producto
              </span>
            </div>

            {/* Product selection dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Seleccionar Producto:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-pink-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {currency}{p.price.toFixed(2)} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity and Price override */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-28">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Cantidad:</label>
                <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPickerQuantity(q => Math.max(1, q - 1))}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-xs">
                    {pickerQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerQuantity(q => q + 1)}
                    className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Precio Unitario:
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={customPrice !== '' ? customPrice : (selectedProduct?.price || 0)}
                  onChange={(e) => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar a Lista</span>
                </button>
              </div>
            </div>

            {/* List of Added Items in this Apartado */}
            <div className="mt-3 pt-3 border-t border-pink-200">
              <div className="text-[11px] font-bold text-slate-700 mb-2 flex justify-between items-center">
                <span>Productos agregados a este apartado ({cartItems.length}):</span>
                <span className="text-pink-700 font-black">
                  Subtotal: {currency}{itemsTotal.toFixed(2)}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center bg-white/60 rounded-xl border border-dashed border-slate-200">
                  Aún no has agregado productos a este apartado. Selecciona arriba y presiona "Agregar a Lista".
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {cartItems.map((item, idx) => (
                    <div 
                      key={item.id || idx}
                      className="p-2 bg-white rounded-xl border border-pink-100 flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {item.productImage && (
                          <img src={item.productImage} alt="" className="w-7 h-7 rounded-lg object-cover border shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate text-[11px]">
                            {item.quantity}x {item.productName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {[item.selectedDesign, item.selectedColor, item.selectedFormat].filter(Boolean).join(' • ') || `${currency}${item.unitPrice.toFixed(2)} c/u`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-pink-700">
                          {currency}{item.subtotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"
                          title="Quitar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Anticipo / Abono Inicial & Saldo */}
          <div className="bg-teal-50/40 p-4 rounded-2xl border border-teal-200/80 space-y-3">
            <h4 className="text-xs font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-teal-600" />
              <span>3. Anticipo & Finanzas</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Anticipo / Abono Inicial ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={initialAbono}
                  onChange={(e) => setInitialAbono(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.00 (dejar en blanco si no abonó nada)"
                  className="w-full px-3.5 py-2 bg-white border border-teal-200 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nota del Anticipo:
                </label>
                <input
                  type="text"
                  value={abonoNote}
                  onChange={(e) => setAbonoNote(e.target.value)}
                  placeholder="Ej. Anticipo en efectivo, transferencia"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            {/* Live Financial Totals Summary */}
            <div className="p-3 bg-white rounded-xl border border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Total de la Nota:</span>
                <span className="font-mono font-extrabold text-slate-900 text-sm">
                  {currency}{itemsTotal.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-emerald-600 block text-[11px]">Abono Inicial:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {currency}{numericAbono.toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-rose-600 block text-[11px] font-bold">Saldo Pendiente:</span>
                <span className="font-mono font-black text-rose-700 text-base">
                  {currency}{saldoPendiente.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Decrement stock checkbox */}
            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={decrementStock}
                onChange={(e) => setDecrementStock(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <span>Descontar automáticamente las piezas del inventario en existencias</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Receipt className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Apartado & Ver Remisión'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
