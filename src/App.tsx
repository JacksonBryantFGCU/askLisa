import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Questions from './pages/Questions';
import Ask from './pages/Ask';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes — no site header/footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Public routes — with site header/footer */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/ask" element={<Ask />} />
              </Routes>
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
