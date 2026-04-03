import React, { useState } from 'react';

const mockData = {
  student: { 
    name: 'Rahul Sharma', 
    batch: 'CSE-B', 
    semester: '4th Sem', 
    rollNo: '21CS045',
    usn: '1AM21CS045',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Rahul%20Sharma&backgroundColor=065f46&fontFamily=Arial'
  },
  todayClasses: [
    { id: 1, subject: 'Data Structures', room: 'A-101', teacher: 'Dr. Mehta', time: '9:00 - 10:00 AM', status: 'ongoing' },
    { id: 2, subject: 'DBMS', room: 'B-203', teacher: 'Prof. Sharma', time: '10:00 - 11:00 AM', status: 'upcoming' },
    { id: 3, subject: 'OS Lab', room: 'Lab-3', teacher: 'Dr. Iyer', time: '2:00 - 4:00 PM', status: 'upcoming' },
    { id: 4, subject: 'Mathematics', room: 'C-105', teacher: 'Prof. Nair', time: '11:00 - 12:00 PM', status: 'upcoming' },
  ],
  stats: [
    { label: 'Classes Today', value: '4', color: 'bg-blue-100 text-blue-700' },
    { label: 'Rooms Allocated', value: '3', color: 'bg-green-100 text-green-700' },
    { label: 'Pending Requests', value: '1', color: 'bg-yellow-100 text-yellow-700' },
  ]
};

const statusStyle = {
  ongoing: 'bg-green-100 text-green-700 border border-green-200',
  upcoming: 'bg-blue-50 text-blue-600 border border-blue-100',
  completed: 'bg-gray-100 text-gray-500 border border-gray-200',
};

const StudentDashboard = () => {
  const { student, todayClasses, stats } = mockData;
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 mb-8 text-white shadow">
        <div className="flex items-center gap-5">
          
          {/* Profile picture */}
          <div className="w-20 h-20 rounded-full border-4 border-white border-opacity-40 overflow-hidden flex-shrink-0 shadow-lg">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div class="w-full h-full bg-green-800 flex items-center justify-center text-white text-2xl font-bold">${student.name.charAt(0)}</div>`;
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <p className="text-green-100 text-sm mb-0.5">Welcome back 👋</p>
            <h1 className="text-2xl font-bold">{student.name}</h1>
            
            {/* USN badge */}
            <div className="inline-flex items-center gap-1.5 bg-white bg-opacity-20 px-3 py-1 rounded-full mt-1.5">
              <span className="text-green-100 text-xs">USN</span>
              <span className="text-white font-semibold text-sm tracking-wide">{student.usn}</span>
            </div>

            {/* Other details */}
            <div className="flex flex-wrap gap-3 text-sm text-green-100 mt-2">
              <span>🎓 {student.batch}</span>
              <span>📅 {student.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - only 3 now */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block mb-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Today's Classes</h2>
          <span className="text-xs text-gray-400">{new Date().toDateString()}</span>
        </div>

        <div className="space-y-3">
          {todayClasses.map(cls => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(selectedClass?.id === cls.id ? null : cls)}
              className="border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{cls.subject}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{cls.teacher}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle[cls.status]}`}>
                  {cls.status}
                </span>
              </div>

              {/* Expanded detail on click */}
              {selectedClass?.id === cls.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Room</p>
                    <p className="font-semibold text-gray-800">{cls.room}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Time</p>
                    <p className="font-semibold text-gray-800">{cls.time}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;