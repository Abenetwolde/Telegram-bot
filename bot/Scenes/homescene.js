const { Scenes, Markup, session } = require("telegraf")
const axios = require('axios');

const { t, match } = require('telegraf-i18next');
const { getAllCategories } = require("../Database/categoryController");
const homeScene = new Scenes.BaseScene('homeScene');
const apiUrl = 'http://localhost:5000';
const UserKPI=require("../Model/KpiUser");
homeScene.enter(async (ctx) => {
    try {
        await ctx.sendChatAction('typing');
        const enterTime = new Date();

        ctx.scene.state.enterTime = enterTime;
        // Display the initial message
        console.log("isthere a prodcut on session????????",ctx.session.products)
        ctx.session.cleanUpState = ctx.session.cleanUpState || [];
        // let categories;
        // try {
        //   categories = await axios.get(`${apiUrl}/api/getcategorys`);
        // } catch (error) {
        //   // Handle API error gracefully
        //   console.error('API error:', error);
        //   throw new Error('Unable to fetch categories. Please try again later.');
        // }
        const categories = await getAllCategories();

        const pairs = categories?.categories.reduce((result, value, index, array) => {
            if (index % 2 === 0)
              result.push(array.slice(index, index + 2));
            return result;
          }, []);
          let showkey=false
  
            const userId = ctx.from.id;
            // get the chat ID or username of the channel
            const chatId = '@takeitorle';
            // get the chat member information
        await ctx.telegram.getChatMember(chatId, userId)
              .then(user => {
                // check if the user is an admin or creator
        if(user.status === 'administrator' || user.status === 'creator'){
            console.log("true impemented............")
            showkey=true
        }
                  
               
              })
              .catch(error => {
                return false;
                // handle the error
                
              });
        
        try {
     
            let keyboard = [
                [ctx.i18next.t('Search'), ctx.i18next.t('cart')],
                [ctx.i18next.t('order'), ctx.i18next.t('Language')]
            ];
            if (showkey) {
                console.log("trie")
keyboard[1].push('Admin 📊');
            }
            const welcomeMessage = await ctx.reply(
                `👋 Hello ${ctx.session.token ? 'again, ' : ''}${ctx.from.first_name}!`,
                Markup.keyboard(keyboard).resize()
            );
            console.log("key........",keyboard)
            // Save the welcome message ID to the cleanUpState array in the session data
            ctx.session.cleanUpState.push({ id: welcomeMessage.message_id, type: 'home' });
        } catch (error) {
            console.error('Error in homeScene.enter (first Message):', error);
        }

        // Display the secondary message
        try {
            const secondaryMessage = await ctx.reply(
                ctx.i18next.t('wellcomemessage'),
                Markup.inlineKeyboard(   pairs.map(pair => pair.map(category => Markup.button.callback(`${category.icon} ${category.name}`, `category_${category._id}_${category.name}_${category.icon}`))))
            )
            ctx.session.cleanUpState.push({ id: secondaryMessage.message_id, type: 'home' });
        } catch (error) {
            console.error('Error in homeScene.enter (Secondary Message):', error);
        }

    } catch (error) {
        console.error('Error in homeScene.enter:', error);
    }
});


homeScene.action(/category_(.+)/, async(ctx) => {
    const callbackData = ctx.match[1];
    const [categoryId, categoryName,categoryIcon] = callbackData.split('_');
  
    // Now, you have both the category ID and name separately
    console.log('Category ID:', categoryId);
    console.log('Category Name:', categoryName);
    // ctx.scene.enter('product',  { category: categoryId });
   await ctx.scene.enter('product', { category: { id: categoryId, name: categoryName , icon:categoryIcon} });
    
  });
homeScene.hears(match('Search'), async (ctx) => {
    await ctx.scene.enter("searchProduct")
})

homeScene.hears(match('cart'), async (ctx) => {
    await ctx.scene.enter("cart")
})
homeScene.hears(match('order'), async (ctx) => {
    await ctx.scene.enter("myOrderScene")
})
homeScene.hears('Admin 📊', async (ctx) => {
    await ctx.scene.enter("adminBaseScene")
})
homeScene.action('latest', async (ctx) => {
    await ctx.scene.enter('product', { sortBy: 'latest' });
    // await ctx.scene.leave();
});

homeScene.action('popular', async (ctx) => {
    await ctx.scene.enter('product', { sortBy: 'popular' });
    // await ctx.scene.leave();
});
homeScene.hears(match('Language'), async (ctx) => {
    const message = await ctx.reply('🌐 Please choose your language', Markup.inlineKeyboard([
        Markup.button.callback('🇬🇧 English ', 'set_lang:en'),
        Markup.button.callback('🇪🇹 አማርኛ', 'set_lang:am')
      ]))
    ctx.session.languageMessageId = message.message_id;
})
homeScene.leave(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            // Iterate over the cleanUpState array
            for (const message of ctx.session.cleanUpState) {
                // Check if the message exists before attempting to delete it
                if (message?.type === 'home') {
                    await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up messages in homeScene.leave:', error);
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
                    name: 'HomeScene',
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
                        name: 'HomeScene',
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

    // Reset the enterTime in the scene state
    ctx.scene.state.enterTime = null;

    // Leave the scene
    await ctx.scene.leave();
});



module.exports = {
    homeScene
}