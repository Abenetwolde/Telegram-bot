const { Scenes, Markup } = require("telegraf")
const { sendProdcutSummary } = require("../Templeat/summary")
const axios = require('axios');
const { createOrder, getOrderById } = require("../Database/orderController");
const { getCart, removeItemFromCart, removeFromCart } = require("../Database/cartController");

const apiUrl = 'http://localhost:5000';
const UserKPI=require("../Model/KpiUser");
const noteScene = new Scenes.BaseScene("NOTE_SCENE")
noteScene.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.session.cleanUpState = []
    ctx.session.timeout = []
    ctx.session.isWaiting = {
        status: false
    }
    // const summaymessage = await sendProdcutSummary(ctx)
    // console.log("summary message from note",summaymessage)
    const note1message = await ctx.reply("Last step before we're able to generate your invoice! 🙂", Markup.keyboard([
        ["❌ Cancel"]
    ]).resize())


    const note1message2 = await ctx.reply("📝 Would you like to leave a note along with the order?", Markup.inlineKeyboard([
        Markup.button.callback("✅ Yes", 'yes'),
        Markup.button.callback("⏩ Skip", 'Skip'),

    ]))
    ctx.session.cleanUpState.push({ id: note1message.message_id, type: 'note' });
    ctx.session.cleanUpState.push({ id: note1message2.message_id, type: 'note' });
    // ctx.session.cleanUpState.push(summaymessage);

})
noteScene.action("yes", async (ctx) => {
    console.log("reach yes")
    // User wants to leave a note, prompt for the message using force reply
    const note3message = await ctx.reply("What is your message for the seller? (Type your message)", {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.cleanUpState.push({ id: note3message.message_id, type: 'note' });
});


noteScene.action("Skip", async (ctx) => {
    ctx.session.orderInformation = {
        ...ctx.session.orderInformation,
        note: "",
    };
    let summary = '';
    let totalQuantity = 0;
    let totalPrice = 0;

  const userId=ctx.from.id
    const cart = await getCart(userId);
    cart?.items?.forEach((product, productId) => {
        if (product.quantity > 0) {
            // console.log(ctx.session.quantity[product._id], product._id)//filter the product quantity is greater than o
            summary += `🛒 ${product.product.name}: ${product.quantity} x ${product.product.price} = ${product.quantity * product.product.price} ETB\n`;
            totalQuantity += product.quantity;
            totalPrice += product.quantity * product.product.price;

        }
    });
    let usernote =await ctx.session?.orderInformation?.note 
    let paymentType =await ctx.session?.orderInformation?.paymentType
    let address=await ctx.session?.orderInformation?.location
    let phoneNumber=await ctx.session?.orderInformation?.phoneNo
    console.log("Payemettype",paymentType) 
    if (usernote) {
        summary += `📔 Note for seller: ${usernote}\n`

        // orderItems.push({ "note": note }, )
    }
    if (paymentType) {
        summary += `💳 Payment Type: ${paymentType}\n`
    }
    if(address){ 
        summary+=`🏠 Delivery Address:${address}\n`
        }
        if(phoneNumber)
        {
         summary+= `📲 Phone Number For Contact:${phoneNumber}\n`
        }
    summary += `\nTotal Quantity: ${totalQuantity}\nTotal Price: <u>${totalPrice} ETB</u>`;

    const message =   await ctx.replyWithHTML(summary, {
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Order", 'make_order')],
            [Markup.button.callback("Update Order Infromation", 'updateorder')],
            [Markup.button.callback("Cancel Order", `cancel_cart:${cart._id}`)]
        ]),
    })
    ctx.session.cleanUpState.push({ id: message.message_id, type: 'note' })

  
});
// Listener to clear message after scene ends
noteScene.on("message", async (ctx) => {
    // if (!(ctx.session.isWaiting && ctx.session.isWaiting.status)) {
    const text = ctx.message.text;

    if (text === "❌ Cancel" || text === "/start") {
        return ctx.scene.enter("cart")
    } else {
        const note4message = await ctx.replyWithHTML(`This is the note that you wish to leave for the seller: <i>${ctx.message.text}</i>`,
 
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Confirm", 'confirm'),
                Markup.button.callback("❌ Edit", "edit"),

            ])
        );

        ctx.session.orderInformation = {
            ...ctx.session.orderInformation,
            note: text,
        };
        ctx.session.isWaiting.note = text
        // ctx.session.isWaiting.status = false;
        ctx.session.cleanUpState.push({ id: note4message.message_id, type: 'note' });
    }

    // }
});
noteScene.action("edit", async (ctx) => {
    console.log("edit")

    const confirmationMessage = await ctx.replyWithHTML(`Your note has been updated to: <i>${ctx.session.orderInformation?.note}</i>`, {
        reply_markup: {
            force_reply: true,
        },
    }, Markup.inlineKeyboard([
        [

            { text: "❌ Cancel", callback_data: "cancel" },
        ],
    ]));

    // Cleanup state
    ctx.session.cleanUpState.push({ id: confirmationMessage.message_id, type: 'note' });

    // Reset waiting status
    // ctx.session.isWaiting = {
    //     status: false,
    // };
}
);
noteScene.on("message", async (ctx) => {
    // if (!(ctx.session.isWaiting && ctx.session.isWaiting.status)) {
    const text = ctx.message.text;

    if (text === "❌ Cancel" || text === "/start") {
        return ctx.scene.enter("cart")
    } else {
        const note4message = await ctx.replyWithHTML(`This is the note that you wish to leave for the seller: <i>${ctx.message.text}</i>`,
     
            Markup.inlineKeyboard([
                Markup.button.callback("✅ Confirm", "confirm"),
                Markup.button.callback("❌ Edit", "edit"),

            ])
        );
        ctx.session.isWaiting.note = text

        ctx.session.cleanUpState.push({ id: note4message.message_id, type: 'note' });
    }

    // }
});
noteScene.action('confirm', async (ctx) => {
    const confirmedNote = ctx.session.isWaiting.note;
    ctx.session.orderInformation = {
        ...ctx.session.orderInformation,
        note: confirmedNote,
    };

    let summary = '';
    let totalQuantity = 0;
    let totalPrice = 0;

  const userId=ctx.from.id
    const cart = await getCart(userId);
    cart?.items?.forEach((product, productId) => {
        if (product.quantity > 0) {
            // console.log(ctx.session.quantity[product._id], product._id)//filter the product quantity is greater than o
            summary += `🛒 ${product.product.name}: ${product.quantity} x ${product.product.price} = ${product.quantity * product.product.price} ETB\n`;
            totalQuantity += product.quantity;
            totalPrice += product.quantity * product.product.price;

        }
    });
    let usernote =await ctx.session?.orderInformation?.note 
    let paymentType =await ctx.session?.orderInformation?.paymentType
    let address=await ctx.session?.orderInformation?.location
    let phoneNumber=await ctx.session?.orderInformation?.phoneNo
    console.log("Payemettype",paymentType) 
    if (usernote) {
        summary += `📔 Note for seller: ${usernote}\n`

        // orderItems.push({ "note": note }, )
    }
    if (paymentType) {
        summary += `💳 Payment Type: ${paymentType}\n`
    }
    if(address){ 
        summary+=`🏠 Delivery Address:${address}\n`
        }
        if(phoneNumber)
        {
         summary+= `📲 Phone Number For Contact:${phoneNumber}\n`
        }
    summary += `\nTotal Quantity: ${totalQuantity}\nTotal Price: <u>${totalPrice} ETB</u>`;
    console.log("summary",summary)
    const message =   await ctx.replyWithHTML(summary, {
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Order", 'make_order')],
            [Markup.button.callback("Update Order Infromation", 'updateorder')],
            [Markup.button.callback("Cancel Order", `cancel_cart:${cart._id}`)]
        ]),
    })
    ctx.session.cleanUpState.push({ id: message.message_id, type: 'note' }) 
});
noteScene.action("make_order", async (ctx) => {
    const userId = ctx.from.id;
    const cartItems = await getCart(userId);

    const orderInformation = ctx.session.orderInformation || {};

    if (ctx.session.orderInformation.paymentType && ctx.session.orderInformation.paymentType.toLowerCase() === 'online') {
        const order = await createOrder(userId, orderInformation, cartItems);
        const orderJson = JSON.stringify(order);
        const orderJsonParse = JSON.parse(orderJson);
        await ctx.reply(`Payment received for Order ID: ${orderJsonParse._id.toString()}. Total Amount: ${order.totalPrice}`);
        await ctx.scene.enter('paymentScene', {
            totalPrice: orderJsonParse.totalPrice,
            orderItems: orderJsonParse.orderItems,
            orderId: orderJsonParse._id.toString(),
        });
        //  await ctx.scene.leave()
    } else {
 
        const order = await createOrder(userId, orderInformation, cartItems);
        const orderJson = JSON.stringify(order);
        const orderJsonParse = JSON.parse(orderJson);
      const message=  await ctx.reply(`Payment received for Order ID: ${orderJsonParse.orderNumber}. Total Amount: ${order.totalPrice}`);
      await ctx.telegram.pinChatMessage(ctx.chat.id, message.message_id);
      await ctx.reply(`Thank you for your order! The product will be delivered to you soon.`,Markup.inlineKeyboard([
        Markup.button.callback(
          `View Your Order`,"showOrder")
      ]));
  

        ctx.session.cleanUpState.push({ id: message.message_id, type: 'note' })
        //   await ctx.reply(`Order created successfully! Order ID: ${order._id}\n ${ctx.session.isWaiting.note}`);
 
    }
    ctx.session.orderInformation=await []
    // 
});


