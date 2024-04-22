const { Scenes, Markup } = require("telegraf")
const { performance } = require('perf_hooks');
const UserKPI = require("../Model/KpiUser");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");
const aboutUs = new Scenes.BaseScene("aboutus")
aboutUs.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;

    const aboutme = await ctx.reply('👋ሰላም, I’m Abnet Wolde,\n a Software developer based in Ethiopia, specializing in the latest JavaScript frameworks.\n\n'
        + 'Email: abnetwoldedev@gmail.com\n'
        + '[LinkedIn](https://www.linkedin.com/in/abnet-wolde-8b3923220/)\n'
        + '[GitHub](https://github.com/Abenetwolde)\n'
        + '[Telegram](https://t.me/abnet_abi)',

        {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "❌ Back", callback_data: "Back" }]
                ]
            }
        }
    )



    ctx.session.cleanUpState.push({ id: aboutme.message_id, type: 'aboutme' });
    // ctx.session.cleanUpState.push({ id: note1message2.message_id, type: 'addressOnline' });
    // ctx.session.cleanUpState.push(summaymessage);

})

aboutUs.action("Back", async (ctx) => {
    await ctx.scene.enter("homeScene")
  
    await updateClicks(ctx,"aboutus","aboutus")
}

)




aboutUs.leave(async (ctx) => {
    try {
        performance.mark('start-leave');
        if (ctx.session.cleanUpState) {

            for (const message of ctx.session.cleanUpState) {

                if (/* message?.type === 'addressOnline' */ message?.type === 'aboutus') {
                    await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
                }
            }
        }
    } catch (error) {
        console.error('Error in note leave:', error);
    } finally {
        // Always clear the cleanUpState array
        // ctx.session.cleanUpState = [];
    }


    try {
        // Calculate the duration when leaving the scene
        const leaveTime = new Date();
        const enterTime = ctx.scene.state.enterTime;
        const durationMs = new Date(leaveTime - enterTime);
        // Convert milliseconds to minutes
        await updateSceneDuration(ctx, durationMs,"AboutMe_Scene")
        performance.mark('end-leave');
        performance.measure('leave-time', 'start-leave', 'end-leave');
        const measurement = performance.getEntriesByName('leave-time')[0];
        console.log(`Execution time for aboutUs.leave: ${measurement.duration} milliseconds`);
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
})

module.exports = {
    aboutUs
}