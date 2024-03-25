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

    return populatedCart.items.find((item) => item.product._id.toString() === productId);
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
      });;

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


  
async function removeItemFromCart(cartId,productId) {
  console.log("cartId",cartId)
    try {
      const cart = await Cart.findByIdAndUpdate(
        cartId,
        { $pull: { items: { product: productId } } },
        { new: true } // To return the updated document
      );
      if (!cart) {
        throw new Error('Cart not found.');
      }
  
      // // Remove the item from the cart based on the productId
      // cart.items = cart.items.filter(item => !item.product.equals(productId));
  
      // Save the updated cart
      // await cart.save();

  
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
  module.exports = { createCart, getCart,updateCartItemQuantity, removeItemFromCart,removeFromCart };