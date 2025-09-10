import React from 'react'
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 w-full mt-8 py-6 px-4 sm:px-6"
      >
        <div className="max-w-[90%] sm:max-w-3xl md:max-w-5xl lg:max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <Link
                  to="/"
                  className="flex items-center text-gray-200 hover:text-[#FFD93D] transition-colors text-sm sm:text-base"
                  aria-label="Contact Us"
                >
              
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
            </Link>  
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-200 hover:text-[#FFD93D] transition-colors text-sm sm:text-base"
                  aria-label="Contact Us"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-200 hover:text-[#FFD93D] transition-colors text-sm sm:text-base"
                  aria-label="About Us"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-[#4D96FF] mb-2">Follow Us</h3>
            <div className="flex justify-center sm:justify-start gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-[#FFD93D] transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11 1-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.55 1.72 2.14 2.97 4.02 3-.47.37-1.07.65-1.72.81-.49.12-1 .18-1.51.18-.99 0-1.9-.09-2.82-.27 1.91 1.23 4.18 1.94 6.62 1.94 7.94 0 12.29-6.58 12.29-12.29 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-[#FFD93D] transition-colors"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-7h-2v-2h2v-1.5c0-2.07 1.24-3.2 3.06-3.2.87 0 1.62.16 1.84.24v2.14h-1.26c-1.24 0-1.48.7-1.48 1.73V12h2.5l-.4 2h-2.1v7c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-[#FFD93D] transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.81.24 2.23.4.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.34 1.06.4 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.06 1.17-.24 1.81-.4 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.34-2.23.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.06-1.81-.24-2.23-.4-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.34-1.06-.4-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.06-1.17.24-1.81.4-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.34 2.23-.4 1.27-.06 1.65-.07 4.85-.07zm0-2.16C8.74 0 8.33.01 7.05.07c-1.28.06-2.16.26-2.93.56-.95.36-1.76.84-2.57 1.65-.81.81-1.29 1.62-1.65 2.57-.3.77-.5 1.65-.56 2.93C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.16.56 2.93.36.95.84 1.76 1.65 2.57.81.81 1.62 1.29 2.57 1.65.77.3 1.65.5 2.93.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.28-.06 2.16-.26 2.93-.56.95-.36 1.76-.84 2.57-1.65.81-.81 1.29-1.62 1.65-2.57.3-.77.5-1.65.56-2.93.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.16-.56-2.93-.36-.95-.84-1.76-1.65-2.57-.81-.81-1.62-1.29-2.57-1.65-.77-.3-1.65-.5-2.93-.56C15.67.01 15.26 0 12 0z" />
                  <path d="M12 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 10.16a4 4 0 110-8 4 4 0 010 8zm6.4-10.4a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-poppins font-semibold text-[#4D96FF] mb-2">About Try Ur Luck</h3>
            <p className="text-gray-200 text-sm sm:text-base">
              &copy; {new Date().getFullYear()} Try Ur Luck. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
  )
}

export default Footer;