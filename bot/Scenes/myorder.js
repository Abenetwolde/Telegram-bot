const { Markup, Scenes } = require("telegraf");
const axios = require('axios');
const sharp = require('sharp');
const { getUserOrders, cancelOrder } = require("../Database/orderController");
const { ReturnDocument } = require("mongodb");
const UserKPI = require("../Model/KpiUser");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");
const myOrderScene = new Scenes.BaseScene("myOrderScene");

myOrderScene.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.session.currentImageIndexofOrder = {};
    await ctx.session.cleanUpState
        .filter((message) => message?.type === "orderhistory" || message?.type === "myorder")
        .forEach(async (message) => {
            try {
                await ctx.deleteMessage(message?.id);
            } catch (error) {
                console.log(error)
            }

        });
    const ordermessage=await ctx.reply("Here is your Order Foods👇", Markup.keyboard([["🏠 Home", "My Order History"]]).resize().oneTime());
    ctx.session.cleanUpState.push({ id: ordermessage.message_id, type: "myorder" });
    const userId = ctx.from.id;
    const userOrders = await getUserOrders(userId, "pending");
    if (userOrders.length === 0) {
        if (ctx.session.cleanUpState) {
            ctx.session.cleanUpState.forEach(async (message) => {
                console.log("%c called deleteing when its leave", "color: red;")
                if (message?.type === 'myorder' || message?.type === 'orderhistory') {
                    try {
                        await ctx.telegram.deleteMessage(ctx.chat.id, message?.id);
                    } catch (error) {
                        console.log("error while deleting.......", error)
                    }
    
                }
    
    
            });
        }
        const emptyOrderMessage = await ctx.reply("You don't have any orders yet.", Markup.keyboard([["🏠 Home", "My Order History"]]).resize().oneTime());
        ctx.session.cleanUpState.push({ id: emptyOrderMessage.message_id, type: "myorder" });
    } else {
        ctx.session.UserOrder = userOrders
        for (const order of userOrders) {

            if (order?.orderItems?.length > 1) {
                await OrderMessageWithProducts(ctx, order._id, order.orderItems,order?.orderNumber);    
            }
            else {

                const formatTelegramMessage = (product, quantity) => {
                    const { name, description, price, available, warranty, category, highlights, images } = product;
                    const createdAt = new Date(order.createdAt);
                    const formattedDate = `${createdAt.getDate()}/${createdAt.getMonth() + 1}/${createdAt.getFullYear()}`;
                    const formattedprice = product?.quantity !== 0 ?     `  
                  . 
                  . 
                   ${quantity}x${product?.price}= ${quantity * product?.price} ETB` : ''

                    return `
                 Order Number :<u>${order?.orderNumber}</u>\n
                 ${category.icon} ${name} ${category?.icon}
                 💴 ${price} ETB
                 Order Status : <b>${order.orderStatus ?? 'Pending'}</b>
                 Payment Status : <b>${order.orderStatus ?? 'Pending'}</b>
                 Payment Type : <b>${order?.paymentType}</b>
                 Ordered Date :${formattedDate}
                 ${order?.shippingInfo?.location?`Location:${order?.shippingInfo?.location}`:""}
                 ${formattedprice}
                
                
                    `;
                };
                try {

                  const orderItems = order?.orderItems || []; // Ensure orderItems is an array and not undefined

                    if (orderItems.length > 0 && orderItems[0]?.product?.images?.length > 0) {

                        const resizeimage = await order?.orderItems[0]?.product?.images[0]?.imageUrl
      
                        const response = await axios.get(resizeimage, { responseType: 'arraybuffer' });
                        const imageBuffer = await sharp(response.data)
                            .resize(200, 200)
                            .toBuffer();
                        if (resizeimage) {
                            const orderMessage = await ctx.replyWithPhoto(
                                { source: imageBuffer },
                                {
                                    parse_mode: 'HTML' ,
                                    caption: formatTelegramMessage(orderItems[0].product, orderItems[0].quantity),
                                    ...Markup.inlineKeyboard([Markup.button.callback("Cancel Order", `cancel_order:${order._id}`)]),
                                }
                            );
                            ctx.session.cleanUpState.push({ id: orderMessage.message_id, type: "myorder" });
                        }

                    }else if(orderItems[0]?.product?.video){
                        console.log("there is a prodcut...............",orderItems[0]?.product?.video)
                        const orderMessage = await ctx.replyWithVideo(orderItems[0]?.product?.video?.videoUrl, {
                            caption: formatTelegramMessage(orderItems[0].product, orderItems[0].quantity),
                            
                                parse_mode: 'HTML' ,
                                ...Markup.inlineKeyboard([
                           
                                    [Markup.button.callback("Cancel Order", `cancel_order:${order._id}`)]
                                ]),
                            
                       
                        });
                        ctx.session.cleanUpState.push({ id: orderMessage.message_id, type: "myorder" });
                    }


                } catch (error) {
                    await ctx.reply("error happing", error)
                    // await ctx.scene.leave()
                }

            }




        }


    }
});

