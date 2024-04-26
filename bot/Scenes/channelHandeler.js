const { Scenes, Markup } = require('telegraf');
const { updateUserLanguage } = require('../Database/UserController');
const { getSingleProduct } = require('../Database/productcontroller');
const User = require('../Model/user');
const UserKPI=require("../Model/KpiUser");
const { t, match } = require('telegraf-i18next');
const { updateSceneDuration } = require('../Utils/calculateTimeSpent');
const { updateClicks } = require('../Utils/calculateClicks');
const channelHandeler = new Scenes.BaseScene('channelHandeler');

// Add a keyboard to the admin scene
channelHandeler.enter(async(ctx) => {
  const enterTime = new Date();
  ctx.scene.state.enterTime = enterTime;
    const product = ctx.scene.state.pid;
    ctx.session.productID = product;
    const message = await ctx.reply( ctx.i18next.t('selectL'), Markup.inlineKeyboard([
      Markup.button.callback('🇬🇧 English ', 'set_lang:en'),
      Markup.button.callback('🇪🇹 አማርኛ', 'set_lang:am')
    ]))
    ctx.session.languageMessageId = message.message_id;
    try {
      let existingUser = await User.findOne({ telegramid: ctx.from.id });
      if (!existingUser) {
           
          // If the user doesn't exist, create a new user document
          newuser = await User.create({
            telegramid: ctx.from.id,
            first_name: ctx.from.first_name,
            last_name: ctx.from.last_name,
            username: ctx.from.username || null,
            is_bot: ctx.from.is_bot || false,
              from: 'CHANNEL' // Set initial status
          });
          console.log("New User Created",newuser);
          ctx.session.token = await newuser?.token;
          ctx.session.userid = await newuser._id.toString();
      } 
    } catch (error) {
      
    }
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
   await updateUserLanguage(ctx.from.id, ctx.session.locale);

   await updateClicks(ctx,"channel","channel")
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
    //   try {
  
    //     const leaveTime = new Date();
    //     const enterTime = ctx.scene.state.enterTime;
    //     const durationMs = new Date(leaveTime - enterTime);

    //     await updateSceneDuration(ctx, durationMs, "ChannelHandler_Scene")
    // } catch (error) {
    //     console.error('Error saving UserKPI in homeScene.leave:', error);
    // }
  });
module.exports = channelHandeler;
