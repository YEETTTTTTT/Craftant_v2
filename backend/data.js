import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      name: 'basir',
      email: 'admin@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: true
    },
    {
      name: 'john',
      email: 'user@example.com',
      password: bcrypt.hashSync('123456'),
      isAdmin: false,
    }
  ],

  products: [
    {
      //_id: '1',
      name: 'Apple Pie',
      slug: 'apple-pie',
      category: 'food',
      image: '/images/pie.jpg',
      price: 12,
      stock: 20,
      shop: 'Lovely Pies',
      rating: 4.8,
      numReviews: 10,
      description: 'delicious pie, christmas offer!'
    },
    {
      //_id: '2',
      name: 'Phone Case',
      slug: 'phone-case',
      category: 'gadgets',
      image: '/images/case.jpg',
      price: 24,
      stock: 5,
      shop: 'Hype Gadgets',
      rating: 4.2,
      numReviews: 15,
      description: 'Coolest and Hottest phone casing ever.'
    },
    {
      //_id: '3',
      name: 'Christmas Cake',
      slug: 'christmas-cake',
      category: 'food',
      image: '/images/cake.jpg',
      price: 70,
      stock: 1,
      shop: 'Custom Cakes',
      rating: 5.0,
      numReviews: 20,
      description: 'Custom baked christmas cake, pre-order needed.'
    },
    {
      //_id: '4',
      name: 'Cute Necklace',
      slug: 'cute-necklace',
      category: 'accessories',
      image: '/images/necklace.jpg',
      price: 48,
      stock: 100,
      shop: 'Anny Jewelry',
      rating: 4.4,
      numReviews: 15,
      description: 'Cute handmade necklace for sale.'
    }
  ]
}

export default data;
