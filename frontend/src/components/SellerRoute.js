import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../Store';

export default function SellerRoute({children}) {

  const {state} = useContext(Store);
  const {userInfo} = state;
  return userInfo && userInfo.userRole === 'seller' ? children : <Navigate to ="/signin" />;
}
