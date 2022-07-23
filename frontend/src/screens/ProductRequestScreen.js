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
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
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

export default function ProductListScreen() {
  const [{ loading, error, products, loadingCreate, loadingDelete, successDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);

  const { state } = useContext(Store);
  const { userInfo } = state;

  const isBuyer = (product) => (product.user === userInfo._id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/request`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    if (successDelete) {
      dispatch({type: 'DELETE_RESET'});
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm("Confirm Creation")) {

      try {
        dispatch({type: 'CREATE_REQUEST'});
        const { data } = await axios.post(
          '/api/products/request',
          {},
          {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        toast.success('Request Listed Successfully!');
        dispatch({type: 'CREATE_SUCCESS'});
        navigate(`/buyer/request/${data.product._id}`);
      } catch(err) {
        toast.error(getError(err));
        dispatch({type: 'CREATE_FAIL'});
      }
    }
  }

  const deleteHandler = async (product) => {
    if (window.confirm("Confirm deletion")) {
      try {
        await axios.delete(`/api/products/request/${product._id}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        toast.success("Request deleted");
        dispatch({type: 'DELETE_SUCCESS'});
      } catch(err) {
        toast.error(getError(err));
        dispatch({type: 'DELETE_FAIL'});
      }
    }
  }

  return (
    <div className="order-history-box">
    <Row>
      <Col>
        <h1>Requests</h1>
      </Col>
      <Col className="col text-end">
        <div>
          <Button type="button" onClick={createHandler}>List Request</Button>
        </div>
      </Col>
    </Row>
    {loadingCreate && <LoadingBox />}
    {loadingDelete && <LoadingBox />}

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
              {products.filter(isBuyer).map((product) => (
                <tr key={product._id}>
                  <td>#{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>
                    <Button type="button" variant="light" onClick={() => navigate(`/buyer/request/${product._id}`)}>
                      Edit
                    </Button>
                    &nbsp;
                    <Button type="button" variant="light" onClick={() => deleteHandler(product)}>
                      Delete
                    </Button>
                    <Button type="button" variant="light" onClick={() => {
                      navigate(`/buyer/request/page/${product._id}`);
                    }}>Details
                    </Button>
                  </td>
                  <td>{product.applicant ? product.applicant.shop.toUpperCase() : 'NONE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
