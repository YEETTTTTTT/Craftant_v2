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
import Product from '../components/Product';
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
    default:
      return state;
  }
};

export default function SellerScreen() {

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;


  const isShop = (product) => (product.shop === userInfo.shop);

  console.log(userInfo);

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
    fetchData();
  }, [userInfo]);


  const sumRating = products.filter(isShop).map((product) => product.rating).reduce((a, c) => a+c, 0);
  const avgRating = sumRating/products.filter(isShop).length;

  const sumReviews = products.filter(isShop).map((product) => product.numReviews).reduce((a,c) => a+c, 0);

  return (
    <div>
      <Helmet>
        <title>{userInfo.shop}'s Shop</title>
      </Helmet>
      <h1>{userInfo.shop}'s Shop</h1>
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
                <Card.Title className="mb-3"><strong>{userInfo.shop}</strong></Card.Title>
                <img src={userInfo.logo} className="seller-logo"/>

                <Card.Text className="mt-3">
                <strong> About {userInfo.shop}: </strong>
                <br/>
                  {userInfo.description}
                </Card.Text>
                <hr/>
                {userInfo.handmade === true ? (
                  <i className="fas fa-star star"><h4>Verified Handmade!</h4></i>
                ) : null}
                <hr/>
                <Card.Text>
                  <Rating numReviews={sumReviews} rating={avgRating}/>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Row>
              {products.filter(isShop).map((product) => (
                <Col key={product.slug} sm={12} md={6} lg={4} className="mb-3">
                  <Product product={product}></Product>
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
