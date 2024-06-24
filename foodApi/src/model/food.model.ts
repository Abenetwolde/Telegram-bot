// productModel.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

// Interface defining the Product document structure
interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  available: boolean;
  category: mongoose.Types.ObjectId;
  images: [
    {
      imageId: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
],
  orderQuantity: number;
  cookTime: string;
  highlights:string[];

  postStatus:boolean;
  video: {
    videoUrl: string;
    videoId: string;
  };// New field for video URL
}

// Schema definition
const productSchema: Schema<IProduct> = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  available: { type: Boolean, default: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{
    imageId: { type: String, },
    imageUrl: { type: String, },
  }],
  highlights: [
    {
        type: String,
    }
],
postStatus: { type: Boolean, default: true },
  orderQuantity: { type: Number, default: 0 },
  cookTime: { type: String },
  video: {
    videoUrl: { type: String },
    vedioId: { type: String },
    thumbnail:{type: String}
  },
});

// Model definition
const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);

export default Product;
