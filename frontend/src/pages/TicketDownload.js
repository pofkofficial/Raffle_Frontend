import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import ConfettiBurst from '../components/ConfettiBurst';
import axios from 'axios';

const TicketDownload = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [error, setError] = useState('');
  const ticketNumber = searchParams.get('ticketNumber');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid raffle ID');
        return;
      }
      if (!ticketNumber) {
        setError('No ticket number provided');
        return;
      }
      try {
        console.log(`Fetching ticket with raffle ID: ${id}, ticketNumber: ${ticketNumber}`);
        const response = await axios.get(`https://raffle-backend-rho.vercel.app/api/raffles/${id}/ticket/${ticketNumber}`);
        console.log('Ticket data:', response.data);
        setTicketData({ ...response.data.raffle, participants: [response.data.participant], ticketNumber });
      } catch (err) {
        console.error('Error fetching ticket:', err.response?.data || err.message);
        setError(`Failed to load ticket: ${err.response?.data?.error || err.message}`);
      }
    };

    fetchTicket();
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [id, ticketNumber]);

  const handleDownload = () => {
    if (!id || id === 'undefined' || !ticketData?.participants[0]?.ticketNumber) {
      setError('Invalid raffle ID or ticket number');
      return;
    }
    axios
      .get(`https://raffle-backend-rho.vercel.app/api/raffles/${id}/ticket/${ticketData.participants[0].ticketNumber}`, { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'raffle-ticket.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => setError(`Failed to download ticket: ${err.response?.data?.error || err.message}`));
  };

  const handleGoBack = () => {
    navigate(`/raffle/${id}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] flex items-center justify-center p-4">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] flex items-center justify-center p-4">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  const participant = ticketData.participants[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#4D96FF] p-4 flex justify-center items-center">
          <img
            src="/logo.png"
            alt="Try Ur Luck Logo"
            className="h-16 w-auto"
            onError={(e) => (e.target.src = '/fallback-logo.png')}
          />
        </div>
        <div className="p-6 text-center">
          <h1 className="text-3xl font-poppins font-bold text-[#4D96FF] mb-4">
            🎉 Ticket Secured!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
            You've secured your ticket for <strong>{ticketData.title}</strong>!
          </p>
          <div className="my-6">
            <QRCodeCanvas
              value={`https://raffle-frontend-xi.vercel.app/ticket/${id}?ticketNumber=${encodeURIComponent(participant.ticketNumber)}`}
              size={150}
              className="mx-auto"
            />
            <p className="mt-2 text-[#FF6B6B] font-semibold">
              Ticket Number: {ticketNumber || 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-200">
              Name: {participant?.displayName || 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-200">
              Expires: {new Date(ticketData.endTime).toLocaleString()}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="bg-[#FFD93D] text-black p-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors mb-3"
          >
            Download Ticket
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="bg-[#4D96FF] text-white p-3 rounded-lg w-full font-semibold hover:bg-[#3D86E6] transition-colors"
          >
            Go Back to Raffle
          </motion.button>
        </div>
      </motion.div>
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default TicketDownload;