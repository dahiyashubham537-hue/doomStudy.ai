import { useState } from "react";
import LandingPage from "./components/LandingPage";
import DoomScroller from "./components/DoomScroller";
import useCardsStore from "./assets/useCardsStore";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'

export default function App() {
 return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/doom" element={<DoomScroller />} />
      </Routes>
    </Router>
  );
}
