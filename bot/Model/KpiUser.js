const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userKPISchema = new mongoose.Schema({
    telegramid: {
        type: Number,
        required: true,
        unique: true
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' } ,
    scene: [{
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
    }]
});

const UserKPI = mongoose.model('UserKPI', userKPISchema);

module.exports = UserKPI;
