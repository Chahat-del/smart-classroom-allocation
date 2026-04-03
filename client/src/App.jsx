import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TeacherDashboard from "./pages/Teacherdashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSchedule from './pages/StudentSchedule';
import StudentBookingRequest from './pages/StudentBookingRequest';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Teacher page - no Navbar */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        
        {/* Student pages - with Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/schedule" element={<StudentSchedule />} />
              <Route path="/booking-request" element={<StudentBookingRequest />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}