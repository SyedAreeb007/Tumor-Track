const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const aiRoutes = require("./routes/aiRoutes");
const { port } = require("./config/config");
const { setupStaticFiles } = require("./controllers/aiController");

const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Serve static files
setupStaticFiles(app);

app.use("/api", aiRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));