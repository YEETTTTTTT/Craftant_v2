import { useEffect, useReducer, useState, useContext } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import Seller from '../components/Seller';
import Card from 'react-bootstrap/Card';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';

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
      return { ...state, users: action.payload, loading: false };
    case 'FETCHUSER_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const isAvailable = (product) => (product.stock > 0);
const isActive = (user) => (user.shop);

function HomeScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, products, users }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
    users: []
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    const fetchUser = async() => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        const user = await axios.get('/api/users');
        dispatch({ type: 'FETCHUSER_SUCCESS', payload: user.data});
      } catch(err) {
        dispatch({ type: 'FETCHUSER_FAIL', payload: err.message});
      }
    }
    fetchData();
    fetchUser();
  }, []);

  console.log(users);
  console.log(products);

  return (
    <div>
      <Helmet>
        <title>Craftant</title>
      </Helmet>
      <h1 class="della-font-headers">Featured Products</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.filter(isAvailable).map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
      <br/>
      <h1 class="della-font-headers">New Shops</h1>
      <br/>
      <div className="users">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {users.filter(isActive).map((user) => (
              <Col key={user.email} sm={6} md={4} lg={3} className="mb-3">
                <Seller seller={user}></Seller>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
