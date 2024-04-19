
import mongoose, { Document, Model, model, Schema } from 'mongoose';
interface IClick extends Document {
    name: string;
    type: string;
    count: Number;
    date?: Date;

}

interface IUserKPI extends Document {
    telegramid: Number;
    clicks: IClick[];
    user: any; // FIXME: add User type
}

const clickSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true
    },
});
const ClickKpi = new mongoose.Schema<any>({
    telegramid: {
        type: Number,
        required: true,
        unique: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },

    clicks: [{
        name: {
            type: String,
            required: true
        },

        date: {
            type: Date,
            default: Date.now
        },
        count: {
            type: Number,
            default: 0
        },
        type: {
            type: String,
            required: true
        },
    }]
});

const clickKpi: Model<any> = mongoose.model('ClickKpi', ClickKpi);

export default clickKpi;
