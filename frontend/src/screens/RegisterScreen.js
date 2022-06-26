import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import Axios from 'axios';
import { useState, useContext, useEffect } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function RegisterScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirectInUrl = new URLSearchParams(search).get('redirect');
  const redirect = redirectInUrl ? redirectInUrl : '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('');

  const {state, dispatch: ctxDispatch } = useContext(Store);
  const {userInfo} = state;

  const togglePassword = () => {
    function show() {
        var p = document.getElementById('pwd');
        p.setAttribute('type', 'text');
    }

    function hide() {
        var p = document.getElementById('pwd');
        p.setAttribute('type', 'password');
    }

    var pwShown = 0;

    document.getElementById("eye").addEventListener("click", function () {
        if (pwShown == 0) {
            pwShown = 1;
            show();
        } else {
            pwShown = 0;
            hide();
        }
    }, false);
  }

  const submitHandler = async(e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
    }

    try{
      const {data} = await Axios.post('/api/users/register', {
        name,
        email,
        password,
        userRole,
      });
      ctxDispatch({type: 'USER_SIGNIN', payload: data})
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate(redirect || '/');

    } catch(err) {
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  return (
    <Container className="small-container">
      <Helmet>
        <title>Register</title>
      </Helmet>
      <h1 className="my-3 della-font-headers">Register</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control required onChange={(e) => setName(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>{'  '}
          <i class="fa fa-eye" aria-hidden="true" type="button" id="eye" onClick={() => togglePassword()} />
          <Form.Control type="password" id="pwd" required onChange={(e) => setPassword(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>{'  '}
          <i class="fa fa-eye" aria-hidden="true" type="button" id="eye" ></i>
          <Form.Control type="password" id="pwd" required onChange={(e) => setConfirmPassword(e.target.value)}/>
        </Form.Group>
        <Form.Group controlId="userRole">
          <div className="wrapper">
            <input type="radio" name="userRole" id="option-1" value="buyer" onChange={(e) => setUserRole(e.target.value)}/>
            <input type="radio" name="userRole" id="option-2" value="seller" onChange={(e) => setUserRole(e.target.value)}/>
            <Form.Label for="option-1" className="option option-1">
              <div className="dot"></div>
              <span>Buyer</span>
            </Form.Label>
            <Form.Label for="option-2" className="option option-2">
              <div className="dot"></div>
              <span>Seller</span>
            </Form.Label>
          </div>
        </Form.Group>
        <div className="mb-3">
          <Button className="register-btn" type="submit">Register</Button>
        </div>
        <div className="mb-3">
          Already have an account?{' '}
          <Link to={`/signin?redirect=${redirect}`}>Sign In</Link>
        </div>
      </Form>
    </Container>
  );
}
