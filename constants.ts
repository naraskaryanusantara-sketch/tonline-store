import { Category, Product, Order, TeamMember, SellerProfile, ManagementCredentials, ShippingRule, Voucher, BoostedProduct } from './types';

export const CATEGORIES: Category[] = [
  Category.TeenFashion,
  Category.KidsFashion,
  Category.Food,
  Category.Drinks,
  Category.Household,
  Category.Electronics,
  Category.Others,
];

export const PLACEHOLDER_IMAGE_URL = 'https://i.ibb.co/9v0Gyt8/placeholder.png';


const defaultSellerInfo = {
  storeName: 'BURAQ Official Store',
  profilePicture: 'https://i.pravatar.cc/150?u=buraq-store',
};


export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];

// --- Management Account Data ---

const managementSellerInfo = {
  storeName: 'Manajemen BURAQ',
  profilePicture: 'https://i.pravatar.cc/150?u=manajemen-buraq',
};

export const MANAGEMENT_CREDENTIALS: ManagementCredentials = {
  username: 'manajemen',
  password: 'password123',
};

export const INITIAL_MANAGEMENT_PROFILE: SellerProfile = {
  ...managementSellerInfo,
  username: MANAGEMENT_CREDENTIALS.username,
  phone: '081122334455',
};

export const INITIAL_MANAGEMENT_PRODUCTS: Product[] = [];

export const INITIAL_MANAGEMENT_ORDERS: Order[] = [];

export const INITIAL_SHIPPING_RULES: ShippingRule[] = [
    { id: 'ship-1', destination: 'DKI Jakarta', standardCost: 10000, expressCost: 20000 },
    { id: 'ship-2', destination: 'Jawa Timur', standardCost: 15000, expressCost: 25000 },
    { id: 'ship-3', destination: 'Jawa Barat', standardCost: 12000, expressCost: 22000 },
    { id: 'ship-4', destination: 'Jawa Tengah', standardCost: 13000, expressCost: 23000 },
];

export const INITIAL_VOUCHERS: Voucher[] = [
    {
        id: 'free-shipping-1',
        name: 'Ekstra Gratis Ongkir',
        code: 'ONGKIRGRATIS',
        description: 'Dapatkan gratis ongkir untuk pesanan Anda.',
        isActive: true,
        minimumPurchase: 50000,
    }
];

export const INITIAL_BOOSTED_PRODUCTS: BoostedProduct[] = [];