const mongoose = require('mongoose');

const FeedBackSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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