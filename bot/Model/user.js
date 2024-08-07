const mongoose = require('mongoose');

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
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  }, 
  
  username:{
    type: String,
  },
  is_bot:{
    type: Boolean,
  },
  role: {
    type: String,
    default: 'USER',
    required: [true, 'Role is required'],
  },
  from: {
    type: String,
    default: 'Bot',
    enum: ['Bot', 'Channel','Refferal'],
    required: [true, 'status is required'],
  },
  language: {
    type: String,
    default: LanguageEnum.EN,
    enum: Object.values(LanguageEnum),
  },
  token: {
    type: String,
  },
  invitedBy: {
    type: Number, // Store Telegram ID of the user who invited
    default: null,
  },
  lotteryNumbers: {
    number: {
      type: Array,
      default:null,
      required: true,
    },
    invitedUsers: {
      type: Number,
      default:0
      // required: true,
    },
  },
  timestamp: { type: Date, default: Date.now },

  isUserRatedTheBot: {
    type: String,  // This will store the rating value (1-5)
    default: null
},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Users', userSchema);
