const { Scenes, Markup, session } = require("telegraf")
const axios = require('axios');
const { sendCartProduct } = require("../Templeat/cart");
const { sendProdcutSummary } = require("../Templeat/summary");
const { getCart, updateCartItemQuantity, removeItemFromCart, DecreaseCartQuantity } = require("../Database/cartController");
const cart = new Scenes.BaseScene('cart');
const UserKPI=require("../Model/KpiUser");
const { t, match } = require('telegraf-i18next');
const telegrafI18next = require("telegraf-i18next");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");
cart.enter(async (ctx) => {
  const enterTime = new Date();

  ctx.scene.state.enterTime = enterTime;
  const nocartmessage = await ctx.reply(
    `🛒 You are now viewing your carts.`,
  
    Markup.keyboard([
      [ctx.i18next.t("Home")],

    ]).resize(),
  )
  ctx.session.cleanUpState.push({ id: nocartmessage.message_id, type: 'cart' });
  const userId = ctx.from.id

  const cart = await getCart(userId);
  
  if (cart) {
    for (const item of cart?.items) {
      if (!item.product) {
        console.warn('Skipping item with null product:', item);
        continue;
      }
      const cartMessageInfo = await sendCartProduct(ctx, item?.product?._id.toString(), item)
   
      ctx.session.cleanUpState.push(cartMessageInfo)
    }
    const summaryinfo = await sendProdcutSummary(ctx,cart)
    ctx.session.cleanUpState.push(summaryinfo)

  }


},

);

cart.action(/(removeQuantity)_(.+)/, async (ctx) => {
  try {
    const productId = ctx.match[2];
    const userId = ctx.from.id;
    const updatedCartItem = await DecreaseCartQuantity(userId, productId);
    const { product, quantity,cartId,cartItem } = JSON.parse(updatedCartItem);
    const cart = await getCart(userId);
    if (cartItem.quantity >= 1) {
      // If quantity is still greater than or equal to 1, update the cart and send the updated cart product
      await sendCartProduct(ctx, productId, cartItem);
      await sendProdcutSummary(ctx,cart);
    }


    if (quantity=== 0) {
       await removeItemFromCart(cartId,productId)

      await ctx.answerCbQuery(`You have deleted ${cartItem?.product?.name} from your cart page.`);

      try {
        // Delete the corresponding message from the cleanup state
        if (ctx.session.cleanUpState && ctx.session.cleanUpState.find(message => message.type === 'cart' && message.productId === productId)) {
          const messageId = ctx.session.cleanUpState.find(message => message.type === 'cart' && message.productId === productId).id;
          await ctx.deleteMessage(messageId);
        }
      } catch (error) {
        ctx.reply(error.message);
      }

      // Send the updated product summary
      await sendProdcutSummary(ctx,cart);
      await updateClicks(ctx,"product",productId)

      return;
    }
    // const updatedCartItem = await updateCartItemQuantity(userId, productId, -1);
    // // Parse the returned JSON string to access the data
    // const { product, quantity,cartId,cartItem } = JSON.parse(updatedCartItem);
 
    //  const cart = await getCart(userId);

  
    // if (cartItem.quantity >= 1) {
    //   // If quantity is still greater than or equal to 1, update the cart and send the updated cart product
    //   await sendCartProduct(ctx, productId, cartItem);
    //   await sendProdcutSummary(ctx,cart);
    // }

    // if (quantity=== 0) {
    //    await removeItemFromCart(cartId,productId)

    //   await ctx.answerCbQuery(`You have deleted ${cartItem?.product?.name} from your cart page.`);

    //   try {
    //     // Delete the corresponding message from the cleanup state
    //     if (ctx.session.cleanUpState && ctx.session.cleanUpState.find(message => message.type === 'cart' && message.productId === productId)) {
    //       const messageId = ctx.session.cleanUpState.find(message => message.type === 'cart' && message.productId === productId).id;
    //       await ctx.deleteMessage(messageId);
    //     }
    //   } catch (error) {
    //     ctx.reply(error.message);
    //   }

    //   // Send the updated product summary
    //   await sendProdcutSummary(ctx,cart);
    //   return;
    // }


  } catch (error) {
    ctx.reply(error.message);
  }
});

cart.action(/(addQuantity)_(.+)/, async (ctx) => {
  const productId = ctx.match[2];
  console.log(productId)
  const userId = ctx.from.id;


 await updateCartItemQuantity(userId, productId, 1);

    const cart = await getCart(userId);

    const cartItemIndex = cart?.items?.findIndex(item => item.product._id.toString() === productId);
    const cartItem = cart?.items[cartItemIndex];

    await sendCartProduct(ctx, productId, cartItem);
    await sendProdcutSummary(ctx,cart)
    await updateClicks(ctx,"product",productId)
});


cart.action("Home", async (ctx) => {
  // await new Promise(resolve => setTimeout(resolve, 1000));
  await ctx.scene.enter("homeScene")
  await updateClicks(ctx,"cart","cart")

});
cart.hears(match('Home'), async (ctx) => {
  // await new Promise(resolve => setTimeout(resolve, 1000));
 
  await ctx.scene.enter('homeScene');
  await updateClicks(ctx,"cart","cart")

});
cart.action("proceedToCheckout", async (ctx) => {
  await ctx.scene.enter("selectePaymentType")
  await updateClicks(ctx,"cart","cart")
});



cart.leave(async (ctx) => {
  try {
    if (ctx.session.cleanUpState) {
      ctx.session.cleanUpState.map(async (message) => {
        if (message?.type === 'nocartmessage' || message?.type === 'cart' || message?.type === 'summary') {
          console.log("reach cart leave scene")
          try {
            await ctx.telegram.deleteMessage(ctx.chat.id, message?.id);
            } catch (error) {
            console.log("error occoring", error)
          }

        }
      });
    }
  } catch (error) {
    console.error('Error in cart:', error);
  }
  try {
    // Calculate the duration when leaving the scene
    const leaveTime = new Date();
    const enterTime = ctx.scene.state.enterTime;
    const durationMs = new Date(leaveTime - enterTime);

        await updateSceneDuration(ctx, durationMs, "Cart_Scene")
} catch (error) {
    console.error('Error saving UserKPI in homeScene.leave:', error);
}

// Reset the enterTime in the scene state
ctx.scene.state.enterTime = null;
  await ctx.scene.leave();
});

module.exports = {
  cart
}