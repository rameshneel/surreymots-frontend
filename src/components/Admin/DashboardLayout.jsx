import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  User,
  Bookmark,
  Calendar,
  ChevronDown,
  Menu,
} from "lucide-react";
import CustomerList from "./CustomerList";
import BookingbyAdminForm from "./BookingbyAdminForm";
import BookingManagement from "./BookingManagement";
import SlotManager from "./SlotManager";
import UserProfile from "./UserProfile";
import { logout } from "../../services/api";
import logo from "../../assets/logo-dark.png";

// Import the new LogoutModal
import LogoutModal from "./LogoutModal";

const sidebarItems = [
  { name: "Bookings", icon: Calendar, path: "/admin" },
  {
    name: "Customer Bookings",
    icon: Bookmark,
    path: "/admin/booking/customer",
  },
  {
    name: "Customer Calendar",
    icon: Calendar,
    path: "/admin/booking/calender",
  },
];

const DashboardLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle for mobile
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State for logout modal
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const renderPage = () => {
    switch (location.pathname) {
      case "/admin":
        return <CustomerList />;
      case "/admin/booking/customer":
        return <BookingbyAdminForm />;
      case "/admin/booking/calender":
        return <BookingManagement />;
      case "/admin/booking/slotmanager":
        return <SlotManager />;
      default:
        return <CustomerList />;
    }
  };

  // Sidebar content extracted for reuse
  const SidebarContent = () => (
    <>
      <div className="p-6  z-30 flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-wide text-teal-400">
          <img src={logo} alt="logo" className="w-48 pt-4" />
        </h1>
        <button
          className="md:hidden text-gray-400"
          onClick={() => setIsSidebarOpen(false)}
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-8 space-y-2 px-3 flex-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-teal-500 text-white shadow-md"
                : "text-gray-300 hover:bg-gray-700 hover:text-teal-300"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-900 font-sans text-gray-200">
      {/* Sidebar: Mobile (Animated) */}
      <motion.div
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-xl z-20 md:hidden"
      >
        <SidebarContent />
      </motion.div>

      {/* Sidebar: Desktop (Static) */}
      <div className="hidden md:block w-64 bg-gray-800 shadow-xl">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden text-gray-400"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-200 sm:text-2xl truncate">
                {sidebarItems.find((item) => item.path === location.pathname)
                  ?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 text-gray-400 hover:text-teal-400 focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </motion.button> */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-gray-400 focus:outline-none"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <User className="h-8 w-8 text-gray-400" />
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </motion.button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-700 ring-1 ring-gray-600 md:w-40"
                    >
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsLogoutModalOpen(true); // Open logout modal
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* UserProfile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            onClick={() => setIsProfileModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <UserProfile onClose={() => setIsProfileModalOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <LogoutModal
            isOpen={isLogoutModalOpen}
            onClose={() => setIsLogoutModalOpen(false)}
            onConfirm={() => {
              handleLogout();
              setIsLogoutModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Bell,
//   User,
//   Bookmark,
//   Calendar,
//   ChevronDown,
//   Menu,
// } from "lucide-react";
// import CustomerList from "./CustomerList";
// import BookingbyAdminForm from "./BookingbyAdminForm";
// import BookingManagement from "./BookingManagement";
// import SlotManager from "./SlotManager";
// import UserProfile from "./UserProfile";
// import { logout } from "../../services/api";
// import logo from "../../assets/logo-dark.png";

// const sidebarItems = [
//   { name: "Booking", icon: Calendar, path: "/admin" },
//   { name: "Customer Booking", icon: Bookmark, path: "/admin/booking/customer" },
//   {
//     name: "Customer Calendar",
//     icon: Calendar,
//     path: "/admin/booking/calender",
//   },
// ];

// const DashboardLayout = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle for mobile
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dropdownRef = useRef(null);

//   const handleLogout = async (e) => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       e.preventDefault();
//       try {
//         await logout();
//         navigate("/login");
//       } catch (err) {
//         console.error("Logout error:", err);
//       }
//     }
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setIsProfileOpen(false);
//     }
//   };

//   useEffect(() => {
//     if (isProfileOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isProfileOpen]);

//   const renderPage = () => {
//     switch (location.pathname) {
//       case "/admin":
//         return <CustomerList />;
//       case "/admin/booking/customer":
//         return <BookingbyAdminForm />;
//       case "/admin/booking/calender":
//         return <BookingManagement />;
//       case "/admin/booking/slotmanager":
//         return <SlotManager />;
//       default:
//         return <CustomerList />;
//     }
//   };

//   // Sidebar content extracted for reuse
//   const SidebarContent = () => (
//     <>
//       <div className="p-6 flex justify-between items-center">
//         <h1 className="text-2xl font-semibold tracking-wide text-teal-400">
//           <img src={logo} alt="logo" className="w-32" />
//         </h1>
//         <button
//           className="md:hidden text-gray-400" // Hide close button on desktop
//           onClick={() => setIsSidebarOpen(false)}
//         >
//           <ChevronDown className="h-6 w-6" />
//         </button>
//       </div>
//       <nav className="mt-8 space-y-2 px-3 flex-1">
//         {sidebarItems.map((item) => (
//           <Link
//             key={item.name}
//             to={item.path}
//             onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click in mobile
//             className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
//               location.pathname === item.path
//                 ? "bg-teal-500 text-white shadow-md"
//                 : "text-gray-300 hover:bg-gray-700 hover:text-teal-300"
//             }`}
//           >
//             <item.icon className="w-5 h-5 mr-3" />
//             <span className="text-sm font-medium">{item.name}</span>
//           </Link>
//         ))}
//       </nav>
//     </>
//   );

//   return (
//     <div className="flex min-h-screen bg-gray-900 font-sans text-gray-200">
//       {/* Sidebar: Mobile (Animated) */}
//       <motion.div
//         animate={{ x: isSidebarOpen ? 0 : -250 }}
//         transition={{ duration: 0.3 }}
//         className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-xl z-20 md:hidden" // Hidden on desktop
//       >
//         <SidebarContent />
//       </motion.div>

//       {/* Sidebar: Desktop (Static) */}
//       <div className="hidden md:block w-64 bg-gray-800 shadow-xl">
//         <SidebarContent />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-gray-800 shadow-md">
//           <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <button
//                 className="md:hidden text-gray-400" // Show menu button only on mobile
//                 onClick={() => setIsSidebarOpen(true)}
//               >
//                 <Menu className="h-6 w-6" />
//               </button>
//               <h2 className="text-xl font-semibold text-gray-200 sm:text-2xl truncate">
//                 {sidebarItems.find((item) => item.path === location.pathname)
//                   ?.name || "Dashboard"}
//               </h2>
//             </div>
//             <div className="flex items-center space-x-4">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 className="p-2 text-gray-400 hover:text-teal-400 focus:outline-none"
//                 aria-label="Notifications"
//               >
//                 <Bell className="h-6 w-6" />
//               </motion.button>
//               <div className="relative" ref={dropdownRef}>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   className="flex items-center space-x-2 text-gray-400 focus:outline-none"
//                   onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 >
//                   <User className="h-8 w-8 text-gray-400" />
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </motion.button>
//                 <AnimatePresence>
//                   {isProfileOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-700 ring-1 ring-gray-600 md:w-40"
//                     >
//                       <button
//                         onClick={() => {
//                           setIsProfileModalOpen(true);
//                           setIsProfileOpen(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Profile
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Logout
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-900">
//           <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
//             {renderPage()}
//           </div>
//         </main>
//       </div>

//       {/* UserProfile Modal */}
//       <AnimatePresence>
//         {isProfileModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
//             onClick={() => setIsProfileModalOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 50 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 50 }}
//               transition={{ duration: 0.3 }}
//               className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <UserProfile onClose={() => setIsProfileModalOpen(false)} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Bell,
//   User,
//   Bookmark,
//   Calendar,
//   ChevronDown,
//   Menu,
// } from "lucide-react";
// import CustomerList from "./CustomerList";
// import BookingbyAdminForm from "./BookingbyAdminForm";
// import BookingManagement from "./BookingManagement";
// import SlotManager from "./SlotManager";
// import UserProfile from "./UserProfile";
// import { logout } from "../../services/api";
// import logo from "../../assets/logo-dark.png";

// const sidebarItems = [
//   { name: "Booking", icon: Calendar, path: "/admin" },
//   { name: "Customer Booking", icon: Bookmark, path: "/admin/booking/customer" },
//   {
//     name: "Customer Calendar",
//     icon: Calendar,
//     path: "/admin/booking/calender",
//   },
// ];

// const DashboardLayout = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar toggle
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dropdownRef = useRef(null);

//   const handleLogout = async (e) => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       e.preventDefault();
//       try {
//         await logout();
//         navigate("/login");
//       } catch (err) {
//         console.error("Logout error:", err);
//       }
//     }
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setIsProfileOpen(false);
//     }
//   };

//   useEffect(() => {
//     if (isProfileOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isProfileOpen]);

//   const renderPage = () => {
//     switch (location.pathname) {
//       case "/admin":
//         return <CustomerList />;
//       case "/admin/booking/customer":
//         return <BookingbyAdminForm />;
//       case "/admin/booking/calender":
//         return <BookingManagement />;
//       case "/admin/booking/slotmanager":
//         return <SlotManager />;
//       default:
//         return <CustomerList />;
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 font-sans text-gray-200">
//       {/* Sidebar */}
//       <motion.div
//         initial={{ x: -250 }}
//         animate={{ x: isSidebarOpen ? 0 : -250 }}
//         transition={{ duration: 0.3 }}
//         className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-xl z-20 md:relative md:translate-x-0 md:w-64"
//       >
//         <div className="p-6 flex justify-between items-center">
//           <h1 className="text-2xl font-semibold tracking-wide text-teal-400">
//             <img src={logo} alt="logo" className="w-32" />
//           </h1>
//           <button
//             className="md:hidden text-gray-400"
//             onClick={() => setIsSidebarOpen(false)}
//           >
//             <ChevronDown className="h-6 w-6" />
//           </button>
//         </div>
//         <nav className="mt-8 space-y-2 px-3">
//           {sidebarItems.map((item) => (
//             <Link
//               key={item.name}
//               to={item.path}
//               onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click in mobile
//               className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
//                 location.pathname === item.path
//                   ? "bg-teal-500 text-white shadow-md"
//                   : "text-gray-300 hover:bg-gray-700 hover:text-teal-300"
//               }`}
//             >
//               <item.icon className="w-5 h-5 mr-3" />
//               <span className="text-sm font-medium">{item.name}</span>
//             </Link>
//           ))}
//         </nav>
//       </motion.div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-gray-800 shadow-md">
//           <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
//             <div className="flex items-center space-x-4">
//               <button
//                 className="md:hidden text-gray-400"
//                 onClick={() => setIsSidebarOpen(true)}
//               >
//                 <Menu className="h-6 w-6" />
//               </button>
//               <h2 className="text-xl font-semibold text-gray-200 sm:text-2xl truncate">
//                 {sidebarItems.find((item) => item.path === location.pathname)
//                   ?.name || "Dashboard"}
//               </h2>
//             </div>
//             <div className="flex items-center space-x-4">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 className="p-2 text-gray-400 hover:text-teal-400 focus:outline-none"
//                 aria-label="Notifications"
//               >
//                 <Bell className="h-6 w-6" />
//               </motion.button>
//               <div className="relative" ref={dropdownRef}>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   className="flex items-center space-x-2 text-gray-400 focus:outline-none"
//                   onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 >
//                   <User className="h-8 w-8 text-gray-400" />
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </motion.button>
//                 <AnimatePresence>
//                   {isProfileOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-700 ring-1 ring-gray-600 md:w-40"
//                     >
//                       <button
//                         onClick={() => {
//                           setIsProfileModalOpen(true);
//                           setIsProfileOpen(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Profile
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Logout
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-900">
//           <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
//             {renderPage()}
//           </div>
//         </main>
//       </div>

//       {/* UserProfile Modal */}
//       <AnimatePresence>
//         {isProfileModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
//             onClick={() => setIsProfileModalOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 50 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 50 }}
//               transition={{ duration: 0.3 }}
//               className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <UserProfile onClose={() => setIsProfileModalOpen(false)} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Bell, User, Bookmark, Calendar, ChevronDown } from "lucide-react";
// import CustomerList from "./CustomerList";
// import BookingbyAdminForm from "./BookingbyAdminForm";
// import BookingManagement from "./BookingManagement";
// import SlotManager from "./SlotManager";
// import UserProfile from "./UserProfile";
// import { logout } from "../../services/api";
// import logo from "../../assets/logo-dark.png";

// const sidebarItems = [
//   { name: "Booking", icon: Calendar, path: "/admin" },
//   { name: "Customer Booking", icon: Bookmark, path: "/admin/booking/customer" },
//   {
//     name: "Customer Calendar",
//     icon: Calendar,
//     path: "/admin/booking/calender",
//   },
// ];

// const DashboardLayout = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dropdownRef = useRef(null);
//   const handleLogout = async (e) => {
//     if (window.confirm("Are you sure you want to log out?")) {
//       e.preventDefault();
//       setError("");
//       setLoading(true);
//       try {
//         await logout();
//         navigate("/login");
//       } catch (err) {
//         console.error("Logout error:", err);
//         setError("An error occurred during logout. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setIsProfileOpen(false);
//     }
//   };

//   useEffect(() => {
//     if (isProfileOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isProfileOpen]);

//   const renderPage = () => {
//     switch (location.pathname) {
//       case "/admin":
//         return <CustomerList />;
//       case "/admin/booking/customer":
//         return <BookingbyAdminForm />;
//       case "/admin/booking/calender":
//         return <BookingManagement />;
//       case "/admin/booking/slotmanager":
//         return <SlotManager />;
//       default:
//         return <CustomerList />;
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-900 font-sans text-gray-200">
//       {/* Sidebar */}
//       <motion.div
//         initial={{ x: -250 }}
//         animate={{ x: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-64 bg-gray-800 shadow-xl"
//       >
//         <div className="p-6">
//           <h1 className="text-2xl font-semibold tracking-wide text-teal-400">
//             <img src={logo} alt="logo" />
//           </h1>
//         </div>
//         <nav className="mt-8 space-y-2 px-3">
//           {sidebarItems.map((item) => (
//             <Link
//               key={item.name}
//               to={item.path}
//               className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
//                 location.pathname === item.path
//                   ? "bg-teal-500 text-white shadow-md"
//                   : "text-gray-300 hover:bg-gray-700 hover:text-teal-300"
//               }`}
//             >
//               <item.icon className="w-5 h-5 mr-3" />
//               <span className="text-sm font-medium">{item.name}</span>
//             </Link>
//           ))}
//         </nav>
//       </motion.div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-gray-800 shadow-md">
//           <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-200 sm:text-2xl truncate">
//               {sidebarItems.find((item) => item.path === location.pathname)
//                 ?.name || "Dashboard"}
//             </h2>
//             <div className="flex items-center space-x-4">
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 className="p-2 text-gray-400 hover:text-teal-400 focus:outline-none"
//                 aria-label="Notifications"
//               >
//                 <Bell className="h-6 w-6" />
//               </motion.button>
//               <div className="relative" ref={dropdownRef}>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   className="flex items-center space-x-2 text-gray-400 focus:outline-none"
//                   onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 >
//                   <User className="h-8 w-8 text-gray-400" />
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </motion.button>
//                 <AnimatePresence>
//                   {isProfileOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -10 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -10 }}
//                       transition={{ duration: 0.2 }}
//                       className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-gray-700 ring-1 ring-gray-600"
//                     >
//                       <button
//                         onClick={() => {
//                           setIsProfileModalOpen(true);
//                           setIsProfileOpen(false);
//                         }}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Profile
//                       </button>
//                       <button
//                         onClick={handleLogout}
//                         className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-teal-300"
//                       >
//                         Logout
//                       </button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-y-auto bg-gray-900">
//           <div className="container mx-auto px-6 py-8">{renderPage()}</div>
//         </main>
//       </div>

//       {/* UserProfile Modal */}
//       <AnimatePresence>
//         {isProfileModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
//             onClick={() => setIsProfileModalOpen(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, y: 50 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.9, y: 50 }}
//               transition={{ duration: 0.3 }}
//               className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <UserProfile onClose={() => setIsProfileModalOpen(false)} />
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;
