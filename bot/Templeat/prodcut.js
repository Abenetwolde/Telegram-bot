
const axios = require('axios');
const sharp = require('sharp');
const { Scenes, Markup, session, Input } = require("telegraf")

const { ObjectId } = require('mongodb');
const { getCart } = require('../Database/cartController');
const prodcut = require('../Services/prodcut');

module.exports = {
    displyProdcut: async function (ctx, producs, viewmore) {
        const userId = ctx.from.id
        const cart = await getCart(userId);
        for (const product of producs) {
            if (ctx.session.shouldContinueSending == false) {
                break;
            }
            const productId = product._id;

            const cartItem = cart.items.find((item) => item.product?._id.toString() === productId);

            if (cartItem) {
                product.quantity = cartItem.quantity;
            }

            // ctx.session.availableSizes[productId] = ['37', '46', '48', '67'];
            ctx.session.currentImageIndex[productId] = 0;
            ctx.session.viewMore[productId] = viewmore ? true : false;
            const messageInfo = await module.exports.sendProduct(ctx, productId, product);

            ctx.session.cleanUpState.push(messageInfo);

        }

    },

    sendProduct: async function (ctx, productId, product, iscart) {
        // console.log("reach", productId) 

        // console.log("reach prodcut", product)
        const formatTelegramMessage = (product) => {
            const { name, description, price, available, warranty, category, highlights, images, createdAt } = product;
            const fromatImage = product?.video?.videoUrl ? " " : ` 🖼️ Images: ${ctx.session.currentImageIndex[productId] + 1}/${images.length}`
            const formattedHighlights = highlights?.map((highlight) => ` ${highlight}`).join(',');
            const foooormatedhighrlight= formattedHighlights&&`🚀 ${formattedHighlights}`
            const formattedprice = product.quantity !== 0 && ctx.session.viewMore[productId] ?

                ` 
          
          💳 ${product.quantity}x${product.price}= ${product.quantity * product.price} ETB` : ''

           
            return `
         ${category?.icon} ${name} ${category?.icon}
         ✨ ${description}
         💴 ${price} ETB
         #${category?.name} ${category?.icon}
         ${foooormatedhighrlight}
         ${formattedprice}
           ---
         ${fromatImage}\n
        
        
            `;
        };
        let caption = '';
        tag =
            caption = ` ${product?.name}\n ▪️${product?.description}  \n ▪️${product?.price} ETB\n
       `
        let telegramMessage = formatTelegramMessage(product);

        if (!ctx.session.viewMore[productId] && caption.length > 50) {
            telegramMessage = telegramMessage.substring(0, 50) + '...';
        }
        // Check if the image for this product exists
        // if (!product?.images || !product?.images[ctx.session.currentImageIndex[productId].imageUrl]) {
        //     return;
        // }
        // Get the current image of this product from its images array using the current image productId stored in the session data
        const image = product?.images[ctx.session.currentImageIndex[productId]]?.imageUrl;
        // const response = await axios.get(image, { responseType: 'arraybuffer' });

        // console.log("imagesa............", image)
        if (ctx.session.cleanUpState && ctx.session.cleanUpState.find(message => message?.type === 'product' && message?.productId === productId)) {
            const productMessage = ctx.session.cleanUpState.find(message => message?.type === 'product' && message?.productId === productId);
            if (productMessage) {
                const messageId = productMessage.id;
                const viewMore = ctx.session.viewMore[productId];
                console.log("viewMore...........", viewMore)
                const quantity = product.quantity;
                console.log("quantity...........", product.quantity)
                const price = product.price;
                const currency = product.currency;

                let keyboard = [];
                let check = ctx.session.currentImageIndex[productId] < product.images.length
                console.log("check...................", check)

                if (quantity == 0 && product?.images.length > 1) {
                    keyboard.push([
                        Markup.button.callback('⬅️', `previous_${productId}`),
                        viewMore ? Markup.button.callback('🔽 View Less', `viewLess_${productId}`) : Markup.button.callback('View More', `viewMore_${productId}`),
                        Markup.button.callback('➡️', `next_${productId}`)
                    ]);
                } else if (quantity > 0 && product?.images.length == 1) {
                    keyboard.push([
                        // Markup.button.callback('⬅️', `previous_${productId}`),
                        viewMore ? Markup.button.callback('🔽 View Less', `viewLess_${productId}`) : Markup.button.callback('🔼 View More', `viewMore_${productId}`),
                        // Markup.button.callback('➡️', `next_${productId}`)
                    ]);
                } else if (quantity == 0 && product?.images.length == 1) {
                    keyboard.push([
                        // Markup.button.callback('⬅️', `previous_${productId}`),
                        viewMore ? Markup.button.callback('🔽 View Less', `viewLess_${productId}`) : Markup.button.callback('🔼 View More', `viewMore_${productId}`),
                        // Markup.button.callback('➡️', `next_${productId}`)
                    ]);
                }

                if (quantity > 0) {
                    keyboard.push([
                        Markup.button.callback('-', `removeQuantity_${productId}`),
                        Markup.button.callback(`${quantity}`, `quantity_${productId}`),
                        Markup.button.callback('+', `addQuantity_${productId}`)
                    ], [
                        Markup.button.callback('Go To Checkout', `Checkout`)
                    ]);
                } else if (viewMore) {
                    keyboard.push([Markup.button.callback('🛒 Buy', `buy_${productId}`)]);
                }
                else if (!viewMore&&product?.video?.videoUrl) {
                    keyboard.push([Markup.button.callback('🛒 Buy', `buy_${productId}`)]);
                }
                if (image) {
                    try {
                        await ctx.telegram.editMessageMedia(
                            ctx.chat.id,
                            messageId,
                            null,
                            {
                                type: 'photo',
                                media: image,
                                caption: telegramMessage
                            },
                            Markup.inlineKeyboard(keyboard)
                        )
                    } catch (error) {
                        if (error.response.error_code === 400 && error.response.description.includes('message is not modified')) {
                            console.log("Caught the 'message is not modified' error");
                        } else {
                            console.log("An unexpected error occurred: ", error);
                        }
                    }
                } else if (product?.video) {
                    try {
                        await ctx.telegram.editMessageMedia(
                            ctx.chat.id,
                            messageId,
                            null,
                            {
                                type: 'video',
                                media: product.video.videoUrl,
                                caption: telegramMessage
                            },
                            Markup.inlineKeyboard(keyboard)
                        )
                    } catch (error) {
                        if (error.response.error_code === 400 && error.response.description.includes('message is not modified')) {
                            console.log("Caught the 'message is not modified' error");
                        } else {
                            console.log("An unexpected error occurred: ", error);
                        }
                    }
                }

            }
        }

        else {


            try {
                if (image) {
                    const resizeimage = image
                    // console.log("imagebuferx............", resizeimage)
                    const response = await axios.get(resizeimage, { responseType: 'arraybuffer' });
                    const imageBuffer = await sharp(response.data)
                        .resize(200, 200)
                        .toBuffer();
                    // console.log("buffer............", imageBuffer)
                    const message = await ctx.replyWithPhoto({ source: imageBuffer }, {
                        caption: telegramMessage,
                        ...Markup.inlineKeyboard([
                            !product.quantity/*   === 0 */ ? [
                                ...(product.images.length !== 1 ? [Markup.button.callback('⬅️', `previous_${productId}`)] : []),

                                ctx.session.viewMore[productId] ? Markup.button.callback('🔽 View Less', `viewLess_${productId}`) : Markup.button.callback('View More', `viewMore_${productId}`),
                                ...(product.images.length !== 1 ? [Markup.button.callback('➡️', `next_${productId}`)] : []),
                                // Markup.button.callback('➡️', `next_${productId}`),
                                // ...(ctx.session.viewMore[productId] ? [Markup.button.callback('Buy', `buy_${productId}`)] : [])
                            ] : [],
                            ...(product.quantity > 0 ? [
                                [
                                    Markup.button.callback('-', `removeQuantity_${productId}`),
                                    Markup.button.callback(`${product.quantity}`, `quantity_${productId}`),
                                    Markup.button.callback('+', `addQuantity_${productId}`)
                                ],
                            
                                [
                                    Markup.button.callback('Go To Checkout', 'Checkout')
                                ]
                            ] : (ctx.session.viewMore[productId] ? [
                                [
                                    Markup.button.callback('🛒 Buy', `buy_${productId}`)
                                ]
                            ] : []))
                        ])
                    }

                    );
                    return {
                        id: message.message_id,
                        type: 'product',
                        productId: productId
                    };
                } else if (product.video) {
                    console.log("vedio...............", product.video.videoUrl);
                    const message = await ctx.replyWithVideo(Input.fromURLStream(product?.video?.videoUrl || ''),/* { source: product?.video?.videoUrl }, */ {
                        caption: telegramMessage,
                        supports_streaming: true,
                        ...Markup.inlineKeyboard([
                            !product.quantity/*   === 0 */ ? [
                              

                                ctx.session.viewMore[productId] ? Markup.button.callback('🔽 View Less', `viewLess_${productId}`) : Markup.button.callback('View More', `viewMore_${productId}`),

                                // Markup.button.callback('➡️', `next_${productId}`),
                                // ...(ctx.session.viewMore[productId] ? [Markup.button.callback('Buy', `buy_${productId}`)] : [])
                            ] : [],
                            ...(product.quantity > 0 ? [
                                [
                                    Markup.button.callback('-', `removeQuantity_${productId}`),
                                    Markup.button.callback(`${product.quantity}`, `quantity_${productId}`),
                                    Markup.button.callback('+', `addQuantity_${productId}`)
                                ],
     
                                [
                                    Markup.button.callback('Checkout', `checkout`)
                                ]
                            ] : (ctx.session.viewMore[productId] ? [
                                [
                                    Markup.button.callback('🛒 Buy', `buy_${productId}`)
                                ]
                            ] : []))
                        ])
                    }

                    );
                    return {
                        id: message.message_id,
                        type: 'product',
                        productId: productId
                    };
                } else {
                    ctx.reply("This product has no photo or video.");
                    return;
                }

            } catch (error) {
                console.log(error);
                throw error;
            }

        }

        // return await ctx.replyWithPhoto("https://th.bing.com/th/id/OIP.y7QJCUnLeQFDE2FXeXH_CwHaHa?pid=ImgDet&rs=1", /* Template.productButtons(categoryName, product, quantity) */)
    },

}