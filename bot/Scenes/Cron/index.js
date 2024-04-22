const axios = require('axios');
const sharp = require('sharp');
const Product = require('../../Model/product');

async function cronSendProductToChannel(productId, product, isCart) {
    try {
        const formatTelegramMessage = (product) => {
            const { name, description, images, price, available, warranty, category, highlights } = product;
            const formattedHighlights = highlights?.map((highlight) => `${highlight}`).join(', ');
            const formattedButton = images.length === 1 ? '' : `\n\n[Buy](https://t.me/testecommerce12bot?start=chat_${productId}) `;

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

        const productIdString = productId.toString();
        const caption = `${formatTelegramMessage(product)}`;
        const paginationKeyboard = {
            inline_keyboard: [
                [{ text: 'Order 📔', url: `https://t.me/testecommerce12bot?start=chat_${productIdString}` }],
            ],
        };

        const channelId = -1002011345443;
        const images = product?.images.map(image => image.imageUrl);

        let mediaGroup = [];
        images.map((image, index) => {
            const mediaObject = {
                media: image,
                type: 'photo',
                caption: index === 0 ? caption : '',
                parse_mode: 'Markdown',
            };
            mediaGroup.push(mediaObject);
        });

        if (images?.length === 1) {
            const image = images[0];
            // const response = await axios.get(image, { responseType: 'arraybuffer' });
            // const imageBuffer = await sharp(response.data)
            //     .resize(200, 200)
            //     .toBuffer();
            console.log(images)
            const messageData = {
                chat_id: channelId,
                photo: image,
                caption: caption,
                // parse_mode: 'Markdown',
                reply_markup: JSON.stringify(paginationKeyboard),
            };
            try {
                const sentMessage = await axios.post(`https://api.telegram.org/bot6372866851:AAE3TheUZ4csxKrNjVK3MLppQuDnbw2vdaM/sendPhoto`, messageData);
                await Product.findByIdAndUpdate(product._id, { channelMessageId: sentMessage.message_id });
            } catch (error) {
                console.log(error)
            }

        } else if (images.length > 1) {
            const messageData = {
                chat_id: channelId,
                media: JSON.stringify(mediaGroup),
                reply_markup: JSON.stringify(paginationKeyboard),
            };

            const sentMessage = await axios.post(`https://api.telegram.org/bot6372866851:AAE3TheUZ4csxKrNjVK3MLppQuDnbw2vdaM/sendMediaGroup`, messageData);

            await Product.findByIdAndUpdate(product._id, { channelMessageId: sentMessage.message_id });
        } else if (product?.video?.videoUrl) {
            const messageData = {
                chat_id: channelId,
                video: product.video.videoUrl,
                supports_streaming: true,
                caption: caption,
                parse_mode: 'Markdown',
                reply_markup: JSON.stringify(paginationKeyboard),
            };

            const message = await axios.post(`https://api.telegram.org/bot6372866851:AAE3TheUZ4csxKrNjVK3MLppQuDnbw2vdaM/sendVideo`, messageData);
            await Product.findByIdAndUpdate(product._id, { channelMessageId: message.message_id });
        }
    } catch (error) {
        console.error('Error sending product to channel:', error);
        throw error;
    }
}

module.exports = { cronSendProductToChannel };