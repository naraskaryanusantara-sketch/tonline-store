
export enum Category {
  TeenFashion = "Fashion Remaja",
  KidsFashion = "Fashion Anak-anak",
  Food = "Makanan",
  Drinks = "Minuman",
  Household = "Alat-alat Rumah Tangga",
  Electronics = "Alat Elektronik",
  Others = "Lain-lain",
}

export interface SellerInfo {
  storeName: string;
  profilePicture: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  stock: number;
  sellerInfo: SellerInfo;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CustomerData {
    name: string;
    phone: string;
    email: string;
    province: string;
    address: string; // Street details
    voucherCode?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string; // Full address string
  customerProvince: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  voucherUsed: string | null;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

export interface SellerProfile {
  storeName: string;
  profilePicture: string;
  username: string;
  phone?: string;
}

export interface SellerPermissions {
  viewDashboard: boolean;
  manageOrders: boolean;
  manageProducts: boolean;
  manageSettings: boolean;
}

export interface TeamMember {
  id: string;
  username: string;
  storeName: string;
  password: string;
  phone: string;
  profilePicture: string;
  productCount: number;
  permissions: SellerPermissions;
}

export interface ManagementCredentials {
  username: string;
  password: string;
}

export interface ShippingRule {
  id: string;
  destination: string; // Should match province name
  standardCost: number;
  expressCost: number;
}

export interface Voucher {
    id: string;
    name: string;
    code: string;
    description: string;
    isActive: boolean;
    minimumPurchase: number;
}

export interface BoostedProduct {
    productId: string;
    endDate: string;
}