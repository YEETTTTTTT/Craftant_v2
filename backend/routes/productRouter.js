import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isSeller, isBuyer } from '../utils.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

productRouter.get('/search', expressAsyncHandler( async (req, res) => {
  const {query} = req;
  const category = query.category || '';
  const shop = query.shop || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const order = query.order || '';
  const searchQuery = query.query || '';

  const queryFilter = searchQuery && searchQuery !== 'all' ? {
    name: {
      $regex: searchQuery,
      $options: 'i',
    },
  } : {};

  const categoryFilter = category && category !== 'all' ? {
    category
  } : {};

  const ratingFilter = rating && rating !== 'all' ? {
    rating: {
      $gte: Number(rating),
      $lt: Number(rating)+1,
    },
  } : {};

  const priceFilter = price && price !== 'all' ? {
    price: {
      $gte: Number(price.split('-')[0]),
      $lte: Number(price.split('-')[1]),
    },
  } : {};

  const sortOrder = order === 'featured' ? {
    featured: -1
  } : order === 'lowest' ? {
    price: 1
  } : order === 'highest' ? {
    price: -1
  } : order === 'ratings' ? {
    rating: -1
  } : order === 'newest' ? {
    createdAt: -1
  } : {
    _id: -1
  };

  const products = await Product.find({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  }).sort(sortOrder);

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });

  res.send({ products, countProducts});
}));

productRouter.post('/', isAuth, isSeller, expressAsyncHandler(async (req, res) => {
  if (!req.user.shop) {
    return res.status(404).send({message: "Please Set Up Your Shop Name First."});
  } else {
      const newProduct = new Product({
        name: 'sample name ' + Date.now(),
        slug: 'sample-name-' + Date.now(),
        image: '/images/cake.jpg',
        price: 0,
        category: 'sample category',
        shop: req.user.shop || "None",
        stock: 0,
        rating: 0,
        numReviews: 0,
        description: 'sample description',
        user: req.user._id,
        type: "listing",
      });
      const product = await newProduct.save();
      res.send({message: 'Product Created', product });
    }
}));

productRouter.post('/request', isAuth, isBuyer, expressAsyncHandler(async (req, res) => {
      const newProduct = new Product({
        name: 'sample name ' + Date.now(),
        slug: 'sample-name-' + Date.now(),
        image: '/images/cake.jpg',
        price: 0,
        category: 'sample category',
        shop: 'sample-shop',
        stock: 0,
        rating: 0,
        numReviews: 0,
        description: 'sample description',
        user: req.user._id,
        type: "request",
      });
      const product = await newProduct.save();
      res.send({message: 'Request Created', product });
}));

productRouter.put(
  '/:id',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.shop = req.body.shop;
      product.stock = req.body.stock;
      product.description = req.body.description;
      product.user = req.user._id,
      product.type = "listing",
      await product.save();
      res.send({message: "Product Updated"});
    } else {
      res.status(404).send({message: "Product Not Found"});
    }
  })
);

productRouter.put(
  '/request/:id',
  isAuth,
  isBuyer,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.rating = req.body.rating,
      product.numReviews = req.body.numReviews,
      product.stock = req.body.stock;
      product.description = req.body.description;
      product.user = req.user._id,
      product.type = "request",
      await product.save();
      res.send({message: "Request Updated"});
    } else {
      res.status(404).send({message: "Request Not Found"});
    }
  })
);

productRouter.put(
  '/request/:id/apply', isAuth, expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('applicant', 'shop');
    if (product) {
      product.applicant = req.user._id;
      const updatedProduct = await product.save();
      res.send({ message: 'Applied', product: updatedProduct});
    } else {
      res.status(404).send({message: 'Product Not Found'});
    }
  })
);

productRouter.delete('/:id', isAuth, isSeller, expressAsyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.send({message: 'Product Deleted'});
  } else {
    res.status(404).send({message: 'Product Not Found'});
  }
}));

productRouter.delete('/request/:id', isAuth, isBuyer, expressAsyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await product.remove();
    res.send({message: 'Request Deleted'});
  } else {
    res.status(404).send({message: 'Request Not Found'});
  }
}));

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async(req, res) => {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      if (product) {
          if (product.reviews.find((x) => x.name === req.user.name)) {
            return res.status(400).send({message: 'You already left a review.'});
          }
          const review = {
            name: req.user.name,
            rating: Number(req.body.rating),
            comment: req.body.comment,
          };
          product.reviews.push(review);
          product.numReviews = product.reviews.length;
          product.rating = product.reviews.reduce((a,c) => c.rating + a, 0) / product.reviews.length;
          const updatedProduct = await product.save();
          res.status(201).send({message: 'Review Created', review: updatedProduct.reviews[updatedProduct.reviews.length-1], numReviews: product.numReviews, rating: product.numReviews});
      } else {
        res.status(404).send({message: 'Product Not Found.'});
      }
  })
);

productRouter.post(
  '/request/:id/reviews',
  isAuth,
  expressAsyncHandler(async(req, res) => {
      const productId = req.params.id;
      const product = await Product.findById(productId).populate('applicant', 'shop');
      if (product) {
        if (product.applicant.shop === req.user.shop) {
            if (product.reviews.find((x) => x.name === req.user.name)) {
              return res.status(400).send({message: 'You already left a review.'});
            }
            const review = {
              name: req.user.name,
              rating: Number(req.body.rating),
              comment: req.body.comment,
            };
            product.reviews.push(review);
            product.numReviews = product.reviews.length;
            product.rating = product.reviews.reduce((a,c) => c.rating + a, 0) / product.reviews.length;
            const updatedProduct = await product.save();
            res.status(201).send({message: 'Review Created', review: updatedProduct.reviews[updatedProduct.reviews.length-1], numReviews: product.numReviews, rating: product.numReviews});
        } else {
          res.status(404).send({message: 'Only the Crafter can leave a review.'});
        }
      } else {
        res.status(404).send({message: 'Request Not Found.'});
      }
  })
);

productRouter.get(
  '/seller',
  isAuth,
  isSeller,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const products = await Product.find()
    res.send({
      products,
    });
  })
);

productRouter.get(
  '/request',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const products = await Product.find({type: "request"}).populate('applicant', 'shop');
    res.send({
      products,
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async(req, res) => {
  const product = await Product.findOne({slug:req.params.slug}).populate('user', 'handmade');
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get('/request/page/:id', async(req, res) => {
  const product = await Product.findById(req.params.id).populate('user', 'name').populate('applicant', 'shop');
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get('/:id', async(req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default productRouter;
