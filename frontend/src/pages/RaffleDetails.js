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
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const isAdmin = !!localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchRaffle = async () => {
      if (!id || id === 'undefined') {
        setError('Invalid raffle ID');
        return;
      }
      try {
        console.log(`Fetching raffle with ID: ${id}`);
        const response = await axios.get(`https://raffle-backend-rho.vercel.app/api/raffles/${id}`);
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
  }, [id]);

  const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_9dd674c3ff8c8ed03348c35c8eb0da14b068fd4d';
  const componentProps = {
    email,
    amount: raffle?.ticketPrice * 100,
    currency: 'GHS',
    metadata: { name, contact, raffleId: id, referrer: window.location.href },
    publicKey,
    text: 'Join Now',
    onSuccess: (response) => {
      console.log('Paystack success:', response);
      setShowConfetti(true);
      axios
        .post('https://raffle-backend-rho.vercel.app/api/raffles/verify-payment', {
          reference: response.reference,
          raffleId: id,
          name,
          contact,
        }, { responseType: 'blob' })
        .then((res) => {
          console.log('Verify Response Headers:', res.headers);
          const ticketNumber = res.headers['x-ticket-number'] || res.headers['X-Ticket-Number'];
          console.log('Ticket Number:', ticketNumber);
          if (!ticketNumber) {
            throw new Error('Ticket number not received from server');
          }
          const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'raffle-ticket.pdf');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          navigate(`/ticket/${id}?ticketNumber=${encodeURIComponent(ticketNumber)}`);
          setTimeout(() => setShowConfetti(false), 3000);
        })
        .catch((err) => setError(`Payment verification failed: ${err.response?.data?.error || err.message}`));
    },
    onClose: () => setError('Payment cancelled'),
  };

  const handleFreeJoin = async () => {
    if (!name || !contact || !email) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await axios.post('https://raffle-backend-rho.vercel.app/api/raffles/init-payment', { raffleId: id, displayName: name, contact, email }, { responseType: 'blob' });
      console.log('Free Join Response Headers:', res.headers);
      const ticketNumber = res.headers['x-ticket-number'] || res.headers['X-Ticket-Number'];
      console.log('Ticket Number:', ticketNumber);
      if (!ticketNumber) {
        throw new Error('Ticket number not received from server');
      }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'raffle-ticket.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setShowConfetti(true);
      navigate(`/ticket/${id}?ticketNumber=${encodeURIComponent(ticketNumber)}`);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(`Failed to join: ${err.response?.data?.error || err.message}`);
    }
  };

  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!raffle) return <div className="text-white text-center p-8">Loading...</div>;

  const isRaffleActive = !raffle.winner && new Date(raffle.endTime) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#4D96FF] p-4 flex justify-center items-center">
          <img
            src="/logo-placeholder.png"
            alt="Raffle Hub Logo"
            className="h-16 w-auto"
            onError={(e) => (e.target.src = '/fallback-logo.png')}
          />
        </div>
        <div className="p-6">
          {raffle.prizeImage && (
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              src={raffle.prizeImage}
              alt="Prize"
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <h1 className="text-4xl font-poppins font-bold text-[#FF6B6B] mb-4 text-center">
            {raffle.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-200 text-lg mb-4">{raffle.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Cash Prize:</span> GHS {raffle.cashPrize}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Ticket Price:</span> GHS {raffle.ticketPrice}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Ends:</span> {new Date(raffle.endTime).toLocaleString()}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              <span className="font-semibold">Participants:</span>{' '}
              <motion.span
                key={raffle.participants.length}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[#6BCB77] font-bold"
              >
                {raffle.participants.length}
              </motion.span>
            </p>
          </div>
          <CountdownTimer endTime={raffle.endTime} />
          {!isAdmin && isRaffleActive && (
            <div className="mt-6">
              <input
                placeholder="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                placeholder="Contact Number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              {raffle.ticketPrice > 0 ? (
                <PaystackButton
                  {...componentProps}
                  className="bg-[#4D96FF] text-white p-4 rounded-lg w-full font-semibold hover:bg-[#3D86E6] transition-colors"
                />
              ) : (
                <button
                  onClick={handleFreeJoin}
                  className="bg-[#6BCB77] text-white p-4 rounded-lg w-full font-semibold hover:bg-[#5BB966] transition-colors"
                >
                  Join Free
                </button>
              )}
            </div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-600 text-white rounded-lg text-center"
            >
              {error}
            </motion.div>
          )}
          {isAdmin && (
            <div className="mt-6">
              {isRaffleActive && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/${raffle._id}?secret=${raffle.creatorSecret}`)}
                  className="bg-[#FFD93D] text-black p-4 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors"
                >
                  Manage Raffle
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin')}
                className="bg-gray-600 text-white p-4 rounded-lg w-full font-semibold hover:bg-gray-700 transition-colors mt-4"
              >
                Go back to admin dashboard
              </motion.button>
            </div>
          )}
          <div className="mt-8">
            <h2 className="text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">Participants</h2>
            <AnimatePresence>
              {raffle.participants.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {raffle.participants.map((p) => (
                    <motion.li
                      key={p.ticketNumber}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold mr-3">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">{p.displayName}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No participants yet. Be the first!</p>
              )}
            </AnimatePresence>
          </div>
          {!isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="mt-6 bg-[#FFD93D] text-black p-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors"
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