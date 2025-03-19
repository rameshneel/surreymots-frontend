import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getCustomerById } from "../../services/api";

const CustomerInfoModal = ({ isOpen, onClose, customerId }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const response = await getCustomerById(customerId);
        setCustomer(response.data.data);
      } catch (err) {
        setError("Failed to fetch customer information");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, [customerId]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-80 bg-gray-800 shadow-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-200">Customer Info</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-teal-400"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {loading && (
            <p className="text-gray-400">Loading customer information...</p>
          )}
          {error && <p className="text-red-400">{error}</p>}

          {customer && (
            <div className="space-y-4 text-gray-200">
              <div>
                <h3 className="font-semibold text-teal-400">Name</h3>
                <p>{customer.customerName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Email</h3>
                <p>{customer.email}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Contact Number</h3>
                <p>{customer.contactNumber}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Booked Date</h3>
                <p>{new Date(customer.selectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Time Slot</h3>
                <p>{customer.selectedTimeSlot}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">
                  Car Make & Model
                </h3>
                <p>{customer.makeAndModel}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Registration No</h3>
                <p>{customer.registrationNo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Total Price</h3>
                <p>£{customer.totalPrice}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Payment Method</h3>
                <p>{customer.paymentMethod}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Payment Status</h3>
                <p>{customer.paymentStatus}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Class</h3>
                <p>{customer.classSelection}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Order ID</h3>
                <p>{customer._id || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Booking Status</h3>
                <p>
                  {customer.bookedBy === "customer" ? "Booked" : "Not Booked"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Booked By</h3>
                <p>{customer.bookedBy}</p>
              </div>
              <div>
                <h3 className="font-semibold text-teal-400">Created At</h3>
                <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
              {customer.refundStatus && (
                <div>
                  <h3 className="font-semibold text-teal-400">Refund Status</h3>
                  <p>{customer.refundStatus}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomerInfoModal;
