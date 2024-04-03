const { Markup } = require('telegraf');
const { Input } = require('telegraf');
const { sendProdcutSummary } = require('../../Templeat/summary');
const axios = require('axios');
const sharp = require('sharp');
const  Product =require( '../../Model/product');
module.exports = {
    sendProductToChannel: async function (ctx, productd, product, isCart) {
        const formatTelegramMessage = (product) => {
            const { name, description,images, price, available, warranty, category, highlights } = product;

            const formattedHighlights = highlights?.map((highlight) => `${highlight}`).join(', ');
          const formattedButton=images.length === 1?"":`\n\n[Buy](https://t.me/testecommerce12bot?start=chat_${productId}) `
           
        

            return `
${category?.icon} ${name} ${category?.icon}
✨ ${description}
💴 ${price} ETB
🚀 ${formattedHighlights} 
${formattedButton}
.
.
#${category?.name} ${category?.icon}


      `;
        };
        const productId = productd.toString()
        const caption = `${formatTelegramMessage(product)}`;
        const paginationKeyboard = Markup.inlineKeyboard([
            Markup.button.url('Order 📔', `https://t.me/testecommerce12bot?start=chat_${productId}`),
        ]);

        const channelId = -1002011345443;
        const images = product?.images.map(image => image.imageUrl);
     
        let mediaGroup=[]
        images.map((i,index)=>index==0?mediaGroup.push(            {
                  media: i,
                   type: 'photo',
                  caption: caption,
                  parse_mode: 'Markdown'
            //    parse_mode: 'MarkdownV2'
             },
            ):mediaGroup.push(            {
                media: i,
                type: 'photo',
                parse_mode: 'Markdown'
           },
          ))
      
        if (images?.length === 1) {
            // If there's only one image, send it with the order link in the caption
            const image = images[0];
            const response = await axios.get(image, { responseType: 'arraybuffer' });
            const imageBuffer = await sharp(response.data)
                .resize(200, 200)
                .toBuffer();

            // Send single photo with the caption containing the order link
            const sentMessage = await ctx.telegram.sendPhoto(
                channelId,
                { source: imageBuffer },
                {
                    caption: caption,
                    ...paginationKeyboard,
                },
               
            );

            // Store the sent message ID in the session
            // ctx.session.cleanUpState.push({
            //     id: sentMessage.message_id,
            //     type: 'channelpost',
            //     productId: productId,
            // });
            await Product.findByIdAndUpdate(product._id, {channelMessageId:  sentMessage.message_id });
        } else if(images.length > 1){
         
            const sentMessage = await ctx.telegram.sendMediaGroup(channelId, mediaGroup, {
             
                reply_markup: paginationKeyboard
            });
            
            let messagesaved;
            // Store the sent message IDs in the session
            sentMessage.forEach(async (message, index) => {
                // ctx.session.cleanUpState.push({
                //     id: message.message_id,
                //     type: 'channelpostGroup',
                //     productId: productId,
                // });
                
                if (index === 0) {
                    messagesaved = message.message_id;
                    await Product.findByIdAndUpdate(product._id, { channelMessageId: messagesaved });
                }
            });
         
           
        }
        else if(product?.video?.videoUrl){
         
            const message = await ctx.telegram.sendVideo(channelId, product.video.videoUrl, {
                supports_streaming: true,
                caption: caption,
                parse_mode: 'Markdown',
                ...paginationKeyboard,
            });
            // ctx.session.cleanUpState.push({
            //     id: message.message_id,
            //     type: 'channelpost',
            //     productId: productId,
            // });
            await Product.findByIdAndUpdate(product._id, {channelMessageId:  message.message_id });

           
        }
    }
}
