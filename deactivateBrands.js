const https = require("https");

const options = {
  hostname: "karthikburra93.us.qlikcloud.com",
  port: 443,
  path: "/api/v1/brands/67a18d4069a1c9fbca184acf/actions/deactivate", //specify brand-id
  method: "POST",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJFUzM4NCIsImtpZCI6IjNjMTAyZTk1LTdiMGUtNGNkYi04ZjRmLTNiMTQ5ODIxMjY1MCIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiSEI5cE5idXRMNWJDbXRWZmRhSGdBV0ZQRmlUOVBwekgiLCJqdGkiOiIzYzEwMmU5NS03YjBlLTRjZGItOGY0Zi0zYjE0OTgyMTI2NTAiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjI0YjUwMGI1NGIyODU5ZTAzY2FlMjExIn0.rWaLzxG1A0HC_P2V7tMPh1KyxwNBpIdMH2lmToUkvWAhNpRk0PSMvX_9UWZfyv-VQ-xcE08c92D36ssBxz5pXEbrZM3WDNi_RPbAm9yCsCn59xtepaxYRFaXf_DRRqWm",
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
