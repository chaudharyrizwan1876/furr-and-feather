import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Cart mein product add karo
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product._id);

        let newItems;
        if (existing) {
          newItems = items.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [
            ...items,
            {
              productId: product._id,
              name: product.name,
              price: product.price,
              image: product.images && product.images[0] ? product.images[0] : null,
              quantity: quantity,
              stock: product.stock,
            },
          ];
        }
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Quantity update karo
      // Quantity update karo
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Item remove karo
      removeItem: (productId) => {
        const newItems = get().items.filter((item) => item.productId !== productId);
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Cart khali karo (order place hone ke baad)
      clearCart: () => set({ items: [], totalItems: 0 }),

      // Total items count (Navbar badge ke liye)
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