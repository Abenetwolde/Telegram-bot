// Search Product scene
const { Scenes, Markup, session } = require("telegraf")
const axios = require('axios');
const { replace } = require("lodash");
const { getAllProducts, searchProducts } = require("../Database/productcontroller");
const { getProducts } = require("../Services/prodcut");
const searchProduct = new Scenes.BaseScene('searchProduct');

const cloudinary = require('cloudinary').v2;
// Importing spawn from child_process

const fs = require('fs');
const path = require('path');
// Dummy data for products
const UserKPI=require("../Model/KpiUser");
cloudinary.config({
  cloud_name: "abmanwolde",
  api_key: "827239376525146",
  api_secret: "qcT03npP3xh4VrLYBBMHuXr2IbQ",
});
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');
const { updateClicks } = require("../Utils/calculateClicks");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");

async function generateThumbnail(videoUrl) {
  return new Promise((resolve, reject) => {
    const thumbnailPath = `thumbnail_${Date.now()}.jpg`;
    const ffmpegProcess = spawn(ffmpeg, ['-i', videoUrl, '-ss', '00:00:05', '-vframes', '1', thumbnailPath]);

    ffmpegProcess.on('close', async(code) => {
      if (code === 0) {
        try {
          // Upload thumbnail to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(thumbnailPath);
          // Delete the local thumbnail file after uploading
          fs.unlinkSync(thumbnailPath);
          // Resolve with the Cloudinary URL of the uploaded thumbnail
          resolve(uploadResult.secure_url);
        } catch (error) {
          console.error('Error uploading thumbnail to Cloudinary:', error);
          reject(error);
        }
      } else {
        const errorMessage = `FFMPEG process exited with code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });
  });
}

searchProduct.enter(async (ctx) => {
  const enterTime = new Date();
  ctx.scene.state.enterTime = enterTime;
  ctx.session.viewMoreSearch=null

  let message = `
  🔍 Click the search button below to find a food item.
`;
  //ctx.reply(text, [extra params])
  ctx.reply(message, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '  Search 🔎', switch_inline_query_current_chat: "" }
        ]
      ],
      force_reply: true
    },

  })

});
// Handle inline queries within the scene
searchProduct.on('inline_query', async (ctx) => {
 
  await updateClicks(ctx,"search_scene","search_scene")

  let input = ctx.inlineQuery.query
  if (!input) {
    return;
  }

  try {

    const response = await searchProducts({
      search: input,
    });

    const products = JSON.parse(JSON.stringify(response));

if (products.products.length === 0) {
  // If no products found, send "No results found" message
  await ctx.answerInlineQuery([{
    type: 'article',
    title: 'No results found',
    id: 'no-results-found',
    input_message_content: {
      message_text: 'No results found.',
    },
  }], {
    cache_time: 0,
  });
  return;
}
const results = await Promise.all(products?.products.map(async (product) => {
  let thumbnail = '';
  if (product?.images[0]) {
    thumbnail = product?.images[0]?.imageUrl ? product?.images[0]?.imageUrl : 'https://th.bing.com/th/id/R.e999a2a1c67874cc430e05b2d667d897?rik=EVD9FK1848e9DA&pid=ImgRaw&r=0';
  } else if (product?.video?.videoUrl) {
    thumbnail = product?.video?.thumbnail? product?.video?.thumbnail:"https://th.bing.com/th/id/R.e999a2a1c67874cc430e05b2d667d897?rik=XNTR0QBgIX65fA&riu=http%3a%2f%2fwww.pngmart.com%2ffiles%2f1%2fVideo-Icon-PNG-File.png&ehk=SV9RycWEvhpiPwx03de0K2l4nQZ5pOI7vhYYhLDNJ4I%3d&risl=&pid=ImgRaw&r=0"
    // thumbnail = await generateThumbnail(product?.video?.videoUrl); // Wait for the thumbnail generation
  }


  return {
    type: 'article',
    title: product?.name || "Product",
    photo_url: String(thumbnail),
    thumb_url: String(thumbnail),
    description: `${product?.description}\n${product?.price} ETB\n`,
    id: String(product?._id),
    input_message_content: {
      message_text: `${product?.name && product?.name}\n ${product?.description}\n${product.price} ETB\n <a href="${thumbnail}">&#8205;</a>`,
      parse_mode: "HTML",
    },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '↗️ View More',
            url: `https://t.me/testecommerce12bot?start=chat_${product._id}`,
          },
        ],
      ],
    },
  };
}));
    // let nextOffset = null;
    // if (page < totalPages) {
    //   nextOffset = page * pageSize;
    // }

    // Calculate the next offset for pagination
    // const nextOffset = page * pageSize;

    // Send the inline query results with pagination parameters
    await ctx.answerInlineQuery(results, {
      cache_time: 0,
      // next_offset: nextOffset !== null ? nextOffset.toString() : '',

    });
    
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
});

