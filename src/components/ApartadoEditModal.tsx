import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Plus, 
  User, 
  Phone, 
  FileText, 
  Bookmark, 
  Sparkles,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Apartado, ApartadoItem, Product, ApartadoStatus } from '../types';

interface ApartadoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartado: Apartado | null;
  products?: Product[];
  currency: string;
  onSave: (id: string, updates: Partial<Apartado>) => Promise<void> | void;
}

export const ApartadoEditModal: React.FC<ApartadoEditModalProps> = ({
  isOpen,
  onClose,
  apartado,
  products = [],
  currency,
  onSave,
}) => {
  const safeProducts = products || [];
  const [clientName, setClientName] = useState(apartado?.clientName || '');
  const [clientPhone, setClientPhone] = useState(apartado?.clientPhone || '');
  const [clientNote, setClientNote] = useState(apartado?.clientNote || '');
  const [status, setStatus] = useState<ApartadoStatus>(apartado?.status || 'apartado');
  const [items, setItems] = useState<ApartadoItem[]>([]);
  
  // Quick product add selector
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState<string>(safeProducts[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize items
  useEffect(() => {
    if (!apartado) return;
    if (apartado.items && apartado.items.length > 0) {
      setItems([...apartado.items]);
    } else {
      // Create single item from flat fields
      setItems([{
        id: `item-1-${Date.now()}`,
        productId: apartado.productId || 'prod-custom',
        productName: apartado.productName || 'Producto',
        productImage: apartado.productImage,
        selectedDesign: apartado.selectedDesign,
        selectedColor: apartado.selectedColor,
        selectedFormat: apartado.selectedFormat,
        quantity: apartado.quantity || 1,
        unitPrice: apartado.unitPrice || apartado.totalPrice || 0,
        subtotal: (apartado.unitPrice || apartado.totalPrice || 0) * (apartado.quantity || 1),
      }]);
    }
    setClientName(apartado.clientName || '');
    setClientPhone(apartado.clientPhone || '');
    setClientNote(apartado.clientNote || '');
    setStatus(apartado.status || 'apartado');
  }, [apartado]);

  if (!isOpen || !apartado) return null;

  // Calculate totals
  const totalCalculated = items.reduce((acc, it) => acc + (it.subtotal || (it.quantity * it.unitPrice)), 0);
  const totalAbonado = apartado.totalAbonado || (apartado.abonos || []).reduce((acc, a) => acc + a.amount, 0);
  const saldoPendiente = Math.max(0, totalCalculated - totalAbonado);

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    const qty = Math.max(1, newQty);
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: qty,
        subtotal: qty * updated[index].unitPrice,
      };
      return updated;
    });
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const price = Math.max(0, newPrice);
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitPrice: price,
        subtotal: updated[index].quantity * price,
      };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('El apartado debe tener al menos un producto');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNewProductToApartado = () => {
    const prod = safeProducts.find(p => p.id === selectedProductIdToAdd);
    if (!prod) return;

    const newItem: ApartadoItem = {
      id: `item-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.designs?.[0]?.imageUrl || '',
      selectedDesign: prod.designs?.[0]?.name,
      quantity: 1,
      unitPrice: prod.price,
      subtotal: prod.price,
    };

    setItems(prev => [...prev, newItem]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }

    if (items.length === 0) {
      alert('Debes incluir al menos un producto');
      return;
    }

    try {
      setIsSaving(true);
      const first = items[0];
      const displayTitle = items.length > 1 
        ? `${first.productName} (+${items.length - 1} más)` 
        : first.productName;

      // Auto-update status if saldo is zero
      let finalStatus = status;
      if (saldoPendiente === 0 && finalStatus !== 'entregado') {
        finalStatus = 'liquidado';
      } else if (saldoPendiente > 0 && finalStatus === 'liquidado') {
        finalStatus = 'apartado';
      }

      const updates: Partial<Apartado> = {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientNote: clientNote.trim(),
        status: finalStatus,
        items,
        productId: first.productId,
        productName: displayTitle,
        productImage: first.productImage,
        selectedDesign: first.selectedDesign,
        quantity: items.reduce((acc, it) => acc + it.quantity, 0),
        unitPrice: items.length === 1 ? first.unitPrice : 0,
        totalPrice: totalCalculated,
        saldoPendiente,
      };

      await onSave(apartado.id, updates);
      onClose();
    } catch (err) {
      console.error('Error guardando cambios del apartado:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-teal-100 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 via-pink-50 to-teal-50 border-b border-teal-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>Editar Apartado</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full font-bold">
                  {apartado.folioRemision || `REM-${apartado.id.slice(-4).toUpperCase()}`}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Modifica cliente, productos, precios o estado del pedido
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Client Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>Datos del Cliente</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Teléfono / WhatsApp</span>
                  <span className="text-[10px] text-teal-600 font-normal">(Opcional)</span>
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nota / Referencia interna
              </label>
              <input
                type="text"
                value={clientNote}
                onChange={(e) => setClientNote(e.target.value)}
                placeholder="Ej. Amiga de la escuela, entrega el viernes, etc."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado del Apartado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApartadoStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="apartado">⏳ Apartado Pendiente</option>
                <option value="pagado_parcial">💵 Pagado Parcial (Con Abonos)</option>
                <option value="liquidado">✨ Liquidado (Pagado Completo)</option>
                <option value="entregado">📦 Entregado al Cliente</option>
                <option value="cancelado">❌ Cancelado</option>
              </select>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-pink-600" />
                <span>Productos en este Apartado ({items.length})</span>
              </h4>
            </div>

            {/* List of items */}
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {item.productImage ? (
                      <img 
                        src={item.productImage} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-500 flex items-center justify-center font-bold shrink-0">
                        📦
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate">
                        {item.productName}
                      </p>
                      {item.selectedDesign && (
                        <p className="text-[11px] text-pink-600 truncate">
                          {item.selectedDesign}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Unit Price Edits */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase">Cant.</label>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemQuantity(idx, parseInt(e.target.value, 10) || 1)}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
                      />
                    </div>

                    <div className="w-20">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase">P. Unit</label>
                      <div className="relative">
                        <span className="absolute left-1.5 top-1 text-slate-400 text-xs font-bold">{currency}</span>
                        <input 
                          type="number"
                          min="0"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                          className="w-full pl-4 pr-1 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="w-20 text-right">
                      <label className="text-[9px] font-bold text-slate-400 block uppercase">Subtotal</label>
                      <span className="font-mono font-bold text-slate-900 text-xs block py-1">
                        {currency}{(item.subtotal || (item.quantity * item.unitPrice)).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Quitar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick add product row */}
            <div className="pt-2 border-t border-dashed border-pink-200 flex items-center gap-2">
              <select
                value={selectedProductIdToAdd}
                onChange={(e) => setSelectedProductIdToAdd(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-pink-200 rounded-xl text-xs font-medium"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {currency}{p.price}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddNewProductToApartado}
                className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Financial Totals Summary */}
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-semibold">Total Calculado del Pedido:</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {currency}{totalCalculated.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-emerald-700">
              <span className="font-semibold">Total ya Abonado:</span>
              <span className="font-mono font-bold text-sm">
                -{currency}{totalAbonado.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-teal-200 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-900 text-sm">
                Nuevo Saldo Pendiente:
              </span>
              <span className={`font-mono text-lg font-black ${
                saldoPendiente === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {currency}{saldoPendiente.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
