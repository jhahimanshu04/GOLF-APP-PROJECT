import { Navigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

// Requires login
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
};

// Requires active subscription
export const SubscribedRoute = ({ children }) => {
  const { isAuthenticated, isSubscribed } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isSubscribed()) return <Navigate to="/pricing" replace />;
  return children;
};

// Requires admin role
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};