myOrderScene.action(/cancel_order:(.+)/, async (ctx) => {
    const userId = ctx.from.id;
    const orderId = ctx.match[1];


    if (orderId) {
        const message = ctx.callbackQuery.message;

        // Edit the button message to include "Yes" instead of using answerCbQuery
        await ctx.telegram.editMessageReplyMarkup(
            message.chat.id,
            message.message_id,
            null,
            {
                inline_keyboard: [
                    [{ text: 'Yes', callback_data: `confirm_cancel:${orderId}` }, { text: 'No', callback_data: 'reject_cancel' }]
                ]
            }
        );
        await ctx.telegram.editMessageCaption(
            message.chat.id,
            message.message_id,
            null,
            "Are you sure you want to cancel the order?",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Yes', callback_data: `confirm_cancel:${orderId}` }, { text: 'No', callback_data: 'reject_cancel' }]
                    ]
                }
            }
        );
    } else {
        await ctx.answerCbQuery("Failed to cancel the order.");
    }
  
    await updateClicks(ctx,"order","order")
});

// Handle user's confirmation
myOrderScene.action(/confirm_cancel:(.+)/, async (ctx) => {
    // Delete the message with the cancellation confirmation prompt
    try {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

        // Retrieve the orderId from the callback data
        const orderId = ctx.match[1];
    
        // Perform cancellation logic here...
        const cancellationResult = await cancelOrder(orderId, ctx.from.id);
        await ctx.answerCbQuery("Order canceled successfully");
        if (cancellationResult.success) {
            await ctx.answerCbQuery("Order canceled successfully.");
            // await ctx.scene.reenter()
        } else { 
            await ctx.answerCbQuery("Failed to cancel the order.");
        }
        await updateClicks(ctx,"order","order")
    } catch (error) {
        console.log(error);
    }
   
});

