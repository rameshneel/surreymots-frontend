import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  Clock,
  Car,
  Phone,
  Mail,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
  PoundSterlingIcon,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCustomerByAdmin,
  getAvailableTimeSlotsforForm,
  getDisabledDates,
} from "../../services/api";
import { useNavigate } from "react-router-dom";

const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 6 && day !== 0;
};

function formatDateForBackend(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const BookingbyAdminForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    makeAndModel: "",
    registrationNo: "",
    selectedDate: null,
    selectedTimeSlot: null,
    howDidYouHearAboutUs: "",
    awareOfCancellationPolicy: true,
    totalPrice: "",
    classSelection: "",
  });
  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "0.75rem",
      borderColor: "#4B5563",
      boxShadow: "none",
      "&:hover": { borderColor: "#2DD4BF" },
      backgroundColor: "#1F2937",
      padding: "0 6px",
      color: "#D1D5DB",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2DD4BF"
        : state.isFocused
        ? "#374151"
        : "#1F2937",
      color: state.isSelected ? "#1F2937" : "#D1D5DB",
      padding: "8px 10px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#D1D5DB",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#1F2937",
      borderRadius: "0.75rem",
      border: "1px solid #4B5563",
    }),
  };
  const classOptions = [
    { value: "class4", label: "Class 4" },
    { value: "class7", label: "Class 7" },
  ];

  const fetchDisabledDates = useCallback(async (year, month) => {
    try {
      const response = await getDisabledDates(year, month);
      const dates = response.data.data.map((item) => new Date(item.date));
      setDisabledDates(dates);
    } catch (error) {
      toast.error("Failed to load unavailable dates");
    }
  }, []);

  const fetchAvailableTimeSlots = async (date) => {
    try {
      const formattedDate = formatDateForBackend(date);
      const response = await getAvailableTimeSlotsforForm(formattedDate);
      const slots = response.data.data
        .filter((slot) => slot.status === "Available")
        .map((slot) => slot.time);
      setAvailableSlots(slots);
      return slots;
    } catch (error) {
      toast.error("Failed to load time slots");
      return [];
    }
  };

  useEffect(() => {
    const currentDate = new Date();
    fetchDisabledDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [fetchDisabledDates]);

  const handleDateChange = useCallback(
    async (date) => {
      if (!date || formatDateForBackend(date) === formData.selectedDate) return;
      setLoading(true);
      setFormData((prev) => ({
        ...prev,
        selectedDate: date,
        selectedTimeSlot: null,
      }));
      const slots = await fetchAvailableTimeSlots(date);
      if (slots.length === 0) {
        setDisabledDates((prev) => [...prev, date]);
        toast.warn("No available slots for this date");
      }
      setErrors((prev) => ({ ...prev, selectedDate: "" }));
      setLoading(false);
    },
    [formData.selectedDate]
  );

  const handleMonthChange = useCallback(
    async (date) => {
      if (!date) return;
      setLoading(true);
      await fetchDisabledDates(date.getFullYear(), date.getMonth() + 1);
      setLoading(false);
    },
    [fetchDisabledDates]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!/^\d{10,}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Invalid contact number";
    if (!formData.selectedDate) newErrors.selectedDate = "Date is required";
    if (!formData.selectedTimeSlot)
      newErrors.selectedTimeSlot = "Time slot is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please complete all required fields");
      return;
    }
    setLoading(true);
    try {
      const response = await createCustomerByAdmin({
        ...formData,
        selectedDate: formatDateForBackend(formData.selectedDate),
      });
      if (response.data.statusCode === 201) {
        toast.success("Booking successful", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/admin"), 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const timeSlotOptions = availableSlots.map((slot) => ({
    value: slot,
    label: slot,
  }));

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 bg-gray-900 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-t-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Car className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                  MOT Booking
                </h1>
                <p className="text-xs sm:text-sm lg:text-base text-teal-100 mt-1 hidden sm:block">
                  Schedule your MOT test easily online
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-b-xl shadow-xl p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-gray-700">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-200">
                    Personal Details
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      name: "firstName",
                      label: "First Name",
                      icon: User,
                      placeholder: "John",
                    },
                    {
                      name: "lastName",
                      label: "Last Name",
                      icon: User,
                      placeholder: "Doe",
                    },
                    {
                      name: "email",
                      label: "Email",
                      icon: Mail,
                      type: "email",
                      placeholder: "john.doe@example.com",
                    },
                    {
                      name: "contactNumber",
                      label: "Contact Number",
                      icon: Phone,
                      type: "tel",
                      placeholder: "07123 456789",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                        <field.icon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        {field.label}
                      </label>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border ${
                          errors[field.name]
                            ? "border-red-500"
                            : "border-gray-600"
                        } focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400 text-sm sm:text-base`}
                        placeholder={field.placeholder}
                      />
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-1 text-xs text-red-400 flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {errors[field.name]}
                        </motion.p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Select Class
                    </label>
                    <Select
                      value={classOptions.find(
                        (option) => option.value === formData.classSelection
                      )}
                      onChange={(option) => {
                        let expectedPrice = "";
                        switch (option.value) {
                          case "class4":
                            expectedPrice = "54.85";
                            break;
                          case "class7":
                            expectedPrice = "58.65";
                            break;
                          default:
                            expectedPrice = "";
                        }
                        setFormData((prev) => ({
                          ...prev,
                          classSelection: option.value,
                          totalPrice: expectedPrice,
                        }));
                      }}
                      options={classOptions}
                      styles={customSelectStyles}
                      placeholder="Select a class"
                      className="text-sm"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Vehicle Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-gray-700">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-200">
                    Vehicle & Booking
                  </h2>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      Preferred Date
                    </label>
                    <DatePicker
                      selected={formData.selectedDate}
                      onChange={handleDateChange}
                      onMonthChange={handleMonthChange}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      filterDate={isWeekday}
                      excludeDates={disabledDates}
                      className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border ${
                        errors.selectedDate
                          ? "border-red-500"
                          : "border-gray-600"
                      } focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400 text-sm sm:text-base`}
                      placeholderText="Select a date"
                      showPopperArrow={false}
                    />
                    {errors.selectedDate && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-xs text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.selectedDate}
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      Preferred Time
                    </label>
                    <Select
                      value={timeSlotOptions.find(
                        (option) => option.value === formData.selectedTimeSlot
                      )}
                      onChange={(option) =>
                        setFormData((prev) => ({
                          ...prev,
                          selectedTimeSlot: option.value,
                        }))
                      }
                      options={timeSlotOptions}
                      styles={customSelectStyles}
                      isLoading={loading}
                      isDisabled={!formData.selectedDate || loading}
                      placeholder="Select a time"
                      className="text-sm"
                    />
                    {errors.selectedTimeSlot && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-xs text-red-400 flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {errors.selectedTimeSlot}
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Make & Model
                    </label>
                    <input
                      type="text"
                      name="makeAndModel"
                      value={formData.makeAndModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400 text-sm sm:text-base"
                      placeholder="e.g., Ford Focus"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNo"
                      value={formData.registrationNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400 uppercase text-sm sm:text-base"
                      placeholder="e.g., AB12 CDE"
                    />
                  </div>
                  <div className="mt-2 sm:mt-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                      Price:
                    </label>
                    <div className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-600 bg-gray-800">
                      <PoundSterlingIcon className="text-[#01669A] h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-lg sm:text-xl font-semibold text-teal-400">
                        {formData.totalPrice
                          ? Number(formData.totalPrice).toLocaleString(
                              "en-US",
                              {
                                style: "currency",
                                currency: "GBP",
                              }
                            )
                          : "£0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    contactNumber: "",
                    makeAndModel: "",
                    registrationNo: "",
                    selectedDate: null,
                    selectedTimeSlot: null,
                    howDidYouHearAboutUs: "",
                    awareOfCancellationPolicy: false,
                    totalPrice: "",
                    classSelection: "",
                  })
                }
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 transition-colors shadow-md w-full sm:w-auto text-sm sm:text-base"
                disabled={loading}
              >
                Reset
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:from-teal-600 hover:to-teal-800 transition-all disabled:opacity-50 shadow-md w-full sm:w-auto flex items-center justify-center gap-2 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Book MOT Test"
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />
    </div>
  );
};

