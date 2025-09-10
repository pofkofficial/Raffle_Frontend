import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RaffleDetails from './pages/RaffleDetails';
import TicketDownload from './pages/TicketDownload';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AdminLogin from './pages/AdminLogin';
import CreateRaffle from './pages/CreateRaffle';
import Home from './pages/LandingPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/raffle/:id" element={<RaffleDetails />} />
        <Route path="/ticket/:id" element={<TicketDownload />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/create" element={<CreateRaffle />} />
        <Route path="/admin/:id" element={<AdminDashboard />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
};

export default App;