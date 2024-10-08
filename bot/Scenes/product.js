// Product scene
const { Scenes, Markup, session } = require("telegraf")
const axios = require('axios');
const sharp = require('sharp');
const { getProdcuts, getProducts } = require("../Services/prodcut");
const { displyProdcut, sendProduct } = require("../Templeat/prodcut");
const { createCart, updateCartItemQuantity, removeItemFromCart, DecreaseCartQuantity } = require("../Database/cartController");
const Product = require("../Model/product");
const prodcut = require("../Services/prodcut");
const pageSize = 6;
const apiUrl = 'http://localhost:5000';
const UserKPI=require("../Model/KpiUser");
const { match } = require("telegraf-i18next");
const KpiProducts = require("../Model/KpiProduct");
const { updateClicks } = require("../Utils/calculateClicks");
const { updateSceneDuration } = require("../Utils/calculateTimeSpent");
// const apiUrl = 'https://backend-vg1d.onrender.com';
const productSceneTest = new Scenes.BaseScene('product');
productSceneTest.enter(async (ctx) => {
    const enterTime = new Date();
    ctx.scene.state.enterTime = enterTime;
    const category = ctx.scene.state.category;
    const product = ctx.scene.state.product;
    const sortBy = ctx.scene.state.sortBy;
    ctx.session.shouldContinueSending = true;
  
    ctx.session.cleanUpState = [];
    ctx.session.currentImageIndex = {};
    // Initialize the viewMore object in the session data
    ctx.session.viewMore = {};
    ctx.session.availableSizes = {}
    // Initialize the quantity object in the session data
    ctx.session.quantity = {};
    ctx.session.currentPage = 1;
    ctx.session.products = []

    if (category && category.name) {
        replyText = `You are now viewing our selection of ${category?.name}${category?.icon} Items.`;
    } else if (sortBy) {
        replyText = `You are now viewing our products sorted by ${sortBy}.`;
    }
    // console.log("product single from product scene", product)
    const productsArray = Array.isArray(product) ? product : [product];
    const simplifiedProducts = productsArray.map(product => ({
        ...product,
         quantity: 0,
        availableSizes: ['37', '46', '48', '67']

    }));
 
    await ctx.sendChatAction('typing');

    // console.log("prodcutKeuboard......................", ctx.session.cleanUpState)


    ctx.session.products = simplifiedProducts;
    const viewmore=true
    product ? await displyProdcut(ctx, simplifiedProducts,viewmore) : await sendPage(ctx)   // await sendPage(ctx)
});

productSceneTest.action('Previous', async (ctx) => {
    if (ctx.session.currentPage > 0) {
        ctx.session.currentPage--;
        await sendPage(ctx);

        await updateClicks(ctx,"product","product")
    }
});
productSceneTest.action('Next', async (ctx) => {
    if ((ctx.session.currentPage) * pageSize < ctx.session.totalNumberProducts) {
        ctx.session.currentPage++;
        await sendPage(ctx);
        await updateClicks(ctx,"product","product")
    }
});

productSceneTest.hears(match('cart'), async (ctx) => {

    
    await ctx.scene.enter('cart');
    await updateClicks(ctx,"product","product")
});
productSceneTest.action('Home', async (ctx) => {
    try {
       
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ctx.scene.enter('homeScene');
    } catch (error) {
        await ctx.reply(error)

    }
    await updateClicks(ctx,"product","product")
    ctx.session.shouldContinueSending = false

});

productSceneTest.hears(match('Home'), async (ctx) => {
    try {
        try {
            if (ctx.session.cleanUpState) {
                ctx.session.cleanUpState.forEach(async (message) => {
                    if (message?.type === 'product' || message?.type === 'pageNavigation' || message?.type === 'productKeyboard'/* && message.type === 'summary' */) {
                        try {
                            await ctx.telegram.deleteMessage(ctx.chat.id, message.id);
                        }
                        catch (error) {
                            console.log(error)
                        }

                    }

                });
            }
        } catch (error) {
            ctx.reply(error)
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ctx.scene.enter('homeScene');
        await updateClicks(ctx,"product","product")
    } catch (error) {
        await ctx.reply(error)

    }
    ctx.session.shouldContinueSending = false

});

productSceneTest.action('Checkout', async (ctx) => {
    // await ctx.scene.leave();
    // ctx.session.shouldContinueSending = false

    // await new Promise(resolve => setTimeout(resolve, 1000));
    await ctx.scene.enter('cart');
    await updateClicks(ctx,"product","product")

});
productSceneTest.action(/size_(.+)_([^_]+)/, async (ctx) => {
    const productId = ctx.match[1];
    const size = ctx.match[2];

    // Find the product in the session
    const productIndex = ctx.session.products.findIndex((p) => p._id === productId);
    if (productIndex === -1) {
        // Product not found, handle accordingly
        return;
    }

    let product = ctx.session.products[productIndex];

    // Check if the selected size is the same as the current selectedSize
    if (product.selectedSize === size) {
        // If the selected size is the same, deselect it
        product.selectedSize = null;
    } else {
        // If a different size is selected, update the selectedSize
        product.selectedSize = size;
    }
    console.log("prodcut update........", product,)
    // Edit the button to add or remove a check mark
    const newMarkup = ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
        row.map(button => button.callback_data === ctx.callbackQuery.data ? { ...button, text: `${size}${size === product.selectedSize ? '✅' : ''}` } : button)
    );

    ctx.editMessageReplyMarkup({ inline_keyboard: newMarkup });

    // Call sendProduct to update the product message
    sendProduct(ctx, productId, product);
});


