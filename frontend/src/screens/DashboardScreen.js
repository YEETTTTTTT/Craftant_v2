import React, { useReducer, useContext, useEffect } from 'react';
import { Store } from '../Store';
import Chart from 'react-google-charts';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProductSeller from '../components/ProductSeller';
import Card from 'react-bootstrap/Card';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, summary: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload};
    case 'PRODUCT_REQUEST':
      return { ...state, loading: true };
    case 'PRODUCT_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'PRODUCT_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function DashboardScreen() {
  const [{ loading, summary, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  useEffect(() => {
    const fetchData = async() => {
      try {
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data});
      } catch(err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    }
    const fetchProducts = async() => {
      dispatch({ type: 'PRODUCT_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'PRODUCT_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'PRODUCT_FAIL', payload: err.message });
      }
    }
    fetchData();
    fetchProducts();
  }, [userInfo]);

    const isShop = (product) => (product.shop === userInfo.shop);
    const sumRating = products.filter(isShop).map((product) => product.rating).reduce((a, c) => a+c, 0);
    const avgRating = sumRating/products.filter(isShop).length;

    const sumReviews = products.filter(isShop).map((product) => product.numReviews).reduce((a,c) => a+c, 0);


  return (
    <div>
      <h1>Dashboard</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.productSales[0].numSales}
                  </Card.Title>
                  <Card.Text> Total Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    $
                    {summary.productSales[0].totalRevenue}
                  </Card.Title>
                  <Card.Text> Total Revenue</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <br/>
          <br/>
          <Row>
            <Col>
              <Row>
                {products.filter(isShop).map((product) => (
                  <Col key={product.slug} sm={12} md={6} lg={4} className="mb-3">
                    <ProductSeller product={product}></ProductSeller>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
