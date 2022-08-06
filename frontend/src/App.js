import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import RegisterScreen from './screens/RegisterScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import BuyerRoute from './components/BuyerRoute';
import SellerRoute from './components/SellerRoute';
import ProfileScreen from './screens/ProfileScreen';
import BuyerScreen from './screens/BuyerScreen';
import ProductListingScreen from './screens/ProductListingScreen';
import OrderHistorySellerScreen from './screens/OrderHistorySellerScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import RequestEditScreen from './screens/RequestEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import SearchScreen from './screens/SearchScreen';
import RequestsPageScreen from './screens/RequestsPageScreen';
import RequestPostScreen from './screens/RequestPostScreen';
import DashboardScreen from './screens/DashboardScreen';
import VerificationScreen from './screens/VerificationScreen';
import ProductRequestScreen from './screens/ProductRequestScreen';
import FavouritesPage from './screens/FavouritesPage';
import RequestsPageSellerScreen from './screens/RequestsPageSellerScreen';
import SellerScreen from './screens/SellerScreen';
import SearchBox from './components/SearchBox';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getError } from './utils';
import axios from 'axios';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;


  const signoutHandler = () => {
    ctxDispatch({type: 'USER_SIGNOUT'});
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async() => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  return (
    <BrowserRouter>
      <div className={sidebarIsOpen ? "d-flex flex-column site-container active-cont" : "d-flex flex-column site-container"}>
      <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar variant="light" expand="lg">
            <Container>
            <Button variant="light" onClick={() => setSidebarIsOpen(!sidebarIsOpen)}>
              <i className="fas fa-bars" />
            </Button>
              <LinkContainer to="/">
                <Navbar.Brand id="craftant">Craftant</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
                <Nav className="me-auto w-100 justify-content-end">
                {userInfo && userInfo.userRole === 'buyer' ? (
                  <Link to="/cart" className="nav-link">
                    Cart
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                ): (
                  null
                )}
                  {userInfo ? (
                    <NavDropdown title={`Welcome, ${userInfo.name}`} id="dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item className="dropdown-item">Account Settings</NavDropdown.Item>
                      </LinkContainer>
                      {userInfo.userRole === 'buyer' ? (
                        <>
                        <LinkContainer to="/orderhistory">
                          <NavDropdown.Item>Order History</NavDropdown.Item>
                        </LinkContainer>

                        <LinkContainer to="/buyer/request">
                          <NavDropdown.Item>Product Requests</NavDropdown.Item>
                        </LinkContainer>

                        <LinkContainer to={`/buyer/${userInfo._id}`}>
                          <NavDropdown.Item>My Page</NavDropdown.Item>
                        </LinkContainer>

                        <LinkContainer to={`/buyer/${userInfo._id}/favourites`}>
                          <NavDropdown.Item>My Favourites ♡</NavDropdown.Item>
                        </LinkContainer>
                        </>
                      ) : userInfo.userRole === 'seller' ? (
                          <LinkContainer to="/seller/verification">
                            <NavDropdown.Item>Verification</NavDropdown.Item>
                          </LinkContainer>
                      ) : (
                        null
                      )}
                      <NavDropdown.Divider />
                        <Link className="dropdown-item" to="#signout" onClick={signoutHandler}>Sign Out</Link>
                    </NavDropdown>
                  ):(
                    <Link className="nav-link" to="/signin">
                    Sign In
                    </Link>
                  )}

                  {userInfo && userInfo.userRole === 'seller' && (
                    <NavDropdown title="Admin" id="dropdown">
                     {userInfo.shop ? (
                        <LinkContainer to="/seller/dashboard">
                          <NavDropdown.Item>Dashboard</NavDropdown.Item>
                        </LinkContainer>
                      ) : (
                        <NavDropdown.Item onClick={(e) => toast.error("Please set up your shop in Account Settings first.")}>Dashboard</NavDropdown.Item>
                      )}

                      <LinkContainer to="/seller/products">
                        <NavDropdown.Item>My Products</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/seller/orders">
                        <NavDropdown.Item>Pending Orders</NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/seller/orders/history">
                        <NavDropdown.Item>Order History</NavDropdown.Item>
                      </LinkContainer>

                      {userInfo.shop ? (
                        <LinkContainer to={`/seller/${userInfo.shop}`}>
                          <NavDropdown.Item>My Shop</NavDropdown.Item>
                        </LinkContainer>
                      ) : (
                        <NavDropdown.Item onClick={(e) => toast.error("Please set up your shop in Account Settings first.")}>My Shop</NavDropdown.Item>
                      )}

                      <LinkContainer to="/seller/request">
                        <NavDropdown.Item>Applied Requests</NavDropdown.Item>
                      </LinkContainer>

                    </NavDropdown>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div className={sidebarIsOpen ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column':'side-navbar f-flex justify-content-between flex-wrap flex-column'}>
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer to={`/search?category=${category}`} onClick={() => setSidebarIsOpen(false)}>
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
            <br/>
            <Nav.Item>
              <strong>Product/Service Requests</strong>
              <LinkContainer to="/requests" onClick={() => setSidebarIsOpen(false)}>
                <Nav.Link>Requests</Nav.Link>
              </LinkContainer>
            </Nav.Item>
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/product/:slug" element={<ProductScreen />} />
              <Route path="/buyer/request/page/:id" element={<RequestPostScreen />} />
              <Route path="/cart" element={<BuyerRoute><CartScreen /></BuyerRoute>} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/requests" element={<RequestsPageScreen />} />
              <Route path="/shipping" element={<BuyerRoute><ShippingAddressScreen /></BuyerRoute>} />
              <Route path="/placeorder" element={<BuyerRoute><PlaceOrderScreen /></BuyerRoute>} />
              <Route path="/order/:id" element={<OrderScreen />} />
              <Route path="/orderhistory" element={<BuyerRoute><OrderHistoryScreen /></BuyerRoute>} />
              <Route path="/payment" element={<BuyerRoute><PaymentMethodScreen /></BuyerRoute>} />
              <Route path="/buyer/request" element={<BuyerRoute><ProductRequestScreen /></BuyerRoute>} />
              <Route path="/buyer/:id/favourites" element={<BuyerRoute><FavouritesPage /></BuyerRoute>} />
              <Route path="/buyer/:id" element={<BuyerScreen />} />
              <Route path="/buyer/request/:id" element={<BuyerRoute><RequestEditScreen /></BuyerRoute>} />

              <Route path="/seller/dashboard" element={<SellerRoute><DashboardScreen/></SellerRoute>} />
              <Route path="/seller/products" element={<SellerRoute><ProductListingScreen/></SellerRoute>} />
              <Route path="/seller/orders" element={<SellerRoute><OrderListScreen/></SellerRoute>} />
              <Route path="/seller/request" element={<SellerRoute><RequestsPageSellerScreen/></SellerRoute>} />
              <Route path="/seller/:shop" element={<SellerScreen/>}/>
              <Route path="/seller/verification" element={<SellerRoute><VerificationScreen/></SellerRoute>} />
              <Route path="/seller/product/:id" element={<SellerRoute><ProductEditScreen/></SellerRoute>} />
              <Route path="/seller/orders/history" element={<SellerRoute><OrderHistorySellerScreen/></SellerRoute>} />
              <Route path="/" element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center">All rights reserved - Craftant</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
