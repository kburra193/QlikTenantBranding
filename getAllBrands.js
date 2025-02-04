require('dotenv').config();
const https = require("https");

const options = {
  hostname: process.env.QLIK_TENANT_URL,
  port: 443,
  path: "/api/v1/brands",
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.QLIK_API_KEY}`,
    Accept: "application/json",
  },
};

// Create HTTPS request
const req = https.request(options, (res) => {
  let data = "";

  console.log(`Status Code: ${res.statusCode}`);

  // Collect data chunks
  res.on("data", (chunk) => {
    data += chunk;
  });

  // Handle end of response
  res.on("end", () => {
    try {
      const jsonData = JSON.parse(data);
      console.log("Brands Data:", jsonData);
    } catch (error) {
      console.error("Error parsing response:", error);
    }
  });
});

// Handle errors
req.on("error", (error) => {
  console.error("Request Error:", error.message);
});

// End request
req.end();
