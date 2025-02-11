require("dotenv").config();
const https = require("https");
const fs = require("fs");
const FormData = require("form-data");

// Load clients from JSON
const clientsFile = "clients.json";
let clientsData = JSON.parse(fs.readFileSync(clientsFile, "utf-8"));

// Function to get API key from `.env` based on `api_key_env` field
function getApiKey(client) {
  if (!client.api_key_env) {
    console.error(`No API key reference found for ${client.name}. Skipping...`);
    return null;
  }

  const apiKey = process.env[client.api_key_env];
  if (!apiKey) {
    console.error(
      `API key ${client.api_key_env} is missing in .env for ${client.name}. Skipping...`
    );
  }
  return apiKey;
}

// Function to create a brand
function createBrand(client) {
  return new Promise((resolve, reject) => {
    const { name, tenant_url, logo, favicon, styles, activated } = client;
    console.log(client);
    const apiKey = getApiKey(client);

    if (!fs.existsSync(logo) || !fs.existsSync(favicon)) {
      console.error(`Missing branding files for ${name}. Skipping...`);
      return resolve(null);
    }

    // Create form-data request
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", `Branding for ${name}`);
    formData.append("logo", fs.createReadStream(logo));
    formData.append("favIcon", fs.createReadStream(favicon));
    formData.append("styles", fs.createReadStream(styles)); // Brand Styles

    const options = {
      hostname: tenant_url,
      port: 443,
      path: "/api/v1/brands",
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const responseData = JSON.parse(data);
          if (res.statusCode === 201) {
            console.log(
              `✅ Brand Created for ${name}. Brand ID: ${responseData.id}`
            );
            resolve(responseData.id);
          } else {
            console.error(`❌ Failed for ${name}:`, responseData);
            resolve(null);
          }
        } catch (error) {
          console.error(`❌ Error parsing response for ${name}:`, error);
          resolve(null);
        }
      });
    });

    req.on("error", (error) => {
      console.error(`Request Error for ${name}:`, error.message);
      resolve(null);
    });

    formData.pipe(req);
  });
}

// Function to activate a brand
function activateBrand(client, brandId) {
  const apiKey = getApiKey(client);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: client.tenant_url,
      port: 443,
      path: `/api/v1/brands/${brandId}/actions/activate`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log(`✅ Brand Activated for ${client.name}`);
          resolve(true);
        } else {
          console.error(`Activation Failed for ${client.name}:`, data);
          resolve(false);
        }
      });
    });

    req.on("error", (error) => {
      console.error(`Request Error for ${client.name}:`, error.message);
      resolve(false);
    });

    req.end();
  });
}

// Function to process all clients
async function processClients() {
  for (let client of clientsData.clients) {
    if (!client.brand_id) {
      const brandId = await createBrand(client);
      console.log("Brand ID: ", brandId);

      if (brandId) {
        client.brand_id = brandId;
        const isActivated = await activateBrand(client, brandId);
        client.activated = isActivated;
      }
    } else {
      console.log(
        `ℹ️ Brand already exists for ${client.name}. Brand ID: ${client.brand_id}`
      );
    }
  }

  // Save updated client data with brand IDs
  fs.writeFileSync(clientsFile, JSON.stringify(clientsData, null, 4), "utf-8");
  console.log("All clients processed & saved.");
}

// Run the automation
processClients();
