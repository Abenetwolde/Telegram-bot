import { Document, Schema, model, Types } from 'mongoose';

interface IKpiProductClick {
    date: Date;
    count: number;
    userId?: string;
}

interface IKpiProduct extends Document {
    product: Types.ObjectId;
    clicks: IKpiProductClick[];
}

const KpiProductSchema = new Schema<IKpiProduct>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    clicks: [{
        date: {
            type: Date,
            default: Date.now
        },
        count: {
            type: Number,
            default: 0
        },
        userId: {
            type: String
        }
    }]
});

const KpiProducts = model<IKpiProduct>('KpiProduct', KpiProductSchema);

export default KpiProducts;
