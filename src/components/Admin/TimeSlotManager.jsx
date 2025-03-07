// import React, { useState, useEffect, memo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   CheckCircleIcon,
//   XCircleIcon,
//   LockClosedIcon,
//   LockOpenIcon,
//   UserIcon,
// } from "@heroicons/react/24/outline";
// import {
//   getAvailableTimeSlots,
//   blockTimeSlots,
//   unblockTimeSlots,
// } from "../../services/api";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Adding memo to prevent unnecessary re-renders
// const TimeSlotManager = memo(({ date }) => {
//   function formatDateForBackend(date) {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   }
//   const globalDate = formatDateForBackend(date);

//   const [timeSlots, setTimeSlots] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (date) {
//       fetchTimeSlots(date);
//     }
//     // Cleanup function to prevent memory leaks
//     return () => {
//       setTimeSlots([]);
//       setError(null);
//     };
//   }, [date]);

//   const fetchTimeSlots = async (selectedDate) => {
//     const dateFormatted = formatDateForBackend(selectedDate);
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getAvailableTimeSlots(dateFormatted);
//       if (response.data.statusCode === 200 && response.data.success) {
//         setTimeSlots(response.data.data);
//       } else {
//         throw new Error(response.message || "Failed to fetch time slots");
//       }
//     } catch (error) {
//       setError("Error fetching time slots: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBlockUnblock = async (slot) => {
//     setLoading(true);
//     setError(null);
//     const action = slot.status === "Blocked" ? "unblock" : "block";

//     try {
//       if (slot.status === "Blocked") {
//         await unblockTimeSlots(globalDate, [slot.time]);
//         toast.success(`Slot ${slot.time} unblocked successfully!`);
//       } else if (slot.status === "Available") {
//         await blockTimeSlots(globalDate, [slot.time]);
//         toast.success(`Slot ${slot.time} blocked successfully!`);
//       }
//       await fetchTimeSlots(date);
//     } catch (error) {
//       toast.error(`Error ${action}ing time slot: ` + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "Available":
//         return <CheckCircleIcon className="w-5 h-5 text-teal-400 mr-2" />;
//       case "Blocked":
//         return <LockClosedIcon className="w-5 h-5 text-red-400 mr-2" />;
//       case "Booked":
//         return <UserIcon className="w-5 h-5 text-blue-400 mr-2" />;
//       default:
//         return null;
//     }
//   };

//   if (loading)
//     return (
//       <div className="text-center py-4 text-gray-400 animate-pulse">
//         Loading...
//       </div>
//     );
//   if (error)
//     return <div className="text-center py-4 text-red-400">{error}</div>;

//   return (
//     <div className="max-w-2xl mx-auto bg-gray-800 shadow-lg rounded-lg">
//       {/* Added fixed height and custom scrollbar */}
//       <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
//         <table className="w-full">
//           <thead className="sticky top-0 bg-gray-700">
//             <tr>
//               <th className="px-4 py-2 text-left text-gray-300">Time Slot</th>
//               <th className="px-4 py-2 text-left text-gray-300">Status</th>
//               <th className="px-4 py-2 text-left text-gray-300">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             <AnimatePresence>
//               {timeSlots.map((slot) => (
//                 <motion.tr
//                   key={slot.time}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -20 }}
//                   transition={{ duration: 0.2 }}
//                   whileHover={{ backgroundColor: "#374151" }}
//                   className="border-b border-gray-700"
//                 >
//                   <td className="px-4 py-2 text-gray-200">{slot.time}</td>
//                   <td className="px-4 py-2">
//                     <div className="flex items-center text-gray-200">
//                       {getStatusIcon(slot.status)}
//                       <span className="capitalize">{slot.status}</span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-2">
//                     {slot.status !== "Booked" && (
//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={() => handleBlockUnblock(slot)}
//                         className={`px-3 py-1 rounded-full text-sm ${
//                           slot.status === "Blocked"
//                             ? "bg-teal-600 text-white hover:bg-teal-500"
//                             : "bg-red-600 text-white hover:bg-red-500"
//                         }`}
//                         disabled={loading}
//                       >
//                         {loading ? (
//                           <span className="animate-spin w-4 h-4 inline mr-1">
//                             🔄
//                           </span>
//                         ) : slot.status === "Blocked" ? (
//                           <>
//                             <LockOpenIcon className="w-4 h-4 inline mr-1" />
//                             Unblock
//                           </>
//                         ) : (
//                           <>
//                             <LockClosedIcon className="w-4 h-4 inline mr-1" />
//                             Block
//                           </>
//                         )}
//                       </motion.button>
//                     )}
//                   </td>
//                 </motion.tr>
//               ))}
//             </AnimatePresence>
//           </tbody>
//         </table>
//       </div>
//       <ToastContainer theme="dark" />
//     </div>
//   );
// });

