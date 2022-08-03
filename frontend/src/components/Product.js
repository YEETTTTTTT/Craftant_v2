import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext, useState, useReducer, useEffect } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getError } from '../utils';


const reducer = (state, action) => {
  switch(action.type) {
    case 'FETCHUSER_REQUEST':
      return { ...state, loading: true };
    case 'FETCHUSER_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'FETCHUSER_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'LIKE_REQUEST':
      return { ...state, loadingLike: true, successLike: false };
    case 'LIKE_SUCCESS':
      return { ...state, loadingLike: false, successLike: true };
    case 'LIKE_FAIL':
      return { ...state, loadingLike: false, successLike: false };
    case 'LIKE_RESET':
      return { ...state, loadingLike: false, successLike: false };
    default:
      return state;
  }
}
function Product(props) {
  const { product } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;
  const { userInfo } = state;

  const [{ loading, user, likes, loadingLike, successLike }, dispatch] = useReducer(reducer, {
    loading: false,
    user: {},
  });

  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        if (userInfo) {
          const user = await axios.get(
            '/api/users/profile', {
              headers: {Authorization: `Bearer ${userInfo.token}`},
            }
          );
          dispatch({type: 'FETCHUSER_SUCCESS', payload: user.data});
        }
      } catch(err) {
        dispatch({type: 'FETCHUSER_FAIL'});
        toast.error(getError(err));
      }
    }
    if (successLike) {
      dispatch({type: 'LIKE_RESET'});
    } else {
      fetchUser();
    }
  }, [successLike]);

  const likesHandler = async(e) => {
    e.preventDefault();
    dispatch({type: 'LIKE_REQUEST'});
    favourites.push(product._id);
    setFavourites(favourites => [...favourites, product._id]);
    const { data } = await axios.put(
      '/api/users/profile',
      { favourites },
      {
        headers: {Authorization: `Bearer ${userInfo.token}`},
      }
    );
    dispatch({type: 'LIKE_SUCCESS'});
  };

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
    <Card styles="1px solid grey">
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>${product.price}</Card.Text>
        {product.stock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}
      </Card.Body>

      {user?.favourites?.includes(product._id) ? (
        <i class="fas fa-heart fa-lg card-icon-btm"></i>
      ) : user.userRole === 'buyer' ? (
        <span onClick={likesHandler}>
          <i class="far fa-heart fa-lg card-icon-btm"></i>
        </span>
      ) : (
        null
      )}

    </Card>
  );
}
export default Product;
