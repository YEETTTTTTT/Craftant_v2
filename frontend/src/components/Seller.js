import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useParams } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import { useContext, useReducer, useEffect } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCHUSER_REQUEST':
      return { ...state, loading: true };
    case 'FETCHUSER_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'FETCHUSER_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function Seller(props) {
  const { seller } = props;

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { shop } = params;

  const [{ loading, error, products, user }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    user: [],
  });

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({type: 'FETCHUSER_REQUEST'});
      try {
        const user = await axios.get(
          `/api/users/${seller.shop}/performance`,
        );
        dispatch({type: 'FETCHUSER_SUCCESS', payload: user.data});
      } catch(err) {
        dispatch({type: 'FETCHUSER_FAIL'});
        toast.error(getError(err));
      }
    }
    fetchUser();
  }, [shop]);

  const starAlertHandler = async() => {
    window.alert("Seller has an average of 5 star rating!");
  }

  const handAlertHandler = async() => {
    window.alert("Seller has made more than 50 sales!");
  }

  const crownAlertHandler = async() => {
    window.alert("Seller has created more than 2 products!");
  }
  
  return (
    <Card className="user-card">
      <Card.Body className="text-center d-flex flex-column">
        <Link to={`/seller/${seller.shop}`}>
          <Card.Title className="mb-3"><strong>{seller.shop}</strong></Card.Title>
        </Link>
        <Link to={`/seller/${seller.shop}`}><img src={seller.logo} className="seller-logo"/></Link>

        <Card.Text className="mt-3">
        <strong> About {seller.shop}: </strong>
        <br/>
          {user.description}
        </Card.Text>
        <hr/>
        {seller.handmade === true ? (
          <i className="fas fa-star star"><h4>Verified Handmade!</h4></i>
        ) : (
          null
        )}
        <hr/>
        <Row className="mt-auto badge-row">
        {user?.averageReviews?.length > 0 && user.averageReviews[0].average === 5 ? (
          <Col>
            <i className="fa-solid fa-ranking-star fa-lg five-star" onClick={starAlertHandler}></i>
          </Col>
        ) : (
          null
        )}

        {user?.numSales?.length > 0 && user.numSales[0].numSales > 50 ? (
          <Col>
            <i className="fa-solid fa-crown fa-lg crown" onClick={crownAlertHandler}></i>
          </Col>
        ) : (
          null
        )}

        {user?.numListings > 2 ? (
          <Col>
            <i className="fa-solid fa-hand-holding-heart fa-lg hold-heart" onClick={handAlertHandler}></i>
          </Col>
        ) : (
          null
        )}
        </Row>
      </Card.Body>
    </Card>
  );
}
export default Seller;
