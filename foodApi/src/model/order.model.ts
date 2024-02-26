import mongoose from 'mongoose';
import { Document, Schema, Types } from 'mongoose';

interface OrderItem {
  quantity: number;
  product: Types.ObjectId | string;
}

interface ShippingInfo {
  location?: string;
  note?: string;
  phoneNo?: string;
}

interface Payment {
  _id: Types.ObjectId;
  // Add other properties from the "payment" schema if needed
}

interface Order extends Document {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  user?: Types.ObjectId | string;
  payment?: Payment;
  paymentStatus: 'pending' | 'completed';
  paymentType?: 'Cash' | 'online';
  totalPrice: number;
  telegramid?: number;
  orderStatus: 'pending' | 'completed';
  orderfromtelegram: boolean;
  createdAt: Date;
}


  const orderSchema = new Schema<Order>({
    shippingInfo: {
        location: {
            type: String,
            required: false
        },
        note: {
            type: String,
            required: false
        },
        phoneNo: {
            type: String,
            required: false
        },
    },
    orderItems: [
      {
        quantity: { type: Number, required: true },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      },
    ],
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment', required: false },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    paymentType: {
      type: String,
      enum: ['Cash', 'online'],
    },
    totalPrice: { type: Number, required: true, default: 0 },
    telegramid: { type: Number },
    orderStatus: {
      type: String,
      enum: ['pending', 'completed',"cancelled","delivered"],
      default: 'pending',
    },
    orderfromtelegram: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  });

const Order = mongoose.model('Order', orderSchema);

export default Order;
