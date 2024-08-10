import PropTypes from 'prop-types';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
// pages
// import Login from '../Page/auth/Login';

// components
import LoadingScreen from '../components/LoadingScreen';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../components/Login';
// import { setLoading } from '../redux/userSlice';

// ----------------------------------------------------------------------

AuthGuard.propTypes = {
  children: PropTypes.node,
};

export default function AuthGuard({ children }) {
  // const { isAuthenticated, isInitialized } = useAuth();
 const dispatch=useDispatch()
  const { pathname } = useLocation();
  const [requestedLocation, setRequestedLocation] = useState(null);
  const isAuthenticated = useSelector((state) => state?.auth.token);
//   const isInitialized = useSelector((state) => state?.auth.isLoading);
  // console.log("isAuthenticated from dashboard.................",isAuthenticated.token)
//   if (isInitialized) {
//     return <LoadingScreen isDashboard={true} />;
//   }

  if (!isAuthenticated) {
    if (pathname !== requestedLocation) {
      setRequestedLocation(pathname);
    }
    return <Login />;
  }

  if (requestedLocation && pathname !== requestedLocation) {
    // dispatch(setLoading(false))
    setRequestedLocation(null);
    return <Navigate to={requestedLocation} />;
  }

  return <>{children}</>;
}
