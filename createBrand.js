require("dotenv").config();
const https = require("https");
const FormData = require("form-data");
const fs = require("fs");

// Load environment variables
const TENANT_URL = process.env.QLIK_TENANT_URL; // No "https://"
const API_KEY = process.env.QLIK_API_KEY;

// Define file paths (Update with actual file paths)
const logoPath = "logo.png";
const faviconPath = "favicon.ico";
const stylesPath = "styles.json";


// Check if files exist before uploading
if (!fs.existsSync(logoPath) || !fs.existsSync(faviconPath)) {
  console.error("Error: One or both image files not found.");
  process.exit(1);
}

// Create form-data instance
const formData = new FormData();
formData.append("name", "My Custom Brand"); // Brand Name
formData.append("description", "Custom branding for Qlik Cloud"); // Description
formData.append("logo", fs.createReadStream(logoPath)); // Attach logo file
formData.append("favIcon", fs.createReadStream(faviconPath)); // Attach favicon file
formData.append("styles", fs.createReadStream(stylesPath)); // Brand Styles

// Define API request options
const options = {
  hostname: "karthikburra93.us.qlikcloud.com",
  port: 443,
  path: "/api/v1/brands",
  method: "POST",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJFUzM4NCIsImtpZCI6IjNjMTAyZTk1LTdiMGUtNGNkYi04ZjRmLTNiMTQ5ODIxMjY1MCIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiSEI5cE5idXRMNWJDbXRWZmRhSGdBV0ZQRmlUOVBwekgiLCJqdGkiOiIzYzEwMmU5NS03YjBlLTRjZGItOGY0Zi0zYjE0OTgyMTI2NTAiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjI0YjUwMGI1NGIyODU5ZTAzY2FlMjExIn0.rWaLzxG1A0HC_P2V7tMPh1KyxwNBpIdMH2lmToUkvWAhNpRk0PSMvX_9UWZfyv-VQ-xcE08c92D36ssBxz5pXEbrZM3WDNi_RPbAm9yCsCn59xtepaxYRFaXf_DRRqWm",

    ...formData.getHeaders(), // Important for multipart requests
  },
};

// Make the HTTPS request
const req = https.request(options, (res) => {
  let data = "";

  console.log(`Status Code: ${res.statusCode}`);

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      console.log("Brand Created Successfully:", JSON.parse(data));
    } catch (error) {
      console.error("Error parsing response:", error);
    }
  });
});

// Handle request errors
req.on("error", (error) => {
  console.error("Request Error:", error.message);
});

// Pipe form data into request
formData.pipe(req);
