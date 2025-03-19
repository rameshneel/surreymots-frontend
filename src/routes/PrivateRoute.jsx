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

  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated);

  if (isAuthenticated === null) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  // If authenticated and redirectAuthenticated is true, redirect to the specified route
  if (isAuthenticated && redirectAuthenticated) {
    return <Navigate to={to} replace />;
  }

  // If unauthenticated users are allowed (e.g., for login page)
  if (!isAuthenticated && allowUnauthenticated) {
    return children;
  }

  // Normal protected route logic
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
export default ProtectedRoute;

// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Loading from "./Loading";

// const ProtectedRoute = ({
//   children,
//   redirectAuthenticated = false,
//   to = "/admin",
//   allowUnauthenticated = false,
// }) => {
//   const { isAuthenticated } = useAuth();
//   if (isAuthenticated === null) {
//     return (
//       <div>
//         <Loading />
//       </div>
//     );
//   }

//   if (isAuthenticated && redirectAuthenticated) {
//     return <Navigate to={to} replace />;
//   }

//   if (!isAuthenticated && allowUnauthenticated) {
//     return children;
//   }

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;