// When the user clicks on a "Next" inline button, update the current image productId for that product and send an updated message using the sendProduct function
productSceneTest.action(/next_(.+)/, async(ctx) => {
    // console.log(ctx.session.currentImageIndex)
    const productId = ctx.match[1];
    const products = ctx.session.products;
    const product = products?.filter((p) => p._id == productId)

    ctx.session.currentImageIndex[productId]++;
    if (ctx.session.currentImageIndex[productId] >=product[0].images.length) {
         ctx.session.currentImageIndex[productId] = 0;
        // return
    }
   await sendProduct(ctx, productId, product[0]);
   await updateClicks(ctx,"product",productId)
});

// When the user clicks on a "Previous" inline button, update the current image productId for that product and send an updated message using the sendProduct function
productSceneTest.action(/previous_(.+)/, async(ctx) => {
    console.log(ctx.session.currentImageIndex)
    const productId = ctx.match[1];

    const products = ctx.session.products;
    const product = products.filter((p) => p._id == productId)

    // ctx.session.currentImageIndex[productId]--;
    if (product[0].images.length > 1) {
        ctx.session.currentImageIndex[productId]--;
        if (ctx.session.currentImageIndex[productId] < 0) {
            ctx.session.currentImageIndex[productId] = product[0].images.length - 1;
        }

    }

    sendProduct(ctx, productId, product[0]);

    await updateClicks(ctx,"product",productId)
});

productSceneTest.action(/viewMore_(.+)/,async (ctx) => {
    // console.log("reach...viewmore")
    const productId = ctx.match[1];
    ctx.session.viewMore[productId] = true;
    const products = ctx.session.products;
    const product = products.filter((p) => p._id == productId)
    // console.log("is prodcut found", ctx.session)
    sendProduct(ctx, productId, product[0]);
    const userId = ctx.from.id
  
    await updateClicks(ctx,"product",productId)
});

productSceneTest.action(/viewLess_(.+)/, async(ctx) => {
    const productId = ctx.match[1];
    ctx.session.viewMore[productId] = false;
    // ctx.session.quantity[productId] = 0;
    const products = ctx.session.products;
    const product = products.filter((p) => p._id == productId)
    product[0].quantity[productId] = 0;
    sendProduct(ctx, productId, product[0]);
    const userId = ctx.from.id
    let clickCount = await KpiProducts.findOne({
     product: productId,
      
    });
    await updateClicks(ctx,"product",productId)
});

productSceneTest.action(/buy_(.+)/, async (ctx) => {
    const productId = ctx.match[1];

    try {
        // Assuming userId is available in the context (you need to handle user authentication)
        const userId = ctx.from.id;

        // Call createCartItem to add the product to the cart
        const cartItem = await createCart(userId, productId, 1);
        const cartJson = JSON.stringify(cartItem);
        const CartData = await JSON.parse(cartJson)
        const cartArg = { ...CartData.product, quantity: CartData.quantity };
        // console.log("cartItem..........................", cartArg)
        // Send the product information to the user
        sendProduct(ctx, productId, cartArg);
        // const userId = ctx.from.id
   
        // Send a confirmation message
        //   await ctx.answerCbQuery(`You have added ${cartItem.quantity} of product ${cartItem.product.name} to your cart.`);
    } catch (error) {
        console.error('Error handling buy action:', error);
        await ctx.answerCbQuery('Failed to add the product to your cart.');
    }
    await updateClicks(ctx,"product",productId)
});
productSceneTest.action(/addQuantity_(.+)/, async (ctx) => {
    const productId = ctx.match[1];

    try {
        // Assuming userId is available in the context (you need to handle user authentication)
        const userId = ctx.from.id;

        // Call updateCartItemQuantity to add the product to the cart
        const updatedCartItem = await updateCartItemQuantity(userId, productId, 1);

        // Parse the returned JSON string to access the data
        const { product, quantity } = JSON.parse(updatedCartItem);

        // Fetch product data
        // const productData = await Product.findById(product._id).populate('category');
        const productArg = { ...product, quantity };
// console.log("productArg", productArg)        // Send the product information to the user
        sendProduct(ctx, productId, productArg);
        // const userId = ctx.from.id
        await updateClicks(ctx,"product",productId)
        // Send a confirmation message
        await ctx.answerCbQuery(`You have added ${quantity} of product ${productArg.name} to your cart.`);
    } catch (error) {
        console.error('Error handling addQuantity action:', error);
        await ctx.answerCbQuery('Failed to update the quantity.');
    }
});



