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
