import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ConfettiBurst from '../components/ConfettiBurst';

const CreateRaffle = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cashPrize, setCashPrize] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prizeImage, setPrizeImage] = useState(null);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Raffle title is required');
      return;
    }
    if (!cashPrize || cashPrize <= 0) {
      setError('Cash prize must be a positive number');
      return;
    }
    if (!ticketPrice || ticketPrice < 0) {
      setError('Ticket price must be a non-negative number');
      return;
    }
    if (!endTime) {
      setError('End time is required');
      return;
    }
    const endDate = new Date(endTime);
    if (endDate <= new Date()) {
      setError('End time must be in the future');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('cashPrize', cashPrize);
    formData.append('ticketPrice', ticketPrice);
    formData.append('endTime', endTime);
    if (prizeImage) formData.append('prizeImage', prizeImage);

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/raffles/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        console.log('Navigating to /admin/', response.data.id);
        navigate(`/admin/${response.data.id}?secret=${response.data.creatorSecret}`);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error details:', err.response?.data, err.response?.status, err.response?.headers);
      setError(`Failed to create raffle: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#4D96FF] p-4 flex justify-center items-center"></div>
        <div className="p-6">
          <h1 className="text-3xl font-poppins font-bold text-[#FF6B6B] mb-6 text-center">
            Create New Raffle
          </h1>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Raffle Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows="4"
            />
            <input
              type="number"
              placeholder="Cash Prize (GHS)"
              value={cashPrize}
              onChange={(e) => setCashPrize(e.target.value)}
              min="1"
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="number"
              placeholder="Ticket Price (GHS)"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              min="0"
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPrizeImage(e.target.files[0])}
              className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-[#6BCB77] text-white p-3 rounded-lg w-full font-semibold hover:bg-[#5BB966] transition-colors"
            >
              Create Raffle
            </motion.button>
          </form>
        </div>
      </motion.div>
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default CreateRaffle;