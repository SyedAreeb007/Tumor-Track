const { GoogleGenerativeAI } = require("@google/generative-ai");
const { googleApiKey } = require("../config/config");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");
const express = require("express");

const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

exports.setupStaticFiles = (app) => {
    app.use("/uploads", express.static(path.join(__dirname, "../Uploads")));
};

exports.getAIResponse = async (req, res) => {
    const { patientName, age, gender, familyHistory, drugIntake } = req.body;
    const flairFile = req.files?.flair;
    const t1ceFile = req.files?.t1ce;

    console.log("Request received:", {
        patientName,
        age,
        gender,
        familyHistory,
        drugIntake,
        flair: flairFile?.name,
        t1ce: t1ceFile?.name
    });

    if (!patientName || !age || !gender || !familyHistory || !drugIntake || !flairFile || !t1ceFile) {
        console.log("Validation failed");
        return res.status(400).json({ error: "All fields and MRI files are required" });
    }

    let tumorType = "Unknown";
    let lobe = "Unknown";
    let grade = "Unknown";
    let segmentationResult = "Error processing MRI files.";
    let imageUrls = {};
    try {
        const flairPath = path.join(__dirname, "../Uploads", flairFile.name);
        const t1cePath = path.join(__dirname, "../Uploads", t1ceFile.name);
        await flairFile.mv(flairPath);
        await t1ceFile.mv(t1cePath);
        console.log("Files saved:", flairPath, t1cePath);

        const combinedResult = await new Promise((resolve, reject) => {
            const pythonProcess = spawn("C:\\Python312\\python.exe", [
                path.join(__dirname, "../predict.py"),
                flairPath,
                t1cePath
            ]);

            let output = "";
            let errorOutput = "";

            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
                console.log("Python stdout:", data.toString());
            });

            pythonProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
                console.log("Python stderr:", data.toString());
            });

            pythonProcess.on("close", (code) => {
                console.log("Python process exited with code:", code);
                if (code === 0) {
                    resolve(output.trim());
                } else {
                    reject(new Error(`Python process failed with code ${code}: ${errorOutput}`));
                }
            });

            pythonProcess.on("error", (err) => {
                reject(new Error(`Failed to spawn Python process: ${err.message}`));
            });
        });

        // Parse result: tumor_type|lobe|grade|segmentation_result|image_paths
        const parts = combinedResult.split("|");
        tumorType = parts[0] || "Unknown";
        lobe = parts[1] || "Unknown";
        grade = parts[2] || "Unknown";
        segmentationResult = parts[3] || "Error processing MRI files.";
        imageUrls = {
            flair: parts[4] ? `/Uploads/${path.basename(parts[4])}` : null,
            t1: parts[5] ? `/Uploads/${path.basename(parts[5])}` : null,
            t1ce: parts[6] ? `/Uploads/${path.basename(parts[6])}` : null,
            t2: parts[7] ? `/Uploads/${path.basename(parts[7])}` : null,
            mask: parts[8] ? `/Uploads/${path.basename(parts[8])}` : null,
            flair_roi: parts[9] ? `/Uploads/${path.basename(parts[9])}` : null,
            flair_img: parts[10] ? `/Uploads/${path.basename(parts[10])}` : null,
            flair_anat: parts[11] ? `/Uploads/${path.basename(parts[11])}` : null,
            not_tumor: parts[12] ? `/Uploads/${path.basename(parts[12])}` : null,
            core: parts[13] ? `/Uploads/${path.basename(parts[13])}` : null,
            edema: parts[14] ? `/Uploads/${path.basename(parts[14])}` : null,
            enhancing: parts[15] ? `/Uploads/${path.basename(parts[15])}` : null
        };

        await fs.unlink(flairPath);
        await fs.unlink(t1cePath);
    } catch (error) {
        console.error("Segmentation error:", error.message);
    }

    console.log("Tumor type:", tumorType);
    console.log("Lobe:", lobe);
    console.log("Grade:", grade);
    console.log("Segmentation result:", segmentationResult);
    console.log("Image URLs:", imageUrls);
    try {
        const prompt = `Patient Information:
        - Patient Name: ${patientName}
        - Age: ${age}
        - Gender: ${gender}
        - Family History: ${familyHistory}
        - Drug Intake: ${drugIntake}
        - Tumor Type: ${tumorType}
        - Tumor Location: ${lobe} lobe
        - Tumor Grade: ${grade}
        - MRI Segmentation Result: ${segmentationResult}

        Provide an analysis of this case for ${patientName}, including potential diagnosis, treatment suggestions, and risk factors. Make sure you are specific and list points line-wise.`;
        const result = await model.generateContent(prompt);
        console.log("Gemini response:", result.response.text());
        res.json({ response: result.response.text(), imageUrls, tumorType, lobe, grade, segmentationResult, patientName });
    } catch (error) {
        console.error("AI error:", error);
        res.status(500).json({ error: "Failed to generate response" });
    }
};