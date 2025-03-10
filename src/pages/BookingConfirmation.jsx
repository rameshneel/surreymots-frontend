import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { createCustomer } from "../services/api";

const BookingConfirmation = ({ isOpen, closeModal, formData, reset }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [confirmationData, setConfirmationData] = useState(null);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const initializeOrder = useCallback(async () => {
    if (!isOpen || orderStatus !== "pending") return;

    setIsLoading(true);
    try {
      const response = await createCustomer(formData);
      if (response.data.success) {
        const invoiceNumber =
          response.data.data.customer?.paypalOrderId || `ORD-${Date.now()}`;
        const amount =
          response.data.data.customer?.totalPrice ||
          formData.totalPrice ||
          "N/A";
        const customerEmail = response.data.data.customer?.email;
        setConfirmationData({
          ...formData,
          invoiceNumber,
          amount,
          customerEmail,
        });
        setOrderStatus("completed");
        toast.success("Booking successful!", { position: "top-right" });
        setTimeout(() => {
          closeModal();
          setOrderStatus("pending");
          setConfirmationData(null);
        }, 50000); // Auto-close after 5 seconds
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (error) {
      setOrderStatus("error");
      toast.error(error.response?.data?.message || "Failed to create booking", {
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, formData, orderStatus, closeModal]);

  useEffect(() => {
    initializeOrder();
  }, [initializeOrder]);

  const handleCancel = () => {
    setOrderStatus("pending");
    setConfirmationData(null);
    closeModal();
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#01669A] to-[#024C6F] p-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Booking Confirmation
              </h3>
              {orderStatus == "completed" && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="p-1 text-white hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <Loader2 className="h-10 w-10 text-[#01669A] animate-spin" />
                  <p className="mt-4 text-gray-600 text-sm">
                    Processing your booking...
                  </p>
                </motion.div>
              )}

              {/* Success State */}
              {orderStatus === "completed" && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Booking Confirmed!
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Thank you for your booking. Here are your details:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <p>
                      <span className="font-medium text-gray-700">
                        Invoice Number:
                      </span>{" "}
                      {confirmationData?.invoiceNumber}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Total Amount:
                      </span>{" "}
                      £{Number(confirmationData?.amount).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Date:</span>{" "}
                      {confirmationData?.selectedDate}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Time:</span>{" "}
                      {confirmationData?.selectedTimeSlot}
                    </p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    A confirmation has been sent to{" "}
                    {confirmationData?.customerEmail}. Please check your inbox
                    for more details.
                  </p>
                  <button
                    onClick={handleCancel}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-[#01669A] text-white rounded-lg hover:bg-[#024C6F] transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}

              {/* Error State */}
              {orderStatus === "error" && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Booking Failed
                  </h2>
                  <p className="text-gray-600 text-sm">
                    There was an issue creating your booking. Please try again
                    or contact support.
                  </p>
                  <button
                    onClick={handleCancel}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
    </AnimatePresence>
  );
};

export default BookingConfirmation;

// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { X, CheckCircle2, Loader2 } from "lucide-react";
// import { createCustomer } from "../services/api";

// const BookingConfirmation = ({ isOpen, closeModal, formData }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [orderStatus, setOrderStatus] = useState("pending");
//   const [confirmationData, setConfirmationData] = useState(null);

//   const modalVariants = {
//     hidden: { opacity: 0, y: -50 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         type: "spring",
//         stiffness: 300,
//         damping: 30,
//       },
//     },
//     exit: {
//       opacity: 0,
//       y: 50,
//       transition: { duration: 0.3 },
//     },
//   };

//   useEffect(() => {
//     const initializeOrder = async () => {
//       if (isOpen && orderStatus === "pending") {
//         setIsLoading(true);
//         try {
//           const response = await createCustomer(formData);
//           console.log("responce", response);
//           console.log("responce.data.success", response.data.success);
//           if (response.data.success) {
//             setConfirmationData({
//               ...formData,
//               invoiceNumber:
//                 response.data.data.customer.paypalOrderId ||
//                 "ORD-" + Date.now(),
//               amount: response.data.data.customer.totalPrice || "N/A",
//             });
//             setOrderStatus("completed");
//             // toast.success("Booking successful!", {
//             //   position: "top-right",
//             // });
//             setTimeout(() => {
//               closeModal();
//               setOrderStatus("pending");
//             }, 50000);
//           } else {
//             throw new Error(response.message);
//           }
//         } catch (error) {
//           toast.error(
//             error.response?.data?.message || "Failed to create booking",
//             {
//               position: "top-right",
//             }
//           );
//           setOrderStatus("error");
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     };
//     initializeOrder();
//   }, [isOpen, formData, orderStatus]);

//   const handleCancel = () => {
//     setOrderStatus("pending");
//     closeModal();
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
//           <div className="flex min-h-screen items-center justify-center p-4">
//             <motion.div
//               variants={modalVariants}
//               initial="hidden"
//               animate="visible"
//               exit="exit"
//               className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
//             >
//               {/* Close Button (hidden when completed) */}
//               {orderStatus == "completed" && (
//                 <button
//                   onClick={handleCancel}
//                   disabled={isLoading}
//                   className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               )}

//               {/* Header */}
//               <h3 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                 Booking Confirmation
//               </h3>

//               {/* Success State */}
//               {orderStatus === "completed" && (
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                   className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
//                 >
//                   <motion.div
//                     initial={{ opacity: 0, x: 50 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     exit={{ opacity: 0, x: -50 }}
//                     className="space-y-6 text-center"
//                   >
//                     <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
//                     <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
//                     <p>
//                       Thank you for your booking. Your invoice number is:{" "}
//                       {confirmationData?.invoiceNumber}
//                     </p>
//                     <p>Total Amount: £{confirmationData?.amount}</p>
//                   </motion.div>
//                 </motion.div>
//               )}

//               {/* Loading State */}
//               {isLoading && (
//                 <motion.div
//                   className="flex justify-center py-6"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                 >
//                   <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
//                 </motion.div>
//               )}

//               {/* Error State */}
//               {orderStatus === "error" && !isLoading && (
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="text-center py-6"
//                 >
//                   <p className="text-red-600">
//                     There was an error creating your booking. Please try again.
//                   </p>
//                 </motion.div>
//               )}
//             </motion.div>
//           </div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default BookingConfirmation;
