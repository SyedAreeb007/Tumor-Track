import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./AIForm.css";
import BackgroundImage from "../../assets/images/details-background-gradient-image.png";
import BackgroundUpperRightImage from "../../assets/images/background-upper-right.png";
import NavbarImage from "../../assets/images/navbar-image.png";
import HomeButtonIcon from "../../assets/images/home-button.png";
import ScanButtonIcon from "../../assets/images/scan-button.png";
import DocumentButtonIcon from "../../assets/images/document-button.png";
import BrainDesktopBlurImage from "../../assets/images/brain-desktop-blur-image.png";
import BrainMobileBlurImage from "../../assets/images/brain-mobile-blur-image.png";
import DetailsBackgroundImage from "../../assets/images/details-background-image.png";
import DetailsBackgroundMobileImage from "../../assets/images/details-background-mobile-image.png";
import DetailsHeader from "../../assets/images/details-header.png";
import NavLogo from "../../assets/images/nav-logo.png";
import NavMenu from "../../assets/images/nav-menu.png";

const AIForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: "",
        age: "",
        gender: "",
        familyHistory: "",
        drugIntake: ""
    });
    const [flairFile, setFlairFile] = useState(null);
    const [t1ceFile, setT1ceFile] = useState(null);
    const [flairFileName, setFlairFileName] = useState("");
    const [t1ceFileName, setT1ceFileName] = useState("");
    const [response, setResponse] = useState("");
    const [imageUrls, setImageUrls] = useState({});
    const [tumorType, setTumorType] = useState("");
    const [lobe, setLobe] = useState("");
    const [grade, setGrade] = useState("");
    const [segmentationResult, setSegmentationResult] = useState("");
    const [patientName, setPatientName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false); // State for mobile nav menu

    const flairInputRef = useRef(null);
    const t1ceInputRef = useRef(null);
    const responseContainerRef = useRef(null);

    // Toggle mobile navigation menu
    const handleNavMenuClick = () => {
        setIsNavMenuOpen(!isNavMenuOpen);
    };

    // Navigation handlers
    const handleHomeClick = () => {
        setIsNavMenuOpen(false);
        navigate("/");
    };

    const handleScanClick = () => {
        setIsNavMenuOpen(false);
        navigate("/details");
    };

    const handleDocsClick = () => {
        setIsNavMenuOpen(false);
        navigate("/docs");
    };

    // Function to clean and structure the analysis response
    const cleanAnalysisResponse = (rawResponse) => {
        if (!rawResponse) return [];

        const lines = rawResponse.split("\n").filter(line => line.trim());
        let elements = [];
        let currentSection = null;
        let isFirstHeading = true;

        lines.forEach((line, index) => {
            let cleanLine = line.replace(/^[#*]+/g, "").trim();
            cleanLine = cleanLine.replace(/\*\*/g, "").replace(/\*/g, "");

            if (line.startsWith("##") && isFirstHeading) {
                elements.push(<h3 key={`heading-${index}`} className="analysis-main-heading">{cleanLine}</h3>);
                isFirstHeading = false;
                return;
            }

            if (line.includes("**") && line.includes(":")) {
                currentSection = cleanLine;
                elements.push(
                    <div key={`section-${index}`} className="analysis-section">
                        <strong>{cleanLine}</strong>
                    </div>
                );
                return;
            }

            if (line.includes("**") && line.trim().startsWith("*")) {
                const parts = cleanLine.split(":", 2);
                const subheading = parts[0] + ":";
                const content = parts[1] ? parts[1].trim() : (lines[index + 1]?.replace(/^[#*]+/, "").trim() || "");
                elements.push(
                    <div key={`subheading-${index}`} className="analysis-subsection">
                        <strong>{subheading}</strong>
                        {content && <p className="analysis-subsection-content">{content}</p>}
                    </div>
                );
                return;
            }

            if (cleanLine && !line.startsWith("*") && !line.includes("**")) {
                elements.push(<p key={`para-${index}`} className="analysis-paragraph">{cleanLine}</p>);
            }
        });

        return elements;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "age") {
            if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 100)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFlairChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith(".nii")) {
            alert("Please select a .nii file for FLAIR.");
            return;
        }
        setFlairFile(file);
        setFlairFileName(file ? file.name : "");
    };

    const handleT1ceChange = (e) => {
        const file = e.target.files[0];
        if (file && !file.name.endsWith(".nii")) {
            alert("Please select a .nii file for T1CE.");
            return;
        }
        setT1ceFile(file);
        setT1ceFileName(file ? file.name : "");
    };

    const handleFlairButtonClick = () => {
        flairInputRef.current.click();
    };

    const handleT1ceButtonClick = () => {
        t1ceInputRef.current.click();
    };

    const handleDownloadPDF = async () => {
        const element = responseContainerRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#FFFFFF"
            });
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });
            const imgWidth = 190;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;

            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight - 20;
            while (heightLeft > 0) {
                pdf.addPage();
                position = heightLeft - imgHeight + 10;
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight - 20;
            }

            pdf.save(`TumorTrack_Analysis_${patientName || "Report"}.pdf`);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patientName.trim()) {
            alert("Please enter a patient name.");
            return;
        }
        const ageNum = parseInt(formData.age);
        if (!formData.age || isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
            alert("Please enter a valid age between 1 and 100.");
            return;
        }
        setLoading(true);

        const data = new FormData();
        data.append("patientName", formData.patientName);
        data.append("age", formData.age);
        data.append("gender", formData.gender);
        data.append("familyHistory", formData.familyHistory);
        data.append("drugIntake", formData.drugIntake);
        if (flairFile) data.append("flair", flairFile);
        if (t1ceFile) data.append("t1ce", t1ceFile);

        try {
            const res = await axios.post("http://localhost:5000/api/generate", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setResponse(res.data.response);
            setTumorType(res.data.tumorType);
            setLobe(res.data.lobe);
            setGrade(res.data.grade);
            setSegmentationResult(res.data.segmentationResult);
            setPatientName(res.data.patientName);
            setImageUrls({
                flair: res.data.imageUrls.flair ? `http://localhost:5000${res.data.imageUrls.flair}` : null,
                t1: res.data.imageUrls.t1 ? `http://localhost:5000${res.data.imageUrls.t1}` : null,
                t1ce: res.data.imageUrls.t1ce ? `http://localhost:5000${res.data.imageUrls.t1ce}` : null,
                t2: res.data.imageUrls.t2 ? `http://localhost:5000${res.data.imageUrls.t2}` : null,
                mask: res.data.imageUrls.mask ? `http://localhost:5000${res.data.imageUrls.mask}` : null,
                flair_roi: res.data.imageUrls.flair_roi ? `http://localhost:5000${res.data.imageUrls.flair_roi}` : null,
                flair_img: res.data.imageUrls.flair_img ? `http://localhost:5000${res.data.imageUrls.flair_img}` : null,
                flair_anat: res.data.imageUrls.flair_anat ? `http://localhost:5000${res.data.imageUrls.flair_anat}` : null,
                not_tumor: res.data.imageUrls.not_tumor ? `http://localhost:5000${res.data.imageUrls.not_tumor}` : null,
                core: res.data.imageUrls.core ? `http://localhost:5000${res.data.imageUrls.core}` : null,
                edema: res.data.imageUrls.edema ? `http://localhost:5000${res.data.imageUrls.edema}` : null,
                enhancing: res.data.imageUrls.enhancing ? `http://localhost:5000${res.data.imageUrls.enhancing}` : null
            });
        } catch (error) {
            console.error("Error:", error);
            setResponse("Failed to get a response.");
            setImageUrls({});
            setTumorType("");
            setLobe("");
            setGrade("");
            setSegmentationResult("");
            setPatientName("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="details-container">
            <div className="details-content-container">
                {/* Mobile Navbar */}
                <div className="mobile-navbar-details">
                    <img
                        src={NavLogo}
                        alt="Nav Logo"
                        className="nav-logo-details"
                        onClick={handleHomeClick}
                    />
                    <img
                        src={NavMenu}
                        alt="Nav Menu"
                        className="nav-menu-details"
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
                <img src={NavLogo} alt="Navbar Logo" className="nav-logo-image" onClick={handleHomeClick} />
                <img src={BackgroundUpperRightImage} alt="Upper Right" className="upper-right-image" />
                <img src={BrainDesktopBlurImage} alt="Brain Desktop" className="brain-desktop-blur-image" />
                <img src={BrainMobileBlurImage} alt="Brain Mobile" className="brain-mobile-blur-image" />
                <img src={DetailsBackgroundImage} alt="Details Background" className="details-background-image" />
                <img
                    src={DetailsBackgroundMobileImage}
                    alt="Details Background Mobile"
                    className="details-background-mobile-image"
                />
                <img src={DetailsHeader} alt="Details Header" className="details-header-image" />
                <div className="header-text-overlay">BRAIN TUMOR ANALYSIS</div>

                {/* Form Container */}
                <div className="form-container">
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="patientName">Patient Name</label>
                                <input
                                    type="text"
                                    id="patientName"
                                    name="patientName"
                                    className="patientName"
                                    placeholder="Enter patient name"
                                    value={formData.patientName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    className="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="age">Age</label>
                                <input
                                    type="text"
                                    id="age"
                                    name="age"
                                    className="age"
                                    placeholder="Enter age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    pattern="\d*"
                                    inputMode="numeric"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="familyHistory">Family History</label>
                                <select
                                    id="familyHistory"
                                    name="familyHistory"
                                    className="familyHistory"
                                    value={formData.familyHistory}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Family History</option>
                                    <option value="Brain Tumor">Brain Tumor</option>
                                    <option value="No Brain Tumor">No Brain Tumor</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="drugIntake">Drug Intake</label>
                                <select
                                    id="drugIntake"
                                    name="drugIntake"
                                    className="drugIntake"
                                    value={formData.drugIntake}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Drug Intake</option>
                                    <option value="Alcoholic">Alcoholic</option>
                                    <option value="Non Alcoholic">Non Alcoholic</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="flair">FLAIR MRI Scan</label>
                                <input
                                    type="file"
                                    id="flair"
                                    name="flair"
                                    className="flair"
                                    accept=".nii"
                                    ref={flairInputRef}
                                    onChange={handleFlairChange}
                                    required
                                    style={{ display: "none" }}
                                />
                                <div className="file-input-container">
                                    <button type="button" className="file-input-button" onClick={handleFlairButtonClick}>
                                        Choose FLAIR File
                                    </button>
                                    <span className="file-name">{flairFileName || "No file selected"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="t1ce">T1CE MRI Scan</label>
                                <input
                                    type="file"
                                    id="t1ce"
                                    name="t1ce"
                                    className="t1ce"
                                    accept=".nii"
                                    ref={t1ceInputRef}
                                    onChange={handleT1ceChange}
                                    required
                                    style={{ display: "none" }}
                                />
                                <div className="file-input-container">
                                    <button type="button" className="file-input-button" onClick={handleT1ceButtonClick}>
                                        Choose T1CE File
                                    </button>
                                    <span className="file-name">{t1ceFileName || "No file selected"}</span>
                                </div>
                            </div>
                            <div className="form-group"></div>
                        </div>
                        <div className="get-results-button">
                            <button type="submit" disabled={loading}>
                                {loading ? "Generating..." : "Get Results"}
                            </button>
                        </div>
                    </form>
                </div>

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

                {/* Results Display */}
                {response && (
                    <div className="response-container" ref={responseContainerRef}>
                        <h3>AI Analysis Results</h3>
                        <p><strong>Patient Name:</strong> {patientName}</p>
                        <p><strong>Predicted Tumor Type:</strong> {tumorType}</p>
                        <p><strong>Tumor Location:</strong> {lobe} lobe</p>
                        <p><strong>Tumor Grade:</strong> {grade}</p>
                        {segmentationResult && (
                            <p><strong>Segmentation Percentages:</strong> {segmentationResult}</p>
                        )}
                        <div className="analysis-content">
                            {cleanAnalysisResponse(response)}
                        </div>
                        <div className="segmented-images">
                            {imageUrls.flair && (
                                <div>
                                    <strong>FLAIR Image:</strong>
                                    <img src={imageUrls.flair} alt="FLAIR" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.t1 && (
                                <div>
                                    <strong>T1 Image:</strong>
                                    <img src={imageUrls.t1} alt="T1" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.t1ce && (
                                <div>
                                    <strong>T1CE Image:</strong>
                                    <img src={imageUrls.t1ce} alt="T1CE" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.t2 && (
                                <div>
                                    <strong>T2 Image:</strong>
                                    <img src={imageUrls.t2} alt="T2" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.mask && (
                                <div>
                                    <strong>Predicted Mask:</strong>
                                    <img src={imageUrls.mask} alt="Mask" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.flair_roi && (
                                <div>
                                    <strong>FLAIR with Mask ROI:</strong>
                                    <img src={imageUrls.flair_roi} alt="FLAIR ROI" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.flair_img && (
                                <div>
                                    <strong>FLAIR Plot Img:</strong>
                                    <img src={imageUrls.flair_img} alt="FLAIR Img" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.flair_anat && (
                                <div>
                                    <strong>FLAIR Plot Anat:</strong>
                                    <img src={imageUrls.flair_anat} alt="FLAIR Anat" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.not_tumor && (
                                <div>
                                    <strong>Not Tumor:</strong>
                                    <img src={imageUrls.not_tumor} alt="Not Tumor" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.core && (
                                <div>
                                    <strong>Necrotic/Core:</strong>
                                    <img src={imageUrls.core} alt="Core" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.edema && (
                                <div>
                                    <strong>Edema:</strong>
                                    <img src={imageUrls.edema} alt="Edema" crossOrigin="anonymous" />
                                </div>
                            )}
                            {imageUrls.enhancing && (
                                <div>
                                    <strong>Enhancing:</strong>
                                    <img src={imageUrls.enhancing} alt="Enhancing" crossOrigin="anonymous" />
                                </div>
                            )}
                        </div>
                        <button className="download-pdf-button" onClick={handleDownloadPDF}>
                            Download PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIForm;