import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import Badge from 'react-bootstrap/Badge';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function ProductSeller(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.stock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };

  return (
    <Card style={{border: "1px solid grey"}}>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text><h5>Price: <strong>${product.price}</strong></h5></Card.Text>
        <Card.Text><h5>Sales: <strong>{product.sales}</strong></h5></Card.Text>
        <Card.Text><h5>Stock: <strong>{product.stock}</strong></h5></Card.Text>
      </Card.Body>
      {product.stock < 5 ? (
        <Badge bg="warning">Low Stock</Badge>
      ) : product.stock === 0 ? (
        <Badge bg="danger">Out of Stock</Badge>
      ) : (
        <Badge bg="success">In Stock</Badge>
      )}
    </Card>
  );
}
export default ProductSeller;