// // Adding displayName for better debugging
// TimeSlotManager.displayName = "TimeSlotManager";

// export default TimeSlotManager;

import React, { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  getAvailableTimeSlots,
  blockTimeSlots,
  unblockTimeSlots,
} from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TimeSlotManager = memo(({ date }) => {
  function formatDateForBackend(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const globalDate = formatDateForBackend(date);

  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (date) {
      fetchTimeSlots(date);
    }
    return () => {
      setTimeSlots([]);
      setError(null);
    };
  }, [date]);

  const fetchTimeSlots = async (selectedDate) => {
    const dateFormatted = formatDateForBackend(selectedDate);
    setLoading(true);
    setError(null);
    try {
      const response = await getAvailableTimeSlots(dateFormatted);
      if (response.data.statusCode === 200 && response.data.success) {
        setTimeSlots(response.data.data);
      } else {
        throw new Error(response.message || "Failed to fetch time slots");
      }
    } catch (error) {
      setError("Error fetching time slots: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (slot) => {
    setLoading(true);
    setError(null);
    const action = slot.status === "Blocked" ? "unblock" : "block";

    try {
      if (slot.status === "Blocked") {
        await unblockTimeSlots(globalDate, [slot.time]);
        toast.success(`Slot ${slot.time} unblocked successfully!`);
      } else if (slot.status === "Available") {
        await blockTimeSlots(globalDate, [slot.time]);
        toast.success(`Slot ${slot.time} blocked successfully!`);
      }
      await fetchTimeSlots(date);
    } catch (error) {
      toast.error(`Error ${action}ing time slot: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Available":
        return (
          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 mr-2" />
        );
      case "Blocked":
        return (
          <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2" />
        );
      case "Booked":
        return (
          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="text-center py-4 text-gray-400 animate-pulse text-sm sm:text-base">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-4 text-red-400 text-sm sm:text-base">
        {error}
      </div>
    );

  return (
    <div className="w-full mx-auto bg-gray-800 shadow-lg rounded-lg">
      {/* Table for Desktop/Tablet */}
      <div className="hidden sm:block max-h-[400px] overflow-y-auto overflow-x-hidden">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left text-xs sm:text-sm text-gray-300">
                Time Slot
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm text-gray-300">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs sm:text-sm text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {timeSlots.map((slot) => (
                <motion.tr
                  key={slot.time}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ backgroundColor: "#374151" }}
                  className="border-b border-gray-700"
                >
                  <td className="px-4 py-2 text-sm text-gray-200">
                    {slot.time}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center text-sm text-gray-200">
                      {getStatusIcon(slot.status)}
                      <span className="capitalize">{slot.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {slot.status !== "Booked" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBlockUnblock(slot)}
                        className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                          slot.status === "Blocked"
                            ? "bg-teal-600 text-white hover:bg-teal-500"
                            : "bg-red-600 text-white hover:bg-red-500"
                        }`}
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="animate-spin w-4 h-4 inline mr-1">
                            🔄
                          </span>
                        ) : slot.status === "Blocked" ? (
                          <>
                            <LockOpenIcon className="w-4 h-4 inline mr-1" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <LockClosedIcon className="w-4 h-4 inline mr-1" />
                            Block
                          </>
                        )}
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className="sm:hidden space-y-2 p-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {timeSlots.map((slot) => (
            <motion.div
              key={slot.time}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
            >
              <div className="text-sm text-gray-200">
                <div>{slot.time}</div>
                <div className="flex items-center text-xs">
                  {getStatusIcon(slot.status)}
                  {slot.status}
                </div>
              </div>
              {slot.status !== "Booked" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBlockUnblock(slot)}
                  className={`px-2 py-1 rounded-full text-xs ${
                    slot.status === "Blocked"
                      ? "bg-teal-600 text-white hover:bg-teal-500"
                      : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 inline mr-1">🔄</span>
                  ) : slot.status === "Blocked" ? (
                    "Unblock"
                  ) : (
                    "Block"
                  )}
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ToastContainer theme="dark" />
    </div>
  );
});

TimeSlotManager.displayName = "TimeSlotManager";

export default TimeSlotManager;
