const { Scenes, Markup, session } = require("telegraf")
const FeedBack =require ("../Model/feedback")
const UserKPI = require("../Model/KpiUser");
const feedback = new Scenes.BaseScene("feedback")
let isedit = false
feedback.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;

    const feedback = await ctx.reply(`Type you Feedback ${!isedit ? "below" : "again"}🙂`, Markup.keyboard([
        ["❌ Cancel"]
    ]).resize())



    // ctx.session.cleanUpState.push({ id: aboutme.message_id, type: 'addressOnline' });
    // ctx.session.cleanUpState.push({ id: note1message2.message_id, type: 'addressOnline' });
    // ctx.session.cleanUpState.push(summaymessage);

})
feedback.on("message", async (ctx) => {
    console.log("message", ctx.message.text)
    const text = ctx.message.text
    if (text === "❌ Cancel" || text === "/start")
        return await ctx.scene.enter("homeScene")
ctx.session.userfeedback=ctx.message.text;
    const feedbackmessage = await ctx.replyWithHTML(`This is the FeedBack that you wish to leave?: <i>${ctx.message.text}</i>`,

        Markup.inlineKeyboard([
            Markup.button.callback("✅ Confirm", "confirm"),
            Markup.button.callback("❌ Edit", "edit"),

        ]),)
});
feedback.action("❌ Cancel", async (ctx) => {
    await ctx.scene.enter("homeScene")
})

feedback.action("confirm", async (ctx) => {
    const text = ctx.session.userfeedback
    console.log("message on log", ctx.session.userfeedback)
     console.log("message on log", ctx.update.message)
    if (text === "❌ Cancel" || text === "/start")
        return
    // const response = FeedBack.findOne({ telegramid: ctx.from.id })
    // if (!response) {
    let data = { telegramid: ctx.from.id, first_name: ctx.from.first_name, username: ctx.from.username, feedback: text }
    const result = await FeedBack(data)
    await result.save();
    console.log("result", result)
    if(result){
    ctx.session.userfeedback=""
    const feedbackmessage = await ctx.replyWithHTML(`Your Feedback has been sent!seccessfuly `)
    await ctx.scene.leave()
    }

    
    // }


}

);
feedback.action("edit", async (ctx) => {
    isedit = true
    await ctx.scene.reenter()

}

);




feedback.leave(async (ctx) => {
    // try {
    //     if (ctx.session.cleanUpState) {
    //         // Iterate over the cleanUpState array
    //         for (const message of ctx.session.cleanUpState) {
    //             // Check if the message exists before attempting to delete it
    //             if (/* message?.type === 'addressOnline' */ message?.type === 'aboutus') {
    //                 await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
    //             }
    //         }
    //     }
    // } catch (error) {
    //     console.error('Error in note leave:', error);
    // } finally {
    //     // Always clear the cleanUpState array
    //     ctx.session.cleanUpState = [];
    // }
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
                    name: 'Feedback',
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
                        name: 'Feedback',
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
    feedback
}