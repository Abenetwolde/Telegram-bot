const mongoose = require('mongoose');

const userKPISchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    scene: [{
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
    }]
});

const UserKPI = mongoose.model('UserKPI', userKPISchema);

module.exports = UserKPI;
