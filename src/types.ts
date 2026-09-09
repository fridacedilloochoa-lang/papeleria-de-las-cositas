export interface ProductDesign {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice?: number; // Cost of purchase/investment
  comparePrice?: number;
  stock: number;
  designs: ProductDesign[];
  colors: ProductColor[];
  formats: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Abono {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export type ApartadoStatus = 'apartado' | 'pagado_parcial' | 'liquidado' | 'entregado' | 'cancelado';

export interface ApartadoItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  selectedDesign?: string;
  selectedColor?: string;
  selectedFormat?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Apartado {
  id: string;
  folioRemision?: string; // Número consecutivo de la nota de remisión ej. REM-0001
  clientName: string;
  clientNote: string;
  clientPhone?: string; // Opcional, ya no se exige para la dueña
  productId?: string;
  productName: string;
  productImage?: string;
  selectedDesign?: string;
  selectedColor?: string;
  selectedFormat?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  abonos: Abono[];
  totalAbonado: number;
  saldoPendiente: number;
  status: ApartadoStatus;
  items?: ApartadoItem[]; // Lista de múltiples productos por cliente
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique cart item id
  product: Product;
  selectedDesign?: ProductDesign;
  selectedColor?: ProductColor;
  selectedFormat?: string;
  quantity: number;
}

export type KawaiiTheme = 'mochila-pastel';

export interface StoreConfig {
  storeName: string;
  tagline: string;
  announcementBanner: string;
  whatsappNumber: string;
  currency: string;
  adminPin: string;
  categories: string[];
  logoUrl?: string;
  themePreference?: KawaiiTheme;
}
