import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isSeller } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get('/', isAuth, isSeller, expressAsyncHandler(async(req, res) => {
  const orders = await Order.find({sellers: req.user.shop}).populate('user', 'name');
  res.send(orders);
}));

orderRouter.post(
  '/', isAuth, expressAsyncHandler(async(req, res) => {

    const user = await User.findById(req.user._id);

    if (user.money >= req.body.totalPrice) {
      const orderItems = req.body.orderItems.map((x) => ({ ...x, product: x._id }));
      const orderRevenue = req.body.orderItems.map(x => x.quantity*x.price);
      const orderQuantity = req.body.orderItems.map(x => x.quantity);

      const sellersSet = [...new Set(orderItems.map(x => x.shop))];
      const sellersArray = Object.values(sellersSet);

      const slugArray = orderItems.map(x => x.slug);

      const productsArr = [];

      for (var j = 0; j < slugArray.length; j++) {
        const product = await Product.findOne({slug: slugArray[j]});
        productsArr.push(product);
      }

      for (var i = 0; i < productsArr.length; i++) {
        productsArr[i].revenue += orderRevenue[i];
        productsArr[i].sales += orderQuantity[i];
        productsArr[i].stock -= orderQuantity[i];
        const seller = await User.findOne({shop: productsArr[i].shop});
        seller.money += orderRevenue[i];
        await productsArr[i].save();
        await seller.save();
      }

      const newOrder = new Order({
        orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        totalPrice: req.body.totalPrice,
        user: req.user._id,
        sellers: [...sellersArray],
      });

      const order = await newOrder.save();
      user.money -= newOrder.totalPrice;
      await user.save();

      res.status(201).send({message: "New Order Created", order});
    } else {
      res.status(404).send({message: "Error! Insufficient Balance"});
    }
  })
);

orderRouter.get('/summary', isAuth, isSeller, expressAsyncHandler(async(req, res) => {
  const productSales = await Product.aggregate([
    {
      $match: { shop: req.user.shop }
    },
    {
      $group: {
        _id: null,
        numSales: { $sum: '$sales'},
        totalRevenue: { $sum: '$revenue'},
      },
    },
  ]);
  res.send({productSales});
}));

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({users: req.user._id});
    res.send(orders);
  })
);

orderRouter.get(
  '/:id', isAuth, expressAsyncHandler(async(req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({message: "Order not Found"});
    }

  })
);

orderRouter.delete('/:id', isAuth, expressAsyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const user = await User.findById(req.user._id);
    const orderItems = order.orderItems.map((x) => x.slug);
    const orderRevenue = order.orderItems.map(x => x.price*x.quantity);
    const orderQuantity = order.orderItems.map(x => x.quantity);
    const productsArr = [];

    for (var j = 0; j < orderItems.length; j++) {
      const product = await Product.findOne({slug: orderItems[j]});
      productsArr.push(product);
    }

    for (var i = 0; i < productsArr.length; i++) {
      productsArr[i].revenue -= orderRevenue[i];
      productsArr[i].sales -= orderQuantity[i];
      productsArr[i].stock += orderQuantity[i];
      const seller = await User.findOne({shop: productsArr[i].shop});
      seller.money -= orderRevenue[i];
      await productsArr[i].save();
      await seller.save();
    }

    user.money += order.totalPrice;
    await user.save();

    await order.remove();

    res.send({message: 'Order Refunded'});
  } else {
    res.status(404).send({message: 'Order Not Found'});
  }


}));

orderRouter.put(
  '/:id/payment', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      await order.save();
      res.send({ message: 'Order paid' });
    } else {
      res.status(404).send({message: 'Order Not Found'});
    }
  })
);

orderRouter.put(
  '/:id/deliver', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      console.log(order);
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({message: 'Order Not Found'});
    }
  })
);

orderRouter.put(
  '/:id/payment', isAuth, expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      const updatedOrder = await order.save();
      console.log(updatedOrder);
      res.send({ message: 'Order Paid', order: updatedOrder});
    } else {
      res.status(404).send({message: 'Order Not Found'});
    }
  })
);

export default orderRouter;
