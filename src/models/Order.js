import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Agar order logged-in customer ne place kiya hai to uska User ID yahan save hota hai.
    // Guest orders ke liye yeh field khali (null) rehta hai — unhe phone number se track kiya jata hai.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        variantId: { type: mongoose.Schema.Types.ObjectId }, // agar product ka specific variant kharida gaya ho
        variantLabel: { type: String }, // e.g. "4.5-10kg" — display ke liye
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    notes: { type: String },

    paymentMethod: { type: String, enum: ['COD', 'Easypaisa', 'JazzCash', 'BankTransfer'], required: true },
    paymentScreenshot: { type: String },
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    total: { type: Number, required: true },

    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
