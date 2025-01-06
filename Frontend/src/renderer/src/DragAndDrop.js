/* eslint-disable prettier/prettier */
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const selectedFilesContainer = document.getElementById("selectedFiles");
  const uploadedFilesContainer = document.getElementById("uploadedFiles");
  const fileUploadForm = document.getElementById("fileUploadForm");
  let selectedFiles = [];
  let uploadedFiles = [];

  const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
    );
  };

  const renderFiles = (files, container, isUploaded) => {
    container.innerHTML = "";
    files.forEach((file) => {
      const fileDiv = document.createElement("div");
      fileDiv.classList.add("file-atc-box");

      fileDiv.innerHTML = `
      <div class="kb-attach-box flex">
        ${file.type.match(/.(jpg|jpeg|png|gif|svg)$/i)
          ? `<div class="file-image"><img src="${file.image}" alt="${file.name}"></div>`
          : `<div class="file-image"><i>${file.name.split(".").pop()}</i></div>`
        }
          <div class="file-detail">
        <h6>${file.name}</h6>
        <p>
        <span>Size: ${file.size}</span>
        <span class="ml-2">Modified: ${file.modified}</span>
        </p>
        <div class="file-actions">
        <button type="button" class="file-action-btn" id="detete" data-id="${file.id}" data-type="${isUploaded ? "uploaded" : "selected"}">Delete</button>
          <span id='status'>  ${isUploaded ? `Scan...` : ""}<span>
        </div>
        </div>
          </div>
        <!-- Form Group -->
        <div id="passbox" hidden >
        <form id="shareForm">
          <div class="relative w-full my-2">
            <div class="absolute inset-y-0 right-0 flex items-center px-2">
          <input class="hidden js-password-toggle" id="toggle" type="checkbox" />
          <label
            class="px-2 py-1 font-mono text-sm text-gray-600 bg-gray-300 rounded cursor-pointer hover:bg-gray-400 js-password-label"
            for="toggle"><i class="ri-eye-line"></i></label>
            </div>
            <input
          class="w-full px-3 py-3 pr-16 font-mono leading-tight text-gray-700 bg-transparent border border-gray-300 rounded appearance-none focus:outline-none focus:border-indigo-700 js-password"
          id="password" type="password" placeholder="Set Password" autocomplete="off" required />
          </div>

          <!-- Time set -->
          <h6>Set Expiry Time (HR:MIN): </h6>
          <div class="inline-flex p-2 text-lg border rounded-md shadow-lg">
            <!-- Hours Dropdown -->
            <select id="hr" class="px-4 bg-[#000000af] outline-none appearance-none rounded-md text-cente custom-select" required>
          ${Array.from({ length: 24 }, (_, i) => {
            const value = i.toString().padStart(2, "0");
            return `<option value="${value}">${value}</option>`;
          }).join("")}
            </select>
            <span class="px-2">:</span>
            <!-- Minutes Dropdown -->
            <select id="min" class="px-4 bg-[#000000af] outline-none appearance-none rounded-md text-center custom-select" required>
          ${Array.from({ start: 1, length: 59 }, (_, i) => {
            i = i + 1;
            const value = i.toString().padStart(2, "0");
            return `<option value="${value}">${value}</option>`;
          }).join("")}
            </select>
          </div>
          <!-- End Form Group -->
          <button type="submit" class="btn btn-primary py-2 px-7 text-lg  ml-3" id="share-btn">
            Share File
          </button>
        </form>
        </div>
        `;
      container.appendChild(fileDiv);
    });
  };
  const deleteFile = (id, isUploaded) => {
    const conf = confirm("Are you sure you want to delete this file?");
    if (conf) {
      if (isUploaded === "uploaded") {
        uploadedFiles = uploadedFiles.filter((file) => file.id !== id);
        renderFiles(uploadedFiles, uploadedFilesContainer, true);
      } else {
        selectedFiles = [];
        renderFiles(selectedFiles, selectedFilesContainer, false);
      }
      fileInput.value = ""; // Reset file input
    }
  };

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]; // Handle only single file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        selectedFiles = [
          {
            // Replace array instead of pushing
            id: Date.now() + Math.random().toString(36).slice(2, 11),
            name: file.name,
            type: file.type,
            size: formatFileSize(file.size),
            modified: file.lastModifiedDate.toLocaleString(),
            image: reader.result,
          },
        ];
        renderFiles(selectedFiles, selectedFilesContainer, false);
      };
      reader.readAsDataURL(file);
    }
  });

  const submitButton = document.querySelector("#submit");
  const changestatus = () => {
    const fileInput = document.querySelector("input[type='file']");
    if (selectedFiles.length > 0) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Uploading...";
      fileInput.disabled = true;
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML = "Upload";
      fileInput.disabled = false;
    }
  };

  fileUploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    changestatus();
    if (selectedFiles.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      uploadedFiles = [...uploadedFiles, ...selectedFiles];
      selectedFiles = [];
      renderFiles(selectedFiles, selectedFilesContainer, false);
      renderFiles(uploadedFiles, uploadedFilesContainer, true);

      if (uploadedFiles.length > 0) {
        submitButton.innerHTML = "Uploaded";
      }
    } else {
      alert("Please select files to upload.");
    }
  });

  // Add event listener for hour select
  document.body.addEventListener("change", (e) => {
    if (e.target.id === "hr") {
      const minSelect = document.getElementById('min');
      minSelect.innerHTML = e.target.value > '00' 
        ? Array.from({length: 60}, (_, i) => `<option value=${i.toString().padStart(2, '0')}>${i.toString().padStart(2, '0')}</option>`).join('')
        : Array.from({length: 59}, (_, i) => `<option value=${(i+1).toString().padStart(2, '0')}>${(i+1).toString().padStart(2, '0')}</option>`).join('');
    }
  });

  // Event delegation for delete actions
  document.body.addEventListener("click", (e) => {
    if (e.target.id === "detete") {
      changestatus();
      const fileId = e.target.dataset.id;
      const fileType = e.target.dataset.type;
      deleteFile(fileId, fileType);
    }
  });
});
