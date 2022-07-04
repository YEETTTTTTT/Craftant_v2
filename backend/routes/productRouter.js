import express from 'express';
import Product from '../models/productModel.js';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isSeller } from '../utils.js';

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
  const newProduct = new Product({
    name: 'sample name ' + Date.now(),
    slug: 'sample-name-' + Date.now(),
    image: '/images/cake.jpg',
    price: 0,
    category: 'sample category',
    shop: 'sample shop',
    stock: 0,
    rating: 0,
    numReviews: 0,
    description: 'sample description',
  });
  const product = await newProduct.save();
  res.send({message: 'Product Created', product });
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
      await product.save();
      res.send({message: "Product Updated"});
    } else {
      res.status(404).send({message: "Product Not Found"});
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
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async(req, res) => {
  const product = await Product.findOne({slug:req.params.slug});
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
