import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// We use both productId + variantId to uniquely identify each item in the
// cart. If a product has no variant, variantId stays null. This is
// important so that 2 different variants of the same product (e.g.
// Bravecto 4.5-10kg and 40-56kg) remain separate cart line items instead
// of accidentally merging.
const getItemKey = (productId, variantId) => `${productId}__${variantId || 'base'}`;

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add a product to the cart. variantId/variantLabel are optional —
      // pass them when a specific product variant has been selected.
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

      // Update quantity — match on both productId + variantId
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map((item) =>
          getItemKey(item.productId, item.variantId) === getItemKey(productId, variantId)
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Remove an item — match on both productId + variantId
      removeItem: (productId, variantId) => {
        const newItems = get().items.filter(
          (item) => getItemKey(item.productId, item.variantId) !== getItemKey(productId, variantId)
        );
        set({ items: newItems, totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0) });
      },

      // Clear the cart (after an order is placed)
      clearCart: () => set({ items: [], totalItems: 0 }),

      // Total item count (for the Navbar badge)
      totalItems: 0,
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Calculate the subtotal
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
