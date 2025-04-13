import React, { useState } from 'react';
import './Docs.css';
import BackgroundImage from '../../assets/images/details-background-gradient-image.png';
import BrainDesktopBlurImage from '../../assets/images/brain-desktop-blur-image.png';
import BrainMobileBlurImage from '../../assets/images/brain-mobile-blur-image.png';
import BackgroundUpperRightImage from '../../assets/images/background-upper-right.png';
import NavbarImage from '../../assets/images/navbar-image.png';
import HomeButtonIcon from '../../assets/images/home-button.png';
import ScanButtonIcon from '../../assets/images/scan-button.png';
import DocumentButtonIcon from '../../assets/images/document-button.png';
import NavLogo from '../../assets/images/nav-logo.png';
import NavMenu from '../../assets/images/nav-menu.png';
import { useNavigate } from 'react-router-dom';

const Docs = () => {
    const navigate = useNavigate();
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // State for mobile nav menu

    // Toggle mobile navigation menu
    const handleNavMenuClick = () => {
        setIsNavMenuOpen(!isNavMenuOpen);
    };

    // Navigation handlers
    const handleHomeClick = () => {
        setIsNavMenuOpen(false);
        navigate('/');
    };

    const handleScanClick = () => {
        setIsNavMenuOpen(false);
        navigate('/details');
    };

    const handleDocsClick = () => {
        setIsNavMenuOpen(false);
        navigate('/docs');
    };

    return (
        <div className="docs-container">
            <div className="docs-content-container">
                {/* Mobile Navbar */}
                <div className="mobile-navbar-docs">
                    <img
                        src={NavLogo}
                        alt="Nav Logo"
                        className="nav-logo-docs"
                        onClick={handleHomeClick}
                    />
                    <img
                        src={NavMenu}
                        alt="Nav Menu"
                        className="nav-menu-docs"
                        onClick={handleNavMenuClick}
                    />
                    {isNavMenuOpen && (
                        <div className="mobile-nav-menu">
                            <img
                                src={HomeButtonIcon}
                                alt="Home"
                                className="mobile-nav-icon home-icon"
                                onClick={handleHomeClick}
                            />
                            <img
                                src={ScanButtonIcon}
                                alt="Scan"
                                className="mobile-nav-icon scan-icon"
                                onClick={handleScanClick}
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

                <img src={BackgroundImage} alt="Background" className="background-image" />
                <img
                    src={NavLogo}
                    alt="Navbar Logo"
                    className="nav-logo-image"
                    onClick={handleHomeClick}
                />
                <img
                    src={BackgroundUpperRightImage}
                    alt="Upper Right"
                    className="upper-right-image"
                />
                <img
                    src={BrainDesktopBlurImage}
                    alt="Brain Desktop"
                    className="brain-desktop-blur-image"
                />
                <img
                    src={BrainMobileBlurImage}
                    alt="Brain Mobile"
                    className="brain-mobile-blur-image"
                />

                <div className="navbar-container">
                    <img src={NavbarImage} alt="Navbar" className="navbar-image" />
                    <div className="button-icons">
                        <img
                            src={HomeButtonIcon}
                            alt="Home"
                            className="button-icon home-icon"
                            onClick={handleHomeClick}
                        />
                        <img
                            src={ScanButtonIcon}
                            alt="Scan"
                            className="button-icon scan-icon"
                            onClick={handleScanClick}
                        />
                        <img
                            src={DocumentButtonIcon}
                            alt="Document"
                            className="button-icon document-icon"
                            onClick={handleDocsClick}
                        />
                    </div>
                </div>

                {/* Documentation Content */}
                <div className="docs-content">
                    <h2>User Manual</h2>
                    <p>
                        Welcome to Tumor-Track, a tool for analyzing brain tumors using MRI scans. This
                        manual guides you through using the application effectively.
                    </p>
                    <p>
                        <strong>Getting Started:</strong> Navigate to the Brain Tumor Analysis page
                        via the "Scan Now" button. Fill in patient details (name, age, gender, family
                        history, drug intake) and upload FLAIR and T1CE MRI scans (.nii format).
                    </p>
                    <p>
                        <strong>Analysis:</strong> Click "Get Results" to process the scans. The system
                        uses AI to classify tumor type (e.g., Meningioma), detect location (e.g.,
                        Temporal lobe), estimate grade, and provide segmentation percentages. Results
                        include a detailed analysis with diagnosis, treatment suggestions, and more.
                    </p>
                    <p>
                        <strong>Downloading Reports:</strong> Use the "Download PDF" button to save
                        results, including images and analysis, for sharing with healthcare providers.
                    </p>

                    <h2>Help Section</h2>
                    <p>
                        Need assistance? Here are common tasks and how to perform them:
                    </p>
                    <p>
                        <strong>Uploading Scans:</strong> Ensure MRI files are in .nii format. Use the
                        "Choose FLAIR File" and "Choose T1CE File" buttons. Only valid files are
                        accepted.
                    </p>
                    <p>
                        <strong>Understanding Results:</strong> The Analysis section explains the tumor
                        type, location, grade, and segmentation (e.g., enhancing tissue percentage).
                        Consult a neurosurgeon for medical decisions.
                    </p>
                    <p>
                        <strong>Navigation:</strong> Use the Home button to return to the main page or
                        the Scan Now button to start a new analysis. The Document icon refreshes this
                        page.
                    </p>

                    <h2>Troubleshooting Guide</h2>
                    <p>
                        Encountering issues? Try these solutions:
                    </p>
                    <p>
                        <strong>Upload Errors:</strong> If "Please select a .nii file" appears, check
                        your file format. Convert images to .nii if needed (use tools like 3D Slicer).
                    </p>
                    <p>
                        <strong>Longer Processing:</strong> If reached to 2 minutes or more than that, then try to restart the application.
                    </p>
                    <p>
                        <strong>No Results:</strong> Ensure all fields (name, age, etc.) are filled.
                        Age must be 1–100. Check your internet connection and try again.
                    </p>
                    <p>
                        <strong>PDF Download Fails:</strong> Clear browser cache or try another browser.
                        Ensure images load in the results before downloading.
                    </p>
                    <p>
                        <strong>Other Issues:</strong> Restart the application or contact support at
                        syedareeb445@gmail.com.
                    </p>

                    <h2>API Documentation</h2>
                    <p>
                        It uses Google API Key for Gemini to get the deep analysis of the case.
                    </p>
                    <p>
                        <strong>Endpoint:</strong> POST /api/generate
                    </p>
                    <p>
                        <strong>Request:</strong> Send a multipart/form-data request with:
                        <ul>
                            <li>patientName (string): Patient’s name.</li>
                            <li>age (string): Age (1–100).</li>
                            <li>gender (string): Male, Female, Other.</li>
                            <li>familyHistory (string): Brain Tumor, No Brain Tumor.</li>
                            <li>drugIntake (string): Alcoholic, Non Alcoholic.</li>
                            <li>flair (file): FLAIR MRI (.nii).</li>
                            <li>t1ce (file): T1CE MRI (.nii).</li>
                        </ul>
                    </p>
                    <p>
                        <strong>Response:</strong> JSON object containing:
                        <ul>
                            <li>response (string): Detailed analysis text.</li>
                            <li>tumorType (string): e.g., Meningioma.</li>
                            <li>lobe (string): e.g., Temporal.</li>
                            <li>grade (string): e.g., Low.</li>
                            <li>segmentationResult (string): e.g., "Not tumor: X%, ...".</li>
                            <li>patientName (string): Echoed name.</li>
                            <li>imageUrls (object): URLs for FLAIR, T1CE, mask, etc.</li>
                        </ul>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Docs;