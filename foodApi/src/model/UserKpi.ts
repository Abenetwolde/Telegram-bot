
import mongoose, { Document, Model, model, Schema } from 'mongoose';
interface IScene extends Document {
    name: string;
    date?: Date;
    duration?: string;
}

interface IUserKPI extends Document {
    telegramid: Number;
    scene: IScene[];
    user: any; // FIXME: add User type
}

const sceneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
      },
});
const userKPISchema = new mongoose.Schema<IUserKPI>({
    telegramid: {
        type: Number,
        required: true,
        unique: true
    },
    scene: [sceneSchema],
    user: { type: Schema.Types.ObjectId, ref: 'User' } 
});

const UserKPI: Model<IUserKPI> = mongoose.model('UserKPI', userKPISchema);

export default UserKPI;
