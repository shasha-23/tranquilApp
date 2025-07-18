import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Info from './pages/Info';
import MentalHealth from './pages/MentalHealth';
import PhysicalHealth from './pages/PhysicalHealth';
import MoodMap from './pages/MoodMap';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<Info />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/physical-health" element={<PhysicalHealth />} />
          <Route path="/mood-map" element={<MoodMap />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;