export default BookingbyAdminForm;

// import React, { useState, useCallback, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import Select from "react-select";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   Calendar,
//   Clock,
//   Car,
//   Phone,
//   Mail,
//   User,
//   CreditCard,
//   Loader2,
//   AlertCircle,
//   EuroIcon,
//   Option,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   createCustomerByAdmin,
//   getAvailableTimeSlotsforForm,
//   getDisabledDates,
// } from "../../services/api";
// import { useNavigate } from "react-router-dom";

// const isWeekday = (date) => {
//   const day = date.getDay();
//   return day !== 6 && day !== 0;
// };

// function formatDateForBackend(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// }

// const BookingbyAdminForm = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contactNumber: "",
//     makeAndModel: "",
//     registrationNo: "",
//     selectedDate: null,
//     selectedTimeSlot: null,
//     howDidYouHearAboutUs: "",
//     awareOfCancellationPolicy: true,
//     totalPrice: "",
//     classSelection: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [disabledDates, setDisabledDates] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const customSelectStyles = {
//     control: (base) => ({
//       ...base,
//       minHeight: "48px",
//       borderRadius: "0.75rem",
//       borderColor: "#4B5563", // gray-600
//       boxShadow: "none",
//       "&:hover": { borderColor: "#2DD4BF" }, // teal-400
//       backgroundColor: "#1F2937", // gray-800
//       padding: "0 8px",
//       color: "#D1D5DB", // gray-300
//     }),
//     option: (base, state) => ({
//       ...base,
//       backgroundColor: state.isSelected
//         ? "#2DD4BF" // teal-400
//         : state.isFocused
//         ? "#374151" // gray-700
//         : "#1F2937", // gray-800
//       color: state.isSelected ? "#1F2937" : "#D1D5DB",
//       padding: "10px 12px",
//     }),
//     singleValue: (base) => ({
//       ...base,
//       color: "#D1D5DB", // gray-300
//     }),
//     placeholder: (base) => ({
//       ...base,
//       color: "#9CA3AF", // gray-400
//     }),
//     menu: (base) => ({
//       ...base,
//       backgroundColor: "#1F2937", // gray-800
//       borderRadius: "0.75rem",
//       border: "1px solid #4B5563", // gray-600
//     }),
//   };
//   const classOptions = [
//     { value: "class4", label: "Class 4 " },
//     { value: "class7", label: "Class 7 " },
//   ];

