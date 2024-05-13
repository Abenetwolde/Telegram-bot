const { Scenes, Telegraf, Markup, session } = require("telegraf")
const axios = require('axios');
const { encode, decode, parse, stringify } = require('urlencode');
// user
const { t, match } = require('telegraf-i18next');
const { getAllCategories } = require("../Database/categoryController");
const homeScene = new Scenes.BaseScene('homeScene');

const UserKPI = require("../Model/KpiUser");
const User = require("../Model/user");
const KpiCategorys = require("../Model/KpiCategory");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");
const { createUser } = require("../Database/UserController");
const { checkUserToken } = require("../Utils/checkUserToken");
homeScene.enter(async (ctx) => {
    try {
        if (ctx.session.cleanUpState) {
            ctx.session.cleanUpState.forEach(async (message) => {
                if (message?.type === 'aboutme' /* || message?.type === 'pageNavigation' || message?.type === 'productKeyboard'|| message?.type === 'home'||message?.type === 'first' */) {
                    await ctx.telegram.deleteMessage(ctx.chat.id, message.id).catch((e) => ctx.reply(e.message));

                }
            });
        }
        await ctx.sendChatAction('typing');

        const userToken = await checkUserToken(`${ctx.from.id}`, ctx)
          console.log("userToken", userToken)

          if (userToken == null) {
            try {
         
              const response = await createUser({
                telegramid: ctx.from.id,
                first_name: ctx.from.first_name,
                last_name: ctx.from.last_name,
                username: ctx.from.username || null,
                is_bot: ctx.from.is_bot || false,
                language: ctx.session.locale
              });
              if (response) {
                console.log("response.data", response)
                ctx.session.userid = response.user._id.toString();
                ctx.session.token = response.token;
              }

            }
        
        catch (error) {
          if (error.message == 'User already exists!') {
            await ctx.reply("User already exists! ")
          }
          console.log(error.response)
        }
      }
        const enterTime = new Date();

        ctx.scene.state.enterTime = enterTime;

        ctx.session.cleanUpState = ctx.session.cleanUpState || [];

        const categories = await getAllCategories();

        const pairs = categories?.categories.reduce((result, value, index, array) => {
            if (index % 2 === 0)
                result.push(array.slice(index, index + 2));
            return result;
        }, []);
        let showkey = false

        const userId = ctx.from.id;
        // get the chat ID or username of the channel
        const chatId = '@takeitorle';
        // get the chat member information
        await ctx.telegram.getChatMember(chatId, userId)
            .then(user => {
                // check if the user is an admin or creator
                if (user.status === 'administrator' || user.status === 'creator') {

                    showkey = true
                }
            })
            .catch(error => {
                return false;

            });

        try {

            let keyboard = [
                [ctx.i18next.t('Search'), ctx.i18next.t('cart')],
                [ctx.i18next.t('order'), ctx.i18next.t('Language')],
                [ctx.i18next.t('aboutus'), ctx.i18next.t('invite'), ctx.i18next.t('feedback')]
            ];
            if (showkey) {

                keyboard[1].push('Admin 📊');
            }
            // const welcomeMessage = await ctx.reply(
            //     `👋 Hello ${ctx.session.token ? 'again, ' : ''}${ctx.from.first_name}!`,
            //     Markup.keyboard(keyboard).resize()
            // );
            const welcomeMessage = await ctx.reply(` 👋 ${ctx.i18next.t('gretting')} ${ctx.from.first_name} ${ctx.session.token ? ctx.i18next.t('hello') : ''}!`,

                Markup.keyboard(keyboard).resize()
            );

            // Save the welcome message ID to the cleanUpState array in the session data
            ctx.session.cleanUpState.push({ id: welcomeMessage.message_id, type: 'home' });
        } catch (error) {
            console.error('Error in homeScene.enter (first Message):', error);
        }

        // Display the secondary message
        try {
            const secondaryMessage = await ctx.reply(
                ctx.i18next.t('wellcomemessage'),
                Markup.inlineKeyboard(pairs.map(pair => pair.map(category => Markup.button.callback(`${category?.icon} ${category?.name}`, `category_${category?._id}_${category?.name}_${category?.icon}`))))
            )
            ctx.session.cleanUpState.push({ id: secondaryMessage.message_id, type: 'home' });
        } catch (error) {
            console.error('Error in homeScene.enter (Secondary Message):', error);
        }

    } catch (error) {
        console.error('Error in homeScene.enter:', error);
    }
});


