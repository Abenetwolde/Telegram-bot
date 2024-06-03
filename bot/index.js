
const { Telegraf, Markup, InputFile, Scene, session, WizardScene, Scenes } = require('telegraf');
const { i18next } = require('telegraf-i18next');
const cron = require('node-cron');
const sharp = require('sharp');
const { reply } = require('telegraf-i18next')
const { Redis } = require("@telegraf/session/redis");
const http = require('http');
const LocalSession = require('telegraf-session-local');
const axios = require('axios');
const fs = require('fs').promises;
require('dotenv').config();
const { t, match } = require('telegraf-i18next');
const { homeScene, productSceneTest, cart, informationCash, searchProduct, myOrderScene, addressOnline, selectePaymentType, noteScene, paymentScene, adminBaseScene, channelHandeler, feedback, aboutUs } = require('./Scenes/index.js');
const { checkUserToken } = require('./Utils/checkUserToken');
const { Mongo } = require("@telegraf/session/mongodb");
const { MongoClient } = require('mongodb');
const rateLimit = require('telegraf-ratelimit')
const { createUser, updateUserLanguage } = require('./Database/UserController.js');
const UserKPI = require("./Model/KpiUser");
const bot = new Telegraf("6372866851:AAE3TheUZ4csxKrNjVK3MLppQuDnbw2vdaM", {
  timeout: Infinity
});
require("dotenv").config();
const connectDatabase = require('./config/database.js');
const { getSingleProduct, getAllProducts } = require('./Database/productcontroller.js');
const User = require('./Model/user.js');
const { sendProductToChannel } = require('./Scenes/Admin/sendProduct.js');
const { cronSendProductToChannel } = require('./Scenes/Cron/index.js');
 
connectDatabase()
bot.use(i18next({
  debug: true,
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: ['en', 'am'],
  resources: {
    en: {
      translation: require('./locales/en.json')
    },
    am: {
      translation: require('./locales/am.json')
    }
  }
}));
const buttonsLimit = {
  window: 1000,
  limit: 1,
  onLimitExceeded: (ctx, next) => {
    if ('callback_query' in ctx.update)
      ctx.answerCbQuery('You`ve pressed buttons too oftern, wait.', true)
        .catch((err) => sendError(err, ctx))
  },
  keyGenerator: (ctx) => {
    return ctx.callbackQuery ? true : false
  }
}
bot.use(rateLimit(buttonsLimit))

const { Stage } = Scenes;
const stage = new Stage([homeScene, channelHandeler, searchProduct, productSceneTest, cart, myOrderScene, selectePaymentType, addressOnline, informationCash, noteScene, paymentScene, adminBaseScene, feedback, aboutUs])


// bot.use(session({ store }));
// bot.use(session());
// bot.use(i18n.middleware());


// const localSession = new LocalSession({
//   getSessionKey(ctx) {
//     const fromId = ctx.from?.id;
//     if (fromId) return String(fromId);
//   },
//   database: 'db1.json',
//   property: 'session',
//   storage: LocalSession.storageFileAsync,
//   format: {
//     serialize: (obj) => JSON.stringify(obj, null, 2),
//     deserialize: (str) => JSON.parse(str),
//   },
// });


