import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage             from "./pages/LoginPage";
import TeacherDashboard      from "./pages/Teacherdashboard";
import TeacherBookings       from "./pages/TeacherBookings";
import TeacherRooms          from "./pages/TeacherRooms";
import TeacherAnalytics      from "./pages/TeacherAnalytics";
import StudentDashboard      from "./pages/StudentDashboard";
import StudentSchedule       from "./pages/StudentSchedule";
import StudentBookingRequest from "./pages/StudentBookingRequest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                      element={<LoginPage />} />
        <Route path="/teacher/dashboard"     element={<TeacherDashboard />} />
        <Route path="/teacher/bookings"      element={<TeacherBookings />} />
        <Route path="/teacher/rooms"         element={<TeacherRooms />} />
        <Route path="/teacher/analytics"     element={<TeacherAnalytics />} />
        <Route path="/student"               element={<StudentDashboard />} />
        <Route path="/schedule"              element={<StudentSchedule />} />
        <Route path="/booking-request"       element={<StudentBookingRequest />} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}