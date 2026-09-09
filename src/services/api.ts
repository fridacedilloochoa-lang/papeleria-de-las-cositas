import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImageToImgBB } from './imgbb';
import { Product, Apartado, StoreConfig, ApartadoItem } from '../types';
import { initialProducts, initialApartados, initialStoreConfig } from '../data/initialData';

const LOCAL_FAVORITES_KEY = 'senora_cositas_favorites';

const productsCol = collection(db, 'products');
const apartadosCol = collection(db, 'apartados');
const configDocRef = doc(db, 'config', 'main');

type StoreData = {
  products: Product[];
  apartados: Apartado[];
  config: StoreConfig;
};

// Firestore no acepta "undefined" ni arreglos dentro de arreglos.
// Esta función limpia y corrige ambos casos antes de guardar cualquier dato.
function clean<T>(obj: T): T {
  const stripped = JSON.parse(JSON.stringify(obj));
  function fixNested(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (Array.isArray(item)) {
          return { valores: fixNested(item) };
        }
        return fixNested(item);
      });
    } else if (value && typeof value === 'object') {
      const out: any = {};
      for (const key in value) out[key] = fixNested(value[key]);
      return out;
    }
    return value;
  }
  return fixNested(stripped);
}

// Convierte un apartado (nuevo o viejo) en su lista de productos (items).
function getApartadoItems(apt: Apartado): ApartadoItem[] {
  if (apt.items && apt.items.length > 0) return apt.items;
  return [{
    id: `item-${apt.id}-legacy`,
    productId: apt.productId || '',
    productName: apt.productName,
    productImage: apt.productImage,
    selectedDesign: apt.selectedDesign,
    selectedColor: apt.selectedColor,
    selectedFormat: apt.selectedFormat,
    quantity: apt.quantity,
    unitPrice: apt.unitPrice,
    subtotal: apt.totalPrice,
  }];
}

