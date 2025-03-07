import React from "react";
import { motion } from "framer-motion";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      exit="exit"
      variants={modalVariants}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md mx-4">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-200">
            Confirm Logout
          </h3>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Are you sure you want to log out?
          </p>
          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="bg-gray-600 text-gray-200 px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-500 transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LogoutModal;

// import React from 'react';
// import { motion } from 'framer-motion';

// const modalVariants = {
//   hidden: { opacity: 0, scale: 0.9 },
//   visible: { opacity: 1, scale: 1 },
//   exit: { opacity: 0, scale: 0.9 }
// };

// const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
//   return (
//     <motion.div
//       initial="hidden"
//       animate={isOpen ? "visible" : "hidden"}
//       exit="exit"
//       variants={modalVariants}
//       transition={{ duration: 0.3 }}
//       className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}
//     >
//       <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4">
//         <div className="p-6">
//           <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
//           <p className="mt-2 text-gray-600">Are you sure you want to log out?</p>
//           <div className="mt-4 flex justify-end">
//             <button
//               onClick={onClose}
//               className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onConfirm}
//               className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default LogoutModal;
