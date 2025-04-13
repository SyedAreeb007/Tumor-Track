import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import HomeScreen from "./components/HomeScreen/HomeScreen";
import AIForm from "./components/AIForm/AIForm";
import Docs from "./components/Docs/Docs";

const App = () => {
  return (
    <Router>
      <Routes>        
        <Route path="/" element={<SplashScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/details" element={<AIForm/>} />
        <Route path="/docs" element={<Docs/>} />
      </Routes>
    </Router>
  );
};

export default App;
