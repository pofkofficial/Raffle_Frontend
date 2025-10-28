import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CountdownTimer from '../components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import ConfettiBurst from '../components/ConfettiBurst';
import Winner from '../components/Winner';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';

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
  const [newEndTime, setNewEndTime] = useState('');
  const [overview, setOverview] = useState({
    liveRafflesCount: 0,
    totalTicketsSold: 0,
    earningsByMonth: {},
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [sortOption, setSortOption] = useState('name-asc');
  const [deleting, setDeleting] = useState(false); // NEW: loading state for delete
  const BACKEND = process.env.REACT_APP_BACKEND_LINK;

  // Load raffles on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (id && id !== 'undefined') {
      // Load single raffle
      axios
        .get(`${BACKEND}/api/raffles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
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
      // Load all raffles for dashboard
      axios
        .get(`${BACKEND}/api/raffles`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const now = new Date();
          const live = res.data.filter((r) => !r.winner && new Date(r.endTime) > now);
          const ended = res.data.filter((r) => r.winner || new Date(r.endTime) <= now);
          setLiveRaffles(live);
          setEndedRaffles(ended);

          const allRaffles = [...live, ...ended];
          const totalTicketsSold = allRaffles.reduce(
            (sum, r) =>
              sum +
              (r.participants?.reduce((acc, p) => acc + p.ticketNumbers.length, 0) || 0),
            0
          );
          const earningsByMonth = allRaffles.reduce((acc, r) => {
            const createdAt = new Date(r.createdAt);
            const monthYear = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1)
              .toString()
              .padStart(2, '0')}`;
            const earnings =
              (r.participants?.reduce((acc, p) => acc + p.ticketNumbers.length, 0) || 0) *
              r.ticketPrice;
            acc[monthYear] = (acc[monthYear] || 0) + earnings;
            return acc;
          }, {});
          setOverview({
            liveRafflesCount: live.length,
            totalTicketsSold,
            earningsByMonth,
          });
        })
        .catch((err) => {
          setError(`Failed to load raffles: ${err.response?.data?.error || err.message}`);
        });
    }
  }, [id, secret, navigate, BACKEND]);

  // End raffle with animation
  const handleEndRaffle = async () => {
    if (isSelecting) return;
    setIsSelecting(true);
    setError('');

    const participants = raffle?.participants || [];
    const ticketEntries = participants.flatMap((p) =>
      p.ticketNumbers.map((ticket) => ({ ticket, displayName: p.displayName }))
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
        const response = await axios.post(
          `${BACKEND}/api/raffles/end/${id}/${secret}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setShowConfetti(true);
        setShowWinnerModal(true);
        setRaffle(response.data);
        setTimeout(() => setShowConfetti(false), 3000);
      } catch (err) {
        setError(`Failed to end raffle: ${err.response?.data?.error || err.message}`);
      } finally {
        setIsSelecting(false);
      }
    }, maxCycles * 300);
  };

  // DELETE RAFFLE - FIXED
  const handleDeleteRaffle = async () => {
    if (!window.confirm(`Are you sure you want to delete the raffle "${raffle.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Admin login required');
        setDeleting(false);
        return;
      }

      // DELETE request
      await axios.delete(`${BACKEND}/api/raffles/${id}/${secret}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 12000,
      });

      // Refresh lists
      const res = await axios.get(`${BACKEND}/api/raffles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const now = new Date();
      setLiveRaffles(res.data.filter((r) => !r.winner && new Date(r.endTime) > now));
      setEndedRaffles(res.data.filter((r) => r.winner || new Date(r.endTime) <= now));

      alert(`Raffle "${raffle.title}" deleted successfully!`);
      navigate('/admin');
    } catch (err) {
      console.error('Delete raffle error:', err);
      setError(`Failed to delete raffle: ${err.response?.data?.error || err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Reset end time
  const handleResetEndTime = async () => {
    if (!newEndTime) {
      setError('Please select a new end time');
      return;
    }
    const newDate = new Date(newEndTime);
    if (isNaN(newDate.getTime()) || newDate <= new Date()) {
      setError('New end time must be a valid date in the future');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${BACKEND}/api/raffles/${id}/${secret}`,
        { endTime: newDate.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRaffle(response.data);
      setNewEndTime('');
      setError('');
    } catch (err) {
      setError(`Failed to reset end time: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleExportContacts = () => {
    if (!raffle?.participants || raffle.participants.length === 0) {
      setError('No participants to export');
      return;
    }

    const csvHeader = 'Name,Phone,Email\n';
    const csvRows = raffle.participants
      .map((p) =>
        `"${p.displayName.replace(/"/g, '""')}","${p.contact.replace(/"/g, '""')}","${p.email.replace(
          /"/g,
          '""'
        )}"`
      )
      .join('\n');
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `raffle-${raffle._id}-contacts.csv`);
  };

  const filteredAndSortedParticipants = useMemo(() => {
    let result = raffle?.participants ? [...raffle.participants] : [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(query) ||
          p.contact.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query)
      );
    }

    if (ticketFilter !== 'all') {
      result = result.filter((p) => {
        const count = p.ticketNumbers.length;
        if (ticketFilter === '1') return count === 1;
        if (ticketFilter === '2-5') return count >= 2 && count <= 5;
        if (ticketFilter === '6+') return count > 5;
        return true;
      });
    }

    result.sort((a, b) => {
      if (sortOption === 'name-asc') return a.displayName.localeCompare(b.displayName);
      if (sortOption === 'name-desc') return b.displayName.localeCompare(a.displayName);
      if (sortOption === 'tickets-asc') return a.ticketNumbers.length - b.ticketNumbers.length;
      if (sortOption === 'tickets-desc') return b.ticketNumbers.length - a.ticketNumbers.length;
      return 0;
    });

    return result;
  }, [raffle, searchQuery, ticketFilter, sortOption]);

  // Early returns
  if (error && !raffle && !liveRaffles.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-red-600 text-center p-6 bg-red-50 rounded-xl max-w-md">
          <p className="text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (id && id !== 'undefined' && !raffle) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#4D96FF] border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading raffle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#4D96FF] p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Link to="/admin" className="flex items-center justify-center sm:justify-start gap-2">
            <img
              src="/logo.png"
              alt="Try Ur Luck Logo"
              className="h-12 sm:h-16 w-auto"
              onError={(e) => (e.target.src = '/fallback-logo.png')}
            />
            <h1 className="text-lg sm:text-2xl font-poppins font-bold text-white">Admin Dashboard</h1>
          </Link>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/create')}
              className="bg-[#FFD93D] text-black px-3 py-2 sm:p-2 rounded-lg font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px]"
            >
              Create New Raffle
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="bg-[#FF6B6B] text-white px-3 py-2 sm:p-2 rounded-lg font-semibold hover:bg-[#E55A5A] transition-colors min-h-[44px]"
            >
              Sign Out
            </motion.button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Single Raffle View */}
          {id && id !== 'undefined' && raffle ? (
            <>
              <h2 className="text-xl sm:text-2xl font-poppins font-bold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
                Manage Raffle: {raffle.title}
              </h2>

              {/* Raffle Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
                  <span className="font-semibold">Prize:</span>{' '}
                  {raffle.prizeTypes.includes('cash') && `GHS ${raffle.cashPrize || 'N/A'}`}
                  {raffle.prizeTypes.includes('cash') && raffle.prizeTypes.includes('item') && ' + '}
                  {raffle.prizeTypes.includes('item') && (raffle.itemName || 'N/A')}
                </p>
                <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
                  <span className="font-semibold">Ticket Price:</span> GHS {raffle.ticketPrice}
                </p>
                <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
                  <span className="font-semibold">Ends:</span>{' '}
                  <CountdownTimer endTime={raffle.endTime} />
                </p>
                <p className="text-gray-700 dark:text-gray-200 text-base sm:text-lg">
                  <span className="font-semibold">Participants:</span>{' '}
                  <motion.span
                    key={raffle.participants?.length || 0}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-[#6BCB77] font-bold"
                  >
                    {raffle.participants?.length || 0}
                  </motion.span>
                </p>
              </div>

              {/* Reset End Time */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <input
                  type="datetime-local"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full sm:w-1/2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetEndTime}
                  disabled={!newEndTime || raffle.winner || new Date(raffle.endTime) <= new Date()}
                  className={`bg-[#FFD93D] text-black px-4 py-3 rounded-lg w-full sm:w-auto font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px] ${
                    !newEndTime || raffle.winner || new Date(raffle.endTime) <= new Date()
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Reset End Time
                </motion.button>
              </div>

              {/* Winner Selection Animation */}
              <AnimatePresence>
                {isSelecting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 sm:p-6 bg-gray-800 text-white rounded-lg text-center"
                  >
                    <h2 className="text-lg sm:text-2xl font-poppins font-semibold mb-4">
                      Selecting Winner...
                    </h2>
                    <motion.p
                      key={currentParticipant}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xl sm:text-3xl font-bold text-[#FFD93D]"
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

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-4">
                {!raffle.winner && new Date(raffle.endTime) > new Date() && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEndRaffle}
                    disabled={isSelecting}
                    className={`bg-[#FFD93D] text-black px-4 py-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px] ${
                      isSelecting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    End Raffle & Pick Winner
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportContacts}
                  disabled={!raffle?.participants || raffle.participants.length === 0}
                  className={`bg-[#FFD93D] text-black px-4 py-3 rounded-lg w-full font-semibold hover:bg-[#FFCA28] transition-colors min-h-[44px] ${
                    !raffle?.participants || raffle.participants.length === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  Export Contacts
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteRaffle}
                  disabled={deleting}
                  className={`bg-red-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-red-700 transition-colors min-h-[44px] ${
                    deleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete Raffle'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/admin')}
                  className="bg-gray-600 text-white px-4 py-3 rounded-lg w-full font-semibold hover:bg-gray-700 transition-colors min-h-[44px]"
                >
                  Go back to admin dashboard
                </motion.button>
              </div>

              {/* Participants List */}
              <div className="mt-8">
                <h2 className="text-lg sm:text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">
                  Participants
                </h2>
                <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 w-full sm:w-1/3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
                  />
                  <div className="flex gap-4 w-full sm:w-auto">
                    <select
                      value={ticketFilter}
                      onChange={(e) => setTicketFilter(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
                    >
                      <option value="all">All Tickets</option>
                      <option value="1">1 Ticket</option>
                      <option value="2-5">2-5 Tickets</option>
                      <option value="6+">6+ Tickets</option>
                    </select>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 px-3 py-3 sm:py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4D96FF] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm sm:text-base min-h-[44px]"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="tickets-asc">Tickets (Low to High)</option>
                      <option value="tickets-desc">Tickets (High to Low)</option>
                    </select>
                  </div>
                </div>
                <AnimatePresence>
                  {filteredAndSortedParticipants.length > 0 ? (
                    <ul className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
                      {filteredAndSortedParticipants.map((p, index) => (
                        <motion.li
                          key={`${p.email}:${p.contact}:${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-bold mr-3">
                            {p.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-800 dark:text-gray-200 text-base sm:text-lg">
                              {p.displayName}
                            </span>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                              Tickets: {p.ticketNumbers.length} ({p.ticketNumbers.join(', ')})
                            </p>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                              Phone: {p.contact}
                            </p>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                              Email: {p.email}
                            </p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                      No participants match your criteria.
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Dashboard Overview */
            <>
              <h1 className="text-xl sm:text-3xl font-poppins font-bold text-[#FF6B6B] mb-4 sm:mb-6 text-center">
                Admin Dashboard
              </h1>
              <div className="mb-8">
                <h2 className="text-lg sm:text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">
                  Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-base sm:text-lg">
                      Live Raffles
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#6BCB77]">
                      {overview.liveRafflesCount}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-base sm:text-lg">
                      Total Tickets Sold
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#6BCB77]">
                      {overview.totalTicketsSold}
                    </p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                    <p className="text-gray-700 dark:text-gray-200 font-semibold text-base sm:text-lg">
                      Earnings This Month
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-[#6BCB77]">
                      GHS{' '}
                      {overview.earningsByMonth[
                        `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
                          .toString()
                          .padStart(2, '0')}`
                      ] || 0}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-base sm:text-xl font-poppins font-semibold text-[#4D96FF] mb-2">
                    Earnings by Month
                  </h3>
                  {Object.keys(overview.earningsByMonth).length > 0 ? (
                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {Object.entries(overview.earningsByMonth)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([monthYear, earnings]) => (
                          <li
                            key={monthYear}
                            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 text-base sm:text-lg"
                          >
                            {monthYear}: GHS {earnings}
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                      No earnings data available.
                    </p>
                  )}
                </div>
              </div>

              {/* Live Raffles */}
              <div className="mt-8">
                <h2 className="text-lg sm:text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">
                  Live Raffles
                </h2>
                {liveRaffles.length > 0 ? (
                  <ul className="space-y-3">
                    {liveRaffles.map((r) => (
                      <motion.li
                        key={r._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <button
                          onClick={() => navigate(`/admin/${r._id}?secret=${r.creatorSecret}`)}
                          className="w-full text-left"
                        >
                          <span className="text-gray-800 dark:text-gray-200 font-semibold text-base sm:text-lg">
                            {r.title}
                          </span>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Participants: {r.participants.length} | Ends:{' '}
                            {new Date(r.endTime).toLocaleString()}
                          </p>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg text-center">
                    No live raffles. Create one to get started!
                  </p>
                )}
              </div>

              {/* Ended Raffles */}
              <div className="mt-8">
                <h2 className="text-lg sm:text-2xl font-poppins font-semibold text-[#4D96FF] mb-4">
                  Ended Raffles
                </h2>
                {endedRaffles.length > 0 ? (
                  <ul className="space-y-3">
                    {endedRaffles.map((r) => (
                      <motion.li
                        key={r._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.7, x: 0 }}
                        className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-70"
                      >
                        <button
                          onClick={() => navigate(`/admin/${r._id}?secret=${r.creatorSecret}`)}
                          className="w-full text-left"
                        >
                          <span className="text-gray-800 dark:text-gray-200 font-semibold text-base sm:text-lg">
                            {r.title}
                          </span>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                            Participants: {r.participants.length} | Ended:{' '}
                            {new Date(r.endTime).toLocaleString()}
                            {r.winner && (
                              <>
                                {' '}
                                | Winner:{' '}
                                {r.participants.find((p) => p.ticketNumbers.includes(r.winner))
                                  ?.displayName || 'Unknown'}{' '}
                                | Ticket: {r.winner}
                              </>
                            )}
                          </p>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg text-center">
                    No ended raffles.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && (raffle?.winner || new Date(raffle?.endTime) <= new Date()) && (
          <Winner raffle={raffle} onClose={() => setShowWinnerModal(false)} isAdmin={true} />
        )}
      </AnimatePresence>

      {/* Confetti */}
      <ConfettiBurst trigger={showConfetti} />
    </div>
  );
};

export default AdminDashboard;