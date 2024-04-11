
import mongoose, { Document, Model, model, Schema } from 'mongoose';
interface IScene extends Document {
    name: string;
    enterTime?: Date;
    leaveTime?: Date;
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
    enterTime: {
        type: Date
    },
    leaveTime: {
        type: Date
    },
    duration: {
        type: String
    }
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
