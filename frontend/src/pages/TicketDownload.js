import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  const FRONTEND = process.env.REACT_APP_FRONTEND_LINK;
  const BACKEND = process.env.REACT_APP_BACKEND_LINK;

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
        const response = await axios.get(`${BACKEND}/api/raffles/${id}/ticket/${ticketNumber}`);
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
  }, [id, ticketNumber, BACKEND]);

  const handleDownload = () => {
    if (!id || id === 'undefined' || !ticketData?.participants[0]?.ticketNumber) {
      setError('Invalid raffle ID or ticket number');
      return;
    }
    axios
      .get(`${BACKEND}/api/raffles/${id}/ticket/${ticketData.participants[0].ticketNumber}`, { responseType: 'blob' })
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
      <div className="min-h-[calc(100vh-2rem)] bg-white flex items-center justify-center p-4 sm:p-6">
        <div className="text-red-500 text-sm sm:text-base text-center">{error}</div>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-[calc(100vh-2rem)] bg-white flex items-center justify-center p-4 sm:p-6">
        <div className="text-gray-700 dark:text-gray-200 text-sm sm:text-base text-center">Loading...</div>
      </div>
    );
  }

  const participant = ticketData.participants[0];

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-white p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[90%] sm:max-w-sm md:max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <Link to="/" className="bg-[#4D96FF] p-3 sm:p-4 flex justify-center items-center space-x-2">
          <img
            src="/logo.png"
            alt="Try Ur Luck Logo"
            className="h-12 sm:h-16 w-auto"
            onError={(e) => (e.target.src = '/fallback-logo.png')}
          />
          <h1 className="text-white text-lg sm:text-xl font-poppins font-bold">Try Ur Luck</h1>
        </Link>
        <div className="p-4 sm:p-6 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-poppins font-bold text-[#4D96FF] mb-3 sm:mb-4">
            🎉 Ticket Secured!
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 mb-4 sm:mb-6">
            You've secured your ticket for <strong>{ticketData.title}</strong>!
          </p>
          <div className="my-4 sm:my-6">
            <QRCodeCanvas
              value={`${FRONTEND}/ticket/${id}?ticketNumber=${encodeURIComponent(participant.ticketNumber)}`}
              size={120}
              className="mx-auto sm:size-[150px]"
              aria-label="QR code for ticket"
            />
            <p className="mt-2 text-[#FF6B6B] text-sm sm:text-base font-semibold">
              Ticket Number: {ticketNumber || 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-200 text-sm sm:text-base">
              Name: {participant?.displayName || 'N/A'}
            </p>
            <p className="text-gray-600 dark:text-gray-200 text-sm sm:text-base">
              Expires: {new Date(ticketData.endTime).toLocaleString()}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="bg-[#FFD93D] text-black px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors mb-3 sm:mb-4 min-h-[44px]"
            aria-label="Download raffle ticket"
          >
            Download Ticket
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoBack}
            className="bg-[#4D96FF] text-white px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#3D86E6] transition-colors min-h-[44px]"
            aria-label="Go back to raffle details"
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