import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from '../components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiBurst from '../components/ConfettiBurst';
import Winner from '../components/Winner';

const AdminDashboard = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const secret = new URLSearchParams(location.search).get('secret');
  const [raffle, setRaffle] = useState(null);
  const [liveRaffles, setLiveRaffles] = useState([]);
  const [endedRaffles, setEndedRaffles] = useState([]);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState('');
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }

    if (id && id !== 'undefined') {
      axios
        .get(`https://raffle-backend-rho.vercel.app/api/raffles/${id}`)
        .then((res) => {
          if (res.data.creatorSecret !== secret) {
            setError('Invalid secret for this raffle');
          } else {
            setRaffle(res.data);
            if (res.data.winner || new Date(res.data.endTime) <= new Date()) {
              setShowWinnerModal(true);
            }
          }
        })
        .catch((err) => {
          setError(`Failed to load raffle: ${err.response?.data?.error || err.message}`);
        });
    } else {
      axios
        .get('https://raffle-backend-rho.vercel.app/api/raffles')
        .then((res) => {
          const now = new Date();
          const live = res.data.filter(
            (r) => !r.winner && new Date(r.endTime) > now
          );
          const ended = res.data.filter(
            (r) => r.winner || new Date(r.endTime) <= now
          );
          setLiveRaffles(live);
          setEndedRaffles(ended);
        })
        .catch((err) => {
          setError(`Failed to load raffles: ${err.response?.data?.error || err.message}`);
        });
    }
  }, [id, secret, navigate]);

  const handleEndRaffle = async () => {
    if (isSelecting) return;
    setIsSelecting(true);
    setError(null);

    const participants = raffle?.participants || [];
    // Flatten all ticket numbers with their corresponding displayNames
    const ticketEntries = participants.flatMap(p => 
      p.ticketNumbers.map(ticket => ({ ticket, displayName: p.displayName }))
    );

    if (ticketEntries.length === 0) {
      setError('No tickets in this raffle');
      setIsSelecting(false);
      return;
    }

    let cycleCount = 0;
    const maxCycles = 12;
    const cycleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * ticketEntries.length);
      setCurrentParticipant(ticketEntries[randomIndex].displayName || 'Selecting...');
      cycleCount++;
      if (cycleCount >= maxCycles) {
        clearInterval(cycleInterval);
      }
    }, 300);

    setTimeout(async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setError('Admin login required');
          setIsSelecting(false);
          return;
        }
        const response = await axios.post(
          `https://raffle-backend-rho.vercel.app/api/raffles/end/${id}/${secret}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowConfetti(true);
        setShowWinnerModal(true);
        setRaffle(response.data); // Use POST response to update raffle state
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
        setIsSelecting(false);
      } catch (err) {
        console.error('End raffle error:', err);
        setError(`Failed to end raffle: ${err.response?.data?.error || err.message}`);
        setIsSelecting(false);
      }
    }, maxCycles * 300);
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (id && id !== 'undefined' && !raffle) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6BCB77] to-[#4D96FF] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="bg-[#4D96FF] p-4 flex justify-between items-center">
          <h1 className="text-2xl font-poppins font-bold text-white">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/create')}
              className="bg-[#FFD93D] text-black p-2 rounded-lg font-semibold hover:bg-[#FFCA28] transition-colors"
            >
              Create New Raffle
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="bg-[#FF6B6B] text-white p-2 rounded-lg font-semibold hover:bg-[#E55A5A] transition-colors"
            >
              Sign Out
            </motion.button>
          </div>
        </div>
        <div className="p-6">
          {id && id !== 'undefined' && raffle ? (
            <>
              <h2 className="text-3xl font-poppins font-bold text-[#FF6B6B] mb-6 text-center">
                Manage Raffle: {raffle.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <p className="text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">Cash Prize:</span> GHS {raffle.cashPrize || 'N/A'}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">Ticket Price:</span> GHS {raffle.ticketPrice}
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">Ends:</span> <CountdownTimer endTime={raffle.endTime} />
                </p>
                <p className="text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">Participants:</span>{' '}
                  <motion.span
                    key={raffle.participants?.length || 0}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-[#6BCB77] font-bold"
                  >
                    {raffle.participants?.length || 0}
                  </motion.span>
                </p>
              </div>
              <AnimatePresence>
                {isSelecting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-6 bg-gray-800 text-white rounded-lg text-center"
                  >
                    <h2 className="text-2xl font-poppins font-semibold mb-4">Selecting Winner...</h2>
                    <motion.p
                      key={currentParticipant}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-bold text-[#FFD93D]"
                    >
                      {currentParticipant}
                    </motion.p>
                  </motion.div>
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
              </AnimatePresence>
              <div className="mt-6">
                {!raffle.winner && new Date(raffle.endTime) > new Date() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndRaffle}
                    disabled={isSelecting}
                    className={`bg-[#FFD93D] text-black p-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors ${
                      isSelecting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    End Raffle & Pick Winner
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="bg-gray-600 text-white p-3 rounded-lg w-full font-semibold hover:bg-gray-700 transition-colors mt-4"
                >
                  Go back to admin dashboard
                </motion.button>
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">Participants</h2>
                <AnimatePresence>
                  {raffle.participants?.length > 0 ? (
                    <ul className="space-y-3 max-h-64 overflow-y-auto">
                      {raffle.participants.map((p, index) => (
                        <motion.li
                          key={`${p.email}:${p.contact}:${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold mr-3">
                            {p.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-800 dark:text-gray-200">{p.displayName}</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Tickets: {p.ticketNumbers.length} ({p.ticketNumbers.join(', ')})
                            </p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No participants yet.</p>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-poppins font-bold text-[#FF6B6B] mb-6 text-center">
                Admin Dashboard
              </h1>
              <div className="mt-8">
                <h2 className="text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">Live Raffles</h2>
                {liveRaffles.length > 0 ? (
                  <ul className="space-y-3">
                    {liveRaffles.map((r) => (
                      <motion.li
                        key={r._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <button
                          onClick={() => navigate(`/admin/${r._id}?secret=${r.creatorSecret}`)}
                          className="w-full text-left"
                        >
                          <span className="text-gray-800 dark:text-gray-200 font-semibold">{r.title}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Participants: {r.participants.length} | Ends: {new Date(r.endTime).toLocaleString()}
                          </p>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No live raffles. Create one to get started!
                  </p>
                )}
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">Ended Raffles</h2>
                {endedRaffles.length > 0 ? (
                  <ul className="space-y-3">
                    {endedRaffles.map((r) => (
                      <motion.li
                        key={r._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.7, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-70"
                      >
                        <button
                          onClick={() => navigate(`/admin/${r._id}?secret=${r.creatorSecret}`)}
                          className="w-full text-left"
                        >
                          <span className="text-gray-800 dark:text-gray-200 font-semibold">{r.title}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Participants: {r.participants.length} | Ended: {new Date(r.endTime).toLocaleString()}
                            {r.winner && (
                              <>
                                <span> | Winner: {r.participants.find((p) => p.ticketNumbers.includes(r.winner))?.displayName || 'Unknown'}</span>
                                <span> | Ticket: {r.winner}</span>
                              </>
                            )}
                          </p>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No ended raffles.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showWinnerModal && (raffle?.winner || new Date(raffle?.endTime) <= new Date()) && (
          <Winner raffle={raffle} onClose={() => setShowWinnerModal(false)} isAdmin={true} />
        )}
      </AnimatePresence>
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default AdminDashboard;