//   const fetchDisabledDates = useCallback(async (year, month) => {
//     try {
//       const response = await getDisabledDates(year, month);
//       const dates = response.data.data.map((item) => new Date(item.date));
//       setDisabledDates(dates);
//     } catch (error) {
//       toast.error("Failed to load unavailable dates");
//     }
//   }, []);

//   const fetchAvailableTimeSlots = async (date) => {
//     try {
//       const formattedDate = formatDateForBackend(date);
//       const response = await getAvailableTimeSlotsforForm(formattedDate);
//       const slots = response.data.data
//         .filter((slot) => slot.status === "Available")
//         .map((slot) => slot.time);
//       setAvailableSlots(slots);
//       return slots;
//     } catch (error) {
//       toast.error("Failed to load time slots");
//       return [];
//     }
//   };

//   useEffect(() => {
//     const currentDate = new Date();
//     fetchDisabledDates(currentDate.getFullYear(), currentDate.getMonth() + 1);
//   }, [fetchDisabledDates]);

//   const handleDateChange = useCallback(
//     async (date) => {
//       const formattedDate = formatDateForBackend(date);
//       if (!date || date === formData.selectedDate) return;
//       setLoading(true);
//       setFormData((prev) => ({
//         ...prev,
//         selectedDate: formattedDate,
//         selectedTimeSlot: null,
//       }));
//       const slots = await fetchAvailableTimeSlots(date);
//       if (slots.length === 0) {
//         setDisabledDates((prev) => [...prev, date]);
//         toast.warn("No available slots for this date");
//       }
//       setErrors((prev) => ({ ...prev, selectedDate: "" }));
//       setLoading(false);
//     },
//     [formData.selectedDate]
//   );

//   const handleMonthChange = useCallback(
//     async (date) => {
//       if (!date) return;
//       setLoading(true);
//       await fetchDisabledDates(date.getFullYear(), date.getMonth() + 1);
//       setLoading(false);
//     },
//     [fetchDisabledDates]
//   );

