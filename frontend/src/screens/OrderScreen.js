import axios from 'axios';
import React, {useReducer, useEffect, useContext} from 'react';
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
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';


function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, order: action.payload, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPayment: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPayment: false, successPayment: true };
    case 'PAY_FAIL':
      return { ...state, loadingPayment: false };
    case 'PAY_RESET':
      return { ...state, loadingPayment: false, successPayment: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false, errorDeliver: action.payload };
    case 'DELIVER_RESET':
      return { ...state, loadingDeliver: false, successDeliver: false };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [{loading, error, order, loadingPayment, successPayment, loadingDeliver, successDeliver}, dispatch] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    loadingPayment: false,
    successPayment: false,
    loadingDeliver: false,
    successDeliver: false,
  });

  useEffect(() => {
    const fetchOrder = async() => {
      try{
        dispatch({type:'FETCH_REQUEST'});
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: {authorization: `Bearer ${userInfo.token}`},
        });

        dispatch({type: 'FETCH_SUCCESS', payload: data });
      } catch(err) {
        dispatch({type: 'FETCH_FAIL', payload: getError(err) });
      }
    }
    if (!userInfo) {
      return navigate('/login');
    }
    if (!order._id || successPayment || successDeliver || (order._id && order._id !== orderId)) {
      fetchOrder();
      if (successPayment) {
        dispatch({ type: 'PAY_RESET'});
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET'});
      }
    }
  }, [order, userInfo, orderId, navigate, successPayment, successDeliver]);

  async function orderPaidHandler() {
    try {
      dispatch({ type: 'PAY_REQUEST' });
      const { data } = await axios.put(`/api/orders/${order._id}/payment`, {}, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'PAY_SUCCESS' });
      toast.success('Payment Successful.');
    } catch(err) {
      toast.error(getError(err));
      dispatch({ type: 'PAY_FAIL' });
    }
  }

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(`/api/orders/${order._id}/deliver`, {}, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'DELIVER_SUCCESS' });
      toast.success('Order Delivered.');
    } catch(err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  return  (
    loading? (
      <LoadingBox />
    ) : error ? (
      <MessageBox variant="danger">{error}</MessageBox>
    ) : (
      <div>
        <Helmet>
          <title>Order {orderId}</title>
        </Helmet>
        <h1 className="my-3 della-font-headers">Order #{orderId}</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3" id="order-card">
              <Card.Body>
                <Card.Title>Shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                  <strong>Address:</strong> {order.shippingAddress.address},
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode},
                  {order.shippingAddress.country}
                </Card.Text>
                {order.isDelivered ? (
                  <MessageBox variant="success">Delivered at {order.deliveredAt}</MessageBox>
                ) : (
                  <MessageBox variant="danger">Not Delivered</MessageBox>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-3" id="order-card">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong> {order.paymentMethod}
                </Card.Text>
                {order.isPaid ? (
                  <MessageBox variant="success">Paid at {order.paidAt}</MessageBox>
                ) : (
                  <MessageBox variant="danger">Not Paid</MessageBox>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-3" id="order-card">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <ListGroup variant="flush">
                  {order.orderItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <img src={item.image} alt={item.name} className="img-fluid rounded img-thumbnail"></img>{' '}
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
                        </Col>
                        <Col md={3}>
                          <span>{item.quantity}</span>
                        </Col>
                        <Col md={3}>${item.price}</Col>

                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-3" id="order-card">
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>${order.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>${order.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Order Total</Col>
                      <Col>${order.totalPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  {userInfo.userRole === 'buyer' && !order.isPaid && (
                    <ListGroup.Item>
                      {loadingPayment && <LoadingBox />}
                      <div className="d-grid">
                        <Button type="button" variant="light" onClick={orderPaidHandler}>
                          Make Payment
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                  {userInfo.userRole === 'seller' && order.isPaid && !order.isDelivered && (
                    <ListGroup.Item>
                      {loadingDeliver && <LoadingBox />}
                      <div className="d-grid">
                        <Button type="button" variant="light" onClick={deliverOrderHandler}>
                          Order Delivered
                        </Button>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

        </Row>
      </div>
    )
  )
}
