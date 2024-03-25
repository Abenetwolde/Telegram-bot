const { Scenes, Markup } = require('telegraf');
// const { getAllProducts } = require('../../Database/productcontroller');
// const { sendProductToChannel } = require('./sendProduct');
const { updateUserLanguage } = require('../Database/UserController');
const { getSingleProduct } = require('../Database/productcontroller');
const User = require('../Model/user');
const UserKPI=require("../Model/KpiUser");
const channelHandeler = new Scenes.BaseScene('channelHandeler');

// Add a keyboard to the admin scene
channelHandeler.enter(async(ctx) => {
  const enterTime = new Date();
  ctx.scene.state.enterTime = enterTime;
    const product = ctx.scene.state.pid;
    ctx.session.productID = product;
    console.log("pid...........",product)
    const message = await ctx.reply('🌐 Please choose your language', Markup.inlineKeyboard([
      Markup.button.callback('🇬🇧 English ', 'set_lang:en'),
      Markup.button.callback('🇪🇹 አማርኛ', 'set_lang:am')
    ]))
    ctx.session.languageMessageId = message.message_id;
    let existingUser = await User.findOne({ telegramid: ctx.from.id });
    if (!existingUser) {
      console.log("register event channel")
        // If the user doesn't exist, create a new user document
        newuser = await User.create({
          telegramid: ctx.from.id,
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          username: ctx.from.username || null,
          is_bot: ctx.from.is_bot || false,
            from: 'CHANNEL' // Set initial status
        });
        ctx.session.token = await newuser?.token;

    } /* else {
        // If the user exists, update their information
        existingUser.first_name = ctx.from.id;
        existingUser.last_name = ctx.from.first_name;
        existingUser.username = username;
        await existingUser.save();
    } */
});

channelHandeler.action(/set_lang:(.+)/, async (ctx) => {
    if (!ctx.session) {
      ctx.session = {}; // Initialize session if not exists
    }
    ctx.session.locale = ctx.match[1];

    ctx.i18next.changeLanguage(ctx.session.locale);
    if (ctx.session.languageMessageId) {
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.languageMessageId);
    }
    const updateResult = await updateUserLanguage(ctx.from.id, ctx.session.locale);

    if (updateResult.success) {
      console.log(updateResult.message);
      
    } else {
      console.error(updateResult.message);
    }
    const productId = await ctx.session.productID;
    const response = await getSingleProduct(productId);
    const product = JSON.stringify(response)
    if (product) {
        // product.quantity = typeof product.quantity === 'number' ? product.quantity : 0;
        const singleP = await JSON.parse(product)
        // Update the quantity based on the action
        await ctx.scene.enter('product', { product: singleP });

      } else {
        console.error('Product not found.');
        // Handle the case when the product is not found
      }
      try {
        // Calculate the duration when leaving the scene
        const leaveTime = new Date();
        const enterTime = ctx.scene.state.enterTime;
        const durationMs = new Date(leaveTime - enterTime);
        // Convert milliseconds to minutes
        const durationMinutes = Math.floor(durationMs / 60000);
    
        // Check if the duration exceeds 5 minutes
        if (durationMinutes <= 5) {
            // If the duration is less than or equal to 5 minutes, save the information to the database
            // Convert milliseconds to hours, minutes, and seconds
            const hours = Math.floor(durationMs / 3600000);
            const minutes = Math.floor((durationMs % 3600000) / 60000);
            const seconds = Math.floor((durationMs % 60000) / 1000);
            const durationFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
            // Check if the user already exists in the database
            let existingUserKPI = await UserKPI.findOne({ telegramId: ctx.from.id });
            if (existingUserKPI) {
                // If the user exists, update the scene details
                existingUserKPI.scene.push({
                    name: 'ChannelHandler',
                    enterTime: enterTime,
                    leaveTime: leaveTime,
                    duration: durationFormatted
                });
                await existingUserKPI.save();
            } else {
                // If the user doesn't exist, create a new UserKPI document
                const newUserKPI = new UserKPI({
                    telegramId: ctx.from.id,
                    scene: [{
                        name: 'ChannelHandler',
                        enterTime: enterTime,
                        leaveTime: leaveTime,
                        duration: durationFormatted
                    }]
                });
                await newUserKPI.save();
            }
        }
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
  });
module.exports = channelHandeler;
