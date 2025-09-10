import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ConfettiBurst from "../components/ConfettiBurst";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import CountdownTimer from '../components/CountdownTimer';

const LandingPage = () => {
  const [confetti, setConfetti] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [prizeTypeFilter, setPrizeTypeFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const [sortOption, setSortOption] = useState("endTime-desc");
  const BACKEND = process.env.REACT_APP_BACKEND_LINK;

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        console.log("Fetching raffles for LandingPage with " + BACKEND);
        const response = await axios.get(`${BACKEND}/api/raffles`);
        console.log("Raffle data:", response.data);
        const activeRaffles = response.data.filter(
          (raffle) => !raffle.winner && new Date(raffle.endTime) > new Date()
        );
        setRaffles(activeRaffles);
      } catch (err) {
        console.error("Error fetching raffles:", err.response?.data || err.message);
        setError(`Failed to load raffles: ${err.response?.data?.error || err.message}`);
      }
    };
    fetchRaffles();

    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [BACKEND]);

  const filteredAndSortedRaffles = useMemo(() => {
    let result = [...raffles];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (raffle) =>
          raffle.title.toLowerCase().includes(query) ||
          raffle.description.toLowerCase().includes(query) ||
          raffle._id.toLowerCase().includes(query) ||
          (raffle.itemName && raffle.itemName.toLowerCase().includes(query)) ||
          (raffle.prizeTypes.includes("cash") && `GHS ${raffle.cashPrize}`.toLowerCase().includes(query))
      );
    }

    // Filter by prize type
    if (prizeTypeFilter !== "all") {
      result = result.filter((raffle) => raffle.prizeTypes.includes(prizeTypeFilter));
    }

    // Filter by participant count
    if (participantFilter !== "all") {
      result = result.filter((raffle) => {
        const count = raffle.participants.length;
        if (participantFilter === "0-10") return count <= 10;
        if (participantFilter === "11-50") return count > 10 && count <= 50;
        if (participantFilter === "51+") return count > 50;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "endTime-asc") {
        return new Date(a.endTime) - new Date(b.endTime);
      } else if (sortOption === "endTime-desc") {
        return new Date(b.endTime) - new Date(a.endTime);
      } else if (sortOption === "ticketPrice-asc") {
        return a.ticketPrice - b.ticketPrice;
      } else if (sortOption === "ticketPrice-desc") {
        return b.ticketPrice - a.ticketPrice;
      }
      return 0;
    });

    return result;
  }, [raffles, searchQuery, prizeTypeFilter, participantFilter, sortOption]);

  const getPrizeImageSrc = (prizeImage) => {
    if (!prizeImage) return "/fallback-image.jpg";
    if (prizeImage.startsWith("data:image/")) {
      return prizeImage;
    }
    return `data:image/jpeg;base64,${prizeImage}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6 sm:mb-8"
        onClick={() => setConfetti(true)}
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
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200">
          Where Every Ticket Holds a Dream
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-[90%] sm:max-w-3xl md:max-w-5xl lg:max-w-7xl flex-grow"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-poppins font-semibold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
          Choose your preferred Raffle
        </h2>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <input
            type="text"
            placeholder="Search by title, ID, or prize..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full sm:w-1/3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
            aria-label="Search raffles"
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={prizeTypeFilter}
              onChange={(e) => setPrizeTypeFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
              aria-label="Filter by prize type"
            >
              <option value="all">All Prize Types</option>
              <option value="cash">Cash</option>
              <option value="item">Item</option>
            </select>
            <select
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
              aria-label="Filter by participants"
            >
              <option value="all">All Participants</option>
              <option value="0-10">0-10 Participants</option>
              <option value="11-50">11-50 Participants</option>
              <option value="51+">51+ Participants</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
              aria-label="Sort raffles"
            >
              <option value="endTime-desc">End Time (Latest First)</option>
              <option value="endTime-asc">End Time (Earliest First)</option>
              <option value="ticketPrice-asc">Ticket Price (Low to High)</option>
              <option value="ticketPrice-desc">Ticket Price (High to Low)</option>
            </select>
          </div>
        </div>
        {error ? (
          <div className="text-red-500 text-sm sm:text-base text-center">{error}</div>
        ) : filteredAndSortedRaffles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base text-center">
            No raffles match your criteria. Try adjusting your search or filters!
          </p>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAndSortedRaffles.map((raffle) => (
                <motion.div
                  key={raffle._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow"
                >
                  <Link
                    to={`/raffle/${raffle._id}`}
                    className="block"
                    aria-label={`View raffle ${raffle.title}`}
                  >
                    {raffle.prizeImage && (
                      <div className="relative w-full aspect-[3/2] mb-3 sm:mb-4 rounded-lg overflow-hidden">
                        <img
                          src={getPrizeImageSrc(raffle.prizeImage)}
                          alt={raffle.title}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            console.error("Prize image failed to load for raffle:", raffle._id, raffle.prizeImage);
                            e.target.src = "/fallback-image.jpg";
                          }}
                        />
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-poppins font-semibold text-[#4D96FF] mb-2">
                      {raffle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-200 text-sm sm:text-base mb-2">
                      {raffle.description}
                    </p>
                    <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
                      <p className="font-semibold">
                        Prize:
                        {raffle.prizeTypes.includes("cash") && ` GHS ${raffle.cashPrize || "N/A"}`}
                        {raffle.prizeTypes.includes("cash") && raffle.prizeTypes.includes("item") && " + "}
                        {raffle.prizeTypes.includes("item") && (raffle.itemName || "N/A")}
                      </p>
                      <p>
                        <span className="font-semibold">Ticket:</span> GHS {raffle.ticketPrice}
                      </p>
                      <p>
                        <span className="font-semibold">Ends:</span>{" "}
                        <CountdownTimer endTime={raffle.endTime} />
                      </p>
                      <p>
                        <span className="font-semibold">Participants:</span>{" "}
                        <span className="text-[#6BCB77] font-bold">
                          {raffle.participants.length}
                        </span>
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

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

      <ConfettiBurst trigger={confetti} />
    </div>
  );
};

export default LandingPage;