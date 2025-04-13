import React, { useState } from "react";
import "./HomeScreen.css";
import BackgroundImage from "../../assets/images/background-gradient-image.png";
import BackgroundUpperRightImage from "../../assets/images/background-upper-right.png";
import BrainDesktopImage from "../../assets/images/brain-desktop-image.png";
import BackgroundLeftImage from "../../assets/images/background-left.png";
import NavbarImage from "../../assets/images/navbar-image.png";
import HomeButtonIcon from "../../assets/images/home-button.png";
import ScanButtonIcon from "../../assets/images/scan-button.png";
import DocumentButtonIcon from "../../assets/images/document-button.png";
import TumorVideo from "../../assets/videos/tumor-video.mp4";
import MriVideo from "../../assets/videos/mri-video.mp4";
import NavLogo from "../../assets/images/nav-logo.png";
import NavMenu from "../../assets/images/nav-menu.png";
import BrainMobileImage from "../../assets/images/brain-desktop-image.png";
import { useNavigate } from "react-router-dom";

const HomeScreen = () => {
    const navigate = useNavigate();
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // State for mobile nav menu

    // Navigation handlers
    const handleNavMenuClick = () => {
        setIsNavMenuOpen(!isNavMenuOpen);
    };

    const handleScanNowClick = () => {
        setIsNavMenuOpen(false);
        navigate("/details");
    };

    const handleDocsClick = () => {
        setIsNavMenuOpen(false);
        navigate("/docs");
    };

    return (
        <div className="home-container">
            <div className="content-container">
                {/* Navbar for Mobile */}
                <div className="mobile-navbar">
                    <img
                        src={NavLogo}
                        alt="Nav Logo"
                        className="nav-logo"
                    />
                    <img
                        src={NavMenu}
                        alt="Nav Menu"
                        className="nav-menu"
                        onClick={handleNavMenuClick}
                    />
                    {isNavMenuOpen && (
                        <div className="mobile-nav-menu">
                            <img
                                src={HomeButtonIcon}
                                alt="Home"
                                className="mobile-nav-icon home-icon"
                            />
                            <img
                                src={ScanButtonIcon}
                                alt="Scan"
                                className="mobile-nav-icon scan-icon"
                                onClick={handleScanNowClick}
                            />
                            <img
                                src={DocumentButtonIcon}
                                alt="Document"
                                className="mobile-nav-icon document-icon"
                                onClick={handleDocsClick}
                            />
                        </div>
                    )}
                </div>

                {/* Brain Mobile Image */}
                <img src={BrainMobileImage} alt="Brain Mobile" className="brain-mobile-image" />
                
                <img src={BackgroundImage} alt="Background" className="overlay-image" />
                <img
                    src={BackgroundUpperRightImage}
                    alt="Upper Right"
                    className="upper-right-image"
                />
                <img
                    src={BackgroundLeftImage}
                    alt="Bottom Left"
                    className="bottom-left-image"
                />
                <img
                    src={BrainDesktopImage}
                    alt="Brain Desktop"
                    className="brain-desktop-image"
                />
                <div className="video-container-tumor">
                    <video className="video-tumor" autoPlay loop muted>
                        <source src={TumorVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="video-container-mri">
                    <video className="video-mri" autoPlay loop muted>
                        <source src={MriVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="heading-overlay">
                    <h1 className="tumor-heading">TUMOR</h1>
                    <h2 className="track-heading">TRACK</h2>
                </div>
                <div className="text-overlay">
                    <p>
                        Advanced Deep Learning for Automated Brain Tumor Detection,
                        Segmentation, Classification, and Suggestion
                    </p>
                </div>
                <div className="scan-now-button">
                    <button onClick={handleScanNowClick}>Scan Now!</button>
                </div>
                <div className="navbar-container">
                    <img src={NavbarImage} alt="Navbar" className="navbar-image" />
                    <div className="button-icons">
                        <img
                            src={HomeButtonIcon}
                            alt="Home"
                            className="button-icon home-icon"
                        />
                        <img
                            src={ScanButtonIcon}
                            alt="Scan"
                            className="button-icon scan-icon"
                            onClick={handleScanNowClick}
                        />
                        <img
                            src={DocumentButtonIcon}
                            alt="Document"
                            className="button-icon document-icon"
                            onClick={handleDocsClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;