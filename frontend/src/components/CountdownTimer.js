import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(endTime) - new Date();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft('Ended');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
      className="text-2xl font-bold text-[#FF6B6B]"
    >
      {timeLeft}
    </motion.div>
  );
};

export default CountdownTimer;