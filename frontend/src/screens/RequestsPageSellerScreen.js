import React, { useReducer, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function RequestsPageSellerScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/request`, {
          headers: {Authorization: `Bearer ${userInfo.token}`}
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, [userInfo]);

  const isCrafter = (product) => (product.applicant.shop === userInfo.shop);

  return (
    <div className="order-history-box">
    <Row>
      <Col>
        <h1>Requests</h1>
      </Col>
    </Row>
    {loading && <LoadingBox />}
    {loading && <LoadingBox />}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TITLE</th>
                <th>BUDGET</th>
                <th>ACTIONS</th>
                <th>CRAFTER</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>#{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>
                  {product.numReviews === 0 ? (
                    <Button type="button" variant="light" onClick={() => {
                      navigate(`/buyer/request/page/${product._id}`);
                    }}>Leave Review
                    </Button>
                  ) : (
                    <Button type="button" id="check-review" variant="light" onClick={() => {
                      navigate(`/buyer/request/page/${product._id}`);
                    }}>Check Review
                    </Button>
                  )}
                  </td>
                  <td>{product.applicant.shop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
