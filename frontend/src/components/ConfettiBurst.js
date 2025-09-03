import ReactConfetti from 'react-confetti';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ConfettiBurst = ({ trigger }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (trigger) setShow(true);
  }, [trigger]);

  return (
    show && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ReactConfetti width={window.innerWidth} height={window.innerHeight} colors={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF']} />
      </motion.div>
    )
  );
};

export default ConfettiBurst;