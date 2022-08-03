import { useEffect, useReducer, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FETCHUSER_REQUEST':
      return { ...state, loading: true };
    case 'FETCHUSER_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'FETCHUSER_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function FavouritesPage() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, user, products, error }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
    user: {},
    products: [],
    error: '',
  });

  const params = useParams();
  const { id } = params;

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        if (userInfo) {
          const user = await axios.get(
            `/api/users/buyer/${id}/favourites`, {
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
    fetchUser();
  }, []);

  console.log(user);

  return (
    <div>
      <Helmet>
        <title>My Favourites</title>
      </Helmet>
      <h1 className="della-font-headers">My Favourites</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {user?.products?.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  )
}