//   const validateForm = useCallback(() => {
//     const newErrors = {};
//     if (!formData.firstName) newErrors.firstName = "First name is required";
//     if (!formData.lastName) newErrors.lastName = "Last name is required";
//     if (!formData.contactNumber)
//       newErrors.contactNumber = "Contact number is required";
//     else if (!/^\d{10,}$/.test(formData.contactNumber))
//       newErrors.contactNumber = "Invalid contact number";
//     if (!formData.selectedDate) newErrors.selectedDate = "Date is required";
//     if (!formData.selectedTimeSlot)
//       newErrors.selectedTimeSlot = "Time slot is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [formData]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error("Please complete all required fields");
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await createCustomerByAdmin(formData);
//       if (response.data.statusCode === 201) {
//         toast.success("Booking successful", {
//           position: "top-center",
//           autoClose: 2000,
//         });
//         // navigate("/admin");
//         setTimeout(() => navigate("/admin"), 1000);
//       } else {
//         toast.error(response.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   }, []);

//   const timeSlotOptions = availableSlots.map((slot) => ({
//     value: slot,
//     label: slot,
//   }));

//   return (
//     <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-4xl mx-auto"
//       >
//         {/* Header */}
//         <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-t-xl p-6 text-white shadow-lg">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex items-center gap-3">
//               <Car className="h-8 w-8 sm:h-10 sm:w-10" />
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//                   MOT Booking
//                 </h1>
//                 <p className="text-sm sm:text-base text-teal-100 hidden sm:block">
//                   Schedule your MOT test easily online
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-gray-800 rounded-b-xl shadow-xl p-6 sm:p-8">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
//               {/* Personal Information */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="space-y-6"
//               >
//                 <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
//                   <User className="w-5 h-5 text-teal-400" />
//                   <h2 className="text-lg sm:text-xl font-semibold text-gray-200">
//                     Personal Details
//                   </h2>
//                 </div>
//                 <div className="space-y-4">
//                   {[
//                     {
//                       name: "firstName",
//                       label: "First Name",
//                       icon: User,
//                       placeholder: "John",
//                     },
//                     {
//                       name: "lastName",
//                       label: "Last Name",
//                       icon: User,
//                       placeholder: "Doe",
//                     },
//                     {
//                       name: "email",
//                       label: "Email",
//                       icon: Mail,
//                       type: "email",
//                       placeholder: "john.doe@example.com",
//                     },
//                     {
//                       name: "contactNumber",
//                       label: "Contact Number",
//                       icon: Phone,
//                       type: "tel",
//                       placeholder: "07123 456789",
//                     },
//                   ].map((field) => (
//                     <div key={field.name}>
//                       <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
//                         <field.icon className="w-4 h-4 text-gray-400" />
//                         {field.label}
//                       </label>
//                       <input
//                         type={field.type || "text"}
//                         name={field.name}
//                         value={formData[field.name]}
//                         onChange={handleInputChange}
//                         className={`w-full px-4 py-3 rounded-lg border ${
//                           errors[field.name]
//                             ? "border-red-500"
//                             : "border-gray-600"
//                         } focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400`}
//                         placeholder={field.placeholder}
//                       />
//                       {errors[field.name] && (
//                         <motion.p
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           className="mt-1 text-xs text-red-400 flex items-center gap-1"
//                         >
//                           <AlertCircle className="h-3 w-3" />
//                           {errors[field.name]}
//                         </motion.p>
//                       )}
//                     </div>
//                   ))}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Select Class
//                     </label>

//                     <Select
//                       value={classOptions.find(
//                         (option) => option.value === formData.classSelection
//                       )}
//                       onChange={(option) => {
//                         let expectedPrice = "";

