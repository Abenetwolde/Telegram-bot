const Cart = require('../Model/cart');

const Product = require('../Model/product'); // Import the Product model

async function createCart(userId, productId, quantity) {
  try {
    const filter = { user: userId };
    const update = {
      $addToSet: {
        items: { product: productId, quantity: quantity }
      }
     }; 
    const options = {
       upsert: true, // Create new cart if it doesn't exist
      new: true, // Return the updated cart
      populate: {
        path: 'items.product',
        populate: {
          path: 'category',
          model: 'Category', // replace with your actual Category model name
        },
      }
    };

    const populatedCart = await Cart.findOneAndUpdate(filter, update, options).populate({
      path: 'items.product',
      populate: {
        path: 'category',
        model: 'Category', // replace with your actual Category model name
      },
    });;

    return  populatedCart.items.find(async (item) => item?.product?._id.toString() === productId);
  } catch (error) {
    console.error('Error creating cart:', error);
    throw new Error('Failed to create cart.');
  }
}





async function getCart  (userId)  {
    try {
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        populate: {
          path: 'category',
          model: 'Category', // replace with your actual Category model name
        },
      })
      console.log("cart get",cart)
      return cart || { items: [] }; // Return an empty cart if not found
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw new Error('Failed to fetch cart.');
    }
}
async function updateCartItemQuantity(userId, productId, quantity) {
  try {
  
      const cart = await Cart.findOneAndUpdate(
          { user: userId, 'items.product': productId },
          { $inc: { 'items.$.quantity': quantity } },
          { new: true }
      ).populate({
        path: 'items.product',
        populate: {
          path: 'category',
          model: 'Category', // replace with your actual Category model name
        },
      })

      if (!cart) {
          // If the item is not in the cart, add it
          const newCartItem = { product: productId, quantity };
          const updatedCart = await Cart.findOneAndUpdate(
              { user: userId },
              { $push: { items: newCartItem } },
              { new: true, upsert: true }
          ).populate({
            path: 'items.product',
            populate: {
              path: 'category',
              model: 'Category', // replace with your actual Category model name
            },
          });

          const updatedCartItem = updatedCart.items.find(item => item.product.equals(productId));
          return JSON.stringify({
              product: updatedCartItem.product,
              quantity: updatedCartItem.quantity
          });
      }

      const updatedCartItem = cart.items.find(item => item.product.equals(productId));
      return JSON.stringify({
        cartId:  cart._id,
          product: updatedCartItem.product,
          quantity: updatedCartItem.quantity,
          cartItem:updatedCartItem
      });
  } catch (error) {
      console.error('Error updating cart item quantity:', error);
      throw new Error('Failed to update cart item quantity.');
  }
}
async function DecreaseCartQuantity(userId, productId) {
  console.log(productId)
  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: {
        path: 'category',
        model: 'Category', // replace with your actual Category model name
      },
    });
 
    // If cart not found, return error
    if (!cart) {
      throw new Error('Cart not found');
    }
console.log("cart", cart.items[0].product)
    // Find the index of the product in the cart
    const productIndex = cart.items.findIndex(item => item.product._id.toString() == productId);

    // If product not found in cart, return error
    if (productIndex === -1) {
      throw new Error('Product not found in cart');
    }

    // If quantity is already 0, return error
    if (cart.items[productIndex].quantity === 0) {
      throw new Error('Quantity already at minimum');
    }

    // Decrease quantity by 1
await cart.items[productIndex].quantity--;
   const updatecart= cart.items[productIndex]

    // Save the updated cart
    await cart.save();

    return JSON.stringify({
      cartId:  cart._id,
      product: updatecart.product,
      quantity: updatecart.quantity,
      cartItem:updatecart
    });;
  } catch (error) {
    throw new Error(`Failed to decrease quantity: ${error.message}`);
  }
}

  
async function removeItemFromCart(cartId,productId) {

    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { $pull: { items: { product: productId } } },
        { new: true } // To return the updated document
      );
      if (!cart) {
        throw new Error('Cart not found.');
      }
  
 
      return cart;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Failed to remove item from cart.');
    }
  }
  async function removeFromCart(cartId,productId) {
    console.log("cartId",cartId)
      try {
        const cart = await Cart.findByIdAndDelete(
          cartId,
        ); 
        if (!cart) {
          throw new Error('Cart not found.');
        }

        return cart;
      } catch (error) {
        console.error('Error removing item from cart:', error);
        throw new Error('Failed to remove item from cart.');
      }
    }
  module.exports = { createCart, DecreaseCartQuantity,getCart,updateCartItemQuantity, removeItemFromCart,removeFromCart };