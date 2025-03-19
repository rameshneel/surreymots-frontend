import Loading from "../routes/Loading";
import { createContext, useState, useContext, useEffect } from "react";
import { checkAuth, privateApi, refreshAccessToken } from "../services/api";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await checkAuth();
        console.log("checkAuth response:", response?.data);
        console.log(
          "Setting isAuthenticated to:",
          response?.data?.data?.authenticated
        );
        setIsAuthenticated(response.data?.data?.authenticated);
      } catch (error) {
        console.log("errro", error);

        console.error("checkAuth error:", error);
        if (error.response?.status === 401) {
          await refreshAndRetry();
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const refreshAndRetry = async () => {
    try {
      await refreshAccessToken();
      const response = await checkAuth();
      console.log(
        "refreshAndRetry response:",
        response?.data?.data?.authenticated
      );
      setIsAuthenticated(response?.data?.data?.authenticated);
    } catch (error) {
      console.error("refreshAndRetry error:", error);
      updateAuthStatus(false);
    }
  };

  useEffect(() => {
    privateApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await refreshAccessToken();
            return privateApi(error.config);
          } catch (refreshError) {
            updateAuthStatus(false);
          }
        }
        // if (error.response?.status === 403) {
        //   updateAuthStatus(false);
        // }
        return Promise.reject(error);
      }
    );
  }, []);

  const updateAuthStatus = (authenticated) => {
    setIsAuthenticated(authenticated);
  };
  if (isLoading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }
  console.log("isAuthenticated:", isAuthenticated);
  return (
    <AuthContext.Provider value={{ isAuthenticated, updateAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);

// import { createContext, useState, useContext, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { privateApi, checkAuth, refreshAccessToken } from "../services/api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const response = await checkAuth();
//         setIsAuthenticated(response.data.authenticated);
//       } catch (error) {
//         if (error.response?.status === 401) {
//           await refreshAndRetry();
//         } else {
//           setIsAuthenticated(false);
//         }
//       }
//     };
//     initializeAuth();
//   }, []);

//   const updateAuthStatus = (authenticated) => {
//     setIsAuthenticated(authenticated);
//   };

//   const refreshAndRetry = async () => {
//     try {
//       await refreshAccessToken();
//       const { authenticated } = await checkAuth();
//       setIsAuthenticated(authenticated);
//     } catch (error) {
//       updateAuthStatus(false);
//     }
//   };

//   useEffect(() => {
//     privateApi.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           try {
//             await refreshAccessToken();
//             return privateApi(error.config);
//           } catch (refreshError) {
//             updateAuthStatus(false);
//           }
//         }
//         // if (error.response?.status === 403) {
//         //   // navigate("/login");
//         //   updateAuthStatus(false);
//         // }
//         return Promise.reject(error);
//       }
//     );
//   }, [navigate]);

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, updateAuthStatus }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
