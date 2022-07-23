import axios from 'axios';
import React, {useReducer, useEffect, useContext, useState} from 'react';
import { Helmet } from 'react-helmet-async';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Request from '../components/Request';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';

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

export default function BuyerScreen() {

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id } = params;

  const [{ loading, error, products, user }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
    user: [],
  });

  console.log(params);

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
    const fetchUser = async () => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        const user = await axios.get(
          `/api/users/buyer/${id}`,
        );
        dispatch({type: 'FETCHUSER_SUCCESS', payload: user.data});
      } catch(err) {
        dispatch({type: 'FETCHUSER_FAIL'});
        toast.error(getError(err));
      }
    }
    fetchData();
    fetchUser();
  }, [id]);

  console.log(user);

  const isUser = (product) => (product.user === user._id);
  const sumRating = products.filter(isUser).map((product) => product.rating).reduce((a, c) => a+c, 0);
  const avgRating = sumRating/products.filter(isUser).length;

  const sumReviews = products.filter(isUser).map((product) => product.numReviews).reduce((a,c) => a+c, 0);

  return (
    <div>
      <Helmet>
        <title>Profile Page</title>
      </Helmet>
      <h1>{user.name}'s Profile Page</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
          <Col lg={3} md={4} sm={12} className="me-5">
            <Card>
              <Card.Body className="text-center">
                <Card.Title className="mb-3"><strong>{user.name}</strong></Card.Title>
                <img src={user.logo} className="seller-logo"/>

                <Card.Text className="mt-3">
                <strong> About {user.name}: </strong>
                <br/>
                  {user.description}
                </Card.Text>
                <hr/>
                <Card.Text>
                  <Rating numReviews={sumReviews} rating={avgRating}/>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Row>
              {products.filter(isUser).map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} className="mb-3">
                  <Request product={product}></Request>
                </Col>
              ))}
            </Row>
          </Col>
          </>
        )}
      </div>
    </div>
  )
}
