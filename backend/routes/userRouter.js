import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
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
        token: generateToken(user),
      });
    } else {
      res.status(404).send({message: "User not Found"});
    }
  })
)


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
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.shop = req.body.shop || user.shop;
      user.handmade = req.body.handmade || user.handmade;
      user.logo = req.body.logo || user.logo;
      user.description = req.body.description;
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
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({message:'User not found'});
    }
  })
)

export default userRouter;
