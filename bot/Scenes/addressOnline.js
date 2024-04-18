const { Scenes, Markup } = require("telegraf")
const { sendProdcutSummary } = require("../Templeat/summary")
const axios = require('axios');
const { createOrder, getOrderById } = require("../Database/orderController");
const { getCart } = require("../Database/cartController");
const apiUrl = 'http://localhost:5000';
const UserKPI=require("../Model/KpiUser");
const { t, match } = require('telegraf-i18next');
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const addressOnline = new Scenes.BaseScene("addressOnline")
addressOnline.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.session.cleanUpState = []
    ctx.session.timeout = []
    ctx.session.isWaiting = {
        status: false
    }
    const note1message = await ctx.reply(ctx.i18next.t('great!'), Markup.keyboard([
        ["❌ Cancel"]
    ]).resize())
    

    const note1message2 = await ctx.reply(
       
        ctx.i18next.t('locationpromt'),
        {
          reply_markup: {
            resize_keyboard: true, 
            force_reply: true,
          },
        }
      );
    ctx.session.cleanUpState.push({ id: note1message.message_id, type: 'addressOnline' });
    ctx.session.cleanUpState.push({ id: note1message2.message_id, type: 'addressOnline' });
    // ctx.session.cleanUpState.push(summaymessage);

})

addressOnline.on("message", async (ctx) => {
    const text = ctx.message.text;

    if (text === "❌ Cancel" || text === "/start") {
        return ctx.scene.enter("cart")
    } else {
        ctx.session.orderInformation = {
            ...ctx.session.orderInformation,
            location: ctx.message.text,
        };
        await ctx.scene.enter("NOTE_SCENE");
    }

});






addressOnline.leave(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            // Iterate over the cleanUpState array
            for (const message of ctx.session.cleanUpState) {
                // Check if the message exists before attempting to delete it
                if (/* message?.type === 'addressOnline' */ message?.type === 'summary') {
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

        await updateSceneDuration(ctx, durationMs, "AddressForOnlinePayment_Scene")
        
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
})

module.exports = {
    addressOnline
}