
import mongoose, { Document, Model, model, Schema } from 'mongoose';
interface IScene extends Document {
    name: string;
    date?: Date;
    duration?: string;
}

interface IUserKPI extends Document {
    telegramId: string;
    scene: IScene[];
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
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    scene: [sceneSchema]
});

const UserKPI: Model<IUserKPI> = mongoose.model('UserKPI', userKPISchema);

export default UserKPI;
