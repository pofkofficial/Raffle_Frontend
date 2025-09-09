import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { PaystackButton } from 'react-paystack';
import CountdownTimer from '../components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiBurst from '../components/ConfettiBurst';
import Winner from '../components/Winner';

const RaffleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const isAdmin = !!localStorage.getItem('adminToken');
  const BACKEND = process.env.BACKEND_LINK;

  useEffect(() => {
    const fetchRaffle = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid raffle ID');
        return;
      }
      try {
        console.log(`Fetching raffle with ID: ${id}`);
        const response = await axios.get(`${BACKEND}/api/raffles/${id}`);
        console.log('Raffle data:', response.data);
        setRaffle(response.data);
        if (response.data.winner || new Date(response.data.endTime) <= new Date()) {
          setShowWinnerModal(true);
        }
      } catch (err) {
        console.error('Error fetching raffle:', err.response?.data || err.message);
        setError(`Failed to load raffle: ${err.response?.data?.error || err.message}`);
      }
    };
    fetchRaffle();
  }, [id, BACKEND]);

  const publicKey = process.env.MAIN_PAYSTACK;
  const componentProps = {
    email,
    amount: raffle?.ticketPrice * quantity * 100,
    currency: 'GHS',
    metadata: { name, contact, raffleId: id, referrer: window.location.href, quantity, email },
    publicKey,
    text: `Join Now (${quantity} Ticket${quantity > 1 ? 's' : ''})`,
    onSuccess: (response) => {
      console.log('Paystack success:', response);
      setShowConfetti(true);
      axios
        .post(`${BACKEND}/api/raffles/verify-payment`, {
          reference: response.reference,
          raffleId: id,
          name,
          contact,
          email,
          quantity,
        }, { responseType: 'blob' })
        .then((res) => {
          console.log('Verify Response Headers:', res.headers);
          const ticketNumbersHeader = res.headers['x-ticket-numbers'] || res.headers['X-Ticket-Numbers'];
          console.log('Raw x-ticket-numbers header:', ticketNumbersHeader);
          const ticketNumbers = ticketNumbersHeader ? JSON.parse(ticketNumbersHeader) : [];
          console.log('Parsed Ticket Numbers:', ticketNumbers);
          if (!ticketNumbers.length) {
            throw new Error('No ticket numbers received from server');
          }
          const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `tickets-${id}.zip`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          navigate(`/ticket/${id}?ticketNumber=${encodeURIComponent(ticketNumbers[0])}`);
          setTimeout(() => setShowConfetti(false), 3000);
        })
        .catch((err) => setError(`Payment verification failed: ${err.response?.data?.error || err.message}`));
    },
    onClose: () => setError('Payment cancelled'),
  };

  const handleFreeJoin = async () => {
    if (!name || !contact || !email || !quantity || quantity < 1) {
      setError('All fields and valid ticket quantity are required');
      return;
    }
    try {
      const res = await axios.post(`${BACKEND}/api/raffles/init-payment`, {
        raffleId: id,
        displayName: name,
        contact,
        email,
        quantity,
      }, { responseType: 'blob' });
      console.log('Free Join Response Headers:', res.headers);
      const ticketNumbersHeader = res.headers['x-ticket-numbers'] || res.headers['X-Ticket-Numbers'];
      console.log('Raw x-ticket-numbers header:', ticketNumbersHeader);
      const ticketNumbers = ticketNumbersHeader ? JSON.parse(ticketNumbersHeader) : [];
      console.log('Parsed Ticket Numbers:', ticketNumbers);
      if (!ticketNumbers.length) {
        throw new Error('No ticket numbers received from server');
      }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-${id}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowConfetti(true);
      navigate(`/ticket/${id}?ticketNumber=${encodeURIComponent(ticketNumbers[0])}`);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(`Failed to join: ${err.response?.data?.error || err.message}`);
    }
  };

  const getPrizeImageSrc = (prizeImage) => {
    if (!prizeImage) return '/fallback-image.jpg';
    if (prizeImage.startsWith('data:image/')) {
      return prizeImage;
    }
    return `data:image/jpeg;base64,${prizeImage}`;
  };

  if (error) return <div className="text-red-500 text-sm sm:text-base text-center p-4 sm:p-8">{error}</div>;
  if (!raffle) return <div className="text-gray-700 text-sm sm:text-base text-center p-4 sm:p-8">Loading...</div>;

  const isRaffleActive = !raffle.winner && new Date(raffle.endTime) > new Date();

  const aggregatedParticipants = raffle.participants.reduce((acc, p) => {
    const key = `${p.email}:${p.contact}`;
    if (!acc[key]) {
      acc[key] = { ...p, ticketCount: p.ticketNumbers.length };
    } else {
      acc[key].ticketNumbers.push(...p.ticketNumbers);
      acc[key].ticketCount += p.ticketNumbers.length;
    }
    return acc;
  }, {});
  const uniqueParticipants = Object.values(aggregatedParticipants);

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-white p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[90%] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#4D96FF] p-3 sm:p-4 flex justify-center items-center space-x-2">
          <img
            src="/logo.png"
            alt="Try Ur Luck Logo"
            className="h-12 sm:h-16 w-auto"
            onError={(e) => (e.target.src = '/fallback-logo.png')}
          />
          <h1 className="text-white text-lg sm:text-xl font-poppins font-bold">Try Ur Luck</h1>
        </div>
        <div className="p-4 sm:p-6">
          {raffle.prizeImage && (
            <div className="relative w-full aspect-[3/2] mb-4 sm:mb-6 rounded-lg overflow-hidden">
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                src={getPrizeImageSrc(raffle.prizeImage)}
                alt="Prize"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => {
                  console.error('Prize image failed to load:', raffle.prizeImage);
                  e.target.src = '/fallback-image.jpg';
                }}
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
            {raffle.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-200 text-base sm:text-lg mb-4 sm:mb-6">{raffle.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 sm:mb-6">
            <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
              <span className="font-semibold">Prize:</span>{" "}
              {raffle.prizeTypes.includes('cash') && `GHS ${raffle.cashPrize || 'N/A'}`}
              {raffle.prizeTypes.includes('cash') && raffle.prizeTypes.includes('item') && ' + '}
              {raffle.prizeTypes.includes('item') && (raffle.itemName || 'N/A')}
            </p>
            <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
              <span className="font-semibold">Ticket Price:</span> GHS {raffle.ticketPrice}
            </p>
            <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
              <span className="font-semibold">Ends:</span>{" "}
              <CountdownTimer endTime={raffle.endTime} />
            </p>
            <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
              <span className="font-semibold">Participants:</span>{' '}
              <motion.span
                key={raffle.participants.length}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[#6BCB77] font-bold"
              >
                {uniqueParticipants.length}
              </motion.span>
            </p>
          </div>
          {!isAdmin && isRaffleActive && (
            <div className="mt-4 sm:mt-6">
              <input
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                required
                aria-label="Display Name"
              />
              <input
                placeholder="Contact Number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                required
                aria-label="Contact Number"
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                required
                aria-label="Email"
              />
              <input
                type="number"
                placeholder="Number of Tickets"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base sm:text-lg min-h-[44px]"
                required
                aria-label="Number of Tickets"
              />
              {raffle.ticketPrice > 0 ? (
                <PaystackButton
                  {...componentProps}
                  className="bg-[#4D96FF] text-white px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#3D86E6] transition-colors min-h-[44px]"
                  aria-label={`Join raffle with ${quantity} ticket${quantity > 1 ? 's' : ''}`}
                />
              ) : (
                <button
                  onClick={handleFreeJoin}
                  className="bg-[#6BCB77] text-white px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#5BB966] transition-colors min-h-[44px]"
                  aria-label={`Join free raffle with ${quantity} ticket${quantity > 1 ? 's' : ''}`}
                >
                  Join Free ({quantity} Ticket{quantity > 1 ? 's' : ''})
                </button>
              )}
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-600 text-white rounded-lg text-center text-sm sm:text-base"
            >
              {error}
            </motion.div>
          )}
          {isAdmin && (
            <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:gap-4">
              {isRaffleActive && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/${raffle._id}?secret=${raffle.creatorSecret}`)}
                  className="bg-[#FFD93D] text-black px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px]"
                  aria-label="Manage Raffle"
                >
                  Manage Raffle
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="bg-gray-600 text-white px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-gray-700 transition-colors min-h-[44px]"
                aria-label="Go back to admin dashboard"
              >
                Go back to admin dashboard
              </motion.button>
            </div>
          )}
          <div className="mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-2xl font-poppins font-semibold text-[#4D96FF] mb-3 sm:mb-4">Participants</h2>
            <AnimatePresence>
              {uniqueParticipants.length > 0 ? (
                <ul className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                  {uniqueParticipants.map((p) => (
                    <motion.li
                      key={`${p.email}:${p.contact}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold mr-3">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-gray-800 dark:text-gray-200 text-base sm:text-lg">{p.displayName}</span>
                        <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 block">
                          Tickets: {p.ticketCount}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No participants yet. Be the first!</p>
              )}
            </AnimatePresence>
          </div>
          {!isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="mt-4 sm:mt-6 bg-[#FFD93D] text-black px-4 py-3 sm:py-4 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px]"
              aria-label="Check new raffles"
            >
              Check new raffles
            </motion.button>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showWinnerModal && (raffle.winner || new Date(raffle.endTime) <= new Date()) && (
          <Winner raffle={raffle} onClose={() => setShowWinnerModal(false)} isAdmin={isAdmin} />
        )}
      </AnimatePresence>
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default RaffleDetails;