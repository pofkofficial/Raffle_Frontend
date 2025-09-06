import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ConfettiBurst from '../components/ConfettiBurst';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://raffle-backend-rho.vercel.app/api/admin/login', {
        emailOrUsername,
        password,
      });
      localStorage.setItem('adminToken', response.data.token);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate('/admin');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email/username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="bg-[#4D96FF] p-4 flex justify-center items-center mb-6 rounded-t-2xl">
          <h1>Raffle Hub</h1>
        </div>
        <h1 className="text-3xl font-poppins font-bold text-[#FF6B6B] mb-6 text-center">
          Admin Login
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Email or Username"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-[#4D96FF] text-white p-3 rounded-lg w-full font-semibold hover:bg-[#3D86E6] transition-colors"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default AdminLogin;