productSceneTest.action(/removeQuantity_(.+)/, async (ctx) => {
    const productId = ctx.match[1];

    try {
        const updatedCartItem = await DecreaseCartQuantity(ctx.from.id, productId);
        const { product, quantity,cartId } = JSON.parse(updatedCartItem);
        const productArg = { ...product, quantity };
        if (productArg.quantity === 0) {
            await ctx.answerCbQuery(`You have removed ${productArg.name} of product from your cart.`);
            await removeItemFromCart(cartId,productId)
            sendProduct(ctx, productId, productArg);
            await ctx.answerCbQuery(`You have removed ${productArg.quantity} of product ${productArg.name} from your cart.`);
            return;
        }
        
        // console.log("removed item...",productArg)
        sendProduct(ctx, productId, productArg);
        await ctx.answerCbQuery(`You have removed ${productArg.quantity} of product ${productArg.name} from your cart.`);
        await updateClicks(ctx,"product",productId)
        // // console.log("removed item...",productArg)
        // sendProduct(ctx, productId, productArg);
        // await ctx.answerCbQuery(`You have removed ${productArg.quantity} of product ${productArg.name} from your cart.`);
    } catch (error) {
        console.error('Error handling removeQuantity action:', error);
        await ctx.answerCbQuery('Failed to update the quantity.');
    }
});
productSceneTest.action(/remove_(.+)/, async (ctx) => {
    const productId = ctx.match[1];

    try {
        const userId = ctx.from.id;
        const updatedCart = await updateCartItemQuantity(userId, productId, -1);
        const productData = await Product.findById(productId).populate("category");
        const productArg = { ...productData.toObject(), quantity: updatedCart?.items?.find(item => item.product.equals(productId)).quantity };
        if (productArg.quantity === 0) {
            await ctx.answerCbQuery(`You have removed ${productArg.name} of product from your cart.`);
            await removeItemFromCart(userId, productId)
        }
        sendProduct(ctx, productId, productArg);
        await updateClicks(ctx,"product",productId)
        await ctx.answerCbQuery(`You have removed ${productArg.quantity} of product ${productArg.name} from your cart.`);
    } catch (error) {
        console.error('Error handling removeQuantity action:', error);
        await ctx.answerCbQuery('Failed to update the quantity.');
    }
});


