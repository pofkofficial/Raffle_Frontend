import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ConfettiBurst from "../components/ConfettiBurst";
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import CountdownTimer from '../components/CountdownTimer';

const LandingPage = () => {
  const [confetti, setConfetti] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prizeTypeFilter, setPrizeTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("endTime-desc");
  const BACKEND = process.env.REACT_APP_BACKEND_LINK;

  const fetchRaffles = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BACKEND}/api/raffles`, { timeout: 10000 });
      const activeRaffles = response.data.filter(
        (raffle) => !raffle.winner && new Date(raffle.endTime) > new Date()
      );
      setRaffles(activeRaffles);
    } catch (err) {
      console.error("Error fetching raffles:", err.response?.data || err.message);
      const errorMsg = err.code === 'ECONNABORTED'
        ? "Request timed out. Please try again."
        : err.message === 'Network Error'
        ? "Network error. Check your connection."
        : err.response?.data?.error || err.message || "Unknown error";
      setError(`Failed to load raffles: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND]);

  useEffect(() => {
    fetchRaffles();

    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [fetchRaffles]); // Only re-run if fetchRaffles changes (stable via useCallback)

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
  }, [raffles, searchQuery, prizeTypeFilter, sortOption]);

  const getPrizeImageSrc = (raffle) => {
    if (!raffle.prizeImage) return "/fallback-image.jpg";
    if (raffle.prizeImage.startsWith("data:image/")) {
      return raffle.prizeImage;
    }
    return `data:image/jpeg;base64,${raffle.prizeImage}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center p-4 xs:p-6 sm:p-8">
      {/* Header with Logo & Tagline */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-6 xs:mb-8 sm:mb-10 w-full max-w-2xl"
        onClick={() => setConfetti(true)}
      >
        <Link
          to="/"
          className="flex flex-wrap justify-center items-center gap-2 xs:gap-3 bg-[#4D96FF] p-3 xs:p-4 sm:p-5 rounded-t-2xl mb-4 xs:mb-6 sm:mb-8 mx-auto max-w-full"
        >
          <img
            src="/logo.png"
            alt="Try Ur Luck Logo"
            className="h-10 xs:h-12 sm:h-14 w-auto"
            onError={(e) => {
              console.error("Logo failed to load");
              e.target.src = "/fallback-logo.png";
            }}
          />
          <h1 className="text-white text-base xs:text-lg sm:text-xl font-poppins font-bold">
            Try Ur Luck
          </h1>
        </Link>
        <p className="text-base xs:text-lg sm:text-xl text-gray-700 dark:text-gray-200 px-2">
          Where Every Ticket Holds a Dream
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-full mx-2 xs:mx-4 sm:max-w-3xl md:max-w-5xl lg:max-w-7xl flex-grow"
      >
        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-poppins font-semibold text-[#FF6B6B] mb-4 xs:mb-6 sm:mb-8 text-center">
          Choose Your Preferred Raffle
        </h2>

        {/* Search & Filters */}
        <div className="mb-6 xs:mb-8 sm:mb-10 flex flex-col gap-4 xs:gap-6 w-full">
          <input
            type="text"
            placeholder="Search by title, ID, or prize..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-3 xs:py-4 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base min-h-[48px]"
            aria-label="Search raffles"
          />
          <div className="flex flex-col xs:flex-row gap-4 xs:gap-3 sm:gap-4 w-full flex-wrap">
            <select
              value={prizeTypeFilter}
              onChange={(e) => setPrizeTypeFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 xs:py-4 w-full xs:w-auto flex-1 min-w-[120px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base min-h-[48px]"
              aria-label="Filter by prize type"
            >
              <option value="all">All Prize Types</option>
              <option value="cash">Cash</option>
              <option value="item">Item</option>
            </select>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 xs:py-4 w-full xs:w-auto flex-1 min-w-[120px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base min-h-[48px]"
              aria-label="Sort raffles"
            >
              <option value="endTime-desc">End Time (Latest First)</option>
              <option value="endTime-asc">End Time (Earliest First)</option>
              <option value="ticketPrice-asc">Ticket Price (Low to High)</option>
              <option value="ticketPrice-desc">Ticket Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Loading / Error / Raffles */}
        <div aria-live="polite">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12">
              <div className="w-16 h-16 border-4 border-t-[#4D96FF] border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-lg sm:text-xl text-gray-700 dark:text-gray-200 font-medium">
                Loading raffles, please wait...
              </p>
            </div>
          ) : error ? (
            <div className="text-center p-6 sm:p-8 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 text-base sm:text-lg mb-4">
                {error}
              </p>
              <button
                onClick={fetchRaffles}
                className="px-6 py-3 bg-[#4D96FF] text-white font-medium rounded-lg hover:bg-[#3b82f6] focus:outline-none focus:ring-4 focus:ring-[#4D96FF]/50 transition shadow-md"
                aria-label="Retry loading raffles"
              >
                Retry
              </button>
            </div>
          ) : filteredAndSortedRaffles.length === 0 ? (
            <div className="text-center p-8 sm:p-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl">
                No raffles match your criteria. Try adjusting your search or filters!
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-2 gap-4 
                 xs:gap-5 
                 sm:grid-cols-2 sm:gap-6 
                 md:grid-cols-3 md:gap-7 
                 lg:grid-cols-4 lg:gap-8">
                {filteredAndSortedRaffles.map((raffle) => (
                  <motion.div
                    key={raffle._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 
                              rounded-xl shadow-lg 
                              p-4 xs:p-5 sm:p-6 
                              hover:shadow-xl transition-all duration-300 
                              w-full border border-gray-100 dark:border-gray-700"
                  >
                    <Link
                      to={`/raffle/${raffle._id}`}
                      className="block"
                      aria-label={`View raffle ${raffle.title}`}
                    >
                      {/* Prize Image */}
                      {raffle.prizeImage && (
                        <div className="relative w-full aspect-square mb-4 xs:mb-5 sm:mb-6 rounded-lg overflow-hidden shadow-md">
                          <img
                            src={getPrizeImageSrc(raffle)}
                            alt={raffle.title}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.target.src = "/fallback-image.jpg";
                            }}
                          />
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-base xs:text-lg sm:text-xl font-poppins font-bold text-[#4D96FF] mb-2 line-clamp-1">
                        {raffle.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-300 text-sm xs:text-base mb-3 line-clamp-2">
                        {raffle.description}
                      </p>

                      {/* Details */}
                      <div className="text-sm xs:text-base text-gray-700 dark:text-gray-200 space-y-1.5">
                        <p className="font-semibold text-[#FF6B6B]">
                          Prize:
                          {raffle.prizeTypes.includes("cash") && ` GHS ${raffle.cashPrize || "N/A"}`}
                          {raffle.prizeTypes.includes("cash") && raffle.prizeTypes.includes("item") && " + "}
                          {raffle.prizeTypes.includes("item") && ` ${raffle.itemName || "N/A"}`}
                        </p>
                        <p>
                          <span className="font-medium">Ticket:</span> GHS {raffle.ticketPrice}
                        </p>
                        <p className="flex items-center gap-1">
                          <span className="font-medium">Ends:</span>
                          <CountdownTimer endTime={raffle.endTime} />
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <ConfettiBurst trigger={confetti} />
    </div>
  );
};

export default LandingPage;