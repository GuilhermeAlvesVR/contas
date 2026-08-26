import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRoom } from './services/api';
import AccessScreen from './pages/AccessScreen';
import BillsScreen from './pages/BillsScreen';

function AppRoutes({ room, user, onEnter, onExit }) {
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room');

  return (
    <Routes>
      <Route
        path="/"
        element={
          room ? (
            <Navigate to={`/room/${room.shareCode}`} />
          ) : (
            <AccessScreen onEnter={onEnter} initialShareCode={roomParam} />
          )
        }
      />
      <Route
        path="/room/:shareCode"
        element={
          room ? (
            <BillsScreen room={room} user={user} onExit={onExit} />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

function App() {
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(() => localStorage.getItem('userName') || '');

  useEffect(() => {
    const savedRoom = localStorage.getItem('room');
    if (savedRoom) setRoom(JSON.parse(savedRoom));
  }, []);

  const handleEnterRoom = (roomData, userName) => {
    setRoom(roomData);
    setUser(userName);
    localStorage.setItem('room', JSON.stringify(roomData));
    localStorage.setItem('userName', userName);
  };

  const handleExit = () => {
    setRoom(null);
    localStorage.removeItem('room');
    localStorage.removeItem('userName');
  };

  return (
    <BrowserRouter>
      <AppRoutes room={room} user={user} onEnter={handleEnterRoom} onExit={handleExit} />
    </BrowserRouter>
  );
}

export default App;
