import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Heart, 
  ShoppingBag, 
  FileDown, 
  Shield, 
  LogOut, 
  X,
  MessageCircle,
  Store,
  Palette,
  Check,
  Bookmark,
  Plus
} from 'lucide-react';
import { StoreConfig, KawaiiTheme } from '../types';

interface HeaderProps {
  config: StoreConfig;
  currentTheme: KawaiiTheme;
  onSelectTheme: (theme: KawaiiTheme) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount: number;
  cartCount: number;
  onOpenCart: () => void;
  onOpenPdfModal: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminPanel?: () => void;
  onLogoutAdmin: () => void;
  showOnlyFavorites: boolean;
  onToggleFavoritesFilter: () => void;
  showOnlyNew: boolean;
  onToggleNewFilter: () => void;
  showOnlyOffers: boolean;
  onToggleOffersFilter: () => void;
  apartadosCount: number;
  onOpenApartadosModal?: () => void;
  onOpenAddCategoryModal?: () => void;
  onOpenChangeLogoModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentTheme,
  onSelectTheme,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  favoritesCount,
  cartCount,
  onOpenCart,
  onOpenPdfModal,
  isAdmin,
  onOpenAdminLogin,
  onOpenAdminPanel,
  onLogoutAdmin,
  showOnlyFavorites,
  onToggleFavoritesFilter,
  showOnlyNew,
  onToggleNewFilter,
  showOnlyOffers,
  onToggleOffersFilter,
  apartadosCount,
  onOpenApartadosModal,
  onOpenAddCategoryModal,
  onOpenChangeLogoModal,
}) => {
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const cleanPhone = (config.whatsappNumber || '55 1779 1232').replace(/\D/g, '');
  const formattedWhatsappUrl = `https://wa.me/${cleanPhone.length === 10 ? '521' + cleanPhone : cleanPhone}`;

  // Color dynamics based on Mochila Pastel Kawaii palette
  const announcementGradient = 'bg-gradient-to-r from-[#F0A5E0] via-[#E0C0FE] to-[#B8E6FF] text-[#22201D]';
  const logoGradient = 'bg-[#FEDEF1] text-[#22201D] shadow-md border-2 border-[#F0A5E0]';
  const activeCategoryClass = 'bg-[#F0A5E0] text-white shadow-xs font-bold ring-2 ring-[#FEDEF1]';
  const primaryBtnClass = 'bg-[#F0A5E0] hover:bg-[#e091cf] text-white';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100/80 shadow-2xs no-print">
      
      {/* Top Announcement Banner with Kawaii Theme Gradient */}
      {config.announcementBanner && (
        <div className={`${announcementGradient} text-xs sm:text-sm py-1.5 px-4 text-center font-bold shadow-inner flex items-center justify-center gap-2 transition-all duration-500`}>
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#22201D] animate-pulse-soft" />
          <span className="truncate tracking-wide">{config.announcementBanner}</span>
          <span className="hidden md:inline-block text-[11px] bg-white/40 px-2 py-0.5 rounded-full font-black text-[#22201D]">
            ✨ Mochila Pastel Kawaii
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Store Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0">
            <div className="relative group">
              <div 
                onClick={() => onSelectCategory('Todas')}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${logoGradient} flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 overflow-hidden border border-pink-200/50`}
              >
                <img 
                  src={config.logoUrl || '/bow-icon.jpg'} 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      const iconFallback = e.currentTarget.parentElement.querySelector('.logo-fallback');
                      if (iconFallback) (iconFallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <span className="logo-fallback hidden text-xl">🎀</span>
              </div>

              {/* Admin quick change logo badge */}
              {isAdmin && onOpenChangeLogoModal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChangeLogoModal();
                  }}
                  className="absolute -bottom-1 -right-1 bg-white hover:bg-pink-50 text-pink-600 p-1 rounded-full shadow-xs border border-pink-200 opacity-80 group-hover:opacity-100 transition cursor-pointer"
                  title="Cambiar imagen / logo de la tienda"
                >
                  <Palette className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div>
                <h1 
                  onClick={() => onSelectCategory('Todas')}
                  className="text-lg sm:text-2xl font-serif font-black tracking-tight text-slate-900 hover:text-pink-600 transition leading-none select-none"
                >
                  {config.storeName || 'Papelería La Señora Cositas'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] font-extrabold text-[#F0A5E0]">Mochila Pastel</span>
                  <span className="text-[10px] text-slate-300 font-black">&bull;</span>
                  <span className="text-[11px] font-semibold text-slate-600">Papelería Kawaii & Novedades</span>
                </div>
              </div>

              {/* Admin Pill Badge */}
              {isAdmin && (
                <button
                  id="header-admin-pill-badge"
                  onClick={onOpenAdminPanel || onOpenAdminLogin}
                  className="hidden sm:inline-flex items-center gap-1 bg-teal-50 text-teal-900 hover:bg-teal-100 font-bold text-[11px] px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wide transition shadow-2xs cursor-pointer"
                  title="Abrir panel de administración"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-700" />
                  <span>PANEL DUEÑA</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop Pill */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input-desktop"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar libretas, peluches, plumas..."
                className="w-full pl-9 pr-8 py-2 bg-pink-50/40 hover:bg-pink-50/80 focus:bg-white border border-pink-200/80 rounded-full text-xs sm:text-sm text-slate-800 placeholder-pink-400/80 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Mochila Pastel Palette Badge */}
            <div
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-pink-200 bg-gradient-to-r from-[#FEDEF1] via-[#E0C0FE]/40 to-[#CBFEDD]/50 text-[#22201D] font-bold text-xs flex items-center gap-1.5 shadow-2xs select-none"
              title="Paleta Mochila Pastel Kawaii"
            >
              <span className="text-sm">🎒</span>
              <span className="hidden lg:inline text-[11px] font-extrabold">Mochila Pastel</span>
              <div className="hidden sm:flex items-center gap-1 ml-0.5">
                <span className="w-2 h-2 rounded-full bg-[#F0A5E0]" title="Fresa Pastel #F0A5E0" />
                <span className="w-2 h-2 rounded-full bg-[#E0C0FE]" title="Lila Lavanda #E0C0FE" />
                <span className="w-2 h-2 rounded-full bg-[#B8E6FF]" title="Azul Cielo #B8E6FF" />
                <span className="w-2 h-2 rounded-full bg-[#CBFEDD]" title="Menta Suave #CBFEDD" />
                <span className="w-2 h-2 rounded-full bg-[#FFFED5]" title="Vainilla Dulce #FFFED5" />
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <button
              id="mobile-search-btn"
              onClick={() => setShowSearchMobile(!showSearchMobile)}
              className="md:hidden p-2 text-pink-600 hover:bg-pink-50 rounded-full transition"
              title="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Heart / Favorites Icon Button */}
            <button
              id="header-favorites-btn"
              onClick={onToggleFavoritesFilter}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition flex items-center justify-center relative shadow-2xs cursor-pointer ${
                showOnlyFavorites 
                  ? 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white border-pink-500 shadow-sm scale-105' 
                  : 'bg-white hover:bg-pink-50 text-slate-700 border-pink-200 hover:border-pink-300'
              }`}
              title="Mis Favoritos"
            >
              <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-white text-white' : 'text-pink-500'}`} />
              {favoritesCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-[10px] w-4 h-4 rounded-full font-bold flex items-center justify-center ${
                  showOnlyFavorites ? 'bg-white text-pink-600' : 'bg-pink-500 text-white'
                }`}>
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* WhatsApp Pill Button */}
            <a
              id="header-whatsapp-btn"
              href={formattedWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-teal-200 bg-white hover:bg-teal-50 text-slate-800 font-bold text-xs sm:text-sm transition shadow-2xs"
              title="Escribir por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            {/* Apartados & Reservas Pill Button - ONLY FOR ADMIN */}
            {isAdmin && onOpenApartadosModal && (
              <button
                id="header-apartados-btn"
                onClick={onOpenApartadosModal}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full border border-pink-200 bg-gradient-to-r from-pink-50 via-purple-50 to-teal-50 hover:from-pink-100 hover:to-purple-100 text-slate-800 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer active:scale-95"
                title="Gestión de apartados y reservas (solo administradora)"
              >
                <Bookmark className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">Apartados</span>
                {apartadosCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-black">
                    {apartadosCount}
                  </span>
                )}
              </button>
            )}

            {/* Catálogo PDF Pill Button */}
            <button
              id="header-pdf-btn"
              onClick={onOpenPdfModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-teal-200 bg-gradient-to-r from-teal-50 to-pink-50 hover:from-teal-100 hover:to-pink-100 text-slate-800 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer"
              title="Descargar o imprimir catálogo en PDF"
            >
              <FileDown className="w-4 h-4 text-teal-600" />
              <span>Catálogo PDF</span>
            </button>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${primaryBtnClass} flex items-center justify-center transition shadow-xs relative cursor-pointer active:scale-95`}
              title="Ver mi pedido / bolsa"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] w-4 h-4 rounded-full font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin / Logout Button */}
            {isAdmin ? (
              <button
                id="admin-logout-btn"
                onClick={onLogoutAdmin}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-200 flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Cerrar sesión de Administradora"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="admin-login-btn"
                onClick={onOpenAdminLogin}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-pink-200 bg-white hover:bg-pink-50 text-pink-700 flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Acceso Dueña / Administradora"
              >
                <Shield className="w-4 h-4 text-teal-700" />
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Expansion */}
        {showSearchMobile && (
          <div className="mt-2.5 md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input-mobile"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar libretas, peluches, plumas..."
                className="w-full pl-9 pr-8 py-2 bg-pink-50/50 border border-pink-200 rounded-full text-xs text-slate-800 placeholder-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-400 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Pills Navigation Row */}
        <div className="mt-3 pt-2.5 border-t border-pink-100 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs sm:text-sm">
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* All Category Pill */}
            <button
              id="filter-all-btn"
              onClick={() => {
                if (showOnlyFavorites) onToggleFavoritesFilter();
                if (showOnlyNew) onToggleNewFilter();
                if (showOnlyOffers) onToggleOffersFilter();
                onSelectCategory('Todas');
              }}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                (activeCategory === 'Todas' || activeCategory === 'Todos') && !showOnlyFavorites && !showOnlyNew && !showOnlyOffers
                  ? activeCategoryClass
                  : 'bg-white text-slate-700 border border-pink-200/80 hover:bg-pink-50 hover:border-pink-300 font-semibold'
              }`}
            >
              🌸 Todas
            </button>

            {/* Dynamic Category List */}
            {config.categories.filter(c => c !== 'Todos' && c !== 'Todas').map((cat) => {
              const isActive = activeCategory === cat && !showOnlyFavorites && !showOnlyNew && !showOnlyOffers;
              const lower = cat.toLowerCase();
              const emoji = lower.includes('peluche') || lower.includes('juguete') 
                ? '🧸' 
                : lower.includes('cuaderno') 
                ? '📓' 
                : lower.includes('pluma') 
                ? '✒️' 
                : lower.includes('plumon') 
                ? '🖍️' 
                : lower.includes('lápiz') || lower.includes('lapiz') 
                ? '✏️' 
                : lower.includes('washi') 
                ? '🎀' 
                : lower.includes('bolsa') 
                ? '🛍️' 
                : lower.includes('tijera') 
                ? '✂️' 
                : lower.includes('estuchera') 
                ? '👝' 
                : lower.includes('sacapunta') 
                ? '✏️' 
                : lower.includes('geometr') 
                ? '📐' 
                : lower.includes('prit') || lower.includes('pegamento') 
                ? '🧴' 
                : lower.includes('corrector') 
                ? '🩹' 
                : lower.includes('organizador') 
                ? '🗂️' 
                : '✨';

              return (
                <button
                  key={cat}
                  id={`category-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    if (showOnlyFavorites) onToggleFavoritesFilter();
                    if (showOnlyNew) onToggleNewFilter();
                    if (showOnlyOffers) onToggleOffersFilter();
                    onSelectCategory(cat);
                  }}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? activeCategoryClass
                      : 'bg-white text-slate-700 border border-pink-200/80 hover:bg-pink-50 hover:border-pink-300 font-semibold'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  <span>{cat}</span>
                </button>
              );
            })}

            {/* Add Custom Category Button - ONLY FOR ADMIN */}
            {isAdmin && onOpenAddCategoryModal && (
              <button
                id="btn-add-category-header"
                onClick={onOpenAddCategoryModal}
                className="px-3.5 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer bg-pink-50 hover:bg-pink-100 text-pink-700 hover:text-pink-800 border border-pink-200/90 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
                title="Agregar nueva categoría al catálogo (solo administradora)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Categoría</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
