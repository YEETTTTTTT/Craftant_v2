import React, { useContext, useState, useEffect } from 'react';
import CheckoutSteps from '../components/CheckoutSteps';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';

export default function PaymentMethodScreen(props) {

  const navigate = useNavigate();

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { shippingAddress, paymentMethod },
  } = state;

  const [paymentMethodName, setPaymentMethod] = useState(
    paymentMethod || 'Paypal'
  );

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate])

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName});
    localStorage.setItem('paymentMethod', paymentMethodName);
    navigate('/placeorder');
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container">
        <Helmet>
          <title>Payment Method</title>
        </Helmet>
        <h1 className="my-3 della-font-headers">Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <div classname="mb-3">
            <Form.Check type="radio" id="Paypal" label="Paypal" value="Paypal" checked={paymentMethodName === 'Paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
          <div classname="mb-3">
            <Form.Check type="radio" id="Stripe" label="Stripe" value="Stripe" checked={paymentMethodName === 'Stripe'} onChange={(e) => setPaymentMethod(e.target.value)} />
          </div>
          <div className="mb-3">
            <Button type="submit">Continue</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
