import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConfettiBurst from './ConfettiBurst';

const Winner = ({ raffle, onClose, isAdmin }) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const winner = raffle?.participants?.find((p) => p.ticketNumbers.includes(raffle.winner));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            ✕
          </button>
          <div className="bg-[#4D96FF] p-4 flex justify-center items-center mb-6 rounded-t-2xl">
            <img
              src="/logo.png"
              alt="Raffle Hub Logo"
              className="h-16 w-auto"
              onError={(e) => (e.target.src = '/fallback-logo.png')}
            />
          </div>
          <h1 className="text-4xl font-poppins font-bold text-[#FF6B6B] mb-6">
            🏆 Winner Announced! 🏆
          </h1>
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-4"
          >
            <p className="text-3xl text-[#FFD93D] font-semibold">
              {winner ? `${winner.displayName} wins!` : 'No winner selected.'}
            </p>
            {winner && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ticket: {raffle.winner}
              </p>
            )}
            <p className="text-lg text-gray-600 dark:text-gray-200 mt-2">
              Raffle: {raffle.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Prize: {raffle.prizeTypes.includes('cash') ? `GHS ${raffle.cashPrize || 'N/A'}` : raffle.itemName || 'N/A'}
            </p>
          </motion.div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-6 bg-[#FFD93D] text-black p-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors"
            >
              Back to Dashboard
            </motion.button>
          )}
        </motion.div>
      </motion.div>
      <div className="fixed top-0 left-0 w-full h-full z-40">
        <ConfettiBurst trigger={showConfetti} />
      </div>
    </>
  );
};

export default Winner;