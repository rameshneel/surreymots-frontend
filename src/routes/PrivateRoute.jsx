import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const ProtectedRoute = ({
  children,
  redirectAuthenticated = false,
  to = "/admin",
  allowUnauthenticated = false,
}) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated === null) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (isAuthenticated && redirectAuthenticated) {
    return <Navigate to={to} replace />;
  }

  if (!isAuthenticated && allowUnauthenticated) {
    return children;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
