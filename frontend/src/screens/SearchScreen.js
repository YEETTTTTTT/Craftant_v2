import React, { useReducer, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import { getError } from '../utils';
import axios from 'axios';
import { toast } from 'react-toastify';
import {Helmet} from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload.products, countProducts: action.payload.countProducts, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $100',
    value: '51-100',
  },
  {
    name: '$101 to $200',
    value: '101-200',
  },
  {
    name: '$201 to $300',
    value: '201-300',
  },
  {
    name: '$301 to $1000',
    value: '301-1000',
  }
];

export const ratings = [
    {
      name: '5stars',
      rating: 5,
    },
    {
      name: '4stars & up',
      rating: 4,
    },
    {
      name: '3stars & up',
      rating: 3,
    },

    {
      name: '2stars & up',
      rating: 2,
    },

    {
      name: '1stars & up',
      rating: 1,
    },
];


export default function SearchScreen() {

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';

  const [{ loading, error, products, countProducts}, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/products/search?query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`);
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: data
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: ' FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [category, price, error, order, rating, query]);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;

    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}`;
  }



  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>

      <Row>
        <Col md={3}>
          <h3>Category</h3>
          <div>
            <ul>
              <li>
                <Link className={'all' === category ? 'text-bold' : ''} to={getFilterUrl({category: 'all'})}>
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link className={c === category ? 'text-bold' : ''} to={getFilterUrl({category: c})}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Price</h3>
            <ul>
              <li>
                <Link className={'all' === price ? 'text-bold' : ''} to={getFilterUrl({price: 'all'})}>
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link className={p.value === price ? 'text-bold' : ''} to={getFilterUrl({price: p.value})}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Ratings</h3>
            <ul>
              {ratings.map((r) => (
                <li key = {r.name}>
                  <Link className={`${r.rating}` === `${rating}` ? 'text-bold' : ''} to={getFilterUrl({rating: r.rating})}>
                    <Rating caption={' Stars'} rating={r.rating} />
                  </Link>
                </li>
              ))}
              <li>
                <Link className={rating === 'all' ? 'text-bold' : ''} to={getFilterUrl({rating: 'all'})}>
                  <Rating caption={'No Reviews'} rating={0} />
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox />
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
            <Row className="justify-content-between mb-3">
              <Col md={6}>
                <div>
                  {countProducts === 0 ? 'No' : countProducts} Results
                  {query !== 'all' && ' : ' + query + ' '}
                  {category !== 'all' && ' : ' + category + ' '}
                  {price !== 'all' && ' : Price $' + price + ' '}
                  {rating !== 'all' && ' : Rating ' + rating + 'stars '}
                  {query !== 'all' || category !== 'all' || rating !== 'all' || price !== 'all' ? (
                    <Button variant="light" onClick={() => navigate('/search')}>
                      <i className="fas fa-times-circle" />
                    </Button>
                  ) : null}
                </div>
              </Col>
              <Col className="text-end">
                Sort by{' '}
                <select value={order} onChange={(e) => {
                  navigate(getFilterUrl({order: e.target.value}));
                }}>
                <option value="newest">Newest Listings</option>
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                <option value="ratings">Ratings: High to Low</option>
                </select>
              </Col>
            </Row>
            {products.length === 0 && (
              <MessageBox>No Products Found</MessageBox>
            )}
            <Row>
              {products.map((product) => (
                <Col sm={6} lg={4} className="mb-3" key={product._id}>
                  <Product product={product} />
                </Col>
              ))}
            </Row>
            </>
          )}
        </Col>
      </Row>
    </div>

  )
}
