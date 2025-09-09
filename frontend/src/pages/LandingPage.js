import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ConfettiBurst from "../components/ConfettiBurst";
import { useState, useEffect } from "react";
import axios from "axios";

const LandingPage = () => {
  const [confetti, setConfetti] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [error, setError] = useState("");
  const BACKEND = process.env.BACKEND_LINK;

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        console.log("Fetching raffles for LandingPage");
        const response = await axios.get(`${BACKEND}/api/raffles`);
        console.log("Raffle data:", response.data);
        const activeRaffles = response.data.filter(
          (raffle) =>
            !raffle.winner && new Date(raffle.endTime) > new Date()
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
  }, []);

  const getPrizeImageSrc = (prizeImage) => {
    if (!prizeImage) return "/fallback-image.jpg";
    if (prizeImage.startsWith("data:image/")) {
      return prizeImage;
    }
    return `data:image/jpeg;base64,${prizeImage}`;
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-white flex flex-col items-center p-4 sm:p-6">
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
        className="w-full max-w-[90%] sm:max-w-3xl md:max-w-5xl lg:max-w-7xl"
      >
        <h2 className="text-xl sm:text-2xl md:text-3xl font-poppins font-semibold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
          Choose your preferred Raffle
        </h2>
        {error ? (
          <div className="text-red-500 text-sm sm:text-base text-center">{error}</div>
        ) : raffles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base text-center">
            No active raffles available. Check back soon!
          </p>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {raffles.map((raffle) => (
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
                        {new Date(raffle.endTime).toLocaleString()}
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

      <ConfettiBurst trigger={confetti} />
    </div>
  );
};

export default LandingPage;