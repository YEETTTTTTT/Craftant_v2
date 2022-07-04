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
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [{ loading, error, products, loadingCreate }, dispatch] = useReducer(reducer, {
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
        const { data } = await axios.get(`/api/products/seller`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, [userInfo]);

  const createHandler = async () => {
    if (window.confirm("Confirm Creation")) {

      try {
        dispatch({type: 'CREATE_REQUEST'});
        const { data } = await axios.post(
          '/api/products',
          {},
          {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        toast.success('Product Listed Successfully!');
        dispatch({type: 'CREATE_SUCCESS'});
        navigate(`/seller/product/${data.product._id}`);
      } catch(err) {
        toast.error(getError(err));
        dispatch({type: 'CREATE_FAIL'});
      }
    }
  }

  return (
    <div>
    <Row>
      <Col>
        <h1>Products</h1>
      </Col>
      <Col className="col text-end">
        <div>
          <Button type="button" onClick={createHandler}>List Product</Button>
        </div>
      </Col>
    </Row>
    {loadingCreate && <LoadingBox />}

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
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>SHOP</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>#{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.shop}</td>
                  <td>
                    <Button type="button" variant="light" onClick={() => navigate(`/seller/product/${product._id}`)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
