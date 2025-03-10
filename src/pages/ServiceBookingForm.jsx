import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
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
  checkCustomer,
  getAvailableTimeSlotsforForm,
  getDisabledDates,
} from "../services/api";
import BookingConfirmation from "./BookingConfirmation";

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

const ServiceBookingForm = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payMentModalOpen, setPayMentModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      makeAndModel: "",
      registrationNo: "",
      selectedDate: null,
      selectedTimeSlot: null,
      awareOfCancellationPolicy: false,
      totalPrice: "",
      paymentMethod: "Payment on the day",
      classSelection: "",
    },
    mode: "onBlur",
  });

  const selectedDate = watch("selectedDate");
  const classSelection = watch("classSelection");

  const classOptions = [
    { value: "class4", label: "Class 4" },
    { value: "class7", label: "Class 7" },
  ];

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      borderRadius: "0.75rem",
      borderColor: state.isFocused
        ? "#01669A"
        : errors[state.name]
        ? "#EF4444"
        : "#CBD5E0",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(1, 102, 154, 0.2)" : "none",
      "&:hover": { borderColor: "#01669A" },
      backgroundColor: "white",
      padding: "0 8px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#01669A"
        : state.isFocused
        ? "#E6F0FA"
        : "white",
      color: state.isSelected ? "white" : "#2D3748",
      padding: "10px 12px",
    }),
  };

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
      if (!date) return;
      setLoading(true);
      const formattedDate = formatDateForBackend(date);
      setValue("selectedDate", formattedDate, { shouldValidate: true });
      setValue("selectedTimeSlot", null);
      const slots = await fetchAvailableTimeSlots(date);
      if (slots.length === 0) {
        setDisabledDates((prev) => [...prev, date]);
        toast.warn("No available slots for this date");
      }
      setLoading(false);
    },
    [setValue]
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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await checkCustomer(data);
      if (response.data.success) {
        setPayMentModalOpen(true);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const timeSlotOptions = availableSlots.map((slot) => ({
    value: slot,
    label: slot,
  }));

  // Update totalPrice based on classSelection
  useEffect(() => {
    let expectedPrice = "";
    switch (classSelection) {
      case "class4":
        expectedPrice = "54.85";
        break;
      case "class7":
        expectedPrice = "58.65";
        break;
      default:
        expectedPrice = "";
    }
    setValue("totalPrice", expectedPrice);
  }, [classSelection, setValue]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-100 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#01669A] to-[#024C6F] rounded-t-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Car className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MOT Booking</h1>
              <p className="text-sm text-gray-200">
                Schedule your MOT test easily online
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-xl shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[#01669A]" /> Personal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#01669A]" /> First Name
                  </label>
                  <input
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#01669A]" /> Last Name
                  </label>
                  <input
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#01669A]" /> Email
                  </label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#01669A]" /> Contact Number
                  </label>
                  <input
                    type="tel"
                    {...register("contactNumber", {
                      required: "Contact number is required",
                      pattern: {
                        value: /^\d{10,}$/,
                        message: "Invalid contact number",
                      },
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                    placeholder="07123 456789"
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.contactNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle & Booking Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Car className="w-5 h-5 text-[#01669A]" /> Vehicle & Booking
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#01669A]" /> Preferred
                    Date
                  </label>
                  <Controller
                    name="selectedDate"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date) => {
                          handleDateChange(date);

                          field.onChange(
                            date ? formatDateForBackend(date) : null
                          );
                        }}
                        onMonthChange={handleMonthChange}
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        filterDate={isWeekday}
                        excludeDates={disabledDates}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.selectedDate
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                        placeholderText="Select a date"
                        showPopperArrow={false}
                      />
                    )}
                  />
                  {errors.selectedDate && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.selectedDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#01669A]" /> Preferred Time
                  </label>
                  <Controller
                    name="selectedTimeSlot"
                    control={control}
                    rules={{ required: "Time slot is required" }}
                    render={({ field }) => (
                      <Select
                        value={timeSlotOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || null)
                        }
                        options={timeSlotOptions}
                        styles={customSelectStyles}
                        isLoading={loading}
                        isDisabled={!selectedDate || loading}
                        placeholder={
                          selectedDate ? "Select a time" : "Select a date first"
                        }
                        className="text-sm"
                      />
                    )}
                  />
                  {errors.selectedTimeSlot && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.selectedTimeSlot.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Make & Model
                  </label>
                  <input
                    {...register("makeAndModel")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all"
                    placeholder="e.g., Ford Focus"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    {...register("registrationNo")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all uppercase"
                    placeholder="e.g., AB12 CDE"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Select Class
                  </label>
                  <Controller
                    name="classSelection"
                    control={control}
                    rules={{ required: "Class is required" }}
                    render={({ field }) => (
                      <Select
                        value={classOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || null)
                        }
                        options={classOptions}
                        styles={customSelectStyles}
                        placeholder="Select a class"
                        className="text-sm"
                      />
                    )}
                  />
                  {errors.classSelection && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.classSelection.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#01669A]" /> Payment
                    Method
                  </label>
                  <select
                    {...register("paymentMethod", {
                      required: "Payment method is required",
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.paymentMethod
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all`}
                  >
                    <option value="Payment on the day">
                      Payment on the day
                    </option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />{" "}
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cancellation Policy and Price */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#F7FAFC] p-4 rounded-xl border border-[#E6F0FA] shadow-md">
              <div className="flex items-center mb-4 sm:mb-0">
                <input
                  type="checkbox"
                  {...register("awareOfCancellationPolicy", {
                    required: "Please accept the cancellation policy",
                  })}
                  className="h-5 w-5 text-[#01669A] rounded border-gray-300 focus:ring-2 focus:ring-[#01669A] cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium">
                  I agree to the{" "}
                  <span className="text-[#01669A] font-semibold">
                    24-hour cancellation policy
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-600 bg-gray-800">
                <PoundSterlingIcon className="text-[#01669A] h-5 w-5" />
                <span className="text-lg font-semibold text-teal-400">
                  {watch("totalPrice")
                    ? Number(watch("totalPrice")).toLocaleString("en-US", {
                        style: "currency",
                        currency: "GBP",
                      })
                    : "£0.00"}
                </span>
              </div>
            </div>
            {errors.awareOfCancellationPolicy && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{" "}
                {errors.awareOfCancellationPolicy.message}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => reset({ paymentMethod: "Payment on the day" })}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors w-full sm:w-auto"
                disabled={loading}
              >
                Reset
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-[#01669A] text-white rounded-xl hover:bg-[#024C6F] transition-all disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                // disabled={loading || !isValid}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Processing
                  </>
                ) : (
                  "Book MOT Test"
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <AnimatePresence>
          <BookingConfirmation
            isOpen={payMentModalOpen}
            closeModal={() => setPayMentModalOpen(false)}
            formData={watch()}
            reset={reset}
          />
        </AnimatePresence>
      </motion.div>
      <ToastContainer position="top-right" autoClose={5000} theme="colored" />
    </div>
  );
};

export default ServiceBookingForm;

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
//   PoundSterlingIcon,
// } from "lucide-react";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import {
//   checkCustomer,
//   getAvailableTimeSlotsforForm,
//   getDisabledDates,
// } from "../services/api";
// import BookingConfirmation from "./BookingConfirmation";

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

// const ServiceBookingForm = () => {
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     contactNumber: "",
//     makeAndModel: "",
//     registrationNo: "",
//     selectedDate: null,
//     selectedTimeSlot: null,
//     awareOfCancellationPolicy: false,
//     totalPrice: "",
//     paymentMethod: "Payment on the day",
//     classSelection: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [disabledDates, setDisabledDates] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [payMentModalOpen, setPayMentModalOpen] = useState(false);

//   const classOptions = [
//     { value: "class4", label: "Class 4 " },
//     { value: "class7", label: "Class 7 " },
//   ];
//   const customSelectStyles = {
//     control: (base, state) => ({
//       ...base,
//       minHeight: "48px",
//       borderRadius: "0.75rem",
//       borderColor: state.isDisabled ? "#E2E8F0" : "#CBD5E0", // Softer border when disabled
//       boxShadow: "none",
//       "&:hover": { borderColor: state.isDisabled ? "#E2E8F0" : "#01669A" },
//       backgroundColor: state.isDisabled ? "#F7FAFC" : "white", // Light gray when disabled
//       opacity: state.isDisabled ? 0.6 : 1, // Reduce opacity for disabled state
//       cursor: state.isDisabled ? "not-allowed" : "pointer",
//       padding: "0 8px",
//     }),
//     option: (base, state) => ({
//       ...base,
//       backgroundColor: state.isSelected
//         ? "#01669A"
//         : state.isFocused
//         ? "#E6F0FA"
//         : "white",
//       color: state.isSelected ? "white" : "#2D3748",
//       padding: "10px 12px",
//       cursor: state.isDisabled ? "not-allowed" : "pointer",
//     }),
//     placeholder: (base, state) => ({
//       ...base,
//       color: state.isDisabled ? "#A0AEC" : "#718099", // Grayed-out placeholder when disabled
//     }),
//   };
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
//     if (!formData.email) newErrors.email = "Email is required";
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
//       newErrors.email = "Invalid email format";
//     if (!formData.contactNumber)
//       newErrors.contactNumber = "Contact number is required";
//     else if (!/^\d{10,}$/.test(formData.contactNumber))
//       newErrors.contactNumber = "Invalid contact number";
//     if (!formData.selectedDate) newErrors.selectedDate = "Date is required";
//     if (!formData.selectedTimeSlot)
//       newErrors.selectedTimeSlot = "Time slot is required";
//     if (!formData.classSelection)
//       newErrors.selectedTimeSlot = "class is required";
//     if (!formData.awareOfCancellationPolicy)
//       newErrors.awareOfCancellationPolicy =
//         "Please accept the cancellation policy";
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
//       const response = await checkCustomer(formData);
//       if (response.data.success) {
//         setPayMentModalOpen(true);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       toast.error(error.response?.data.message || "An error occurred");
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
//     <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="max-w-4xl mx-auto"
//       >
//         {/* Header */}
//         <div className="bg-gradient-to-r from-[#01669A] to-[#024C6F] rounded-t-xl p-6 text-white shadow-lg">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div className="flex items-center gap-3">
//               <Car className="h-8 w-8 sm:h-10 sm:w-10" />
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
//                   MOT Booking
//                 </h1>
//                 <p className="text-sm sm:text-base text-gray-200 hidden sm:block">
//                   Schedule your MOT test easily online
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-white rounded-b-xl shadow-xl p-6 sm:p-8">
//           <form onSubmit={handleSubmit} className="space-y-8">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
//               {/* Personal Information */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="space-y-6"
//               >
//                 <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
//                   <User className="w-5 h-5 text-[#01669A]" />
//                   <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
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
//                     {
//                       name: "paymentMethod",
//                       label: "Payment Method",
//                       icon: CreditCard,
//                       type: "select",
//                     },
//                   ].map((field) => (
//                     <div key={field.name}>
//                       <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                         <field.icon className="w-4 h-4 text-[#01669A]" />
//                         {field.label}
//                       </label>
//                       {field.type === "select" ? (
//                         <select
//                           name={field.name}
//                           value={formData[field.name]}
//                           onChange={handleInputChange}
//                           className={`w-full px-4 py-3 rounded-lg border ${
//                             errors[field.name]
//                               ? "border-red-500"
//                               : "border-gray-300"
//                           } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all bg-white shadow-sm`}
//                         >
//                           <option value="PayPal">Payment on the day</option>
//                         </select>
//                       ) : (
//                         <input
//                           type={field.type || "text"}
//                           name={field.name}
//                           value={formData[field.name]}
//                           onChange={handleInputChange}
//                           className={`w-full px-4 py-3 rounded-lg border ${
//                             errors[field.name]
//                               ? "border-red-500"
//                               : "border-gray-300"
//                           } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all bg-white shadow-sm`}
//                           placeholder={field.placeholder}
//                         />
//                       )}
//                       {errors[field.name] && (
//                         <motion.p
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           className="mt-1 text-xs text-red-500 flex items-center gap-1"
//                         >
//                           <AlertCircle className="h-3 w-3" />
//                           {errors[field.name]}
//                         </motion.p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </motion.div>

//               {/* Vehicle Information */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="space-y-6"
//               >
//                 <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
//                   <Car className="w-5 h-5 text-[#01669A]" />
//                   <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
//                     Vehicle & Booking
//                   </h2>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-[#01669A]" />
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
//                           : "border-gray-300"
//                       } focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all bg-white shadow-sm`}
//                       placeholderText="Select a date"
//                       showPopperArrow={false}
//                     />
//                     {errors.selectedDate && (
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-1 text-xs text-red-500 flex items-center gap-1"
//                       >
//                         <AlertCircle className="h-3 w-3" />
//                         {errors.selectedDate}
//                       </motion.p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-[#01669A]" />
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
//                       placeholder={
//                         !formData.selectedDate
//                           ? "Select a date first"
//                           : "Select a time"
//                       }
//                       className="text-sm"
//                     />
//                     {errors.selectedTimeSlot && (
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-1 text-xs text-red-500 flex items-center gap-1"
//                       >
//                         <AlertCircle className="h-3 w-3" />
//                         {errors.selectedTimeSlot}
//                       </motion.p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Make & Model
//                     </label>
//                     <input
//                       type="text"
//                       name="makeAndModel"
//                       value={formData.makeAndModel}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all bg-white shadow-sm"
//                       placeholder="e.g., Ford Focus"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Registration Number
//                     </label>
//                     <input
//                       type="text"
//                       name="registrationNo"
//                       value={formData.registrationNo}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#01669A] focus:border-[#01669A] transition-all bg-white shadow-sm uppercase"
//                       placeholder="e.g., AB12 CDE"
//                     />
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Select Class
//                     </label>
//                     <Select
//                       value={
//                         classOptions.find(
//                           (option) => option.value === formData.classSelection
//                         ) || null
//                       }
//                       onChange={(option) => {
//                         let expectedPrice = "";
//                         switch (option?.value) {
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
//                           classSelection: option?.value || "",
//                           totalPrice: expectedPrice,
//                         }));
//                       }}
//                       options={classOptions}
//                       styles={customSelectStyles}
//                       placeholder="Select a class"
//                       className="text-sm"
//                     />
//                     {errors.classSelection && (
//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         className="mt-1 text-xs text-red-500 flex items-center gap-1"
//                       >
//                         <AlertCircle className="h-3 w-3" />
//                         {errors.classSelection}
//                       </motion.p>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Cancellation Policy  and Price*/}

// <motion.div
//   initial={{ opacity: 0 }}
//   animate={{ opacity: 1 }}
//   transition={{ delay: 0.4 }}
// >
//   <div className="flex justify-between items-center bg-[#F7FAFC] p-6 rounded-xl border border-[#E6F0FA] shadow-md hover:shadow-lg transition-all duration-300">
//     {/* Left Side - Cancellation Policy */}
//     <div className="flex items-center">
//       <input
//         type="checkbox"
//         name="awareOfCancellationPolicy"
//         checked={formData.awareOfCancellationPolicy}
//         onChange={handleInputChange}
//         className="h-5 w-5 text-[#01669A] rounded border-gray-300 focus:ring-2 focus:ring-[#01669A] cursor-pointer"
//       />
//       <span className="ml-3 text-sm text-gray-700 font-medium">
//         I agree to the{" "}
//         <span className="text-[#01669A] font-semibold">
//           24-hour cancellation policy
//         </span>
//       </span>
//     </div>

//     {/* Right Side - Price */}
//     <div className="flex items-center space-x-2">
//       <div className="flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-600 bg-gray-800">
//         <PoundSterlingIcon className="text-[#01669A] h-5 w-5 sm:h-6 sm:w-6" />
//         <span className="text-lg sm:text-xl font-semibold text-teal-400">
//           {formData.totalPrice
//             ? Number(formData.totalPrice).toLocaleString("en-US", {
//                 style: "currency",
//                 currency: "GBP",
//               })
//             : "£0.00"}
//         </span>
//       </div>
//     </div>
//   </div>

//   {/* Error message */}
//   {errors.awareOfCancellationPolicy && (
//     <motion.p
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="mt-2 text-xs text-red-500 flex items-center gap-1"
//     >
//       <AlertCircle className="h-3 w-3" />
//       {errors.awareOfCancellationPolicy}
//     </motion.p>
//   )}
// </motion.div>

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
//                     awareOfCancellationPolicy: false,
//                     totalPrice: "",
//                     paymentMethod: "Payment on the day",
//                     classSelection: "",
//                   })
//                 }
//                 className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-md w-full sm:w-auto"
//                 disabled={loading}
//               >
//                 Reset
//               </motion.button>
//               <motion.button
//                 type="submit"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="px-8 py-3 bg-[#01669A] text-white rounded-xl hover:bg-[#024C6F] transition-all disabled:opacity-50 shadow-md w-full sm:w-auto flex items-center justify-center gap-2"
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

//         {/* PayPal Modal */}
//         <AnimatePresence>
//           <BookingConfirmation
//             isOpen={payMentModalOpen}
//             closeModal={() => setPayMentModalOpen(false)}
//             formData={formData}
//           />
//         </AnimatePresence>
//       </motion.div>
//       <ToastContainer position="top-right" autoClose={5000} theme="colored" />
//     </div>
//   );
// };

// export default ServiceBookingForm;