//                         switch (option.value) {
//                           case "class4":
//                             expectedPrice = "54.85";
//                             break;
//                           case "class7":
//                             expectedPrice = "58.65";
//                             break;
//                           default:
//                             expectedPrice = "";
//                         }
//                         setFormData((prev) => ({
//                           ...prev,
//                           classSelection: option.value,
//                           totalPrice: expectedPrice,
//                         }));
//                       }}
//                       options={classOptions}
//                       styles={customSelectStyles}
//                       placeholder="Select a class"
//                       className="text-sm"
//                     />
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Vehicle Information */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="space-y-6"
//               >
//                 <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
//                   <Car className="w-5 h-5 text-teal-400" />
//                   <h2 className="text-lg sm:text-xl font-semibold text-gray-200">
//                     Vehicle & Booking
//                   </h2>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       Preferred Date
//                     </label>
//                     <DatePicker
//                       selected={formData.selectedDate}
//                       onChange={handleDateChange}
//                       onMonthChange={handleMonthChange}
//                       dateFormat="dd/MM/yyyy"
//                       minDate={new Date()}
//                       filterDate={isWeekday}
//                       excludeDates={disabledDates}
//                       className={`w-full px-4 py-3 rounded-lg border ${
//                         errors.selectedDate
//                           ? "border-red-500"
//                           : "border-gray-600"
//                       } focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400`}
//                       placeholderText="Select a date"
//                       showPopperArrow={false}
//                     />
//                     {errors.selectedDate && (
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-1 text-xs text-red-400 flex items-center gap-1"
//                       >
//                         <AlertCircle className="h-3 w-3" />
//                         {errors.selectedDate}
//                       </motion.p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       Preferred Time
//                     </label>
//                     <Select
//                       value={timeSlotOptions.find(
//                         (option) => option.value === formData.selectedTimeSlot
//                       )}
//                       onChange={(option) =>
//                         setFormData((prev) => ({
//                           ...prev,
//                           selectedTimeSlot: option.value,
//                         }))
//                       }
//                       options={timeSlotOptions}
//                       styles={customSelectStyles}
//                       isLoading={loading}
//                       isDisabled={!formData.selectedDate || loading}
//                       placeholder="Select a time"
//                       className="text-sm"
//                     />
//                     {errors.selectedTimeSlot && (
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-1 text-xs text-red-400 flex items-center gap-1"
//                       >
//                         <AlertCircle className="h-3 w-3" />
//                         {errors.selectedTimeSlot}
//                       </motion.p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Make & Model
//                     </label>
//                     <input
//                       type="text"
//                       name="makeAndModel"
//                       value={formData.makeAndModel}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400"
//                       placeholder="e.g., Ford Focus"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Registration Number
//                     </label>
//                     <input
//                       type="text"
//                       name="registrationNo"
//                       value={formData.registrationNo}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-gray-700 text-gray-200 placeholder-gray-400 uppercase"
//                       placeholder="e.g., AB12 CDE"
//                     />
//                   </div>

//                   <div className="mt-4">
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Price:
//                     </label>
//                     <div className="flex items-center space-x-2 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800">
//                       <EuroIcon className="text-[#01669A] h-6 w-6" />
//                       <span className="text-xl font-semibold text-teal-400">
//                         {/* Format the price properly */}
//                         {formData.totalPrice.toLocaleString("en-US", {
//                           style: "currency",
//                           currency: "EUR",
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             ></motion.div>
//             {/* Form Actions */}
//             <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
//               <motion.button
//                 type="button"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() =>
//                   setFormData({
//                     firstName: "",
//                     lastName: "",
//                     email: "",
//                     contactNumber: "",
//                     makeAndModel: "",
//                     registrationNo: "",
//                     selectedDate: null,
//                     selectedTimeSlot: null,
//                     howDidYouHearAboutUs: "",
//                     awareOfCancellationPolicy: false,
//                     totalPrice: "43.20",
//                   })
//                 }
//                 className="px-6 py-3 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 transition-colors shadow-md w-full sm:w-auto"
//                 disabled={loading}
//               >
//                 Reset
//               </motion.button>
//               <motion.button
//                 type="submit"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-700 text-white rounded-xl hover:from-teal-600 hover:to-teal-800 transition-all disabled:opacity-50 shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin" />
//                     Processing
//                   </>
//                 ) : (
//                   "Book MOT Test"
//                 )}
//               </motion.button>
//             </div>
//           </form>
//         </div>
//       </motion.div>
//       <ToastContainer position="top-right" autoClose={5000} theme="dark" />
//     </div>
//   );
// };

// export default BookingbyAdminForm;
