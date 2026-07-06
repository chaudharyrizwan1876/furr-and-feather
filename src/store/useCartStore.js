import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cart mein har item ko uniquely identify karne ke liye productId + variantId
// dono use karte hain. Agar product ka koi variant nahi hai, variantId null
// rehta hai. Yeh zaroori hai taake ek hi product ke 2 alag variants (jaise
// Bravecto 4.5-10kg aur 40-56kg) alag-alag cart line items rahein, na ke
// galti se merge ho jayein.
const getItemKey = (productId, variantId) => `${productId}__${variantId || 'base'}`;

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Cart mein product add karo. variantId/variantLabel optional hain —
      // jab product ka koi specific variant select kiya gaya ho tab pass karo.
      addItem: (product, quantity = 1, variant = null) => {
        const items = get().items;
        const variantId = variant?._id || null;
        const itemKey = getItemKey(product._id, variantId);
        const existing = items.find((item) => getItemKey(item.productId, item.variantId) === itemKey);

        let newItems;
        if (existing) {
          newItems = items.map((item) =>
            getItemKey(item.productId, item.variantId) === itemKey
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              productId: product._id,
              variantId: variantId,
              variantLabel: variant?.label || null,
              name: product.name,
              price: variant ? variant.price : product.price,
              image: product.images && product.images[0] ? product.images[0] : null,
              quantity: quantity,
              stock: variant ? variant.stock : product.stock,
            },
          ];
        }
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Quantity update karo — productId + variantId dono se match karo
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          getItemKey(item.productId, item.variantId) === getItemKey(productId, variantId)
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Item remove karo — productId + variantId dono se match karo
      removeItem: (productId, variantId) => {
        const newItems = get().items.filter(
          (item) => getItemKey(item.productId, item.variantId) !== getItemKey(productId, variantId)
        );
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Cart khali karo (order place hone ke baad)
      clearCart: () => set({ items: [], totalItems: 0 }),

      // Total items count (Navbar badge ke liye)
      totalItems: 0,
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Subtotal calculate karo
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'furr-feathers-cart', // localStorage key
    }
  )
);

export default useCartStore;