async function sendPage(ctx) {
    if (ctx.session.cleanUpState) {
        ctx.session.cleanUpState.forEach(async (message) => {
            if (message?.type === 'product' || message?.type === 'pageNavigation' || message?.type === 'productKeyboard'|| message?.type === 'home'||message?.type === 'first') {
                await ctx.telegram.deleteMessage(ctx.chat.id, message.id).catch((e) => ctx.reply(e.message));

            }
        });
    }
    ctx.session.cleanUpState = []
    let replyText = `You are now viewing our products.`; 
    const category = ctx.scene.state.category;
    const product = ctx.scene.state.product;
    const sortBy = ctx.scene.state.sortBy;
    if (category && category.name) {
        replyText = `You are now viewing our selection of <b>${category.name}</b> ${category.icon} Items.`;
    } else if (sortBy) {
        replyText = `You are now viewing our products sorted by ${sortBy}.`;
    }
    const prodcutKeuboard = await ctx.reply(
        replyText,
        { parse_mode: 'HTML',
      ... Markup.keyboard([
            [ctx.i18next.t("Home"), ctx.i18next.t("cart")],
        ]).resize()
    } // Specify parse_mode for the message text
     
    );
    await ctx.session.cleanUpState.push({ id: prodcutKeuboard.message_id, type: 'productKeyboard' })
   
    try {
        const response = await getProducts(ctx, {pageSize})
        const products = JSON.parse(response);
        if (!products || !products.products || !Array.isArray(products.products)) {
            console.error('Error: Unable to fetch valid products data from the response.');
            console.log('Response:', products);
        } else {
            if(products.products.length===0)
            {
                if (ctx.session.cleanUpState) {
                    ctx.session.cleanUpState.forEach(async (message) => {
                        if (message?.type === 'productKeyboard') {
                            await ctx.telegram.deleteMessage(ctx.chat.id, message.id).catch((e) => ctx.reply(e.message));
            
                        }
                    });
                }
                const noprodut=await ctx.reply("There is no product ☹️",Markup.inlineKeyboard([
                   Markup.button.callback('Go Back','Home')
                ]))
                 await ctx.session.cleanUpState.push({
                    id: noprodut.message_id,
                    type: 'product'  
                })
                return;
            }
            const productsData = products?.products;
            console.log("Product data:", productsData);
            const simplifiedProducts = await productsData.map(product => ({
                ...product,
                quantity: 0,
                // availableSizes: ['37', '46', '48', '67']
            }));

            ctx.session.products = simplifiedProducts;
            ctx.session.page = products.page;
            ctx.session.totalPages = products.totalPages;
            ctx.session.totalNumberProducts = products.count;

            await displyProdcut(ctx, productsData);
            await sendPageNavigation(ctx);
        }
    } catch (error) {
        console.error('Error parsing products JSON:', error);
    }

}

productSceneTest.leave(async (ctx) => {
    // console.log("ctx.session.cleanUpState =>", ctx.session.cleanUpState)
    try {
        ctx.session.product=[]
        if (ctx.session.cleanUpState) {
            ctx.session.cleanUpState.forEach(async (message) => {
                console.log("%c called deleteing when its leave", "color: red;")
                if (message?.type === 'product' || message?.type === 'pageNavigation' || message?.type === 'productKeyboard') {
                    try {
                        await ctx.telegram.deleteMessage(ctx.chat.id, message?.id);
                    } catch (error) {
                        console.log("error while deleting.......", error)
                    }

                }


            });
        }


    } catch (error) {

    }
    ctx.session.products = [];
    try {
        // Calculate the duration when leaving the scene
        const leaveTime = new Date();
        const enterTime = ctx.scene.state.enterTime;
        const durationMs = new Date(leaveTime - enterTime);
        // Convert milliseconds to minutes

    
  await updateSceneDuration(ctx, durationMs, 'Product_Scene');
    } catch (error) {
        console.error('Error saving UserKPI in homeScene.leave:', error);
    }
    await ctx.scene.leave();
})
async function sendPageNavigation(ctx) {
    let totalPages = ctx.session.totalPages
    let pageSizeNumber = ctx.session.page
    // console.log("pageSizeNumber", pageSizeNumber)
    // const response = await axios.get(`${apiUrl}/api/getproducts?page=${ctx.session.currentPage}&pageSize=${pageSize}`);
    // console.log("ctx.session.currentPage", ctx.session.currentPage + 1)
    // console.log("response.data.totalPages", Math.floor(response / pageSize))
    const perPage = 6
    const previousButton = Markup.button.callback('Previous', 'Previous');
    const nextButton = Markup.button.callback('Next', 'Next');
    let pageSize = Markup.button.callback(`${pageSizeNumber}/${totalPages}`, 'as');
    let buttons;
    if (!ctx.session.shouldContinueSending) {
        buttons = []
    }
    if (ctx.session.totalNumberProducts > perPage && ctx.session.currentPage === 1) {
        buttons = [pageSize, nextButton];
    }
    else if (ctx.session.totalNumberProducts <= perPage && ctx.session.currentPage === 1) {
        buttons = [Markup.button.callback('No More Product', 'no')]
    }

    else if (ctx.session.totalNumberProducts >= perPage && ctx.session.currentPage === totalPages) {
        buttons = [previousButton, pageSize];
    }

    // if ( ctx.session.currentPage  == totalPages) {
    //     buttons = [previousButton,pageSize];
    // }
    // } else if (ctx.session.currentPage +1===  Math.floor(response.data.total / pageSize)) {
    //     buttons = [previousButton];
    // } 
    // else if (ctx.session.currentPage < totalPages) {
    //     buttons = [];
    // }

    else {
        buttons = [previousButton, pageSize, nextButton];
    }

    const message = await ctx.reply('Navigate pages:', Markup.inlineKeyboard(buttons));

    await ctx.session.cleanUpState.push({ id: message.message_id, type: 'pageNavigation' });
}

module.exports = {
    productSceneTest
}