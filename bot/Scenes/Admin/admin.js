const { Scenes, Markup } = require('telegraf');
const { getAllProducts } = require('../../Database/productcontroller');
const { sendProductToChannel } = require('./sendProduct');
const { NewUser, getAllUser } = require('../../Database/UserController');
const { getAllOrder } = require('../../Database/orderController');

const adminBaseScene = new Scenes.BaseScene('adminBaseScene');

// Add a keyboard to the admin scene
adminBaseScene.enter((ctx) => {
  const adminKeyboard = Markup.keyboard([
    ['Post Product'],
    ['NewUser', 'NewOrder'],
    ['Exit'],
  ]).resize();

  return ctx.reply('Admin Actions:', adminKeyboard);
});

// Handle the selected option
adminBaseScene.hears('Post Product', async (ctx) => {
  let lastProcessedIndex = ctx.session.lastProcessedIndex || 0;
  const productsData = {
    page: 1,
    pageSize: 10,
  };
  const productsResult = await getAllProducts();
  const { products } = productsResult;

  // Check if there are no more products left to process
  // if (lastProcessedIndex >= products.length) {
  //   // lastProcessedIndex=0
  //   return ctx.reply('All products have been posted to the channel.');
  // }

  // Define exponential backoff parameters
  let delay = 1000; // Initial delay (1 second)
  let success = false;

  while (!success) {
    try {
      // Attempt to send products to channel from the last processed index
      for (let i = lastProcessedIndex; i < products.length; i++) {
        const product = products[i];
        
        await sendProductToChannel(ctx, product._id, product);
        lastProcessedIndex = i;
        if (lastProcessedIndex >= products.length) {
          // lastProcessedIndex=0
          return ctx.reply('All products have been posted to the channel.');
        } // Update the last processed index
      }

      // Mark success if products are sent without errors
      success = true;
    } catch (error) {
      if (error.code === 429) {
        // If rate limit exceeded, wait for the specified delay and then retry
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Double the delay for exponential backoff
      } else {
        // Handle other errors
        throw error;
      }
    }
  }

  // Store the last processed index in the session
  ctx.session.lastProcessedIndex = lastProcessedIndex;

  // ctx.scene.enter('adminBaseScene');
});

// Handle other actions
adminBaseScene.hears('NewUser', async (ctx) => {
  const users = await getAllUser();
  const totalUsers = users?.users?.length;

  // Construct the message body with the list of users
  let message = `Total Users: ${totalUsers}\n\n`;
  users?.users?.forEach((user, index) => {
      // Add 1 to index to start the list from 1 instead of 0
      message += `${index + 1}. Telegram ID: ${user.telegramid}, Username: @${user.username}, First Name: ${user.first_name}, Join From: ${user.from}, Language: ${user.language}\n`;
  });

  // Send the formatted message as a reply
  ctx.reply(message);
});
adminBaseScene.hears('NewOrder', async (ctx) => {
  const orders = await getAllOrder();
  const totalUsers = orders?.orders?.length;
console.log(orders)
  // Construct the message body with the list of users
  let message = `Total Orders Today: ${totalUsers}\n\n`;
  orders?.orders?.forEach((order, index) => {
      // Add 1 to index to start the list from 1 instead of 0
      message += `${index + 1}.OrderID:${order.orderNumber}, Payment Type: ${order.paymentType}, Total Price: ${order.totalPrice}, Order Status: ${order.orderStatus}, Payment: ${order.paymentStatus},\n`;
  });

  // Send the formatted message as a reply
  ctx.reply(message);
});

adminBaseScene.hears('Other Action 2', (ctx) => ctx.reply('Performing Other Action 2'));

// Handle exit action
adminBaseScene.hears('Exit',async (ctx) => 

{
  await ctx.scene.enter("homeScene")
  // await ctx.scene.leave()
});

// You can add more handlers based on your requirements

module.exports = adminBaseScene;