// Handle user's rejection
myOrderScene.action('reject_cancel', async (ctx) => {
  try {
    await ctx.answerCbQuery("Cancellation request rejected.");
    // await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    await ctx.scene.reenter()
  } catch (error) {
    console.log("erorr", error);
  }
  await updateClicks(ctx,"order","order")
});
myOrderScene.hears("My Order History", async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            ctx.session.cleanUpState.forEach(async (message) => {
                console.log("%c called deleteing when its leave", "color: red;")
                if (message?.type === 'myorder' || message?.type === 'orderhistory') {
                    try {
                        await ctx.telegram.deleteMessage(ctx.chat.id, message?.id);
                    } catch (error) {
                        console.log("error while deleting.......", error)
                    } 
    
                }
    
    
            });
        }
      
    } catch (error) {
        console.log(error)
        ctx.reply(error.message)    }

    // await ctx.reply("To go back to home, press 🏠 Home", Markup.keyboard([["🏠 Home", "My Order"]]).resize().oneTime());
    // Delete all previous order messages with the type "myorder"
    const userId = ctx.from.id
    // Fetch user orders with a completed status
    try {
        const completedOrders = await getUserOrders(userId, "delivered"); 
        if (completedOrders?.length === 0) {
            const message = await ctx.reply("You don't have any completed orders.", Markup.inlineKeyboard([Markup.button.callback("Back", "Back")]))
            await ctx.session.cleanUpState.push({ id: message.message_id, type: "myorder" })
        } else {
            for (const order of completedOrders) {
                const formatTelegramMessage = (product, quantity) => {
                    const { name, description, price, available, warranty, category, highlights, images, createdAt } = product;
    
                    const formattedprice = product.quantity !== 0 ?
                        `  
                  . 
                  . 
                   ${quantity}x${product.price}= ${quantity * product.price} ETB` : ''
    
                    return `
                 ${category.icon} ${name} ${category.icon}
                 💴 ${price} ETB
                 #${category.name} ${category.icon}
                 ${formattedprice}
                
                
                    `;
                };
    
                const resizeimage = order.orderItems[0].product?.images[0]?.imageUrl
                if(resizeimage){
                    const response = await axios.get(resizeimage, { responseType: 'arraybuffer' });
                    const imageBuffer = await sharp(response.data)
                        .resize(200, 200)
                        .toBuffer();
                    const orderHistorymessage = await ctx.replyWithPhoto(
                        { source: imageBuffer },
                        {
                            caption: formatTelegramMessage(order?.orderItems[0]?.product, order?.orderItems[0]?.quantity),
                            ...Markup.inlineKeyboard([Markup.button.url("Reorder", `https://t.me/testecommerce12bot?start=chat_${order?.orderItems[0]?.product?._id}`)]),
                        },
        
                    );
                    ctx.session.cleanUpState.push({ id: orderHistorymessage.message_id, type: "orderhistory" });
                }else{
                    ctx.reply("no image url")
                }
        

            }
            // await ctx.reply("To go back to home, press 🏠 Home", Markup.keyboard([Markup.button.callback("🏠 Home", "home")]).resize());
        } 
    } catch (error) {
        console.log(error)
    }
    

   
    await updateClicks(ctx,"order","order")
});
myOrderScene.hears("🏠 Home", async (ctx) => {
    await ctx.scene.enter("homeScene");

});
myOrderScene.hears("My Order", async (ctx) => {
    await ctx.scene.reenter();
    await updateClicks(ctx,"order","order")
});
myOrderScene.action("Back", async (ctx) => {
    await ctx.scene.reenter();
    await updateClicks(ctx,"order","order")
});
myOrderScene.leave(async (ctx) => {
    try {

        if (ctx.session.cleanUpState) {
            ctx.session.cleanUpState.forEach(async (message) => {
                console.log("%c called deleteing when its leave", "color: red;")
                if (message?.type === 'myorder' || message?.type === 'orderhistory') {
                    try {
                        await ctx.telegram.deleteMessage(ctx.chat.id, message?.id);
                    } catch (error) {
                        console.log("error while deleting.......", error)
                    }

                }


            });
        }


    } catch (error) {

    }
    ctx.session.UserOrder = [];
    try {
        // Calculate the duration when leaving the scene
        const leaveTime = new Date();
        const enterTime = ctx.scene.state.enterTime;
        const durationMs = new Date(leaveTime - enterTime);
      
        await updateSceneDuration(ctx, durationMs, "Order_Scene")
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
    await ctx.scene.leave()
    console.log("Cleaning myOrderScene scene")
    // await Utils.clearScene(ctx, true)
})

async function OrderMessageWithProducts(ctx, orderid, orderItems,orderNumber) {
    const productId = 1;

    const imageUrls = orderItems.flatMap((item) => item.product.images.map(image => image.imageUrl));
    const videoUrl = orderItems.map((item) => item.product?.video?.videoUrl)
        const messageIds = [];
        let index = 0;
        const caption = generateCaption(orderNumber, orderItems, orderItems.length, 1);
        if (imageUrls.length > 0) {
            const imageBuffer = await resizeImage(imageUrls[0]);
            // console.log(imageBuffer)
            const orderMessage = await ctx.replyWithPhoto(
                { source: imageBuffer},
           
                     
                {
                    parse_mode: 'HTML' ,
                    caption: caption,
                    ...Markup.inlineKeyboard([[
                        Markup.button.callback('⬅️', `prev_${productId}_${orderid}_${index}_${orderNumber}`),
                        Markup.button.callback('➡️', `next_${productId}_${orderid}_${index}_${orderNumber}`),
                    ],
                    [Markup.button.callback("Cancel Order", `cancel_order:${orderid}`)]
                    ]),
                }
            );

            messageIds.push(orderMessage.message_id);
            ctx.session.cleanUpState.push({ id: orderMessage.message_id, type: "myorder" });
            index++;
            // return
            // }
        }
        else if (videoUrl) {
            console.log("If there is a video, reply with the video")
            // const imageUrls = orderItems.flatMap((item) => item.product.images.map(image => image.imageUrl));
            // const imageBuffer = await resizeImage(imageUrls[0]);
            // console.log(imageBuffer)
            try {
                console.log("imageBuffer")
                const orderMessage = await ctx.replyWithPhoto(
                    {url: "https://gagadget.com/media/cache/db/a4/dba452f0af5bbf105934a103c578a5b9.jpg"},
                     { 
                        parse_mode: 'HTML' ,
                        caption:caption,
                   
                        
                    ...Markup.inlineKeyboard([
                    
                        [Markup.button.callback("Cancel Order", `cancel_order:${orderid}`)]
                    ]),
                }
                );
                ctx.session.cleanUpState.push({ id: orderMessage.message_id, type: "myorder" });
            } catch (error) {
                console.log(error)
            }
          
        }
    }
// }
// Save the message IDs for cleanup



// Handle next and previous actions
myOrderScene.action(/next_(\w+)_(\w+)_(\w+)_(\d+)/, (ctx) => {
    const [, productId, orderid, index,orderNumber] = ctx.match;
    console.log("ctx.match", orderNumber);
    const orderItems = ctx.session.UserOrder.find(order => order._id === orderid).orderItems;
    const nextIndex = (parseInt(index) + 1) % orderItems.length;
    editProductMessage(ctx,orderNumber, orderid, orderItems, productId, index, nextIndex);
});

// Handle previous action
myOrderScene.action(/prev_(\w+)_(\w+)_(\w+)_(\d+)/, (ctx) => {
    const [, productId, orderid, index,orderNumber] = ctx.match;
    const orderItems = ctx.session.UserOrder.find(order => order._id === orderid).orderItems;
    const prevIndex = (parseInt(index) + orderItems.length - 1) % orderItems.length;
    editProductMessage(ctx, orderNumber, orderid, orderItems, productId, index, prevIndex);
});
 
async function editProductMessage(ctx, orderNumber, orderid, orderItems, productId, currentIndex, newIndex) {
    const image = orderItems[parseInt(newIndex)].product?.images[0]?.imageUrl;
 
    const caption = generateCaption(orderNumber,orderItems, orderItems.length, newIndex + 1);
    try {
        const imageBuffer = await resizeImage(image);
        await ctx.telegram.editMessageMedia(
            ctx.chat.id,
            ctx.callbackQuery.message.message_id,
            null,
            {
                type: 'photo',
                media: { source: imageBuffer },
                caption: caption,
                parse_mode: 'HTML' ,
            },

            {
             
                ... Markup.inlineKeyboard([[
                    Markup.button.callback('⬅️ Previous', `prev_${productId}_${orderid}_${newIndex}_${orderNumber}`),
                    Markup.button.callback('Next ➡️', `next_${productId}_${orderid}_${newIndex}_${orderNumber}`),
                ],
                [Markup.button.callback("Cancel Order", `cancel_order:${orderid}`)],
                ]
                )
            }
           
        );
    } catch (error) {
        console.error("Error editing message:", error);
    }
}
function generateCaption(orderid, orderItems, totalCount, currentIndex) {
    if (!Array.isArray(orderItems)) {
        // If orderItems is not an array, return an empty string
        return '';
    }
    let summary=''
    let totalQuantity = 0;
    let totalPrice = 0;
     summary +=`Order Number: <u>${orderid}</u>\n`
    for (let index = 0; index < orderItems.length; index++) {
         summary+= `${orderItems[index].product.name}:${orderItems[index].quantity}X${orderItems[index].product.price}=${orderItems[index].quantity*orderItems[index].product.price} ETB\n`;
         totalQuantity += orderItems[index].quantity;
         totalPrice += orderItems[index].quantity * orderItems[index].product.price;
        
    }
    const productName = orderItems.map(item => item.product.name);
    const quantityTimesPrice = orderItems.map(item => `${item.quantity}X${item.product.price}=${item.quantity * item.product.price} ETB`).join("\n");

    let caption = `Product Name : ${productName}\n`;
    summary += `🖼️  ${currentIndex}/${totalCount}\n`;
    summary += `\nTotal Quantity: ${totalQuantity}\nTotal Price: <u>${totalPrice} ETB</u>`;
    caption += quantityTimesPrice;

    return summary;
}
async function resizeImage(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return await sharp(response.data).resize(200, 200).toBuffer();
}
module.exports = myOrderScene;
