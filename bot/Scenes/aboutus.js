const { Scenes, Markup } = require("telegraf")

const UserKPI = require("../Model/KpiUser");
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
}

)




aboutUs.leave(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            // Iterate over the cleanUpState array
            for (const message of ctx.session.cleanUpState) {
                // Check if the message exists before attempting to delete it
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
                // If the user exists, find the scene for the same day
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to the beginning of the day
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
    
                const existingSceneIndex = existingUserKPI.scene.findIndex(scene => {
                    return scene.name === 'Aboutme' && scene.date >= today && scene.date < tomorrow;
                });
    
                if (existingSceneIndex !== -1) {
                    // If the scene exists for the same day, update the duration
                    const existingScene = existingUserKPI.scene[existingSceneIndex];
                    const existingDurationMs =existingScene.duration;
                    const totalDuration = addDurations(existingDurationMs, durationFormatted);
                    existingUserKPI.scene[existingSceneIndex].duration = totalDuration;
                    await existingUserKPI.save();
                } else {
                    // If the scene doesn't exist for the same day, add a new scene
                    existingUserKPI.scene.push({
                        name: 'Aboutme',
                        date: today,
                        duration: durationFormatted
                    });
                }
    
                await existingUserKPI.save();
            } else {
                // If the user doesn't exist, create a new UserKPI document
                const newUserKPI = new UserKPI({
                    telegramId: ctx.from.id,
                    scene: [{
                        name: 'Aboutme',
                        date: new Date(),
                        duration: durationFormatted
                    }]
                });
                await newUserKPI.save();
            }
        }
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
    
    // try {
    //     // Calculate the duration when leaving the scene
    //     const leaveTime = new Date();
    //     const enterTime = ctx.scene.state.enterTime;
    //     const durationMs = new Date(leaveTime - enterTime);
    //     // Convert milliseconds to minutes
    //     const durationMinutes = Math.floor(durationMs / 60000);

    //     // Check if the duration exceeds 5 minutes
    //     if (durationMinutes <= 5) {
    //         // If the duration is less than or equal to 5 minutes, save the information to the database
    //         // Convert milliseconds to hours, minutes, and seconds
    //         const hours = Math.floor(durationMs / 3600000);
    //         const minutes = Math.floor((durationMs % 3600000) / 60000);
    //         const seconds = Math.floor((durationMs % 60000) / 1000);
    //         const durationFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    //         // Check if the user already exists in the database
    //         let existingUserKPI = await UserKPI.findOne({ telegramId: ctx.from.id });
    //         if (existingUserKPI) {
    //             // If the user exists, update the scene details
    //             existingUserKPI.scene.push({
    //                 name: 'Aboutme',
    //                 enterTime: enterTime,
    //                 leaveTime: leaveTime,
    //                 duration: durationFormatted
    //             });
    //             await existingUserKPI.save();
    //         } else {
    //             // If the user doesn't exist, create a new UserKPI document
    //             const newUserKPI = new UserKPI({
    //                 telegramId: ctx.from.id,
    //                 scene: [{
    //                     name: 'Aboutme',
    //                     enterTime: enterTime,
    //                     leaveTime: leaveTime,
    //                     duration: durationFormatted
    //                 }]
    //             });
    //             await newUserKPI.save();
    //         }
    //     }
    // } catch (error) {
    //     console.error('Error saving UserKPI in homeScene.leave:', error);
    // }
})
function addDurations(currentDuration, newDuration) {
    // Convert current duration to seconds
    const currentDurationInSeconds = durationToSeconds(currentDuration);

    // Convert new duration to seconds
    const newDurationInSeconds = durationToSeconds(newDuration);

    // Add both durations in seconds
    const totalSeconds = currentDurationInSeconds + newDurationInSeconds;

    // Convert total seconds back to hours:minutes:seconds format
    const totalDuration = secondsToDuration(totalSeconds);

    return totalDuration;
}

// Function to convert duration string to seconds
function durationToSeconds(duration) {
    const [hours, minutes, seconds] = duration.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Function to convert seconds to duration string (hours:minutes:seconds)
function secondsToDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
module.exports = {
    aboutUs
}