homeScene.action(/category_(.+)/, async (ctx) => {
    const callbackData = ctx.match[1];
    const [categoryId, categoryName, categoryIcon] = callbackData.split('_');

    // Now, you have both the category ID and name separately
    console.log('Category ID:', categoryId);
    console.log('Category Name:', categoryName);



    const userId = ctx.from.id.toString()

await updateClicks(ctx,"category",categoryId)
    // if (!clickCount) {
    //     try {
    //         createclickCount = await new KpiCategorys({
    //             category: categoryId,
    //             clicks: [{
    //                 // date: today,
    //                 count: 1,
    //                 userId: String(userId)
    //             }]
    //         });
    //         await createclickCount.save()
    //         // console.log("clickCount1", clickCount);
    //     } catch (error) {
    //         console.log("error", error)
    //     }


    // } else {
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0); // Set to the beginning of the day
    //     const tomorrow = new Date(today);
    //     tomorrow.setDate(tomorrow.getDate() + 1);
    //     let clickCount1 = await KpiCategorys.findOne({
    //         category: categoryId,   clicks: {
    //             $elemMatch: { 
    //               userId: userId, 
    //                date: { $gte: today, $lt: tomorrow } // Filter clicks for today
    //              } 
    //           }
    //     });


    //     if (clickCount1!==null) {
    //         const todayClick = clickCount1.clicks.find(click => {
    //             // Ensure the date comparison is in UTC
    //             const clickDate = new Date(click.date);
    //             return click.userId === userId && clickDate >= today && clickDate < tomorrow;
    //         });
        
    //         if (todayClick) {
    //             todayClick.count++;
    //             await clickCount1.save();
    //             console.log("Count incremented successfully.");
    //         } else {
    //             console.log("No click found for today.");
    //         }
    //         // await clickCount1.clicks[0].count++;
            
    //     } else {
    //         let list = await KpiCategorys.findOne({
    //             category: categoryId
    //         });
  
    //          list.clicks.push({
    //              count: 1,
    //             userId: String(userId)
    //         });
    //         await list.save()
    //         console.log("clickCount......of>>perdate", list)
    //     }
    //     // await clickCount1.save()


        
    // }

    // await clickCount.save()
    // ctx.scene.enter('product',  { category: categoryId });
    await ctx.scene.enter('product', { category: { id: categoryId, name: categoryName, icon: categoryIcon } });
 
}); 
homeScene.hears(match('Search'), async (ctx) => {
    await ctx.scene.enter("searchProduct")
    await updateClicks(ctx,"home_scene","home_scene")
})

homeScene.hears(match('cart'), async (ctx) => {
    await ctx.scene.enter("cart")
    await updateClicks(ctx,"home_scene","home_scene")
})
homeScene.hears(match('order'), async (ctx) => {
    await ctx.scene.enter("myOrderScene")
    await updateClicks(ctx,"home_scene","home_scene")
})
homeScene.hears(match('contactus'), async (ctx) => {
    await ctx.reply('📥 Contact me \n ✍️ Support: @abman',)
})
homeScene.hears(match('feedback'), async (ctx) => {
    await ctx.scene.enter("feedback")
    await updateClicks(ctx,"home_scene","home_scene")
})
homeScene.hears(match('aboutus'), async (ctx) => {
    await ctx.scene.enter("aboutus")
    await updateClicks(ctx,"home_scene","home_scene")
})
const bot = new Telegraf("6372866851:AAE3TheUZ4csxKrNjVK3MLppQuDnbw2vdaM", {
    timeout: Infinity
});
homeScene.hears(match('invite'), async (ctx) => {
    let summary = ""
    const userLottery = await User.findOne({ telegramid: ctx.from.id })
    const lotteryNUmner = userLottery.lotteryNumbers.number.map((n => n)).join(",")
    if (lotteryNUmner > 0) {
        summary += `Here is yor lottery number:` + `<u>${lotteryNUmner}</u>\n`;

    } else {
        summary += "You haven't any lottery number yet\n"
    }
    const invitationnumber = userLottery.lotteryNumbers.invitedUsers
    summary += "You invite  " + `<u>${invitationnumber}</u>` + " people \n"



    await ctx.replyWithHTML(summary)
    bot.telegram.getMe().then((botInfo) => {
        const botUsername = botInfo.username;

        // Generate invitation link
        const inviteLink = `https://t.me/${botUsername}?start=invite_${ctx.from.id}`;
        let text = ' ውድ ደንበኛችን ስለ አጠቃቀሙ ገለፃ ከታች ያለውን ቅደም ተከተል ይከተሉ \n\n 1️⃣ በመጀመሪያ 🎁የእርሶ መጋበዣ ሊንክ የሚለውን ይጫኑ! \n 2️⃣ በመቀጠል Official ቻናላችንን ይቀላቀሉ። \n 3️⃣ Restart 🔁 የሚለውን Button ይጫኑ \n 4️⃣ በመቀጠል የእርሶ መጋበዣ ሊንክ ለጓደኛዎ ግሩፕ ወይም ቻናል ላይ ሼር ያድርጉ። \n 5️⃣ በናንተ መጋበዣ ሊንክ አንድ ሰው ሲጋብዙ 1 ነጥብ ያገኛሉ። \n 6️⃣ እርሶ የጋበዟቸው ሰዎች 10 ሰው ሲደርስ ወዲያውኑ የሎተሪ እጣ ቁጥር ይላክሎታል።\n እጣው በሳምንቱ ይወጣል ለባለ አሸናፊዎች የፈለጉትን የምግብ አይነት ከ Delivery ጋር ይደርሶታል\n\n '
        // Send invitation link with keyboard
        ctx.replyWithHTML(`Invite your friends using the by copy the link below:<code>${inviteLink}</code>`, Markup.inlineKeyboard([
            Markup.button.url('Invite', 't.me/share/url?url=' + encode(text + `👥 የእርስዎ ሪፈራል ሊንክ(referal link): ${inviteLink}`)),
        ]));
    });
    await updateClicks(ctx,"home_scene","invite")
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
    await updateClicks(ctx,"home_scene","home_scene")
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

        await updateSceneDuration(ctx, durationMs, "Home_Scene")
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