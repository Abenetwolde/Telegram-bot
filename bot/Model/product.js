const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product description"]
    },
    highlights: [
        {
            type: String,
            required: true
        }
    ],
    specifications: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }
    ],
    price: {
        type: Number,
        required: [true, "Please enter product price"]
    },
    images: [{
        imageId: { type: String, required: true },
        imageUrl: { type: String, required: true },
      }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    warranty: {
        type: Number,
        default: 1
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    }, 
    video: {
        videoUrl: { type: String },
        vedioId: { type: String },
        thumbnail:{type: String}
      },
    postStatus: { type: Boolean, default: true },
    orderQuantity: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    channelMessageId:{
        type :Number
    }

});
productSchema.index({ name: 'text', /* description: 'text' */ });
module.exports = mongoose.model('Product', productSchema);