// Import the sendFile.js file
import { sendFile } from "./sendFile.js";

// Function to upload a file
async function uploadLargeFile() {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-apikey":
        "b7e61bfdd89fa7e4d7d130ac946292e35ef4cb8a31230cff8f9a130cdf8ee1a5",
    },
  };

  try {
    const res = await fetch(
      "https://www.virustotal.com/api/v3/files/upload_url",
      options,
    );
    return await res.json(); // Should return the upload URL
  } catch (err) {
    console.error("Error fetching upload URL:", err);
    return null;
  }
}

async function uploadFile(response, file) {
  const form = new FormData();
  form.append("file", file);

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-apikey":
        "b7e61bfdd89fa7e4d7d130ac946292e35ef4cb8a31230cff8f9a130cdf8ee1a5",
    },
    body: form,
  };

  try {
    const res = await fetch(response, options);
    return await res.json();
  } catch (err) {
    return console.error("Error uploading file:", err);
  }
}

// Function to get file details
async function getFileDetails(url) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-apikey":
        "b7e61bfdd89fa7e4d7d130ac946292e35ef4cb8a31230cff8f9a130cdf8ee1a5",
    },
  };

  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    return console.error("Error fetching file details:", err);
  }
}

// Separate the event listeners
const fileInput = document.getElementById("fileInput");
const form = document.querySelector("form");
let currentFile = null;

fileInput.addEventListener("change", function (event) {
  currentFile = event.target.files[0];
  console.log("File selected:", currentFile);
});

// Toggle password visibility
function toggleEye() {
  /* eslint-disable prettier/prettier */
  const passwordToggle = document.querySelector(".js-password-toggle");

  passwordToggle.addEventListener("change", function () {
    const password = document.querySelector(".js-password"),
      passwordLabel = document.querySelector(".js-password-label");

    if (password.type === "password") {
      password.type = "text";
      passwordLabel.innerHTML = `<i class="ri-eye-off-line"></i>`;
    } else {
      password.type = "password";
      passwordLabel.innerHTML = `<i class="ri-eye-line"></i>`;
    }

    password.focus();
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (currentFile) {
    uploadLargeFile()
      .then((response) => {
        console.log("Upload Response:", response.data);
        if (response.data) {
          return uploadFile(response.data, currentFile);
        }
      })
      .then((response) => {
        if (response?.data?.links?.self) {
          // Wait for analysis to complete
          setTimeout(() => {
            getFileDetails(response.data.links.self).then((details) => {
              console.log("File details:", details);

              // Check if analysis results are available
              if (details.data && details.data.attributes) {
                const stats = details.data.attributes.stats;
                const malicious = stats.malicious || 0;
                const suspicious = stats.suspicious || 0;

                // Create status message element
                const statusElement = document.getElementById("status");
                const passbox = document.getElementById("passbox");
                if (malicious > 0 || suspicious > 0) {
                  statusElement.style.color = "red";
                  statusElement.textContent = `Warning: File may be harmful! (Malicious: ${malicious}, Suspicious: ${suspicious})`;
                } else {
                  passbox.hidden = false;
                  toggleEye();
                  sendFile(currentFile);
                  statusElement.style.color = "green";
                  statusElement.textContent = "File is safe.";
                }
              }
            });
          }, 5000); // Wait 5 seconds for analysis
        }
      })
      .catch((error) => {
        console.error("Upload error:", error);
      });
  }
});