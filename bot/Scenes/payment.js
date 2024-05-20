const { Scenes, Markup } = require("telegraf")
const numeral = require("numeral")
const moment = require("moment")
const axios = require('axios');
const apiUrl = 'http://localhost:5000';
const _ = require("lodash");

const { createPayment } = require("../Database/payment");
const { updateOrder, updateOrderStatus } = require("../Database/orderController");
const product = require("../Model/product");
let priceLabels = []
const paymentScene = new Scenes.BaseScene("paymentScene")
const UserKPI=require("../Model/KpiUser");
const { match } = require("telegraf-i18next");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");

paymentScene.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.session.cleanUpState = []
    ctx.session.timeout = []
    ctx.session.isWaiting = {
        status: false
    }

    await ctx.replyWithHTML(`${ctx.i18next.t("MakeaPaymentforyourOrderID")}<u>${ctx.scene.state?.orderNumber}</u>\n Total Price: <u>${ctx.scene.state.totalPrice} ETB</u>`,    Markup.keyboard([
        [ctx.i18next.t("Home")]
    ]).resize())

    // await Utils.sendSystemMessage(ctx, Template.paymentWelcomeMessage(), Template.paymentMenuButtons())

    await ctx.reply(ctx.i18next.t("Paymenttype "), Markup.inlineKeyboard([
        Markup.button.callback("Chapa 🇪🇹", "chapa"),
        Markup.button.callback("Strapi", "strapi")
    ]));
    // const totalCost =  ctx.scene.state.totalPrice
    // const invoice = await ctx.replyWithInvoice({
    //     chat_id: ctx.chat.id,
    //     provider_token: "6141645565:TEST:SgnwnFe9W5qSP720pKno",
    //     start_parameter: "get_access",
    //     title: `Invoice (${moment().format("HH:mm A, DD/MM/YYYY")})`,
    //     description: `Your total order amounts to ${numeral(totalCost).format("0,0.00")}ETB.`,
    //     currency: "ETB",
    //     prices: priceLabels,
    //     payload: {
    //         id: ctx.from.id,
    //         getway:"chapa"
    //         // voucherID: ctx.scene.state.voucher ? ctx.scene.state.voucher.id : null
    //     },
    //     //  need_shipping_address: true,
    //     need_phone_number: true,
      
    // })
    // console.log("invoiceData", invoice)
    // ctx.session.cleanUpState.push({ id: invoice.message_id, type: "invoice" })

})

paymentScene.action("chapa", async (ctx) => {
    console.log("chapa")
    // Initiate payment process with Chapa payment gateway
    await initiatePayment(ctx, "chapa");
   
    await updateClicks(ctx,"payment","payment")
});

paymentScene.action("strapi", async (ctx) => {
    // Initiate payment process with Strapi payment gateway
    await initiatePayment(ctx, "strapi");
       
    await updateClicks(ctx,"payment","payment")
});
async function initiatePayment(ctx, gateway) {
    // Your existing code to calculate total cost, create invoice, etc.
    // ...
    const priceLabels=[]
    for (const product of ctx.scene.state.orderItems) {

        const productCost = product.quantity * product?.product?.price
        priceLabels.push({
            label: `${product.quantity}x ${product?.product?.name}`,
            amount: 100*productCost,
            // amount: Utils.convertValueToFloat(100 * productCost),
        })

    }

const totalCost =  ctx.scene.state.totalPrice

    let providerToken, payload;
    if (gateway === "chapa") {
        console.log("Getway",gateway)
        providerToken = "6141645565:TEST:SgnwnFe9W5qSP720pKno";
        payload = { id: ctx.from.id,gateway: "chapa" };
    } else if (gateway === "strapi") {
        providerToken = "284685063:TEST:YWE1MmJjZTQwZjJh";
        payload = { id: ctx.from.id, gateway: "strapi" };
    }

    // Generate and send invoice with the selected payment gateway
    const invoice = await ctx.replyWithInvoice({
        chat_id: ctx.chat.id,
        provider_token: providerToken,
        start_parameter: "get_access",
        title: `Invoice (${moment().format("HH:mm A, DD/MM/YYYY")})`,
        description: `Your total order amounts to ${numeral(totalCost).format("0,0.00")}ETB.`,
        currency: "ETB",
        prices: priceLabels,
        payload: payload,
        need_phone_number: true
    });

    // Store invoice ID for cleanup
    ctx.session.cleanUpState.push({ id: invoice.message_id, type: "invoice" });
}

