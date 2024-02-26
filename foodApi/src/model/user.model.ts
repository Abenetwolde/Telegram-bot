// Import the User model
import { Document, Model, model, Schema } from 'mongoose';

const addressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
});
const LanguageEnum = {
  EN: 'en',
  AM: 'am',
};
export interface IUser extends Document {
    // _id:String,
  telegramid: Number;
  email: string;
  password: string;
  name: string;
  first_name: string;
  last_name: string;
  username: string;
  last: string;
  token: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  favorites: Array<Schema.Types.ObjectId>;
  orders:Array<Schema.Types.ObjectId>;
  subscriptions: Array<Schema.Types.ObjectId>;
  locale: string;
  language: string;
  role: {
    type: String,
    default: 'USER',
    enum: ['ADMIN', 'SUPER ADMIN','USER'],
    required: [true, 'Role is required'],
  },
  is_bot:Boolean,
  from: {
    type: String,
    default: 'BOT',
    enum: ['BOT', 'CHANNEL'],
    required: [true, 'status is required'],
  }, 
  createdAt:Date
}

const userSchema = new Schema<IUser>({
  telegramid: {
    type: Number,
    required:true
  },
  email: {
    type: String,
  },

  password: {
    type: String,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  username:{
    type: String,
  },
  is_bot:{
    type: Boolean,
  },
  role: {
    type: String,
    default: 'USER',
    enum: ['ADMIN', 'SUPER ADMIN','USER'],
    required: [true, 'Role is required'],
  },

  from: {
    type: String,
    default: 'BOT',
    enum: ['BOT', 'CHANNEL'],
    required: [true, 'status is required'],
  },
  token: {
    type: String,
  },
  phone: String,
  address: addressSchema,
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  subscriptions: [{ type: Schema.Types.ObjectId, ref: 'Subscription' }],
  language:   {
    type: String,
    default: LanguageEnum.EN,
    enum: Object.values(LanguageEnum),
  },
  createdAt: { type: Date, default: Date.now },
});

// Export the User model
const User: Model<IUser> = model('User', userSchema);
export default User;
