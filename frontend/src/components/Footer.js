import React from 'react';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-gray-800 w-full mt-8 py-8 xs:py-10 px-4 xs:px-6 sm:px-8"
    >
      <div className="max-w-full mx-2 xs:mx-4 sm:max-w-3xl md:max-w-5xl lg:max-w-7xl grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-6 xs:gap-8 text-center xs:text-left">
        <div>
          <Link
            to="/"
            className="flex flex-wrap justify-center xs:justify-start items-center gap-2 xs:gap-3 text-gray-200 hover:text-[#FFD93D] transition-colors mb-4 xs:mb-6"
            aria-label="Try Ur Luck Home"
          >
            <img
              src="/logo.png"
              alt="Try Ur Luck Logo"
              className="h-10 xs:h-12 sm:h-14 w-auto"
              onError={(e) => {
                console.error('Logo failed to load');
                e.target.src = '/fallback-logo.png';
              }}
            />
            <h1 className="text-white text-base xs:text-lg sm:text-xl font-poppins font-bold">
              Try Ur Luck
            </h1>
          </Link>
          <ul className="space-y-3 xs:space-y-4">
            <li>
              <Link
                to="/contact"
                className="text-gray-200 hover:text-[#FFD93D] transition-colors text-base sm:text-lg"
                aria-label="Contact Us"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-gray-200 hover:text-[#FFD93D] transition-colors text-base sm:text-lg"
                aria-label="About Us"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-base xs:text-lg sm:text-xl font-poppins font-semibold text-[#4D96FF] mb-3 xs:mb-4">
            Follow Us
          </h3>
          <div className="flex justify-center xs:justify-start gap-4 xs:gap-6">
            <a
              href="https://www.tiktok.com/@tryurluckofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-[#FFD93D] transition-colors p-2"
              aria-label="Follow Try Ur Luck on TikTok"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.829 2.828 2.896 2.896 0 0 1-2.829-2.828 2.896 2.896 0 0 1 2.829-2.828c.281 0 .548.041.805.115V9.772a6.342 6.342 0 0 0-1.614-.204 6.343 6.343 0 0 0-6.336 6.336 6.343 6.343 0 0 0 6.336 6.336 6.343 6.343 0 0 0 6.336-6.336V8.743a8.127 8.127 0 0 0 4.638 1.476V6.686h-.001z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/tryurluckofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-[#FFD93D] transition-colors p-2"
              aria-label="Follow Try Ur Luck on Instagram"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.81.24 2.23.4.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.34 1.06.4 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.81-.4 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.34-2.23.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.81-.24-2.23-.4-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.34-1.06-.4-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.06-1.17.24-1.81.4-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.34 2.23-.4 1.27-.06 1.65-.07 4.85-.07zm0-2.16C8.74 0 8.33.01 7.05.07c-1.28.06-2.16.26-2.93.56-.95.36-1.76.84-2.57 1.65-.81.81-1.29 1.62-1.65 2.57-.3.77-.5 1.65-.56 2.93C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.16.56 2.93.36.95.84 1.76 1.65 2.57.81.81 1.62 1.29 2.57 1.65.77.3 1.65.5 2.93.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.28-.06 2.16-.26 2.93-.56.95-.36 1.76-.84 2.57-1.65.81-.81 1.29-1.62 1.65-2.57.3-.77.5-1.65.56-2.93.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.16-.56-2.93-.36-.95-.84-1.76-1.65-2.57-.81-.81-1.62-1.29-2.57-1.65-.77-.3-1.65-.5-2.93-.56C15.67.01 15.26 0 12 0z" />
                <path d="M12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-base xs:text-lg sm:text-xl font-poppins font-semibold text-[#4D96FF] mb-3 xs:mb-4">
            About Try Ur Luck
          </h3>
          <p className="text-gray-200 text-base sm:text-lg">
            &copy; {new Date().getFullYear()} Try Ur Luck. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;