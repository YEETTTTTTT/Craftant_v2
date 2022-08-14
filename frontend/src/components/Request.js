import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useContext } from 'react';
import { Store } from '../Store';

function Request(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/request/${item._id}`);
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
    <Card className="product-card">
      <Link to={`/buyer/request/page/${product._id}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Row>
          <Link to={`/buyer/request/page/${product._id}`}>
            <Card.Title>{product.name}</Card.Title>
          </Link>
        </Row>
        <Row>
          <Rating rating={product.rating} numReviews={product.numReviews} />
        </Row>
        <Row>
          <Card.Text>Budget: ${product.price}</Card.Text>
        </Row>
        <Row>
          <Card.Text>Require Amount: {product.stock}</Card.Text>
        </Row>
      </Card.Body>
    </Card>
  );
}
export default Request;
