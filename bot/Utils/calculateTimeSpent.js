
const { Scenes, Markup, session } = require("telegraf");
const UserKPI = require("../Model/KpiUser");
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
    updateSceneDuration: async function (ctx, durationMs,sceneName) {
        console.log("reach updateSceneDuration")
        
        try {
            const durationMinutes = Math.floor(durationMs / 60000);
            // Convert milliseconds to minutes
            // const durationMinutes = Math.floor(durationMs / 60000);
    const telegramid=ctx.from.id
            // Check if the duration exceeds 5 minutes
            if (durationMinutes <= 5) {
                // Convert milliseconds to hours, minutes, and seconds
                const hours = Math.floor(durationMs / 3600000);
                const minutes = Math.floor((durationMs % 3600000) / 60000);
                const seconds = Math.floor((durationMs % 60000) / 1000);
                const durationFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
                // Check if the user already exists in the database
                let existingUserKPI = await UserKPI.findOne({ telegramid });
    
                if (existingUserKPI) {
                    // If the user exists, find the scene for the same day
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set to the beginning of the day
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
    
                    const existingSceneIndex = existingUserKPI.scene.findIndex(scene => {
                        return scene.name === sceneName && scene.date >= today && scene.date < tomorrow;
                    });
    
                    if (existingSceneIndex !== -1) {
                        // If the scene exists for the same day, update the duration
                        const existingScene = existingUserKPI.scene[existingSceneIndex];
                        const existingDurationMs = existingScene.duration;
                        const totalDuration = addDurations(existingDurationMs, durationFormatted);
                        existingUserKPI.scene[existingSceneIndex].duration = totalDuration;
                        await existingUserKPI.save();
                    } else {
                        // If the scene doesn't exist for the same day, add a new scene
                        existingUserKPI.scene.push({
                            name: sceneName,
                            date: today,
                            duration: durationFormatted
                        });
                    }
    
                    await existingUserKPI.save();
                } else {
                    // If the user doesn't exist, create a new UserKPI document
                    const newUserKPI = new UserKPI({
                        telegramid,
                       user: ctx.session.userid,
                        scene: [{
                            name: sceneName,
                            date: new Date(),
                            duration: durationFormatted
                        }]
                    });
                    await newUserKPI.save();
                }
            }
        } catch (error) {
            console.error(`Error saving UserKPI in ${sceneName}.leave:`, error);
        }

    }
}