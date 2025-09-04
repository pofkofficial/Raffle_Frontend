import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import ConfettiBurst from "../components/ConfettiBurst";
import { useState, useEffect } from "react";
import axios from "axios";

const LandingPage = () => {
  const [confetti, setConfetti] = useState(false);
  const [raffles, setRaffles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        console.log("Fetching raffles for LandingPage");
        const response = await axios.get("https://raffle-backend-nu.vercel.app/api/raffles");
        console.log("Raffles data:", response.data);
        // Filter active raffles (no winner and endTime > now)
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

    // Stop confetti after 3 seconds
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD93D] to-[#6BCB77] flex flex-col items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
        onHoverStart={() => setConfetti(true)}
        onHoverEnd={() => setConfetti(false)}
      >
        <div className="bg-[#4D96FF] p-4 flex justify-center items-center mb-6 rounded-t-2xl">
          
        </div>
        <h1 className="text-5xl font-poppins font-bold text-[#4D96FF] mb-4">
          Welcome to Raffle Hub
        </h1>
        <p className="text-2xl text-gray-700 dark:text-gray-200">
          Your Chance to Win Big, One Ticket at a Time!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <h2 className="text-3xl font-poppins font-semibold text-[#FF6B6B] mb-6 text-center">
          Join a Raffle
        </h2>
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : raffles.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No active raffles available. Check back soon!
          </p>
        ) : (
          <AnimatePresence>
            <ul className="space-y-4">
              {raffles.map((raffle) => (
                <motion.li
                  key={raffle._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Link to={`/raffle/${raffle._id}`} className="block">
                    <div className="flex items-center">
                      {raffle.prizeImage && (
                        <img
                          src={raffle.prizeImage}
                          alt={raffle.title}
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-poppins font-semibold text-[#4D96FF]">
                          {raffle.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-200 text-sm">
                          {raffle.description}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Prize:</span> GHS {raffle.cashPrize}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Ticket:</span> GHS {raffle.ticketPrice}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Ends:</span>{" "}
                            {new Date(raffle.endTime).toLocaleString()}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200">
                            <span className="font-semibold">Participants:</span>{" "}
                            <span className="text-[#6BCB77] font-bold">
                              {raffle.participants.length}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </motion.div>

      <ConfettiBurst trigger={confetti} />
    </div>
  );
};

export default LandingPage;