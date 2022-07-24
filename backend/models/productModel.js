import mongoose from 'mongoose';
import slugify from 'react-slugify';

const reviewSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    comment: { type: String, required: true},
    rating: { type: Number, required: true},
  },
  {
    timestamps: true
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    shop: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    type: { type: String, required: true },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sales: { type: Number, default: 0},
    revenue: { type: Number, default: 0},
    reviews: [reviewSchema],
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
