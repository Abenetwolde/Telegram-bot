const { Scenes, Markup } = require("telegraf");
const UserKPI=require("../Model/KpiUser");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
const { updateClicks } = require("../Utils/calculateClicks");
const informationCash = new Scenes.WizardScene(

  "informationCash",
  (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    ctx.reply(
      ctx.i18next.t("phoneask"),
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
     
      // User shared contact
      const phoneNumber = ctx.message.contact.phone_number;
      ctx.session.orderInformation = { ...ctx.session.orderInformation, phoneNo:phoneNumber };

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
     ctx.i18next.t("locationpromt"), Markup.keyboard([
        ["❌ Cancel"]

      ]).resize()
    );
    // Check if the user shared their contact



    return ctx.wizard.next();
  },
  async (ctx) => {

    const text=ctx.message.text
    if (ctx.message.text) {
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
    
      await updateClicks(ctx,"infromationcash","infromationcash")
          
      await updateClicks(ctx,"infromationcash","infromationcash")
      // Calculate the duration when leaving the scene
      const leaveTime = new Date();
      const enterTime = ctx.scene.state.enterTime;
      const durationMs = new Date(leaveTime - enterTime);
      // Convert milliseconds to minutes
      await updateSceneDuration(ctx, durationMs, "InfromationForCashPayment_Scene")
  } catch (error) {
      console.error('Error saving UserKPI in homeScene.leave:', error);
  }
    return ctx.scene.enter("NOTE_SCENE");
  },

);
function validatePhoneNumber(phoneNumber) {
  const phoneNumberRegex = /^(0|\+251)\d{9}$/; // Match either starts with 0 or +251 followed by 9 digits
  return phoneNumberRegex.test(phoneNumber);
}
module.exports = {
  informationCash
};
