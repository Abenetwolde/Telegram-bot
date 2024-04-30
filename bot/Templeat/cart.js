
const axios = require('axios');
const sharp = require('sharp');
const { Scenes, Markup, session ,Input} = require("telegraf")
module.exports = {
     sendCartProduct: async function (ctx, productId, cart, iscart) {
        console.log("cart data...........................",cart.product.video);
        const formatTelegramMessage = (product) => {
            const { name, description, price, available, warranty, category, highlights, images, createdAt } = product;

            const formattedHighlights = highlights.map((highlight) => `${highlight}`).join(',');
          const formattedprice= product.quantity!==0?
          `   
          . 
          . 
           ${product.quantity}x${product.price}= ${product.quantity*product.price} ETB`:''
            
            return `
         ${category.icon} ${name} ${category.icon}
         ${description}
         💴 ${price} ETB
         #${category.name} ${category.icon}
         ${formattedHighlights}
         ${formattedprice}
        
        
            `;
        };
        let caption = '';
        caption+=`${cart?.product?.category?.icon} ${cart?.product?.name} ${cart?.product?.category?.icon} \n`
        caption+=`💴 ${cart?.product?.price} ETB\n`
        caption+=`.\n`
        caption+=`.\n`
        caption+= `${cart?.quantity} x ${cart?.product?.price} = ${cart?.quantity * cart?.product?.price} ETB`
        if (ctx.session?.viewMore&&!ctx.session?.viewMore[productId] && caption?.length > 100) {
            caption = caption.substring(0, 100) + '...';
        }
        const image  = await cart?.product?.images[0]?.imageUrl;
        console.log("cart image looks like in the cart.................",image)
        if (ctx.session.cleanUpState && ctx.session.cleanUpState.find(message => message?.type === 'cart' && message?.productId === productId)) {
            const messageId = ctx.session.cleanUpState.find(message => message?.type === 'cart' && message?.productId === productId).id;
            if(image){
                try {
                    await ctx.telegram.editMessageMedia(
                        ctx.chat.id,
                        messageId,
                        null,
                        {
                            type: 'photo',
                            media: image,
                            caption: caption
                        },
                        Markup.inlineKeyboard([
                          
                            ...(cart.quantity > 0 && [
                                [
                                    Markup.button.callback('-', `removeQuantity_${productId}`),
                                    Markup.button.callback(`${cart.quantity}`, `quantity_${productId}`),
                                    Markup.button.callback('+', `addQuantity_${productId}`)
                                ]
                            ] )
                        ])
                    ) 
                } catch (error) {
                    if (error.response.error_code === 400 && error.response.description.includes('message is not modified')) {
                        console.log("Caught the 'message is not modified' error");
                    } else {
                        console.log("An unexpected error occurred: ", error);
                    }
                }}
                else if (cart?.product?.video) {
                    try {
                        await ctx.telegram.editMessageMedia(
                            ctx.chat.id,
                            messageId,
                            null,
                            {
                                type: 'video',
                                media: cart.product.video.videoUrl,
                                caption: caption
                            },
                            Markup.inlineKeyboard([
                          
                                ...(cart.quantity > 0 && [
                                    [
                                        Markup.button.callback('-', `removeQuantity_${productId}`),
                                        Markup.button.callback(`${cart.quantity}`, `quantity_${productId}`),
                                        Markup.button.callback('+', `addQuantity_${productId}`)
                                    ]
                                ] )
                            ])
                        )
                    } catch (error) {
                        if (error.response.error_code === 400 && error.response.description.includes('message is not modified')) {
                            console.log("Caught the 'message is not modified' error");
                        } else {
                            console.log("An unexpected error occurred: ", error);
                        }
                    }

                }


         
        } else {
            if(image!==undefined){
          
                const resizeimage = image
                const response = await axios.get(resizeimage, { responseType: 'arraybuffer' });
                const imageBuffer = await sharp(response.data)
                    .resize(200, 200)
                    .toBuffer();
            const message=    await ctx.replyWithPhoto({ source: imageBuffer }, {
                    caption: caption,
                    ...Markup.inlineKeyboard([
        
                        ...(cart?.quantity > 0 && [
                            [
                                Markup.button.callback('-', `removeQuantity_${productId}`),
                                Markup.button.callback(`${cart.quantity}`, `quantity_${productId}`),      
                                Markup.button.callback('+', `addQuantity_${productId}`)
    
                            ]
                        ] )
                    ])
                }
        
                )
                return {
                    id: message.message_id,
                    type: 'cart',
                    productId:productId
                };
            }else if(cart?.product?.video){
                console.log("vedio ex,,,,,,,,,,,,,,,,,,,,,,,,,,,",cart?.product?.video)
                const message = await ctx.replyWithVideo(Input.fromURLStream( cart?.product?.video?.videoUrl || ''),/* { source: product?.video?.videoUrl }, */ {
                    caption: caption,
                    // thumb:"https://th.bing.com/th/id/OIP.O8X2cM_d8XTou4d3_YlbgAHaLH?rs=1&pid=ImgDetMain",
                    // supports_streaming: true,
                    ...Markup.inlineKeyboard([
        
                        ...(cart.quantity > 0 ? [
                            [
                                Markup.button.callback('-', `removeQuantity_${productId}`),
                                Markup.button.callback(`${cart.quantity}`, `quantity_${productId}`),      
                                Markup.button.callback('+', `addQuantity_${productId}`)
    
                            ]
                        ]:[] )
                    ])
                  
                }
            
                );
                return {
                    id: message.message_id,
                    type: 'cart',
                    productId: productId
                }; 
            }/* else{
                ctx.reply("This product doesn\'t have a picture.")
            } */
        
        }
    },

}