import React, { useRef, useState } from 'react';
import { 
  X, 
  Copy, 
  Printer, 
  MessageCircle, 
  Check, 
  Bookmark, 
  Calendar, 
  User, 
  Receipt,
  Sparkles,
  Phone,
  Layers,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { Apartado, StoreConfig } from '../types';

interface NotaRemisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartado: Apartado | null;
  config: StoreConfig;
}

export const NotaRemisionModal: React.FC<NotaRemisionModalProps> = ({
  isOpen,
  onClose,
  apartado,
  config,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !apartado) return null;

  const currency = config.currency || '$';
  const folio = apartado.folioRemision || `REM-${apartado.id.slice(-4).toUpperCase()}`;
  const formattedDate = new Date(apartado.createdAt || Date.now()).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLiquidated = (apartado.saldoPendiente ?? 0) <= 0;

  // Build message text
  const getTicketTextMessage = () => {
    const itemsList = apartado.items && apartado.items.length > 0
      ? apartado.items.map(it => `• ${it.quantity}x ${it.productName}${it.selectedDesign ? ` (${it.selectedDesign})` : ''} - ${currency}${it.subtotal.toFixed(2)}`).join('\n')
      : `• ${apartado.quantity || 1}x ${apartado.productName} - ${currency}${apartado.totalPrice.toFixed(2)}`;

    return `🎀 *NOTA DE REMISIÓN #${folio}* 🎀
*${config.storeName || 'Papelería La Señora Cositas'}*

👤 *Cliente:* ${apartado.clientName}
📅 *Fecha:* ${formattedDate}
${apartado.clientNote ? `📝 *Ref:* ${apartado.clientNote}\n` : ''}
📦 *Artículos:*
${itemsList}

💰 *Total Nota:* ${currency}${apartado.totalPrice.toFixed(2)}
💵 *Abonado:* ${currency}${apartado.totalAbonado.toFixed(2)}
💳 *SALDO PENDIENTE:* ${currency}${apartado.saldoPendiente.toFixed(2)}
📌 *Estado:* ${isLiquidated ? '✅ LIQUIDADO' : '⏳ APARTADO PENDIENTE'}

¡Muchas gracias por tu compra y confianza! 🌸`;
  };

  // Copy text to clipboard
  const handleCopyTextToClipboard = async () => {
    try {
      const text = getTicketTextMessage();
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error al copiar texto:', err);
    }
  };

  // Share summary via WhatsApp
  const handleShareWhatsApp = () => {
    const message = getTicketTextMessage();
    const phone = apartado.clientPhone ? apartado.clientPhone.replace(/\D/g, '') : '';
    const url = phone 
      ? `https://wa.me/${phone.length === 10 ? '521' + phone : phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  // Download the ticket as a PNG image — se dibuja directo en un canvas
  // (NO se usa html2canvas porque falla con los colores modernos de Tailwind v4)
  const handleDownloadImage = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const items = apartado.items && apartado.items.length > 0
        ? apartado.items
        : [{
            id: 'legacy',
            productName: apartado.productName,
            quantity: apartado.quantity || 1,
            subtotal: apartado.totalPrice,
          }];

      try {
        await document.fonts.load('64px "Mrs Saint Delafield"');
        await document.fonts.ready;
      } catch { /* si no está esa fuente, seguimos con la normal */ }

      const scale = 2;
      const width = 500;
      const padding = 32;

      let height = padding * 2 + 70 + 26 + 20 + 46 + 20 + 46;
      items.forEach(() => { height += 38; });
      height += 20 + 110;

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el lienzo');
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      let cy = padding;

      // Título
      ctx.textAlign = 'center';
      ctx.fillStyle = '#831843';
      ctx.font = '52px "Mrs Saint Delafield", cursive, sans-serif';
      ctx.fillText(config.storeName || 'Papelería La Señora Cositas', width / 2, cy + 38);
      cy += 60;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('N O T A   D E   R E M I S I Ó N', width / 2, cy);
      cy += 18;

      // Línea punteada
      ctx.strokeStyle = '#fbcfe8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(width - padding, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      cy += 18;

      // Folio / Fecha
      ctx.fillStyle = '#fdf2f8';
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 1;
      ctx.fillRect(padding, cy, width - padding * 2, 36);
      ctx.strokeRect(padding, cy, width - padding * 2, 36);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'left';
      ctx.fillText(`Folio: #${folio}`, padding + 12, cy + 23);
      ctx.textAlign = 'right';
      ctx.fillText(formattedDate, width - padding - 12, cy + 23);
      cy += 56;

      // Cliente
      ctx.textAlign = 'left';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText(apartado.clientName, padding, cy);
      cy += 18;
      if (apartado.clientPhone) {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(apartado.clientPhone, padding, cy);
        cy += 16;
      }
      cy += 10;

      // Artículos
      items.forEach((item) => {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        const label = `${item.quantity}x ${item.productName}`;
        ctx.fillText(label.length > 42 ? label.slice(0, 42) + '…' : label, padding, cy);
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`${currency}${Number(item.subtotal ?? 0).toFixed(2)}`, width - padding, cy);
        cy += 22;
      });
      cy += 6;

      // Línea punteada
      ctx.strokeStyle = '#fbcfe8';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(width - padding, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      cy += 24;

      const drawTotalLine = (label: string, value: string, color: string, size = 13) => {
        ctx.textAlign = 'left';
        ctx.font = `bold ${size}px sans-serif`;
        ctx.fillStyle = color;
        ctx.fillText(label, padding, cy);
        ctx.textAlign = 'right';
        ctx.fillText(value, width - padding, cy);
        cy += size + 10;
      };

      drawTotalLine('Total Nota:', `${currency}${apartado.totalPrice.toFixed(2)}`, '#334155');
      drawTotalLine('Abonado:', `${currency}${apartado.totalAbonado.toFixed(2)}`, '#be185d');
      cy += 4;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(width - padding, cy);
      ctx.stroke();
      cy += 20;
      drawTotalLine(
        isLiquidated ? '¡Liquidado!' : 'Saldo pendiente:',
        isLiquidated ? '' : `${currency}${apartado.saldoPendiente.toFixed(2)}`,
        isLiquidated ? '#059669' : '#e11d48',
        16
      );

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `nota-remision-${folio}.png`;
      link.click();
    } catch (err) {
      console.error('Error al generar la imagen de la nota:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn no-print">
      <div className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[95vh]">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-pink-50 via-teal-50 to-pink-50 border-b border-pink-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-2xs overflow-hidden border border-white">
              <img 
                src="/bow-icon.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-sm">🎀</span>';
                }}
              />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-base flex items-center gap-1.5 leading-tight">
                <span>Nota de Remisión</span>
                <span className="font-mono text-xs px-2 py-0.5 bg-pink-100 text-pink-900 rounded-full font-bold">
                  {folio}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Comprobante para cliente &bull; Descargable como imagen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 transition cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            {apartado.items ? `${apartado.items.length} productos incluidos` : '1 producto incluido'}
          </span>
          <span className="font-mono text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
            {folio}
          </span>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60 flex justify-center">
          
          {/* Printable / Exportable Ticket Card */}
          <div 
            ref={ticketRef}
            id="nota-remision-ticket"
            className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-pink-200 shadow-md text-slate-900 relative font-sans select-text"
            style={{ backgroundColor: '#ffffff' }}
          >
              {/* Header with Moño and Branding */}
              <div className="text-center pb-4 border-b border-dashed border-pink-200">
                <div className="w-14 h-14 mx-auto mb-2 rounded-2xl overflow-hidden shadow-xs border-2 border-pink-200 bg-pink-50 flex items-center justify-center">
                  <img 
                    src={config.logoUrl || "/bow-icon.jpg"} 
                    crossOrigin="anonymous"
                    alt="Logo Moño" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = '<span class="text-2xl">🎀</span>';
                      }
                    }}
                  />
                </div>
                <h2 className="font-serif font-black text-xl text-slate-900 tracking-tight leading-snug">
                  {config.storeName || 'Papelería La Señora Cositas'}
                </h2>
                <p className="text-[11px] text-pink-600 font-bold mt-0.5">
                  Papelería Bonita &bull; Novedades &bull; Peluches &bull; Cositas
                </p>
                {config.whatsappNumber && (
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    WhatsApp: {config.whatsappNumber}
                  </p>
                )}
              </div>

              {/* Folio & Date Banner */}
              <div className="py-3 px-3.5 my-3 bg-gradient-to-r from-pink-50 via-teal-50/50 to-pink-50 rounded-2xl border border-pink-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    NOTA DE REMISIÓN
                  </span>
                  <span className="font-mono font-black text-pink-700 text-sm">
                    {folio}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-medium text-slate-500 block">
                    Fecha de emisión
                  </span>
                  <span className="font-bold text-slate-800 text-[11px]">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Client Info Section */}
              <div className="space-y-1 text-xs py-2 px-1 border-b border-dashed border-pink-100">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-500 text-[11px]">Cliente:</span>
                  <span className="font-black text-slate-900 text-sm text-right">
                    {apartado.clientName}
                  </span>
                </div>
                {apartado.clientNote && (
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-slate-500 text-[11px]">Referencia:</span>
                    <span className="text-slate-700 font-medium text-right italic">
                      {apartado.clientNote}
                    </span>
                  </div>
                )}
                {apartado.clientPhone && (
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-slate-500 text-[11px]">Teléfono:</span>
                    <span className="font-mono text-slate-700 text-right">
                      {apartado.clientPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="my-3">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Detalle de Productos</span>
                  <span>Importe</span>
                </div>

                <div className="space-y-2">
                  {apartado.items && apartado.items.length > 0 ? (
                    apartado.items.map((it, idx) => (
                      <div 
                        key={it.id || idx}
                        className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {it.productImage && (
                            <img 
                              src={it.productImage} 
                              alt="" 
                              crossOrigin="anonymous"
                              data-external="true"
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-[11px]">
                              {it.quantity}x {it.productName}
                            </p>
                            {(it.selectedDesign || it.selectedColor || it.selectedFormat) && (
                              <p className="text-[10px] text-pink-600 font-medium truncate">
                                {[it.selectedDesign, it.selectedColor, it.selectedFormat].filter(Boolean).join(' • ')}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400">
                              Unitario: {currency}{it.unitPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 font-mono text-right shrink-0">
                          {currency}{it.subtotal.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {apartado.productImage && (
                          <img 
                            src={apartado.productImage} 
                            alt="" 
                            crossOrigin="anonymous"
                            data-external="true"
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate text-[11px]">
                            {apartado.quantity || 1}x {apartado.productName}
                          </p>
                          {(apartado.selectedDesign || apartado.selectedColor || apartado.selectedFormat) && (
                            <p className="text-[10px] text-pink-600 font-medium truncate">
                              {[apartado.selectedDesign, apartado.selectedColor, apartado.selectedFormat].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400">
                            Unitario: {currency}{(apartado.unitPrice || apartado.totalPrice).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 font-mono text-right shrink-0">
                        {currency}{apartado.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Totals Box */}
              <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Total de la Nota:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currency}{apartado.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Abonado / Anticipo:</span>
                  <span className="font-mono font-bold">
                    -{currency}{apartado.totalAbonado.toFixed(2)}
                  </span>
                </div>

                <div className="pt-2 border-t border-pink-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-slate-900 text-sm">
                    SALDO PENDIENTE:
                  </span>
                  <span className={`font-mono text-lg font-black ${
                    isLiquidated ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {currency}{apartado.saldoPendiente.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mt-3 text-center">
                <span className={`inline-block text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  isLiquidated 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {isLiquidated ? '✨ PRODUCTO LIQUIDADO ✨' : '⏳ APARTADO PENDIENTE'}
                </span>
              </div>

              {/* Abonos History if any */}
              {apartado.abonos && apartado.abonos.length > 0 && (
                <div className="mt-3 pt-2 border-t border-dashed border-slate-200 text-[10px] text-slate-500">
                  <span className="font-bold text-slate-600 block mb-1">Historial de Pagos / Abonos:</span>
                  <div className="space-y-0.5">
                    {apartado.abonos.map((ab, i) => (
                      <div key={ab.id || i} className="flex justify-between">
                        <span>{new Date(ab.date).toLocaleDateString('es-MX')} - {ab.note || 'Abono'}</span>
                        <span className="font-bold font-mono text-emerald-700">+{currency}{ab.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sweet Footer Note */}
              <div className="mt-4 pt-3 border-t border-dashed border-pink-200 text-center">
                <p className="text-[11px] font-bold text-pink-700">
                  🎀 ¡Muchas gracias por tu compra y preferencia! 🎀
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Conserva esta nota de remisión para liquidar o retirar tu pedido.
                </p>
              </div>

            </div>

        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Enviar resumen completo por WhatsApp al cliente"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            {/* Download as Image */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              title="Descargar la nota de remisión como imagen (PNG)"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isDownloading ? 'Generando...' : 'Descargar Imagen'}</span>
            </button>

            {/* Copy text to clipboard */}
            <button
              onClick={handleCopyTextToClipboard}
              className="px-3.5 py-2.5 bg-[#FFF0F5] hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Copiar texto de la nota para pegar en cualquier chat"
            >
              {copiedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-pink-600" />}
              <span>{copiedSuccess ? '¡Texto Copiado!' : 'Copiar Nota (Texto)'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Imprimir nota física o Guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
