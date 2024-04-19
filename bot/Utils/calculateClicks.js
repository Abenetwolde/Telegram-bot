
const { Scenes, Markup, session } = require("telegraf");
const clickKpi = require("../Model/ClickKpi");
// const UserKPI = require("../Model/KpiUser");


module.exports = {
    updateClicks: async function (ctx,sceneName,type) {
        console.log("reach updateSceneDuration")
        
        try {
           
            // Convert milliseconds to minutes
            // const durationMinutes = Math.floor(durationMs / 60000);
    const telegramid=ctx.from.id
        
                // Check if the user already exists in the database
                let existingUserKPI = await clickKpi.findOne({ telegramid });
    
                if (existingUserKPI) {
                    // If the user exists, find the scene for the same day
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set to the beginning of the day
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
    
                    const existingSceneIndex = existingUserKPI.clicks.findIndex(scene => {
                        return scene.name === sceneName&& scene.type === type && scene.date >= today && scene.date < tomorrow;
                    });
    
                    if (existingSceneIndex !== -1) {
                        // If the scene exists for the same day, update the duration
                        const existingScene = existingUserKPI.clicks[existingSceneIndex];
                        const existingDurationMs = existingScene.count;
                        const totalDuration = existingDurationMs+1
                        existingUserKPI.clicks[existingSceneIndex].count = totalDuration;
                        await existingUserKPI.save();
                    } else {
                        // If the scene doesn't exist for the same day, add a new scene
                        existingUserKPI.clicks.push({
                            name: sceneName,
                            type:type,
                            date: today,
                            count: 1
                        });
                    }
    
                    await existingUserKPI.save();
                } else {
                    // If the user doesn't exist, create a new UserKPI document
                    const newUserKPI = new clickKpi({
                        telegramid,
                       user: ctx.session.userid,
                        clicks: [{
                            name: sceneName,
                            type:type,
                            date: new Date(),
                            count: 1
                        }]
                    });
                    await newUserKPI.save();
                }
            
        } catch (error) {
            console.error(`Error saving UserKPI in ${sceneName}.leave:`, error);
        }

    }
}