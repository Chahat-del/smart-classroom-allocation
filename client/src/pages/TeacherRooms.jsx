import { useState } from "react";
import { Building2, Users, Search } from "lucide-react";
import TeacherLayout from "../components/TeacherLayout";
import { BRANCH_DATA, COLOR_MAP, TIME_SLOTS, today } from "../data/dsceData";
import { bookingStore } from "./TeacherBookings";

export default function TeacherRoomsPage() {
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [search,         setSearch]         = useState("");
  const [selectedDate,   setSelectedDate]   = useState(today);
  const bookings = bookingStore.get();

  const branchInfo = BRANCH_DATA[selectedBranch];
  const c          = COLOR_MAP[branchInfo.color];

  const getBooking = (roomId, slot) =>
    bookings.find(b => b.roomId===roomId && b.date===selectedDate && b.start<=slot && slot<b.end);

  const filteredRooms = branchInfo.rooms.filter(r =>
    search==="" || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalSeats = branchInfo.rooms.reduce((s,r) => s+r.capacity, 0);
  const bookedNow  = branchInfo.rooms.filter(r =>
    bookings.some(b => b.roomId===r.id && b.date===selectedDate)
  ).length;

  return (
    <TeacherLayout>
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rooms</h1>
            <p className="text-slate-500 text-sm mt-1">Browse classrooms by building and availability</p>
          </div>
          <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm" />
        </div>

        {/* Building tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {Object.entries(BRANCH_DATA).map(([key, val]) => {
            const tc = COLOR_MAP[val.color];
            return (
              <button key={key} onClick={() => setSelectedBranch(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition
                  ${selectedBranch===key ? `${tc.bg} ${tc.text} ${tc.border}` : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                {key}
              </button>
            );
          })}
        </div>

        {/* Building info banner */}
        <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border mb-6 ${c.bg} ${c.border}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.dot}`}>
            <Building2 size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className={`font-bold text-sm ${c.text}`}>{branchInfo.label}</p>
            <p className={`text-xs mt-0.5 opacity-70 ${c.text}`}>{branchInfo.building}</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className={`font-bold text-lg ${c.text}`}>{branchInfo.rooms.length}</p>
              <p className={`text-xs opacity-70 ${c.text}`}>Rooms</p>
            </div>
            <div className="text-center">
              <p className={`font-bold text-lg ${c.text}`}>{totalSeats}</p>
              <p className={`text-xs opacity-70 ${c.text}`}>Total Seats</p>
            </div>
            <div className="text-center">
              <p className={`font-bold text-lg ${c.text}`}>{bookedNow}</p>
              <p className={`text-xs opacity-70 ${c.text}`}>Booked Today</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
            placeholder="Search rooms…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>

        {/* Room cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filteredRooms.map(room => {
            const roomBookings = bookings.filter(b => b.roomId===room.id && b.date===selectedDate);
            const isOccupied   = roomBookings.length > 0;
            const utilPct      = Math.round((roomBookings.length / 9) * 100);
            return (
              <div key={room.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition hover:shadow-md
                  ${isOccupied ? `${c.border}` : "border-slate-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-slate-800">{room.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Floor {room.floor}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-semibold
                    ${isOccupied ? `${c.bg} ${c.text}` : "bg-emerald-50 text-emerald-600"}`}>
                    {isOccupied ? "In Use" : "Free"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Users size={11} /> {room.capacity} seats
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${c.dot}`} style={{width:`${utilPct}%`}} />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">{utilPct}% utilised today</p>
                {roomBookings.length>0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    {roomBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium truncate">{b.subject}</span>
                        <span className="text-slate-400 flex-shrink-0 ml-2">{b.start}–{b.end}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Availability Grid */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-bold text-slate-800 mb-1">Availability Grid</h2>
          <p className="text-xs text-slate-400 mb-5">{branchInfo.building} · {selectedDate}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-5 text-slate-500 font-semibold w-24 sticky left-0 bg-white">Room</th>
                  {TIME_SLOTS.slice(0,-1).map(slot => (
                    <th key={slot} className="text-center py-2 px-1 text-slate-400 font-medium min-w-[68px]">{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => (
                  <tr key={room.id} className="border-t border-slate-50">
                    <td className="py-2 pr-3 sticky left-0 bg-white">
                      <p className="font-bold text-slate-700">{room.name}</p>
                      <p className="text-slate-400">{room.capacity}🪑</p>
                    </td>
                    {TIME_SLOTS.slice(0,-1).map(slot => {
                      const booking = getBooking(room.id, slot);
                      const [h, m]  = slot.split(":").map(Number);
                      const now     = new Date();
                      const isPast  = selectedDate === today &&
                        (h < now.getHours() || (h === now.getHours() && m < now.getMinutes()));
                      return (
                        <td key={slot} className="px-0.5 py-1">
                          {booking ? (
                            <div className={`rounded-lg px-1 py-2 text-center ${c.bg} ${c.text}`}>
                              <p className="font-semibold truncate max-w-[60px] mx-auto leading-tight text-[10px]">
                                {booking.subject}
                              </p>
                              <p className="opacity-60 text-[10px]">{booking.batch}</p>
                              {booking.teacherName && (
                                <p className="opacity-80 text-[10px] font-bold mt-0.5">
                                  {booking.teacherName.split(" ").map(w => w[0]).join("").toUpperCase()}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className={`rounded-lg border text-center py-2
                              ${isPast ? "bg-slate-100 border-slate-200" : "bg-slate-50 border-slate-100"}`}>
                              <span className={`font-medium ${isPast ? "text-slate-300" : "text-slate-300"}`}>
                                {isPast ? "✕" : "—"}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"/><span className="text-xs text-slate-400">Available</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300"/><span className="text-xs text-slate-400">Past</span></div>
            <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-sm ${c.bg} border ${c.border}`}/><span className="text-xs text-slate-400">Booked</span></div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}