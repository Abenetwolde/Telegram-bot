const { Scenes, Markup } = require("telegraf");
const UserKPI=require("../Model/KpiUser");
const informationCash = new Scenes.WizardScene(

  "informationCash",
  (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.reply(
      "To proceed with the order, we need some information. 📱 Please share your phone number.",
      Markup.keyboard([
        Markup.button.contactRequest("📲 Share Contact"),
        "❌ Cancel"

      ]).resize()
    );
    return ctx.wizard.next();
  },
  async(ctx) => {
   const text= ctx.message?.text;
    if (text === "❌ Cancel" || text === "/start") {
      return ctx.scene.enter("cart")
  }
    if (ctx.message.contact) {
      console.log("share contact....", ctx.message.contact);
      // User shared contact
      const phoneNumber = ctx.message.contact.phone_number;
      console.log("validatePhoneNumber(phoneNumber)",validatePhoneNumber(phoneNumber))
    
      ctx.session.orderInformation = { ...ctx.session.orderInformation, phoneNo:phoneNumber };
      console.log(" ctx.session.orderInformation.phoneNumber)", ctx.session.orderInformation.phoneNumber)
      // if( ctx.session.orderInformation.phoneNumber) return ctx.wizard.next()

   

    } else {
      // User manually entered phone number
      const phoneNumber = ctx.message.text;
      if (validatePhoneNumber(phoneNumber)) {
        ctx.session.orderInformation = { ...ctx.session.orderInformation, phoneNumber };
      } else {
        ctx.reply("Invalid phone number format. Please enter a valid phone number starting with 0 or +251, followed by 9 digits.");
         return ctx.scene.reenter(); // Re-enter the same step
      }

    }
    ctx.reply(
      "Great! Now, please provide your📍location or send a Google Maps link.", Markup.keyboard([
        ["❌ Cancel"]

      ]).resize()
    );
    // Check if the user shared their contact



    return ctx.wizard.next();
  },
  async (ctx) => {

    const text=ctx.message.text
    if (ctx.message.text) {
      console.log("share location....", ctx.message.text);
      // User shared location
      if (text === "❌ Cancel" || text === "/start") {
        return ctx.scene.enter("cart")
    }
      const location = ctx.message.text
      ctx.session.orderInformation = {
        ...ctx.session.orderInformation,
        location: location,
      };
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
                  name: 'CashInfo',
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
                      name: 'CashInfo',
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
    return ctx.scene.enter("NOTE_SCENE");
  },
  // (ctx) => {
  //   return ctx.scene.enter("NOTE_SCENE");
  // }
);
function validatePhoneNumber(phoneNumber) {
  const phoneNumberRegex = /^(0|\+251)\d{9}$/; // Match either starts with 0 or +251 followed by 9 digits
  return phoneNumberRegex.test(phoneNumber);
}
module.exports = {
  informationCash
};