noteScene.action("showOrder",async(ctx)=>{
    await ctx.scene.enter("myOrderScene")
})
//cart

noteScene.action(/cancel_cart:(.+)/, async (ctx) => {
    const userId = ctx.from.id;
    const cartid = ctx.match[1];

    if (cartid) {
        const message = ctx.callbackQuery.message;
        if (
            message.text === "Are you sure you want to cancel your Cart?" &&
            JSON.stringify(message.reply_markup) === JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Yes', callback_data: `yes_cart:${cartid}` }, { text: 'No', callback_data: 'reject_cancel_cart' }]
                ]
            })
        ) {
            // Message content and reply markup are the same, no need to edit
            return;
        }
        // Edit the button message to include "Yes" instead of using answerCbQuery
        await ctx.telegram.editMessageReplyMarkup(
            message.chat.id,
            message.message_id,
            null,
            {
                inline_keyboard: [
                    [{ text: 'Yes', callback_data: `yes_cart:${cartid}` }, { text: 'No', callback_data: 'reject_cancel_cart' }]
                ]
            }
        );
        await ctx.telegram.editMessageText(
            message.chat.id,
            message.message_id,
            null,
            "Are you sure you want to cancel your Cart?",
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Yes', callback_data: `yes_cart:${cartid}` }, { text: 'No', callback_data: 'reject_cancel_cart' }]
                    ]
                }
            }
        );
    } else {
        await ctx.answerCbQuery("Failed to cancel the order.");
    }
  
});
noteScene.action(/yes_cart:(.+)/, async (ctx) => {
    console.log("click cancel")
    // Delete the message with the cancellation confirmation prompt
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    // Retrieve the orderId from the callback data
    const cartId = ctx.match[1];

    // Perform cancellation logic here...

    const cancellationResult = await removeFromCart(cartId);
    
    console.log("cancellationResult",cancellationResult)
    if (cancellationResult) {

        await ctx.reply("Cart canceled successfully.", Markup.inlineKeyboard([
            Markup.button.callback("Back to Home 🏠", `Home`)
        ]));
      
    } else {
        await ctx.answerCbQuery("Failed to cancel the cart.");
    }
    ctx.session.orderInformation=await []
    // await ctx.scene.leave()
});
noteScene.action("Home",async=async(ctx)=>{
    await ctx.scene.enter("homeScene")
})
// Handle user's rejection
noteScene.action('reject_cancel_cart', async (ctx) => {
  
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await ctx.scene.enter("cart")

});
noteScene.action("updateorder", async (ctx) => {
  
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await ctx.scene.enter("selectePaymentType")

})
noteScene.leave(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            // Iterate over the cleanUpState array
            for (const message of ctx.session.cleanUpState) {
                 // Check if the message exists before attempting to delete it
                if (message?.type === 'note' || message?.type === 'summary') {
                    await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
                }
            }
        }
    } catch (error) {
        console.error('Error in note leave:', error);
    } finally {
        // Always clear the cleanUpState array
        ctx.session.cleanUpState = [];
    }  try {
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
                    name: 'NoteScene',
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
                        name: 'NoteScene',
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
})

module.exports = {
    noteScene
}