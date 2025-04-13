import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BrainDesktopImage from "../../assets/images/brain-desktop-image.png"; 
import "./SplashScreen.css";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 1300);

    // Cleanup timer
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <img
        src={BrainDesktopImage}
        alt="Brain Splash"
        className="splash-image"
      />
    </div>
  );
};

export default SplashScreen;
