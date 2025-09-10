import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="bg-[#4D96FF] p-3 sm:p-4 flex justify-center items-center mb-4 sm:mb-6 rounded-t-2xl space-x-2">
          <img
            src="/logo.png"
            alt="Try Ur Luck Logo"
            className="h-12 sm:h-16 w-auto"
            onError={(e) => {
              console.error('Logo failed to load');
              e.target.src = '/fallback-logo.png';
            }}
          />
          <h1 className="text-white text-lg sm:text-xl font-poppins font-bold">Try Ur Luck</h1>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-poppins font-semibold text-[#FF6B6B]">
          About Us
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-[90%] sm:max-w-lg md:max-w-xl text-center"
      >
        <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base mb-4">
          Try Ur Luck is your go-to platform for exciting raffles with amazing prizes. We’re passionate about creating opportunities for everyone to win big, whether it’s cash or exclusive items.
        </p>
        <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base mb-4">
          Our mission is to make raffles fair, fun, and accessible to all. Join us today and try your luck!
        </p>
        <Link
          to="/"
          className="inline-block bg-[#4D96FF] text-white px-4 py-3 sm:py-4 rounded-lg font-semibold hover:bg-[#3D86E6] transition-colors min-h-[44px]"
          aria-label="Back to Home"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default AboutUs;