// bot.use(localSession.middleware());
const mongoClient = new MongoClient('mongodb+srv://abnet:80110847@cluster0.hpovgrl.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to the MongoDB server
mongoClient.connect()
  .then(() => {
    console.log('MongoDB connected successfully');

    // Use the MongoDB client to initialize the Mongo store
    const store = Mongo({
      client: mongoClient,
      database: 'telegraf-bot',

    });


    bot.use(session({ store, getSessionKey: (ctx) => ctx.from?.id.toString(), }));
    // cron.schedule('*/300 * * * *', async () => {
    //   try {

    //     let lastProcessedIndex = /* ctx.session?.lastProcessedIndex || */ 0;
    //     const productsData = {
    //       page: 1,
    //       pageSize: 10,
    //     };

    //     const productsResult = await getAllProducts();
    //     const { products } = productsResult;


    //     // Define exponential backoff parameters
    //     let delay = 1000; // Initial delay (1 second)
    //     let success = false;

    //     while (!success) {
    //       try {
    //         // Attempt to send products to channel from the last processed index
    //         for (let i = lastProcessedIndex; i < products.length; i++) {
    //           const product = products[i];
    //           await cronSendProductToChannel(product._id, product);
    //           lastProcessedIndex = i;
    //           if (lastProcessedIndex >= products.length) {
    //             console.log('All products have been posted to the channel.');
    //             break; // Exit the loop if all products have been processed
    //           }
    //         }
    //         success = true; // Mark success if products are sent without errors
    //       } catch (error) {
    //         if (error.code === 429) {
    //           // If rate limit exceeded, wait for the specified delay and then retry
    //           await new Promise(resolve => setTimeout(resolve, delay));
    //           delay *= 2; // Double the delay for exponential backoff
    //         } else {
    //           // Handle other errors
    //           console.error("Error:", error);
    //           throw error; // Throw the error to stop the cron job
    //         }
    //       }
    //     }

    //     // Store the last processed index in the session
    //     ctx.session.lastProcessedIndex = lastProcessedIndex;

    //   } catch (error) {
    //     console.error("Error:", error);
    //     // Handle any uncaught errors
    //   }
    // });

    bot.use((ctx, next) => {
      // if (!ctx.session) {
      //   ctx.session = {};
      // }
      if (ctx.session?.locale) {
        ctx.i18next.changeLanguage(ctx.session.locale);
      }
      return next();
    });


    bot.use(stage.middleware())




    bot.use(async (ctx, next) => {
      // Save user start time to the context
      ctx.session.startTime = new Date().getTime();
      // Continue with the next middleware
      await next();
    });
    const calculateDuration = (startTime, endTime) => {
      return new Date(endTime) - new Date(startTime);
    };

    // Function to format duration in HH:MM:SS format
    const formatDuration = (durationMs) => {
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Function to calculate and format User KPI data
    const calculateAndFormatUserKPIData = (userKPI) => {
      // Initialize variables to track scene durations and total duration
      let totalDuration = 0;
      const sceneDurations = {};

      // Iterate over each scene entry in the user's KPI data
      userKPI.scene.forEach((scene) => {
        const sceneName = scene.name;
        const durationMs = calculateDuration(scene.enterTime, scene.leaveTime);
        totalDuration += durationMs;

        // Add scene duration to the sceneDurations object
        if (!sceneDurations[sceneName]) {
          sceneDurations[sceneName] = 0;
        }
        sceneDurations[sceneName] += durationMs;
      });

      // Format total duration
      const totalDurationFormatted = formatDuration(totalDuration);

      // Format scene durations
      const sceneDurationsFormatted = {};
      for (const sceneName in sceneDurations) {
        const durationMs = sceneDurations[sceneName];
        sceneDurationsFormatted[sceneName] = formatDuration(durationMs);
      }

      return { sceneDurations: sceneDurationsFormatted, totalDuration: totalDurationFormatted };
    };

    // Command handler to fetch and display user KPI data
    const kpiCommandHandler = async (ctx) => {
      try {
        // Fetch User KPI data for the current user
        const userKPI = await UserKPI.findOne({ telegramId: ctx.from.id });

        // If userKPI is found, calculate and format KPI data
        if (userKPI) {
          const { sceneDurations, totalDuration } = calculateAndFormatUserKPIData(userKPI);

          // Prepare response message with formatted KPI data
          let responseMessage = 'User KPI Data:\n\n';
          for (const sceneName in sceneDurations) {
            responseMessage += `${sceneName}: ${sceneDurations[sceneName]}\n`;
          }
          responseMessage += `\nTotal time spent on the bot today: ${totalDuration}`;

          // Send the response message
          await ctx.reply(responseMessage);
        } else {
          await ctx.reply('User KPI data not found.');
        }
      } catch (error) {
        console.error('Error in kpiCommandHandler:', error);
        await ctx.reply('An error occurred while fetching user KPI data.');
      }
    };




    bot.command('kpi', kpiCommandHandler);

    //   const checkLanguageMiddleware = async (ctx, next) => {
    //     // Check if the user came from a channel post
    //     const startCommand = ctx.message.text.split(' ');
    //     if (startCommand.length === 2 && startCommand[1].startsWith('chat_')) {
    //         const questionId = startCommand[1].replace('chat_', '');
    //         console.log("id from search scene MIDDLEWARE:", questionId);

    //         // Check if language is selected
    //         if (!ctx.session.locale) {
    //             // Prompt the user to choose a language
    //             const message = await ctx.reply('Please choose your language', Markup.inlineKeyboard([
    //                 Markup.button.callback('English', 'set_lang_channel:en'),
    //                 Markup.button.callback('አማርኛ', 'set_lang_channel:am')
    //             ]));
    //             ctx.session.languageMessageId = message.message_id;
    //             return; // Stop further execution until the user selects a language
    //         }
    //     }
    //     // Language is selected or not applicable, proceed to the next middleware or handler
    //     await next();
    // };

    // // Apply the middleware to the bot command
    // bot.start(checkLanguageMiddleware);
    //   // Apply the startMiddleware to all scenes



    bot.start(async (ctx) => {


      console.log("ctx.session.locale", ctx.session.locale)
      const startCommand = ctx.message.text.split(' ');
      if (startCommand.length === 2 && startCommand[1].startsWith('chat_')) {
        const questionId = startCommand[1].replace('chat_', '');
        console.log("id from search scene", questionId)

        console.log("if the user is select the langunage", ctx.session.locale)
        try {
          if (!ctx.session.locale) {
            return ctx.scene.enter("channelHandeler", { pid: questionId })
          }

          const response = await getSingleProduct(questionId);
          const product = JSON.stringify(response)

          if (product) {
            // product.quantity = typeof product.quantity === 'number' ? product.quantity : 0;
            const singleP = await JSON.parse(product)
            // Update the quantity based on the action
            await ctx.scene.enter('product', { product: singleP });

          } else {
            console.error('Product not found.');
            // Handle the case when the product is not found
          }


        } catch (error) {
          console.error('Error handling quantity action:', error);
        }

      } else if (startCommand.length === 2 && startCommand[1].startsWith('invite_')) {
        const channelId = -1002011345443;
        const userId = ctx.from.id
        const isMember = await bot.telegram.getChatMember(channelId, userId)
          .then((chatMember) => chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator')
          .catch((err) => {
            console.error('Error checking channel membership:', err);
            return false;
          });
        if (!isMember) {
          ctx.reply(
            "ctx.from.id,",
            Markup.inlineKeyboard([
              [Markup.button.url('📥 በመጀመሪያ የቴሌግራም ቻናላችንን መቀላቀል አለብዎ ', "https://t.me/takeitorle"),

              ],
              [Markup.button.callback('🔄 Restart', 'restart')]
            ])

          )
        } else {

          const telegramid = startCommand[1].replace('invite_', '');
          let user = await User.findOne({ telegramid: ctx.from.id });
          if (!user) {
            // If the user is new, create a new user record
            user = new User({
              telegramid: ctx.from.id,
              first_name: ctx.from.first_name,
              last_name: ctx.from.last_name,
              username: ctx.from.username || null,
              is_bot: ctx.from.is_bot || false,
              from: "INVITATION",
              language: ctx.session.locale
            });

          }
          if (telegramid && user.invitedBy == null) {
            user.invitedBy = telegramid;
            if (user.invitedBy) {
              const inviter = await User.findOne({ telegramid: user.invitedBy });

              if (inviter) {
                await User.findOneAndUpdate(
                  { telegramid: user.invitedBy },
                  {
                    $inc: { 'lotteryNumbers.invitedUsers': 1 },

                  },
                  { new: true, upsert: true }// Increment invitedUsers by 1
                );
              }
              ctx.session.userid = user._id.toString();
              // Generate lottery numbers (if applicable)
              const invitedUsersCount = inviter.lotteryNumbers.invitedUsers || 0;
              console.log(invitedUsersCount);
              if (invitedUsersCount > 0 && invitedUsersCount === 2/* invitedUsersCount % 10 === 0 */) {
                const lotteryNumber = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit number
                await inviter.lotteryNumbers.number.push(lotteryNumber);
                await ctx.telegram.sendMessage(user.invitedBy, `Congratulations! You've earned a lottery number: ${lotteryNumber}`);
              }
              // ctx.session.userid = user.userid.toString();
              await user.save()
              ctx.reply(`this is your telegram id ${telegramid}`)

              await inviter.save()

            }
          } else {
            ctx.reply("sorry the user is already invited ")
          }

          // Increment invited user count for the inviter (if applicable)


          await user.save()
          await ctx.scene.enter('homeScene');
        }

      } else {
        // try {
        //   if (ctx.session.cleanUpState) {
        //     ctx.session.cleanUpState.forEach(async (message) => {

        //       if (message?.type === 'product' || message?.type === 'pageNavigation' || message?.type === 'productKeyboard') {
        //         console.log("reach start.........")
        //         await ctx.telegram.deleteMessage(ctx.chat.id, message?.id).catch((e) => ctx.reply(e.message));

        //       }
        //     });
        //   }
        // } catch (error) {
        //   console.error("error while deleting message when the bot start", error)
        // }

        if (!ctx.session.locale) {
          const message = await ctx.reply(ctx.i18next.t('selectL'), Markup.inlineKeyboard([
            Markup.button.callback('🇬🇧 English ', 'set_lang:en'),
            Markup.button.callback('🇪🇹 አማርኛ', 'set_lang:am')
          ]))
          ctx.session.languageMessageId = message.message_id;
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

        } else {
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
              console.log("response.data", response)
              ctx.session.userid = response.user._id.toString();
              await ctx.reply(response.token)


              ctx.session.token = response.token;

            }
            catch (error) {
              if (error.message == 'User already exists!') {
                await ctx.reply("User already exists! ")
              }
              console.log(error.response)
            }
          }
          // Whether the user was just registered or is already registered, enter the home scene.
          await ctx.scene.enter('homeScene');
        }
      }
      //  ctx.replyWithPhoto("https://foodapi-mlp3.onrender.com//f94f106e-5419-48ab-80c2-bd6a39b5cc96.jpg")
      // 
    });
    bot.command('changelanguage', async (ctx) => {
      try {
        const message = await ctx.reply('🌐 Please choose your language', Markup.inlineKeyboard([
          Markup.button.callback('🇬🇧 English ', 'set_lang:en'),
          Markup.button.callback('🇪🇹 አማርኛ', 'set_lang:am')
        ]))
        ctx.session.languageMessageId = message.message_id;


      } catch (error) {
        console.log(error)
      }

    });
    bot.command('search', async (ctx) => {
      await ctx.scene.enter("searchProduct")
    })

    bot.command('cart', async (ctx) => {
      await ctx.scene.enter("cart")
    })
    bot.command('order', async (ctx) => {
      await ctx.scene.enter("myOrderScene")
    })
    bot.command('admin', async (ctx) => {
      await ctx.scene.enter("adminBaseScene")
    })
    bot.command('text', async (ctx) => {
      // Your logic here...

      // Example: Sending a message without link preview
      await ctx.reply('Check out this link: https://example.com', {
        disable_web_page_preview: true,
      });
    });
    bot.action(/set_lang:(.+)/, async (ctx) => {
      if (!ctx.session) {
        ctx.session = {}; // Initialize session if not exists
      }
      ctx.session.locale = ctx.match[1];

      ctx.i18next.changeLanguage(ctx.session.locale);
      if (ctx.session.languageMessageId) {
        await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.languageMessageId);
      }
      const updateResult = await updateUserLanguage(ctx.from.id, ctx.session.locale);

      if (updateResult.success) {
        console.log(updateResult.message);
      } else {
        console.error(updateResult.message);
      }
      if (ctx.scene) {
        await ctx.scene.enter('homeScene');
      } else {
        console.error('ctx.scene is not available.');
      }
    });
    bot.action(/set_lang_channel:(.+)/, async (ctx) => {
      if (!ctx.session) {
        ctx.session = {}; // Initialize session if not exists
      }
      ctx.session.locale = ctx.match[1];

      ctx.i18next.changeLanguage(ctx.session.locale);
      if (ctx.session.languageMessageId) {
        await ctx.telegram.deleteMessage(ctx.chat.id, ctx.session.languageMessageId);
      }
      const updateResult = await updateUserLanguage(ctx.from.id, ctx.session.locale);

      if (updateResult.success) {
        console.log(updateResult.message);
      } else {
        console.error(updateResult.message);
      }
      const startCommand = ctx.callbackQuery.message.text.split(' ');
      console.log("start cpmmand", startCommand)
      if (startCommand.length === 2 && startCommand[1].startsWith('chat_')) {
        const questionId = startCommand[1].replace('chat_', '');
        console.log("action language:", questionId);

        try {
          const response = await getSingleProduct(questionId);
          const product = JSON.stringify(response);

          if (product) {
            const singleP = await JSON.parse(product);
            await ctx.scene.enter('product', { product: singleP });
          } else {
            console.error('Product not found.');
            // Handle the case when the product is not found
          }
        } catch (error) {
          console.error('Error handling quantity action:', error);
        }
      }
    });

    bot.on("pre_checkout_query", async (ctx) => {
      await ctx.answerPreCheckoutQuery(true)

    })
    bot.action('restart', async (ctx) => {
      const channelId = -1002011345443;
      const userId = ctx.from.id
      const isMember = await bot.telegram.getChatMember(channelId, userId)
        .then((chatMember) => chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator')
        .catch((err) => {
          console.error('Error checking channel membership:', err);
          return false;
        });
      if (!isMember) {
        ctx.reply(
          "subscribe our telegram channel first",


        )
      }
      else {
        await ctx.scene.enter("homeScene")
      }
    });
    async function sendError(err, ctx) {
      const errorCode = err.response && err.response.error_code;
      let errorMessage = '';

      switch (errorCode) {
        case 400:
          errorMessage = 'Bad Request: The request was not understood or lacked required parameters.';
          break;
        case 403:
          errorMessage = 'Forbidden: The bot was blocked by the user.';
          break;
        case 404:
          errorMessage = 'Not Found: The requested resource could not be found.';
          break;
        case 409:
          errorMessage = 'Conflict: The request could not be completed due to a conflict with the current state of the resource.';
          break;
        case 429:
          errorMessage = 'Too Many Requests: The bot is sending too many requests to the Telegram servers.';
          break;
        case 500:
          errorMessage = 'Internal Server Error: An error occurred on the server.';
          break;
        default:
          errorMessage = 'An error occurred while processing your request.';
      }
      // console.log(err.toString())
      if (ctx != undefined) {
        if (err.code === 400) {
          return setTimeout(() => {
            ctx.answerCbQuery()
            ctx.scene.enter("homeScene")
          }, 500)
        } else if (err.code === 429) {
          return ctx.reply(
            'You`ve pressed buttons too often and were blocked by Telegram' +
            'Wait some minutes and try again'
          )
        }
        const adminChatId = '2126443079'
        bot.telegram.sendMessage(adminChatId, '[' + ctx.from.first_name + '](tg://user?id=' + ctx.from.id + ') has got an error.\nError text: ' + errorMessage, { parse_mode: 'markdown' })
      } else {
        bot.telegram.sendMessage(adminChatId, 'There`s an error:' + err.toString())
      }
    }

    bot.catch((err) => {
      sendError(err)
    })

    process.on('uncaughtException', (err) => {
      sendError(err)
    })
    // bot.use(async (ctx, next) => {
    //   const telegramid = ctx.from.id;
    //   const userSpentTime = await User.findOne({ telegramid });

    //   if (userSpentTime) {
    //     // Calculate the duration spent in milliseconds
    //     const currentTime = new Date().getTime();
    //     const duration = currentTime - ctx.session.startTime;

    //     // Update user spent time with current date
    //     const currentDate = new Date();
    //     const currentDay = currentDate.getDate();
    //     const currentMonth = currentDate.getMonth();
    //     const currentYear = currentDate.getFullYear();

    //     const spentTimeEntryIndex = userSpentTime.spentTime?.findIndex(entry => {
    //       const entryDate = new Date(entry.date);
    //       return entryDate.getDate() === currentDay && entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    //     });

    //     if (spentTimeEntryIndex !== -1) {
    //       // Update existing spent time entry
    //       userSpentTime?.spentTime[spentTimeEntryIndex].duration += duration; // Add duration for each interaction
    //     } else {
    //       // Create a new spent time entry for the current day
    //       userSpentTime.spentTime.push({ duration, date: currentDate });
    //     }

    //     // Save the updated user spent time to the database
    //     await userSpentTime.save();
    //   }

    //   // Continue with the next middleware
    //   await next();
    // });
  })


/* This code uses the getWebhookInfo method to check 
   if a webhook is set for your bot. If a webhook is set, it may cause conflicts with the getUpdates 
   method and result in the error message you are seeing. In this case, you should either remove the webhook or switch to using webhooks 
    instead of the getUpdates method to receive updates. */
bot.telegram.getWebhookInfo().then(info => {
  if (info.url) {
    console.log(`Webhook is set to ${info.url}, this may cause conflicts with getUpdates method`)
  } else {
    console.log('No webhook is set, getUpdates method should work fine')
  }
})
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
// bot.use(session({ defaultSession: () => ({ locale: 'en' }) }))

bot.telegram.setMyCommands([
  { command: 'start', description: 'Start The Bot' },
  { command: 'search', description: 'Search Foods' },
  { command: 'cart', description: 'Go to Cart' },
  { command: 'order', description: 'Go to My Orders' },
  { command: 'changelanguage', description: 'Language' },
  { command: 'admin', description: 'Admin 📊' }

  // { command: 'location', description: 'Location' }
]);



bot.command('mariya', async (ctx) => {
  const userId = ctx.message.from.id
  const orderid = 1
  try {
    const orderMessage = await ctx.replyWithPhoto(
      { url: "https://gagadget.com/media/cache/db/a4/dba452f0af5bbf105934a103c578a5b9.jpg" },
      {
        parse_mode: 'HTML',
        caption: "caption",


        ...Markup.inlineKeyboard([

          [Markup.button.callback("Cancel Order", `cancel_order:${orderid}`)]
        ]),
      }
    );
    // const res = await bot.telegram.sendMessage("355514342", 'Hey Maria, How are you?This is Lelasew, my Telegram is accidentally banned(idk what happen) you can reach me now at @abnetw see you!')
    console.log("res...........", res)
  } catch (err) {
    console.log('An error occurred:', err)
  }

})






const storeLocation = {
  latitude: 8.988419295555572,// Replace with the actual latitude of your store
  longitude: 38.770562304441114, // Replace with the actual longitude of your store
};


const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Function to convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Start command
bot.command('location', (ctx) => {
  ctx.reply('Please share your location:', Markup.keyboard([[Markup.button.locationRequest('Share Location')]]).resize());
});

bot.on('location', async (ctx) => {
  const userLocation = ctx.message.location;
  console.log(userLocation)
  const latitude = ctx.message.location.latitude;
  const longitude = ctx.message.location.longitude;
  const apiKey = '00e3d74bccb441b789b527912050f884';
  const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}+${longitude}&pretty=1`;


  try {
    const response = await axios.get(geocodingUrl);
    const firstResult = response.data.results[0]; // Get the first result

    if (firstResult) {
      const formattedAddress = firstResult.formatted;
      const country = firstResult.components.country;

      ctx.reply(`Location: ${formattedAddress}, Country: ${country}`);
    } else {
      ctx.reply('Location not found');
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    ctx.reply('Sorry, there was an error processing your location.');
  }
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    storeLocation.latitude,
    storeLocation.longitude
  );

  let price;
  if (distance < 5) {
    price = '$10 Birr';
  } else {
    price = '15 Birr';
  }
  // Function to estimate travel time based on average speed
  const estimateTravelTime = (distance, averageSpeed) => {
    // Assuming averageSpeed is in kilometers per hour
    const travelTimeInHours = distance / averageSpeed;
    const travelTimeInMinutes = travelTimeInHours * 60;
    return travelTimeInMinutes;
  };

  const averageSpeed = 60; // in kilometers per hour
  const travelTime = estimateTravelTime(distance, averageSpeed);
  ctx.reply(`Estimated travel time: ${travelTime.toFixed(2)} minutes`);
  console.log(`Distance: ${distance.toFixed(2)} km`);

  console.log(`Estimated travel time: ${travelTime.toFixed(2)} minutes`);

  ctx.reply(`Distance to the store: ${distance.toFixed(2)} km\nPrice: ${price}`);
});


// bot.on("successful_payment", async (ctx) => {
//   console.log("Success payment from   index File", ctx.message.successful_payment)
//   // ctx.session.cleanUpState = ctx.session.cleanUpState.map(ctx.session.cleanUpState, function (message) {         // Convert old cart message ID into text to prune
//   //     if (message.type === "invoice") {
//   //         message.type = "receipt"
//   //     }
//   //     return message
//   // })
//   const payment = ctx.message.successful_payment
//   const invoice = JSON.parse(payment.invoice_payload)
//   const paymentData = {
//       user:ctx.from.id,
//       order: ctx.scene.state.orderId,
//       total_amount: ctx.message.successful_payment.total_amount,
//       invoice_id: invoice.id,
//       telegram_payment_charge_id: ctx.message.successful_payment.telegram_payment_charge_id,

//   }
//   const paymentdata=JSON.parse(JSON.stringify(paymentData))
//   console.log("paymetn data", )
//   try {
//       const savedPayment = await createPayment(
//           paymentdata
//       );
//      const orderupdate={
//           orderId:ctx.scene.state.orderId,
//           phoneNo:payment.order_info.phone_number,
//           paymentStatus:"completed",
//           orderStatus:"pending",
//           location:ctx.session.orderInformation?.location
//       }
// const updatedOrder=await updateOrder(orderupdate)
// // console.log("orderupdate",orderinfo)
// let summary = '';
// let totalPrice = 0;
// summary += `Order Details:`
// // const updatedOrder = await updateOrderStatus(ctx.scene.state.orderId, 'completed');
// // console.log('Order status updated successfully:', updatedOrder.orderItems);
// for (const orderItem of updatedOrder.orderItems) {

//   summary += `🛒 ${orderItem.product.name}: ${orderItem.quantity} x ${orderItem.product.price} = ${orderItem.quantity * orderItem.product.price} ETB\n`;
//   totalPrice += orderItem.quantity * orderItem.product.price ;
//   // await ctx.reply(
//   //     `Order Details:
//   //                Product: ${orderItem.product.name}
//   //                Quantity: ${orderItem.quantity}
//   //                Total Price: ${orderItem.quantity * orderItem.product.price} ETB
//   //                Order ID: ${updatedOrder._id}`,
//   // );

//   await product.findByIdAndUpdate(orderItem.product._id, {
//       $inc: {   orderQuantity: +orderItem.quantity }
//   });
// }
// summary += `\nTotal Price: <u>${totalPrice} ETB</u>`;

// // Send a separate message about the product
// await ctx.reply(`Thank you for your order! The product will be delivered to you soon.`);
// await ctx.replyWithHTML(summary),
// ctx.session.orderInformation={}   
//   } catch (error) {
//       console.error('Error creating payment:', error);
//       // Handle error
//   }

// await ctx.scene.enter("homeScene")
// })

// Attach the link text to a message
bot.command('link', async (ctx) => {
  const linkText = '(\n\n[Buy](https://t.me/testecommerce12bot?start=chat_${productId})';
  const resizeimage = 'https://images.pexels.com/photos/5084674/pexels-photo-5084674.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  const response = await axios.get(resizeimage, { responseType: 'arraybuffer' });
  const imageBuffer = await sharp(response.data)
    .resize(200, 200)
    .toBuffer();
  await ctx.replyWithPhoto({ source: imageBuffer }, { caption: `[Buy](https://t.me/testecommerce12bot?start=chat_${123}`, parse_mode: 'Markdown' });
  // ctx.replyWithMarkdown(`[Buy](https://t.me/testecommerce12bot?start=chat_${123}`);
});


// bot.catch(async (err, ctx) => {
//   console.log(`Error while handling update ${ctx.update.update_id}:`, err)

//   const errorCode = err.response && err.response.error_code;
//   let errorMessage = '';

//   switch (errorCode) {
//     case 400:
//       errorMessage = 'Bad Request: The request was not understood or lacked required parameters.';
//       break;
//     case 403:
//       errorMessage = 'Forbidden: The bot was blocked by the user.';
//       break;
//     case 404:
//       errorMessage = 'Not Found: The requested resource could not be found.';
//       break;
//     case 409:
//       errorMessage = 'Conflict: The request could not be completed due to a conflict with the current state of the resource.';
//       break;
//     case 429:
//       errorMessage = 'Too Many Requests: The bot is sending too many requests to the Telegram servers.';
//       break;
//     case 500:
//       errorMessage = 'Internal Server Error: An error occurred on the server.';
//       break;
//     default:
//       errorMessage = 'An error occurred while processing your request.';
//   }
//   const adminChatId = '2126443079'
//   // Notify the user
//   await ctx.telegram.sendMessage(adminChatId, errorMessage).catch((err) => {
//     console.log('Failed to send error message to user:', err);
//   });
//   // if (ctx && ctx.chat && ctx.chat.id) {
//   await ctx.telegram.sendMessage(adminChatId, errorMessage).catch((err) => {
//     console.log('Failed to send error message to user:', err);
//   });
//   // }
// })
bot.command('time', async (ctx) => {
  const telegramid = ctx.from.id;
  const activities = await User.find({ telegramid }).sort({ timestamp: 1 });

  let totalTime = 0;
  for (let i = 1; i < activities.length; i++) {
    const prevTimestamp = activities[i - 1].timestamp;
    const currentTimestamp = activities[i].timestamp;
    const duration = currentTimestamp - prevTimestamp;
    totalTime += duration;
  }

  const hours = Math.floor(totalTime / 3600000);
  const minutes = Math.floor((totalTime % 3600000) / 60000);

  ctx.reply(`You've spent ${hours} hours and ${minutes} minutes on this bot! 🕒`);
});
bot.command('spendtimeperday', async (ctx) => {
  const telegramid = ctx.from.id;
  const userSpentTime = await User.findOne({ telegramid });

  if (userSpentTime) {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const spentTimeEntry = userSpentTime.spentTime.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === currentDay && entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    if (spentTimeEntry) {
      const durationInMinutes = spentTimeEntry.duration / (1000 * 60); // Convert milliseconds to minutes
      ctx.reply(`You have spent ${durationInMinutes.toFixed(2)} minutes today.`);
    } else {
      ctx.reply('No data available for today.');
    }
  } else {
    ctx.reply('No data available for you.');
  }
});

bot.command('testDevice', async (ctx) => {
  console.log('User is using a web platform', ctx.update.message);
  if (ctx.from && ctx.from.id) {
    const userAgent = ctx.update.message && ctx.update.message.headers && ctx.update.message.headers['user-agent'];
    if (userAgent) {
      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iOS')) {
        console.log('User is using a mobile device');
      } else if (userAgent.includes('Windows') || userAgent.includes('Macintosh') || userAgent.includes('Linux')) {
        console.log('User is using a desktop device');
      } else {
        console.log('User is using a web platform');
      }
    } else {
      console.log('User agent information not available');
    }
  } else {
    console.log('User information not available');
  }

  // Your bot's start command logic here
  ctx.reply('Welcome to the bot!');
});

process.once("SIGINT", () => bot.stop("SIGINT"))
process.once("SIGTERM", () => bot.stop("SIGTERM"))


// http.createServer(/* bot.webhookCallback('/my-secret-path') */).listen(3000);

// module.exports = async (req, res) => {
//   try {
//     await bot.handleUpdate(req.body, res);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send({ error: err.message });
//   }
// };


// bot.launch({
//   dropPendingUpdates: true, polling: {
//     timeout: 30,
//     limit: 100,
//   },
// })

const launch = async () => {
  try {
    await bot.launch({
      dropPendingUpdates: true,
      polling: {
        timeout: 30,
        limit: 100,
      },
    });
    // bot.launch({
    //   webhook: {
    //     domain: 'https://telegrambot-iytz.onrender.com/',
    //     hookPath: '/my-secret-path',
    //   },
    // });
    console.log('Bot is running!');
  } catch (e) {
    console.error(`Couldn't connect to Telegram - ${e.message}; trying again in 5 seconds...`);

    // Wait for 5 seconds before attempting to reconnect
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Retry launching the bot
    await launch();
  }
};
try {


  // bot.launch({
  //   webhook: {
  //     domain: 'https://telegrambot-iytz.onrender.com/',
  //     hookPath: '/my-secret-path',
  //   },
  // });
  // console.log('Bot is running!');
  // http.createServer(bot.webhookCallback('/my-secret-path')).listen(3000);



} catch (e) {
  console.error(`Couldn't connect to Telegram - ${e.message}; trying again in 5 seconds...`);

  // Wait for 5 seconds before attempting to reconnect
  new Promise((resolve) => setTimeout(resolve, 5000));



}
launch();


