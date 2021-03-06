import React, { useContext, useState, useReducer } from 'react';
import { Store } from '../Store';
import {Helmet} from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';



const reducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
}


export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [shop, setShop] = useState(userInfo.shop);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
    } else {
      try {
        const { data } = await axios.put(
          '/api/users/profile',
          {
            name, email, password, shop
          },
          {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        dispatch({type: 'UPDATE_SUCCESS'});
        ctxDispatch({type: 'USER_SIGNIN', payload: data});
        toast.success('User updated successfully!');
      } catch(err) {
        dispatch({type: 'FETCH_FAIL'});
        toast.error(getError(err));
      }
    }
  };

  return (
    <div className="container small-container">
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3 della-font-headers">User Profile - <strong className="della-font-headers" id="user-role-color">{userInfo.userRole}</strong></h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control value={name} onChange={(e) => setName(e.target.value)} required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </Form.Group>

        {userInfo.userRole === 'seller' && userInfo.shop === 'None' ? (
          <Form.Group className="mb-3" controlId="shop">
            <Form.Label>Shop Name</Form.Label>
            <Form.Control value={shop} onChange={(e) => setShop(e.target.value)} required/>
          </Form.Group>
        ) : userInfo.userRole === 'seller' && userInfo.shop !== 'None' ? (
          <Form.Group className="mb-3" controlId="shop">
            <Form.Label>Shop Name</Form.Label>
            <Form.Control value={shop} onChange={(e) => setShop(e.target.value)} required disabled/>
          </Form.Group>
        ) : (
          null
        )}

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" onChange={(e) => setPassword(e.target.value)} required/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control type="password" onChange={(e) => setConfirmPassword(e.target.value)} required/>
        </Form.Group>

        <div className="mb-3">
          <Button type="submit">Update Details</Button>
        </div>

      </Form>
    </div>
  )
}
