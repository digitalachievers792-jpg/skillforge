import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/layout/ScrollToTop';
import PageTransition from './components/layout/PageTransition';
import { RequireAuth, RequireRole, PublicOnly } from './components/layout/RouteGuards';
import ChatWidget from './components/chat/ChatWidget';

import Landing from './pages/Landing';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LessonPlayer from './pages/LessonPlayer';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import NewPost from './pages/NewPost';
import SearchResults from './pages/SearchResults';
import Certificates from './pages/Certificates';
import PublicProfile from './pages/PublicProfile';
import Profile from './pages/Profile';

import AuthLayout from './components/auth/AuthLayout';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/dashboard/InstructorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CourseForm from './pages/dashboard/instructor/CourseForm';

const SessionExpired = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate('/login?session=expired', { replace: true });
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, [navigate]);
  return null;
};

const NotFound = () => (
  <div className="mx-auto max-w-lg px-4 py-24 text-center">
    <div className="font-display text-7xl font-extrabold text-gradient">404</div>
    <h1 className="mt-4 text-2xl font-extrabold text-slate-800">Page not found</h1>
    <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist or was moved.</p>
    <a href="/" className="btn-gradient mt-6 inline-flex items-center gap-1.5 rounded-xl px-6 py-3 text-sm font-bold text-white">
      Back to home
    </a>
  </div>
);

function AppRoutes() {
  const location = useLocation();

  return (
    <>
      <SessionExpired />
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname + location.search}>
            <Routes location={location}>
              <Route path="/" element={<Landing />} />

              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/post/:id" element={<PostDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/users/:id" element={<PublicProfile />} />
              <Route path="/certificates/:code" element={<Certificates />} />

              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
              <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
              <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              <Route path="/forum/new" element={<RequireAuth><NewPost /></RequireAuth>} />
              <Route path="/learn/:courseId" element={<RequireAuth><LessonPlayer /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <RoleDashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/instructor"
                element={
                  <RequireRole roles={['instructor', 'admin']}>
                    <InstructorDashboard />
                  </RequireRole>
                }
              />
              <Route
                path="/dashboard/instructor/courses/new"
                element={
                  <RequireRole roles={['instructor', 'admin']}>
                    <CourseForm />
                  </RequireRole>
                }
              />
              <Route
                path="/dashboard/instructor/courses/:id/edit"
                element={
                  <RequireRole roles={['instructor', 'admin']}>
                    <CourseForm />
                  </RequireRole>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <RequireRole roles={['admin']}>
                    <AdminDashboard />
                  </RequireRole>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

const RoleDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <StudentDashboard />;
};

export default function App() {
  return <AppRoutes />;
}
