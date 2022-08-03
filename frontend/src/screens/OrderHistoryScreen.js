import React, {useContext, useEffect, useReducer } from 'react';
import {Helmet} from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../utils';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';


const reducer = (state, action) => {
  switch(action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, orders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};


export default function OrderHistoryScreen() {

  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  const isUser = (order) => (order.user === userInfo._id)

  const [{loading, error, orders, loadingDelete, successDelete}, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async() => {
      dispatch({type: 'FETCH_REQUEST'});
      try {
        const {data} = await axios.get(
          `/api/orders/mine`,
          {headers: {Authorization: `Bearer ${userInfo.token}`}}
        );
        dispatch({type: 'FETCH_SUCCESS', payload: data});
      } catch(error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    if (successDelete) {
      dispatch({type: 'DELETE_RESET'});
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const refundHandler = async (order) => {
    if (window.confirm("Refund Order?")) {
      try {
        await axios.delete(`/api/orders/${order._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("Order Refunded");
        dispatch({type: 'DELETE_SUCCESS'});
      } catch(err) {
        toast.error(getError(err));
        dispatch({type: 'DELETE_FAIL'});
      }
    }
  }

  return (
    <div className="order-history-box">
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <h1 className="della-font-headers">Order History</h1>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(isUser).map((order) => (
              <tr key={order._id}>
                <td>#{order._id}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                <td>{order.isDelivered ? order.deliveredAt.substring(0, 10) : 'No'}</td>
                <td>
                  <Button type="button" variant="light" onClick={() => {
                    navigate(`/order/${order._id}`);
                  }}>Details
                  </Button>
                  &nbsp;
                  <Button type="button" variant="light" onClick={() => refundHandler(order)}>Refund
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
