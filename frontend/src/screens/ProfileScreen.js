import React, { useContext, useState, useReducer, useEffect } from 'react';
import { Store } from '../Store';
import {Helmet} from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {
  switch(action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    case 'FETCHUSER_REQUEST':
      return { ...state, loading: true };
    case 'FETCHUSER_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'FETCHUSER_FAIL':
      return { ...state, loading: false, error: action.payload };
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
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState(userInfo.description);
  const [handmade, setHandmade] = useState('');
  const [money, setMoney] = useState(userInfo.money);

  const [{ loadingUpdate, loadingUpload, user }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
    user: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        const user = await axios.get(
          '/api/users/profile', {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        dispatch({type: 'FETCHUSER_SUCCESS', payload: user.data});
      } catch(err) {
        dispatch({type: 'FETCHUSER_FAIL'});
        toast.error(getError(err));
      }
    }
    fetchUser();
  }, []);

  const submitHandler = async(e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
    } else {
      try {
        const { data } = await axios.put(
          '/api/users/profile',
          {
            name, email, password, shop, description, logo, handmade, money
          },
          {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        dispatch({type: 'UPDATE_SUCCESS'});
        ctxDispatch({type: 'USER_SIGNIN', payload: data});
        localStorage.setItem('userInfo', JSON.stringify(data));
        toast.success('User updated successfully!');
      } catch(err) {
        dispatch({type: 'FETCH_FAIL'});
        toast.error(getError(err));
      }
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({type:'UPLOAD_REQUEST'});
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({type: 'UPLOAD_SUCCESS'});
      toast.success('Image Uploaded Successfully');
      setLogo(data.secure_url);
    } catch(err) {
      toast.error(getError(err));
      dispatch({type: 'UPLOAD_FAIL', payload: getError(err)});
    }
  }


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

        <img
          className="seller-logo"
          src={userInfo.logo}
        ></img>
        <Form.Group className="mb-3" controlId = "imageFile">
          <Form.Label>Logo</Form.Label>
          <Form.Control type="file" onChange={uploadFileHandler} />
          {loadingUpload && <LoadingBox />}
        </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                value= {description}
              />
            </Form.Group>

        <Form.Group className="mb-3" controlId="money">
          <Form.Label>Balance</Form.Label>
          <Form.Control type="text" value={"$"+user.money} disabled/>
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </Form.Group>

        {userInfo.userRole === 'seller' && !userInfo.shop ? (
          <Form.Group className="mb-3" controlId="shop">
            <Form.Label>Shop Name</Form.Label>
            <Form.Control value={shop} onChange={(e) => setShop(e.target.value)} required/>
          </Form.Group>
        ) : userInfo.userRole === 'seller' && userInfo.shop ? (
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