export const api = {
  // Favoritos (solo en este dispositivo, no necesita Firebase)
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveFavorites(favorites: string[]) {
    try {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error guardando favoritos:', e);
    }
  },

  // Subir una imagen a ImgBB (gratis, sin tarjeta)
  async uploadImage(base64Data: string, filename?: string): Promise<string> {
    return uploadImageToImgBB(base64Data, filename);
  },

  // Traer todo el catálogo desde Firestore
  async getStoreData(): Promise<StoreData> {
    try {
      const [productsSnap, apartadosSnap, configSnap] = await Promise.all([
        getDocs(productsCol),
        getDocs(apartadosCol),
        getDoc(configDocRef),
      ]);

      const products = productsSnap.docs.map(d => d.data() as Product);
      const apartados = apartadosSnap.docs.map(d => d.data() as Apartado)
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      const config = configSnap.exists()
        ? { ...initialStoreConfig, ...(configSnap.data() as StoreConfig) }
        : initialStoreConfig;

      // Si no hay nada guardado todavía (primera vez), sembramos los datos de ejemplo.
      if (products.length === 0 && apartados.length === 0 && !configSnap.exists()) {
        await this.seedInitialData();
        return { products: initialProducts, apartados: initialApartados, config: initialStoreConfig };
      }

      return {
        products: products.length > 0 ? products : initialProducts,
        apartados,
        config,
      };
    } catch (err) {
      console.warn('No se pudo leer de Firestore, usando datos de ejemplo:', err);
      return { products: initialProducts, apartados: initialApartados, config: initialStoreConfig };
    }
  },

  // Se usa solo la primera vez que la tienda se conecta a una base de datos vacía.
  async seedInitialData(): Promise<void> {
    await Promise.all([
      ...initialProducts.map(p => setDoc(doc(productsCol, p.id), clean(p))),
      ...initialApartados.map(a => setDoc(doc(apartadosCol, a.id), clean(a))),
      setDoc(configDocRef, clean(initialStoreConfig)),
    ]);
  },

  // ---------------- Productos ----------------
  async addProduct(productData: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'Nuevo Producto',
      description: productData.description || '',
      category: productData.category || 'General',
      price: productData.price || 0,
      costPrice: productData.costPrice,
      comparePrice: productData.comparePrice,
      stock: productData.stock || 0,
      designs: productData.designs || [],
      colors: productData.colors || [],
      formats: productData.formats || [],
      isNew: productData.isNew,
      isFeatured: productData.isFeatured,
      tags: productData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(productsCol, newProduct.id), clean(newProduct));
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const ref = doc(productsCol, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Producto no encontrado');
    const updated: Product = {
      ...(snap.data() as Product),
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, clean(updated));
    return updated;
  },

  async updateStock(id: string, delta?: number, exactStock?: number): Promise<{ stock: number }> {
    const ref = doc(productsCol, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Producto no encontrado');
    const current = snap.data() as Product;
    const newStock = exactStock !== undefined
      ? Math.max(0, exactStock)
      : Math.max(0, (current.stock || 0) + (delta || 0));
    await setDoc(ref, clean({ ...current, stock: newStock, updatedAt: new Date().toISOString() }));
    return { stock: newStock };
  },

  async deleteProduct(id: string): Promise<boolean> {
    await deleteDoc(doc(productsCol, id));
    return true;
  },

  // ---------------- Apartados ----------------
  async createApartado(apartadoData: {
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
    initialAbono?: number;
    initialAbonoNote?: string;
    decrementStock?: boolean;
    folioRemision?: string;
    items?: ApartadoItem[];
  }): Promise<Apartado> {
    const calculatedFromItems = apartadoData.items?.reduce((s, it) => s + it.subtotal, 0);
    const total = apartadoData.totalPrice || calculatedFromItems || ((apartadoData.unitPrice || 0) * (apartadoData.quantity || 1));
    const initialAbono = Number(apartadoData.initialAbono) || 0;
    const abonos = [];
    if (initialAbono > 0) {
      abonos.push({
        id: `abn-${Date.now()}`,
        amount: initialAbono,
        date: new Date().toISOString(),
        note: apartadoData.initialAbonoNote || 'Anticipo inicial',
      });
    }
    const totalAbonado = abonos.reduce((s, a) => s + a.amount, 0);
    const saldoPendiente = Math.max(0, total - totalAbonado);
    const status = saldoPendiente === 0 ? 'liquidado' : (totalAbonado > 0 ? 'pagado_parcial' : 'apartado');

    const firstItem = apartadoData.items?.[0];
    const displayTitle = apartadoData.items && apartadoData.items.length > 1
      ? `${firstItem?.productName || 'Producto'} (+${apartadoData.items.length - 1} más)`
      : (apartadoData.productName || firstItem?.productName || 'Producto');

    const newApartado: Apartado = {
      id: `apt-${Date.now()}`,
      folioRemision: apartadoData.folioRemision || `REM-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      clientName: apartadoData.clientName || 'Cliente',
      clientNote: apartadoData.clientNote || '',
      clientPhone: apartadoData.clientPhone || '',
      productId: apartadoData.productId || firstItem?.productId,
      productName: displayTitle,
      productImage: apartadoData.productImage || firstItem?.productImage,
      selectedDesign: apartadoData.selectedDesign || firstItem?.selectedDesign,
      selectedColor: apartadoData.selectedColor || firstItem?.selectedColor,
      selectedFormat: apartadoData.selectedFormat || firstItem?.selectedFormat,
      quantity: apartadoData.items ? apartadoData.items.reduce((s, it) => s + it.quantity, 0) : (apartadoData.quantity || 1),
      unitPrice: apartadoData.unitPrice || (firstItem?.unitPrice || 0),
      totalPrice: total,
      items: apartadoData.items,
      abonos,
      totalAbonado,
      saldoPendiente,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(apartadosCol, newApartado.id), clean(newApartado));

    if (apartadoData.decrementStock) {
      const itemsToDecrement = apartadoData.items && apartadoData.items.length > 0
        ? apartadoData.items
        : (apartadoData.productId ? [{ productId: apartadoData.productId, quantity: apartadoData.quantity || 1 }] : []);
      for (const it of itemsToDecrement) {
        if (!it.productId) continue;
        const ref = doc(productsCol, it.productId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const current = snap.data() as Product;
          await setDoc(ref, clean({ ...current, stock: Math.max(0, (current.stock || 0) - (it.quantity || 1)) }));
        }
      }
    }

    return newApartado;
  },

  // Solo la administradora: agrega otro producto a un apartado (cuenta) que ya existe.
  async addProductToApartado(apartadoId: string, itemData: {
    productId: string;
    productName: string;
    productImage?: string;
    selectedDesign?: string;
    selectedColor?: string;
    selectedFormat?: string;
    quantity: number;
    unitPrice: number;
    decrementStock?: boolean;
  }): Promise<Apartado> {
    const ref = doc(apartadosCol, apartadoId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Apartado no encontrado');
    const current = snap.data() as Apartado;

    const existingItems = getApartadoItems(current);
    const quantity = Number(itemData.quantity) || 1;
    const unitPrice = Number(itemData.unitPrice) || 0;
    const newItem: ApartadoItem = {
      id: `item-${Date.now()}`,
      productId: itemData.productId,
      productName: itemData.productName,
      productImage: itemData.productImage,
      selectedDesign: itemData.selectedDesign,
      selectedColor: itemData.selectedColor,
      selectedFormat: itemData.selectedFormat,
      quantity,
      unitPrice,
      subtotal: unitPrice * quantity,
    };
    const updatedItems = [...existingItems, newItem];
    const totalPrice = updatedItems.reduce((s, it) => s + Number(it.subtotal || 0), 0);
    const totalAbonado = (current.abonos || []).reduce((s, a) => s + Number(a.amount || 0), 0);
    const saldoPendiente = Math.max(0, totalPrice - totalAbonado);

    let newStatus = current.status;
    if (saldoPendiente === 0 && current.status !== 'entregado') {
      newStatus = 'liquidado';
    } else if (current.status === 'liquidado' && saldoPendiente > 0) {
      newStatus = totalAbonado > 0 ? 'pagado_parcial' : 'apartado';
    }

    const updated: Apartado = {
      ...current,
      items: updatedItems,
      totalPrice,
      saldoPendiente,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, clean(updated));

    if (itemData.decrementStock) {
      const prodRef = doc(productsCol, itemData.productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) {
        const currentProd = prodSnap.data() as Product;
        await setDoc(prodRef, clean({ ...currentProd, stock: Math.max(0, (currentProd.stock || 0) - quantity) }));
      }
    }

    return updated;
  },

  async addAbono(apartadoId: string, amount: number, note?: string): Promise<Apartado> {
    const ref = doc(apartadosCol, apartadoId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Apartado no encontrado');
    const current = snap.data() as Apartado;

    const newAbono = {
      id: `abn-${Date.now()}`,
      amount,
      date: new Date().toISOString(),
      note: note || 'Abono',
    };
    const abonos = [...(current.abonos || []), newAbono];
    const totalAbonado = abonos.reduce((s, a) => s + a.amount, 0);
    const saldoPendiente = Math.max(0, current.totalPrice - totalAbonado);
    const status = saldoPendiente === 0 ? 'liquidado' : 'pagado_parcial';

    const updated: Apartado = {
      ...current,
      abonos,
      totalAbonado,
      saldoPendiente,
      status,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, clean(updated));
    return updated;
  },

  async updateApartado(id: string, updates: Partial<Apartado>): Promise<Apartado> {
    const ref = doc(apartadosCol, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Apartado no encontrado');
    const updated: Apartado = {
      ...(snap.data() as Apartado),
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, clean(updated));
    return updated;
  },

  async deleteApartado(id: string): Promise<boolean> {
    await deleteDoc(doc(apartadosCol, id));
    return true;
  },

  // ---------------- Configuración / Categorías ----------------
  async updateConfig(configUpdates: Partial<StoreConfig>): Promise<StoreConfig> {
    const snap = await getDoc(configDocRef);
    const current = snap.exists() ? (snap.data() as StoreConfig) : initialStoreConfig;
    const updated = { ...current, ...configUpdates };
    await setDoc(configDocRef, clean(updated));
    return updated;
  },

  async deleteCategory(categoryName: string): Promise<{ success: boolean; message?: string }> {
    const productsSnap = await getDocs(productsCol);
    const productsUsingIt = productsSnap.docs.filter(d => (d.data() as Product).category === categoryName).length;
    if (productsUsingIt > 0) {
      return { success: false, message: `No se puede eliminar: hay ${productsUsingIt} producto(s) usando "${categoryName}".` };
    }
    const configSnap = await getDoc(configDocRef);
    const current = configSnap.exists() ? (configSnap.data() as StoreConfig) : initialStoreConfig;
    const updated = { ...current, categories: current.categories.filter(c => c !== categoryName) };
    await setDoc(configDocRef, clean(updated));
    return { success: true };
  },

  // ---------------- Restaurar ----------------
  async resetData(): Promise<void> {
    const [productsSnap, apartadosSnap] = await Promise.all([getDocs(productsCol), getDocs(apartadosCol)]);
    await Promise.all([
      ...productsSnap.docs.map(d => deleteDoc(d.ref)),
      ...apartadosSnap.docs.map(d => deleteDoc(d.ref)),
    ]);
    await this.seedInitialData();
  },
};
