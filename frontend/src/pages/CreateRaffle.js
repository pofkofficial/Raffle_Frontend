import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import ConfettiBurst from '../components/ConfettiBurst';

const CreateRaffle = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeTypes, setPrizeTypes] = useState([]);
  const [cashPrize, setCashPrize] = useState('');
  const [itemName, setItemName] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [endTime, setEndTime] = useState('');
  const [prizeImage, setPrizeImage] = useState(null);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const BACKEND = process.env.REACT_APP_BACKEND_LINK;

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const generateCreatorSecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handlePrizeTypeChange = (type) => {
    setPrizeTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
    if (type === 'cash' && prizeTypes.includes('cash')) {
      setCashPrize('');
    }
    if (type === 'item' && prizeTypes.includes('item')) {
      setItemName('');
      setPrizeImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Raffle title is required');
      return;
    }
    if (prizeTypes.length === 0) {
      setError('At least one prize type (Cash or Item) must be selected');
      return;
    }
    if (prizeTypes.includes('cash') && (!cashPrize || cashPrize <= 0)) {
      setError('Cash prize must be a positive number');
      return;
    }
    if (prizeTypes.includes('item') && !itemName.trim()) {
      setError('Item name is required when Item is selected');
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
    formData.append('prizeTypes', JSON.stringify(prizeTypes));
    if (prizeTypes.includes('cash')) {
      formData.append('cashPrize', cashPrize);
    }
    if (prizeTypes.includes('item')) {
      formData.append('itemName', itemName);
      if (prizeImage) formData.append('prizeImage', prizeImage);
    }
    formData.append('ticketPrice', ticketPrice);
    formData.append('endTime', new Date(endTime).toISOString());
    formData.append('creatorSecret', generateCreatorSecret());

    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post(`${BACKEND}/api/raffles/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        console.log('Navigating to /admin/', response.data._id);
        navigate(`/admin/${response.data._id}?secret=${response.data.creatorSecret}`);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      console.error('Error details:', err.response?.data, err.response?.status, err.response?.headers);
      setError(`Failed to create raffle: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-white flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
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
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
            Create New Raffle
          </h1>
          {error && <p className="text-red-500 text-sm sm:text-base text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Raffle Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
              required
              aria-label="Raffle Title"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg"
              rows="5"
              aria-label="Raffle Description"
            />
            <div className="mb-3">
              <label className="block text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-1">Prize Type</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="cash"
                    checked={prizeTypes.includes('cash')}
                    onChange={() => handlePrizeTypeChange('cash')}
                    className="mr-2 h-5 w-5"
                    aria-label="Cash Prize"
                  />
                  <span className="text-base sm:text-lg">Cash</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="item"
                    checked={prizeTypes.includes('item')}
                    onChange={() => handlePrizeTypeChange('item')}
                    className="mr-2 h-5 w-5"
                    aria-label="Item Prize"
                  />
                  <span className="text-base sm:text-lg">Item</span>
                </label>
              </div>
            </div>
            {prizeTypes.includes('cash') && (
              <input
                type="number"
                placeholder="Cash Prize (GHS)"
                value={cashPrize}
                onChange={(e) => setCashPrize(e.target.value)}
                min="1"
                className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                required
                aria-label="Cash Prize Amount"
              />
            )}
            {prizeTypes.includes('item') && (
              <>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                  required
                  aria-label="Item Name"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPrizeImage(e.target.files[0])}
                  className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg"
                  aria-label="Prize Image Upload"
                />
              </>
            )}
            <input
              type="number"
              placeholder="Ticket Price (GHS)"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              min="0"
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
              required
              aria-label="Ticket Price"
            />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
              required
              aria-label="Raffle End Time"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-[#6BCB77] text-white px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#5BB966] transition-colors min-h-[44px]"
              aria-label="Create Raffle"
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