const { Scenes, Markup } = require("telegraf")
const moment = require("moment")
const _ = require("lodash")

const { sendProdcutSummary } = require("../Templeat/summary")

const selectePaymentType = new Scenes.BaseScene("selectePaymentType")
const UserKPI=require("../Model/KpiUser");
const { i18next, t } = require("telegraf-i18next")
const { updateClicks } = require("../Utils/calculateClicks")
/**
 * Upon entering, scene contains:
 * 1. Voucher applied from cart scene (i.e. ctx.scene.state.voucher)
 * 
 * isWaiting: {
 *      status: true,               // If user is in text-only mode
 *      date: XXX                    // callback_query that user selects
 * }
 */

selectePaymentType.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    // await sendProdcutSummary(ctx)
    // const selec1message = await ctx.reply("Just two more steps before we're able to generate your invoice! 🙂",    Markup.keyboard([
    //     ["🏠 Back to Home"]
    // ]).resize())

    const selec2message = await ctx.reply(ctx.i18next.t("Paymenttype"), Markup.inlineKeyboard([
        [Markup.button.callback("Pay Online 💳", 'online'),
        Markup.button.callback("Pay On Cash 💵", 'cash'),],
        [
            Markup.button.callback('Back to Home 🏠 ', 'Home')
        ]

    ]))

    // ctx.session.cleanUpState.push({ id: selec1message.message_id, type: "selectPayment" })
    ctx.session.cleanUpState.push({ id: selec2message.message_id, type: "selectPayment" }) // Update as calendar type to prevent message from deletion in midst of selecting a date
})
selectePaymentType.action("online", async (ctx) => {
    ctx.session.orderInformation = {
        paymentType: 'online'
    }
    // await sendProdcutSummary(ctx)
    await ctx.scene.enter("addressOnline");
    await updateClicks(ctx,"selectePaymentType","selectePaymentType")
});
selectePaymentType.action("cash", async (ctx) => {
    // ctx.session.paymentType="Chash"
    // ctx.session.cancelOrder = true

    ctx.session.orderInformation = {
        paymentType: 'Cash'
    }
    await ctx.scene.enter("informationCash");
    await updateClicks(ctx,"selectePaymentType","selectePaymentType")
    // await sendProdcutSummary(ctx)
    // await ctx.reply("your order is seccessfully............ here is your order number #23784 ")
    // await ctx.scene.leave()
    // await ctx.scene.enter("PAYMENT_SCENE");
    // await ctx.scene.enter("PAYMENT_SCENE");
});
selectePaymentType.action("Home", async (ctx) => {

    await ctx.scene.enter("homeScene");
       
    await updateClicks(ctx,"selectePaymentType","selectePaymentType")
  
});
selectePaymentType.leave(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            // Iterate over the cleanUpState array
            for (const message of ctx.session.cleanUpState) {
      
                if (message?.type === 'selectPayment'/* || message?.type === 'summary' */) {
                    await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
                }
            }
        }
    } catch (error) {
        console.error('Error in note leave:', error);
    } finally {
        // Always clear the cleanUpState array
        ctx.session.cleanUpState = [];
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
                    name: 'SelectScene',
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
                        name: 'SelectScene',
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
    selectePaymentType
}