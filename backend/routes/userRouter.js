import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { generateToken, isAuth } from '../utils.js';
import mongoose from 'mongoose';

const userRouter = express.Router();

userRouter.get(
  '/',
  expressAsyncHandler(async(req, res) => {
    const users = await User.find({userRole: "seller"});
    res.send(users);
  })
);

userRouter.get(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.send(user);
  })
);

userRouter.get(
  '/:shop',
  expressAsyncHandler(async(req, res) => {
    const user = await User.findOne({shop: req.params.shop});
    if (user) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        shop: user.shop,
        userRole: user.userRole,
        description: user.description,
        logo: user.logo,
        handmade: user.handmade,
        money: user.money,
      });
    } else {
      res.status(404).send({message: "User not Found"});
    }
  })
)

userRouter.get(
  '/:shop/performance',
  expressAsyncHandler( async (req, res) => {
    const user = await User.findOne({shop: req.params.shop});

    const productSales = await Product.aggregate([
      {
        $match: { shop: req.params.shop }
      },
      {
        $group: {
          _id: null,
          numSales: { $sum: '$sales'},
          totalRevenue: { $sum: '$revenue'},
        },
      },
    ]);

    const numListings = await Product.countDocuments({ shop: req.params.shop });

    const averageReviews = await Product.aggregate([
      {
        $match: { $and: [ { shop: req.params.shop }, { numReviews: { $gte: 1 } } ] },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
        },
      },
    ]);

    if (user) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        shop: user.shop,
        userRole: user.userRole,
        description: user.description,
        logo: user.logo,
        handmade: user.handmade,
        money: user.money,
        numListings: numListings,
        averageReviews: averageReviews,
        numSales: productSales,
      });
    } else {
      res.status(404).send({message: "User not Found"});
    }
  })
)


userRouter.get(
  '/buyer/:id',
  expressAsyncHandler(async(req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        shop: user.shop,
        userRole: user.userRole,
        logo: user.logo,
        description: user.description,
        money: user.money,
      });
    } else {
      res.status(404).send({message: "User not Found"});
    }
  })
)

userRouter.get(
  '/buyer/:id/favourites',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const products = await Product.find({_id: { $in: user.favourites}});
    if (user) {
      res.send({user, products});
    } else {
      res.status(404).send({message: "User not Found."});
    }
  })
);

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          shop: user.shop,
          isAdmin: user.isAdmin,
          userRole: user.userRole,
          description: user.description,
          logo: user.logo,
          handmade: user.handmade,
          money: user.money,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
  '/register',
  expressAsyncHandler(async(req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      userRole: req.body.userRole,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      shop: user.shop,
      isAdmin: user.isAdmin,
      userRole: user.userRole,
      money: user.money,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    console.log(req.body);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.shop = req.body.shop || user.shop;
      user.handmade = req.body.handmade || user.handmade;
      user.logo = req.body.logo || user.logo;
      user.description = req.body.description;
      user.money = user.money;
      if (req.body.favourites) {
        if (!user.favourites.includes(req.body.favourites[0])) {
          user.favourites.push(req.body.favourites[0]);
          console.log("pushed");
        }
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        shop: updatedUser.shop,
        isAdmin: updatedUser.isAdmin,
        userRole: updatedUser.userRole,
        handmade: updatedUser.handmade,
        logo: updatedUser.logo,
        description: updatedUser.description,
        money: updatedUser.money,
        favourites: updatedUser.favourites,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({message:'User not found'});
    }
  })
)

export default userRouter;
