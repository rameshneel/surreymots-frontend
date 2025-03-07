import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { createCustomer } from "../services/api";

const BookingConfirmation = ({ isOpen, closeModal, formData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [confirmationData, setConfirmationData] = useState(null);

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    const initializeOrder = async () => {
      if (isOpen && orderStatus === "pending") {
        setIsLoading(true);
        try {
          const response = await createCustomer(formData);
          if (response.data.success) {
            setConfirmationData({
              ...formData,
              invoiceNumber:
                response.data.data.paypalOrderId || "ORD-" + Date.now(), // Using timestamp as fallback invoice
              amount: formData.totalPrice || "N/A", // Assuming amount might be in formData
            });
            setOrderStatus("completed");
            toast.success("Booking created successfully!", {
              position: "top-right",
            });
            setTimeout(() => {
              closeModal();
              setOrderStatus("pending");
            }, 5000); // Close after 5 seconds
          } else {
            throw new Error(response.message);
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to create booking",
            {
              position: "top-right",
            }
          );
          setOrderStatus("error");
        } finally {
          setIsLoading(false);
        }
      }
    };
    initializeOrder();
  }, [isOpen, formData, orderStatus]);

  const handleCancel = () => {
    setOrderStatus("pending");
    closeModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              {/* Close Button (hidden when completed) */}
              {orderStatus !== "completed" && (
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Header */}
              <h3 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Booking Confirmation
              </h3>

              {/* Success State */}
              {orderStatus === "completed" && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
                >
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6 text-center"
                  >
                    <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                    <p>
                      Thank you for your booking. Your invoice number is:{" "}
                      {confirmationData?.invoiceNumber}
                    </p>
                    <p>Total Amount: £{confirmationData?.amount}</p>
                  </motion.div>
                </motion.div>
              )}

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  className="flex justify-center py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </motion.div>
              )}

              {/* Error State */}
              {orderStatus === "error" && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <p className="text-red-600">
                    There was an error creating your booking. Please try again.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingConfirmation;

// import React, { useCallback, useEffect, useState } from "react";

// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { X, Clock, CheckCircle2, Loader2 } from "lucide-react";
// import { capturePayment, cancelPayment, createCustomer } from "../services/api";

// const formatTime = (ms) => {
//   const minutes = Math.floor(ms / 60000);
//   const seconds = ((ms % 60000) / 1000).toFixed(0);
//   return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
// };

// const BookingConfirmation = ({ isOpen, closeModal, formData }) => {
//   const PAYMENT_TIMEOUT = 10 * 60 * 1000;

//   const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
//   const [isLoading, setIsLoading] = useState(false);
//   const [paypalOrderId, setPaypalOrderId] = useState(null);
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
//     let timer;
//     if (isOpen && timeLeft > 0 && orderStatus !== "completed") {
//       timer = setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1000) {
//             handleCancel();
//             return 0;
//           }
//           return prev - 1000;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [isOpen, timeLeft, orderStatus]);

//   useEffect(() => {
//     const initializeOrder = async () => {
//       if (isOpen && !paypalOrderId) {
//         setIsLoading(true);
//         try {
//           const response = await createCustomer(formData);
//           if (response.data.success) {
//             setPaypalOrderId(response.data.data.paypalOrderId);
//             setOrderStatus("created");
//           } else {
//             throw new Error(response.message);
//           }
//         } catch (error) {
//           toast.error(
//             error.response?.data?.message || "Failed to create order",
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
//   }, [isOpen, formData]);

//   const handleCancel = async () => {
//     setIsLoading(true);
//     try {
//       if (paypalOrderId) {
//         await cancelPayment(paypalOrderId);
//       }
//       toast.info("Payment cancelled", {
//         position: "top-right",
//       });
//       setOrderStatus("pending");
//       setPaypalOrderId(null);
//       closeModal();
//     } catch (error) {
//       toast.error("Failed to cancel payment", {
//         position: "top-right",
//       });
//       setOrderStatus("error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePaymentSuccess = async (details) => {
//     setIsLoading(true);
//     setOrderStatus("processing");
//     try {
//       await capturePayment(details);
//       setConfirmationData({
//         ...formData,
//         invoiceNumber: details.id,
//         amount: details.purchase_units[0].amount.value,
//       });
//       setOrderStatus("completed");
//       setTimeout(() => {
//         closeModal();
//         setOrderStatus("pending");
//         setPaypalOrderId(null);
//       }, 10000);
//     } catch (error) {
//       toast.error("Payment capture failed", {
//         position: "top-right",
//       });
//       setOrderStatus("error");
//     } finally {
//       setIsLoading(false);
//     }
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
//               {/* Close Button */}
//               {/* Close Button (hidden when completed) */}
//               {orderStatus !== "completed" && (
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
//                 Complete Your Payment
//               </h3>

//               {/* Timer */}
//               {orderStatus === "created" && (
//                 <motion.div
//                   className="mb-6"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                 >
//                   <div className="flex items-center justify-center gap-2 mb-3">
//                     <Clock className="h-5 w-5 text-indigo-600 animate-pulse" />
//                     <span className="text-sm font-medium text-gray-700">
//                       Time remaining: {formatTime(timeLeft)}
//                     </span>
//                   </div>
//                   <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <motion.div
//                       className="absolute h-full bg-gradient-to-r from-indigo-500 to-blue-500"
//                       initial={{ width: "100%" }}
//                       animate={{
//                         width: `${(timeLeft / PAYMENT_TIMEOUT) * 100}%`,
//                       }}
//                       transition={{ ease: "linear" }}
//                     />
//                   </div>
//                 </motion.div>
//               )}

//               {/* Payment Status */}
//               {orderStatus === "completed" ? (
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                   className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
//                 >
//                   <h1 className="text-2xl font-bold text-center mb-6">
//                     Payment Confirmation
//                   </h1>

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
//                     <p>Total Amount Paid: £{confirmationData?.amount}</p>
//                     <button
//                       onClick={() => navigate("/")}
//                       className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
//                     >
//                       Return to Home
//                     </button>
//                   </motion.div>
//                 </motion.div>
//               ) : (
//                 <>
//                   {/* Loading State */}
//                   {isLoading && (
//                     <motion.div
//                       className="flex justify-center py-6"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                     >
//                       <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
//                     </motion.div>
//                   )}

//                   {/* PayPal Buttons */}
//                   {orderStatus === "created" && !isLoading && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       className="mt-6"
//                     >
//                       <PayPalScriptProvider
//                         options={{ "client-id": PAYPAL_CLIENT_ID }}
//                       >
//                         <PayPalButtons
//                           style={{
//                             layout: "vertical",
//                             color: "blue",
//                             shape: "pill",
//                             label: "pay",
//                             height: 48,
//                           }}
//                           createOrder={() => paypalOrderId}
//                           onApprove={async (data, actions) => {
//                             const details = await actions.order.capture();
//                             await handlePaymentSuccess(details);
//                           }}
//                           onCancel={handleCancel}
//                           disabled={isLoading}
//                         />
//                       </PayPalScriptProvider>
//                     </motion.div>
//                   )}
//                 </>
//               )}
//             </motion.div>
//           </div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default BookingConfirmation;
