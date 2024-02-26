
const mongoose = require('mongoose');
const { USER_TYPES } = require('../utils/config');

const LanguageEnum = {
    EN: 'en',
    AM: 'am',
  };
const userSchema = new mongoose.Schema({
    telegramid: {
        type: Number,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    name: {
        type: String,
    },
    last: {
        type: String,
    },
    role: {
        type: String,
        enum: ["admin", "superadmin"],
        default: "admin"
    },
    role: {
        type: String,
        enum: USER_TYPES,
        default:"ADMIN",
        required:[true, "Role is required"]
      },
    language: {
        type: String,
        default: LanguageEnum.EN,
        enum: Object.values(LanguageEnum),
      },
      token: {
        type: String,
      }

});
module.exports = mongoose.model('User', userSchema);