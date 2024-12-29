function sendFile(file) {
  // Upload file for sending
  const shareButton = document.getElementById("share");
  shareButton.addEventListener("click", async () => {
    const password = document.getElementById("password").value;
    const HR = document.getElementById("hr").value;
    const MIN = document.getElementById("min").value;

    const form = new FormData();
    form.append("file", file);
    form.append("password", password);
    form.append("expiryMinutes", MIN);
    form.append("expiryHours", HR);

    const options = {
      method: "POST",
      body: form,
    };

    try {
      const res = await fetch("http://localhost:3000/upload", options);
      const data = await res.json();
      console.log(data);
      createsharebox();
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  });
}

function createsharebox() {
  const sharebox = document.getElementById("msg_box");
  sharebox.innerHTML = `
   <div id="msg" class="alert alert-success" role="alert">
                  <span id="msg_text">
                    <span id="msg_text">File uploaded successfully</span>
                  </span>
                </div>
                <div class="clipboard">
                  <input class="copy-input" value="mail.com" id="copyClipboard" readonly>
                </div>
                <div id="copied-success" class="copied">
                  <span>Copied!</span>
                </div>
  `;
  copyclipboard();
}
function copyclipboard() {
  document.getElementById("copyClipboard").addEventListener("click", () => {
    let copyText = document.getElementById("copyClipboard");
    let copySuccess = document.getElementById("copied-success");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);

    copySuccess.style.opacity = "1";
    setTimeout(function () {
      copySuccess.style.opacity = "0";
    }, 500);
  });
}

export { sendFile };