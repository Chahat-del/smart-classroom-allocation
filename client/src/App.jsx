
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSchedule from './pages/StudentSchedule';
import StudentBookingRequest from './pages/StudentBookingRequest';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
          <Route path="/schedule" element={<StudentSchedule />} />
          <Route path="/booking-request" element={<StudentBookingRequest />} />
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </BrowserRouter>
  );
}