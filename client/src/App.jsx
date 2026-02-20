import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { BookTransitionProvider } from './context/BookTransitionContext';
import BookOpenOverlay from './components/BookOpenOverlay';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import BookDetails from './pages/BookDetails';
import GenreBooks from './pages/GenreBooks';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupDashboard from './pages/GroupDashboard';
import ProfilePage from './pages/ProfilePage';
import MyUploadsPage from './pages/MyUploadsPage';
import MyGroups from './pages/MyGroups';

import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <BookTransitionProvider>
        <BookOpenOverlay />
        <Toaster position="top-center" />
        <Layout>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
              <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
              <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />
              <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
              <Route path="/books/:id" element={<PageTransition><BookDetails /></PageTransition>} />
              <Route path="/genres/:genreId" element={<PageTransition><GenreBooks /></PageTransition>} />
              <Route path="/join/:code" element={<PageTransition><JoinGroup /></PageTransition>} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/groups/create" element={<PageTransition><CreateGroup /></PageTransition>} />
                <Route path="/groups/:id" element={<PageTransition><GroupDashboard /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                <Route path="/my-uploads" element={<PageTransition><MyUploadsPage /></PageTransition>} />
                <Route path="/groups" element={<PageTransition><MyGroups /></PageTransition>} />
              </Route>
            </Routes>
          </AnimatePresence>
        </Layout>
      </BookTransitionProvider>
    </AuthProvider>
  );
}

export default App;
