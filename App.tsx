
import React, { useState, useCallback, useEffect } from 'react';
import { Product, CartItem, Order, SellerProfile, CustomerData, TeamMember, ManagementCredentials, ShippingRule, Voucher, BoostedProduct } from './types';
import CustomerView from './views/CustomerView';
import LoginView from './views/seller/LoginView';
import SellerDashboard from './views/seller/SellerDashboard';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_TEAM_MEMBERS, MANAGEMENT_CREDENTIALS, INITIAL_MANAGEMENT_PROFILE, INITIAL_MANAGEMENT_PRODUCTS, INITIAL_MANAGEMENT_ORDERS, INITIAL_SHIPPING_RULES, INITIAL_VOUCHERS, INITIAL_BOOSTED_PRODUCTS } from './constants';
import SellerSetupView from './views/seller/SellerSetupView';
import ManagementLoginView from './views/management/ManagementLoginView';
import ManagementSetupView from './views/management/ManagementSetupView';
import ManagementDashboard from './views/management/ManagementDashboard';


type View = 'customer' | 'login' | 'seller_setup' | 'seller_dashboard' | 'management_login' | 'management_setup' | 'management_dashboard';

const App: React.FC = () => {
    // --- Global and Customer State ---
    const [view, setView] = useState<View>('customer');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCartItemIds, setSelectedCartItemIds] = useState<Set<string>>(new Set());
    const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
    
    // --- Seller State ---
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
    const [shippingRules, setShippingRules] = useState<ShippingRule[]>(INITIAL_SHIPPING_RULES);
    const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
    const [boostedProducts, setBoostedProducts] = useState<BoostedProduct[]>(INITIAL_BOOSTED_PRODUCTS);
    const [sellerProfile, setSellerProfile] = useState<SellerProfile>({
        storeName: 'BURAQ Official Store',
        profilePicture: 'https://i.pravatar.cc/150?u=buraq-store',
        username: 'naraskaryanusantara',
        phone: '08563231191'
    });

    // --- Management State (repurposed for sub-sellers) ---
    const [managementIsAuthenticated, setManagementIsAuthenticated] = useState<boolean>(false);
    const [managementProfile, setManagementProfile] = useState<SellerProfile>(INITIAL_MANAGEMENT_PROFILE);
    const [managementProducts, setManagementProducts] = useState<Product[]>(INITIAL_MANAGEMENT_PRODUCTS);
    const [managementOrders, setManagementOrders] = useState<Order[]>(INITIAL_MANAGEMENT_ORDERS);


    useEffect(() => {
        try {
            const savedOrders = localStorage.getItem('buraq_customer_orders');
            if (savedOrders) {
                const parsedOrders = JSON.parse(savedOrders);
                // CRITICAL FIX: Ensure the loaded data is an array before setting state
                if (Array.isArray(parsedOrders)) {
                    setCustomerOrders(parsedOrders);
                }
            }
        } catch (error) {
            console.error("Failed to load or parse customer orders from localStorage", error);
            // If data is corrupted, it's safer to clear it
            localStorage.removeItem('buraq_customer_orders');
        }
    }, []);

    const navigateTo = (newView: View) => {
        setView(newView);
    };

    // --- Seller Auth ---
    const handleLogin = useCallback(() => {
        if (sellerProfile.storeName === '' || sellerProfile.profilePicture === '') {
            setView('seller_setup');
        } else {
            setIsAuthenticated(true);
            setView('seller_dashboard');
        }
    }, [sellerProfile]);

    const handleSetupComplete = useCallback((profile: SellerProfile) => {
        setSellerProfile(profile);
        setIsAuthenticated(true);
        setView('seller_dashboard');
    }, []);

    const handleLogout = () => {
        setIsAuthenticated(false);
        setView('customer');
    };
    
    // --- Management/Sub-seller Auth ---
    const handleManagementLogin = useCallback((member: TeamMember) => {
        setManagementIsAuthenticated(true);
        const profile: SellerProfile = {
            storeName: member.storeName,
            profilePicture: member.profilePicture,
            username: member.username,
            phone: member.phone,
        };
        setManagementProfile(profile);
        setView('management_dashboard');
    }, []);

    const handleManagementSetupComplete = useCallback((profile: SellerProfile) => {
        setManagementProfile(profile);
        setManagementIsAuthenticated(true);
        setView('management_dashboard');
    }, []);

    const handleManagementLogout = () => {
        setManagementIsAuthenticated(false);
        setView('customer');
    };

    // --- Cart & Order Logic ---
    const addToCart = (product: Product, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
        setSelectedCartItemIds(prev => new Set(prev).add(product.id));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        setCart(prevCart => {
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== productId);
            }
            return prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
        if (quantity <= 0) {
            setSelectedCartItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    };
    
    const toggleCartItemSelection = (productId: string) => {
        setSelectedCartItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const toggleSelectAllCartItems = () => {
        setSelectedCartItemIds(prev => {
            if (prev.size === cart.length) {
                return new Set();
            } else {
                return new Set(cart.map(item => item.id));
            }
        });
    };

    const handlePlaceOrder = (customerData: CustomerData) => {
        const itemsToOrder = cart.filter(item => selectedCartItemIds.has(item.id));
        if (itemsToOrder.length === 0) {
            alert("Tidak ada item yang dipilih untuk di-checkout.");
            return null;
        }

        const subtotal = itemsToOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Calculate shipping cost
        const shippingRule = shippingRules.find(rule => rule.destination === customerData.province);
        let calculatedShippingCost = shippingRule ? shippingRule.standardCost : 0; // Default to 0 if no rule found

        // Validate voucher
        let voucherUsed: string | null = null;
        if (customerData.voucherCode) {
            const voucher = vouchers.find(v => v.code.toLowerCase() === customerData.voucherCode?.toLowerCase() && v.isActive);
            if (voucher) {
                if (subtotal >= voucher.minimumPurchase) {
                    calculatedShippingCost = 0;
                    voucherUsed = voucher.code;
                } else {
                    alert(`Minimal pembelian untuk voucher ${voucher.code} adalah Rp${voucher.minimumPurchase}.`);
                    // Don't proceed with order if voucher is invalid and entered
                }
            } else {
                 alert(`Kode voucher "${customerData.voucherCode}" tidak valid.`);
                 // Don't proceed with order if voucher is invalid and entered
            }
        }

        const total = subtotal + calculatedShippingCost;
        const fullAddress = `${customerData.address}, ${customerData.province}`;

        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            customerName: customerData.name,
            customerPhone: customerData.phone,
            customerEmail: customerData.email,
            customerAddress: fullAddress,
            customerProvince: customerData.province,
            items: itemsToOrder,
            subtotal: subtotal,
            shippingCost: calculatedShippingCost,
            voucherUsed: voucherUsed,
            total: total,
            status: 'Pending',
            date: new Date().toISOString(),
        };

        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setManagementOrders(prevOrders => [newOrder, ...prevOrders]);
        
        setCustomerOrders(prevCustomerOrders => {
            const updatedOrders = [newOrder, ...prevCustomerOrders];
            try {
                localStorage.setItem('buraq_customer_orders', JSON.stringify(updatedOrders));
            } catch (error) {
                console.error("Failed to save customer orders to localStorage", error);
            }
            return updatedOrders;
        });

        setCart(prevCart => prevCart.filter(item => !selectedCartItemIds.has(item.id)));
        setSelectedCartItemIds(new Set());
        return newOrder;
    };
    
    const batchUpdateOrderStatuses = (updates: { [orderId: string]: Order['status'] }) => {
        const updateLogic = (order: Order) => updates[order.id] ? { ...order, status: updates[order.id] } : order;

        setOrders(prev => prev.map(updateLogic));
        setManagementOrders(prev => prev.map(updateLogic));
        
        const updatedCustomerOrders = customerOrders.map(updateLogic);
        setCustomerOrders(updatedCustomerOrders);
        
        try {
            localStorage.setItem('buraq_customer_orders', JSON.stringify(updatedCustomerOrders));
        } catch (error) {
            console.error("Failed to save updated customer orders to localStorage", error);
        }
    };
    
    // --- Management CRUD Handlers ---
    const managementCrudHandlers = {
      addProduct: (product: Product) => setManagementProducts(prev => [{ ...product, sellerInfo: managementProfile }, ...prev]),
      updateProduct: (updatedProduct: Product) => setManagementProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)),
      deleteProduct: (productId: string) => setManagementProducts(prev => prev.filter(p => p.id !== productId)),
      batchUpdateOrderStatuses,
      updateSellerProfile: (profile: SellerProfile) => setManagementProfile(profile),
    };

    // --- Seller CRUD Handlers (includes Management control) ---
    const crudHandlers = {
      // Seller's own data
      addProduct: (product: Product) => setProducts(prev => [{...product, sellerInfo: sellerProfile }, ...prev]),
      updateProduct: (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)),
      deleteProduct: (productId: string) => setProducts(prev => prev.filter(p => p.id !== productId)),
      updateOrder: (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setManagementOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      },
      deleteOrder: (orderId: string) => {
          setOrders(prev => prev.filter(o => o.id !== orderId));
          setManagementOrders(prev => prev.filter(o => o.id !== orderId));
      },
      batchUpdateOrderStatuses,
      updateSellerProfile: (profile: SellerProfile) => setSellerProfile(profile),
      addTeamMember: (member: TeamMember) => setTeamMembers(prev => [member, ...prev]),
      updateTeamMember: (updatedMember: TeamMember) => setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m)),
      deleteTeamMember: (memberId: string) => setTeamMembers(prev => prev.filter(m => m.id !== memberId)),
      
      // Shipping Rules
      addShippingRule: (rule: ShippingRule) => setShippingRules(prev => [rule, ...prev]),
      updateShippingRule: (updatedRule: ShippingRule) => setShippingRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r)),
      deleteShippingRule: (ruleId: string) => setShippingRules(prev => prev.filter(r => r.id !== ruleId)),

      // Promotions
      updateVoucher: (updatedVoucher: Voucher) => setVouchers(prev => prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v)),
      addBoostedProduct: (productId: string, durationDays: number) => {
        const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        const newBoost: BoostedProduct = { productId, endDate };
        setBoostedProducts(prev => [...prev.filter(p => p.productId !== productId), newBoost]);
      },
      removeBoostedProduct: (productId: string) => setBoostedProducts(prev => prev.filter(p => p.productId !== productId)),

      // Deprecated Management Control
      updateManagementCredentials: () => {},
      updateManagementProduct: managementCrudHandlers.updateProduct,
      deleteManagementProduct: managementCrudHandlers.deleteProduct,
    };

    const allProductsForCustomer = [...products, ...managementProducts];
    const allSellerProducts = [...products, ...managementProducts];
    const allSellerOrders = [...orders];


    const renderView = () => {
        switch (view) {
            case 'customer':
                return (
                    <CustomerView
                        products={allProductsForCustomer}
                        cart={cart}
                        customerOrders={customerOrders}
                        boostedProducts={boostedProducts}
                        shippingRules={shippingRules}
                        vouchers={vouchers}
                        addToCart={addToCart}
                        updateCartQuantity={updateCartQuantity}
                        onPlaceOrder={handlePlaceOrder}
                        navigateToSeller={() => navigateTo('login')}
                        selectedCartItemIds={selectedCartItemIds}
                        toggleCartItemSelection={toggleCartItemSelection}
                        toggleSelectAllCartItems={toggleSelectAllCartItems}
                    />
                );
            case 'login':
                return <LoginView onLogin={handleLogin} navigateToCustomer={() => navigateTo('customer')} navigateToManagementLogin={() => navigateTo('management_login')} />;
            case 'seller_setup':
                return <SellerSetupView onSetupComplete={handleSetupComplete} currentProfile={sellerProfile} />;
            case 'seller_dashboard':
                 if (isAuthenticated) {
                    return (
                        <SellerDashboard
                            products={products}
                            orders={allSellerOrders}
                            allProducts={allSellerProducts}
                            sellerProfile={sellerProfile}
                            teamMembers={teamMembers}
                            shippingRules={shippingRules}
                            vouchers={vouchers}
                            boostedProducts={boostedProducts}
                            onLogout={handleLogout}
                            crudHandlers={crudHandlers}
                        />
                    );
                }
                return <LoginView onLogin={handleLogin} navigateToCustomer={() => navigateTo('customer')} navigateToManagementLogin={() => navigateTo('management_login')} />;
            
            case 'management_login':
                return <ManagementLoginView onLogin={handleManagementLogin} navigateToCustomer={() => navigateTo('customer')} teamMembers={teamMembers} />;
            case 'management_setup':
                return <ManagementSetupView onSetupComplete={handleManagementSetupComplete} currentProfile={managementProfile} />;
            case 'management_dashboard':
                if (managementIsAuthenticated) {
                    return (
                        <ManagementDashboard
                            products={managementProducts}
                            orders={managementOrders}
                            sellerProfile={managementProfile}
                            onLogout={handleManagementLogout}
                            crudHandlers={managementCrudHandlers}
                        />
                    );
                }
                return <ManagementLoginView onLogin={handleManagementLogin} navigateToCustomer={() => navigateTo('customer')} teamMembers={teamMembers} />;
            default:
                return <div>404 - Page Not Found</div>;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            {renderView()}
        </div>
    );
};

export default App;