const productQuantityState = new Map();
async function sendOrEditMessage(ctx, productId, product) {
  const totalPrice = product.quantity * product.price;
  const messageText = `${product.name}\n${product.description}\nQuantity: ${product.quantity}\nTotal Price: ${totalPrice}`;

  if (ctx.session.viewMoreSearch) {
    // Edit the existing message
    const editedMessage = await ctx.telegram.editMessageText(
      ctx.from.id,
      ctx.session.viewMoreSearch,
      null,
      messageText,
      Markup.inlineKeyboard([
        Markup.button.callback('-', `removeQuantity_${productId}`),
        Markup.button.callback('+', `addQuantity_${productId}`),
        Markup.button.callback('Buy Now', `addQuantity_${productId}`),
      ])
    );

    ctx.session.viewMoreSearch = editedMessage.message_id;
  } else {
    // Send a new message
    const newMessage = await ctx.telegram.sendMessage(
      ctx.from.id,
      messageText,
      Markup.inlineKeyboard([
        Markup.button.callback('-', `removeQuantity_${productId}`),
        Markup.button.callback('+', `addQuantity_${productId}`),
        Markup.button.callback('Buy Now', `addQuantity_${productId}`),
      ])
    );

    ctx.session.viewMoreSearch = newMessage.message_id;
  }
}
searchProduct.leave(async (ctx) => {
  try {
    // Calculate the duration when leaving the scene
    const leaveTime = new Date();
    const enterTime = ctx.scene.state.enterTime;
    const durationMs = new Date(leaveTime - enterTime);
    // Convert milliseconds to minutes

await updateSceneDuration(ctx, durationMs, "Search_Scene")

} catch (error) {
    console.error('Error saving UserKPI in homeScene.leave:', error);
}
});
searchProduct.action(/view_more_/, async (ctx) => {
  try {
    const productId = ctx.match.input.split('_')[2];
    const response = await axios.get(`http://localhost:5000/api/getprodcut/${productId}`);
    const selectedProductdata = response.data.product;

    const mediaGroup = selectedProductdata.images.map(image => ({
      type: 'photo',
      media: image,
    }));

    await ctx.telegram.sendMediaGroup(ctx.from.id, mediaGroup);
    // await ctx.telegram.sendMessage(
    //   ctx.from.id,
    //   selectedProductdata.description && selectedProductdata.description,
    //   Markup.inlineKeyboard([
    //     Markup.button.callback('Remove Quantity', `removeQuantity_${productId}`),
    //     Markup.button.callback('Add Quantity', `addQuantity_${productId}`)
    //   ])
    // );

    // Use the new function to send or edit the message
    await sendOrEditMessage(ctx, productId, selectedProductdata);
  } catch (error) {
    ctx.reply("Error handling view more action");
    console.error('Error handling view more action:', error);
  }
});
searchProduct.action(/(add|remove)Quantity_(.+)/, async (ctx) => {
  const action = ctx.match[1];
  const productId = ctx.match[2];

  try {
    // Fetch the product details
    const response = await axios.get(`http://localhost:5000/api/getprodcut/${productId}`);
    const product = { ...response.data.product, quantity:0 };
    // product.quantity = typeof product.quantity === 'number' ? product.quantity : 0;

    // Update the quantity based on the action
    if (action === 'add') {
      product.quantity += 1;
    } else if (action === 'remove') {
      // Ensure the quantity doesn't go below 0
      product.quantity = Math.max(0, product.quantity - 1);
    }

    // Use the new function to send or edit the message
    await sendOrEditMessage(ctx, productId, product);
  } catch (error) {
    console.error('Error handling quantity action:', error);
  }
});


module.exports = {
  searchProduct
}