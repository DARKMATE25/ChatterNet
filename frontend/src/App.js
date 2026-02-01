import './App.css'
import { Route, Routes, Router } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import Home from './GuestModeComp/Home';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
function App() {
  return (
    <div className="Light">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/guest" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
