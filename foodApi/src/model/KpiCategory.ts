import { Document, Schema, model, Types } from 'mongoose';

interface IKpiCategoryClick {
    date: Date;
    count: number;
    userId?: string;
}

interface IKpiCategory extends Document {
    category: Types.ObjectId;
    clicks: IKpiCategoryClick[];
}

const KpiCategorySchema = new Schema<IKpiCategory>({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
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

const KpiCategorys = model<IKpiCategory>('KpiCategory', KpiCategorySchema);

export default KpiCategorys;
