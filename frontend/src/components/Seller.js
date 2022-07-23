import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';

function Seller(props) {
  const { seller } = props;

  return (
    <Card className="user-card">
      <Card.Body className="text-center">
        <Link to={`/seller/${seller.shop}`}>
          <Card.Title className="mb-3"><strong>{seller.shop}</strong></Card.Title>
        </Link>
        <img src={seller.logo} className="seller-logo"/>

        <Card.Text className="mt-3">
        <strong> About {seller.shop}: </strong>
        <br/>
          {seller.description}
        </Card.Text>
        <hr/>
        {seller.handmade === true ? (
          <i className="fas fa-star star"><h4>Verified Handmade!</h4></i>
        ) : (
          <h5>No Badges Yet...</h5>
        )}
        <hr/>
      </Card.Body>
    </Card>
  );
}
export default Seller;
