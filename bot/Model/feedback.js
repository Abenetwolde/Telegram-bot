const mongoose = require('mongoose');

const FeedBackSchema = mongoose.Schema({
    telegramid: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    first_name: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },

   
})
module.exports = mongoose.model('FeedBack', FeedBackSchema);