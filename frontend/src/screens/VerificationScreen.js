import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';


const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
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
    default:
      return state;
  }
};

export default function VerificationScreen() {

  const navigate = useNavigate();
  const params = useParams();
  const { id: productId } = params;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const [name, setName] = useState(userInfo.name);
  const [shop, setShop] = useState(userInfo.shop);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

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
      setImage(data.secure_url);
    } catch(err) {
      toast.error(getError(err));
      dispatch({type: 'UPLOAD_FAIL', payload: getError(err)});

    }
  }

  const submitHandler = async(e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          handmade: true
        },
        {
          headers: {Authorization: `Bearer ${userInfo.token}`},
        }
      );
      dispatch({type: 'UPDATE_SUCCESS'});
      toast.success('Verification Successful!');
    } catch(err) {
      dispatch({type: 'FETCH_FAIL'});
      toast.error(getError(err));
    }
  };


  return (
    <Container className="small-container">
      <Helmet>
        <title>Verification</title>
      </Helmet>
      <h1>Verification - Apply for "Handmaker" Status</h1>

        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="shop">
            <Form.Label>Shop</Form.Label>
            <Form.Control
              value={shop}
              required disabled
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId = "imageFile">
            <Form.Label>Upload Image Of Your Process</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox />}
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Apply
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
    </Container>
  )
}
