import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import { Store } from '../Store';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return { ...state, product: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'APPLY_REQUEST':
      return { ...state, loadingApply: true };
    case 'APPLY_SUCCESS':
      return { ...state, loadingApply: false, successApply: true };
    case 'APPLY_FAIL':
      return { ...state, loadingApply: false };
    case 'APPLY_RESET':
      return { ...state, loadingApply: false, successApply: false };
    default:
      return state;
  }
};

function RequestPostScreen() {

  let reviewsRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  console.log(params);

  const [{ loading, error, product, loadingApply, successApply, loadingCreateReview }, dispatch] = useReducer(reducer, {
    product: [],
    loading: true,
    error: '',
    loadingApply: false,
    successApply: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/request/page/${id}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [id, successApply]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  async function applyHandler() {
    try {
      dispatch({ type: 'APPLY_REQUEST' });
      const { data } = await axios.put(`/api/products/request/${product._id}/apply`, {}, {
        headers: { authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'APPLY_SUCCESS' });
      toast.success('Application Successful.');
    } catch(err) {
      toast.error(getError(err));
      dispatch({ type: 'APPLY_FAIL' });
    }
  }

  const submitHandler = async(e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter review and rating!');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/request/${product._id}/reviews`,
        { rating, comment, name: userInfo.name},
        {
          headers: { Authorization: `Bearer ${userInfo.token}`}
        }
      );
      dispatch({type: 'CREATE_SUCCESS'});
      toast.success('Review submitted successfully.');
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({type: 'REFRESH_PRODUCT', payload: product});
      window.scrollTo({
        behaviour: 'smooth',
        top: reviewsRef.current.offsetTop,
      });

    } catch(err) {
      toast.error(getError(err));
      dispatch({type: 'CREATE_FAIL'});
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className="img-large"
            src={product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h2>{product.name}</h2>
            </ListGroup.Item>
            <ListGroup.Item>Budget: ${product.price}</ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Requestor: <Link to={`/buyer/${product.user._id}`}> {product.user.name} </Link></h5>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={product.rating}
                numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Earnings:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Required Amount:</Col>
                    <Col>
                      {product.stock}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {userInfo.userRole === 'seller' && !product.applicant ? (
                  <ListGroup.Item>
                    {loadingApply && <LoadingBox />}
                    <div className="d-grid">
                      <Button type="button" onClick={applyHandler}>
                        Apply Now
                      </Button>
                    </div>
                  </ListGroup.Item>
                ) : product.applicant && userInfo._id != product.user._id ? (
                  <ListGroup.Item>
                    <Row>
                      <Col>Chosen Craftsman: </Col>
                      <Col>{product.applicant.shop}</Col>
                    </Row>
                  </ListGroup.Item>
                ) : userInfo._id === product.user._id && product.applicant ? (
                  <ListGroup.Item>
                    <Row>
                      <Col>Your Crafter: </Col>
                      <Col><Link to={`/seller/${product.applicant.shop}`}>{product.applicant.shop}</Link></Col>
                    </Row>
                  </ListGroup.Item>
                ) : (
                  null
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className="mb-3">
          {product.reviews.length === 0 && (
            <MessageBox>There is no review.</MessageBox>
          )}
        </div>
        <ListGroup>
          {product.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
            <strong>{review.name}</strong>
            <Rating rating = {review.rating} caption=" "></Rating>
            <p>{review.createdAt.substring(0, 10)}</p>
            <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo && userInfo.userRole === 'seller' ? (
            <Form onSubmit={submitHandler}>
              <h2>Write a review</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="1">1 - Poor.</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel controlId="floatingTextarea" label="Comments" className="mb-3">
                <Form.Control as="textarea" placeholder="Leave a review here" value={comment} onChange={(e)=> setComment(e.target.value)} />
              </FloatingLabel>
              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox />}
              </div>
            </Form>
          ) : !userInfo ? (
            <MessageBox>
              Please <Link to={`/signin?redirect=/product/${product.slug}`}>Sign In</Link> to leave a review.
            </MessageBox>
          ) : (
            null
          )}
        </div>
      </div>
    </div>
  );
}
export default RequestPostScreen;