// paymentScene.on('pre_checkout_query', async (ctx) => {
//     // Store necessary information related to the payment in the session
//     ctx.session.paymentInfo = {
//       orderId: ctx.scene.state.orderId,
//       // Other payment information as needed
//     };
  
//     // Answer the pre-checkout query to confirm the payment
//     await ctx.answerPreCheckoutQuery(true);
//   });
  //some  change
paymentScene.on("successful_payment", async (ctx) => {

    ctx.session.cleanUpState = _.map(ctx.session.cleanUpState, function (message) {         // Convert old cart message ID into text to prune
        if (message.type === "invoice") {
            message.type = "receipt"
        }
        return message
    })
    const payment = ctx.message.successful_payment
    const invoice = JSON.parse(payment.invoice_payload)
    const paymentData = {
        telegramid:ctx.session.userid,
        order: ctx.scene.state.orderId,
        total_amount: ctx.message.successful_payment.total_amount,
        invoice_id: invoice.id,
        telegram_payment_charge_id: ctx.message.successful_payment.telegram_payment_charge_id,
        paymentType:"Online"
      
    }
    const paymentdata=JSON.parse(JSON.stringify(paymentData))
    try {
        const savedPayment = await createPayment(
            paymentdata
        ); 
       const orderupdate={
            orderId:ctx.scene.state.orderId,
            phoneNo:payment.order_info.phone_number,
            paymentStatus:"completed",
            orderStatus:"pending",
            location:ctx.session.orderInformation?.location
        }
const updatedOrder=await updateOrder(orderupdate)
// console.log("orderupdate",orderinfo)
// let summary = '';
// let totalPrice = 0;
// summary += `Order Details:`
// // const updatedOrder = await updateOrderStatus(ctx.scene.state.orderId, 'completed');
// // console.log('Order status updated successfully:', updatedOrder.orderItems);
// for (const orderItem of updatedOrder.orderItems) {

//     summary += `🛒 ${orderItem.product.name}: ${orderItem.quantity} x ${orderItem.product.price} = ${orderItem.quantity * orderItem.product.price} ETB\n`;
//     totalPrice += orderItem.quantity * orderItem.product.price ;
//     // await ctx.reply(
//     //     `Order Details:
//     //                Product: ${orderItem.product.name}
//     //                Quantity: ${orderItem.quantity}
//     //                Total Price: ${orderItem.quantity * orderItem.product.price} ETB
//     //                Order ID: ${updatedOrder._id}`,
//     // );
    
//     await product.findByIdAndUpdate(orderItem.product._id, {
//         $inc: {   orderQuantity: +orderItem.quantity }
//     });
//   }
//   summary += `\nTotal Price: <u>${totalPrice} ETB</u>`;

  // Send a separate message about the product

  const message= await ctx.replyWithHTML(`Thank you for your order! 🎉\nPayment received for Order ID: <u>${updatedOrder.orderNumber}</u>. Total Amount: <u>${updatedOrder.totalPrice}</u>\n
  The product will be delivered to you soon.`,Markup.inlineKeyboard([
    Markup.button.callback(
      `View Your Order`,"showOrder")
  ]));
  await ctx.telegram.pinChatMessage(ctx.chat.id, message.message_id);
//   await ctx.replyWithHTML(summary),
  ctx.session.orderInformation={}   
    } catch (error) {
        console.error('Error creating payment:', error);
        // Handle error
    }

// await ctx.scene.enter("homeScene")
})
paymentScene.hears(match("Home"), async (ctx) => {

      await  ctx.scene.enter("homeScene")
    
      await updateClicks(ctx,"payment","payment")
})
paymentScene.on("message", async (ctx) => {
    if (ctx.message.text === "/start") {
        ctx.scene.enter("homeScene")
           
    await updateClicks(ctx,"payment","payment")
    }
})
paymentScene.action("showOrder",async(ctx)=>{
    await ctx.scene.enter("myOrderScene")
       
    await updateClicks(ctx,"payment","payment")
})
paymentScene.leave(async (ctx) => {
    console.log("Cleaning payment scene")
    ctx.session.orderInformation={}
    try {
        // Calculate the duration when leaving the scene
        const leaveTime = new Date();
        const enterTime = ctx.scene.state.enterTime;
        const durationMs = new Date(leaveTime - enterTime);
        // Convert milliseconds to minutes

        await updateSceneDuration(ctx, durationMs, "Payment_Scene")
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
    // await ctx.scene.leave()
    // await Utils.clearScene(ctx, true)
})

module.exports = {
    paymentScene
}