import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    isAdmin: { type: Boolean, default: true, required: true},
    userRole: { type: String, required: true, default: 'buyer' },
    shop: { type: String, default: "None" },
    handmade: { type: Boolean, default: false },
    logo: {type: String, default: "None"},
    description: { type: String },
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
export default User;
