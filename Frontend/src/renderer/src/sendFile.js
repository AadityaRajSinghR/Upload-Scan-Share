function sendFile(file) {
  // Upload file for sending
  const shareForm = document.getElementById("shareForm");
  shareForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById("share-btn").disabled = true;
    const password = document.getElementById("password").value;
    if (password === "") {
      alert("Please enter a password");
      return;
    }
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
      // console.log(data);  
      createsharebox(data);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  });
}

function createsharebox({ message, downloadLink }) {
  const sharebox = document.getElementById("msg_box");
  sharebox.innerHTML = `
   <div id="msg" class="alert alert-success mt-3" role="alert">
                  <span id="msg_text">
                    <span id="msg_text">${message}</span>
                  </span>
                </div>
                <div class="clipboard">
                  <input class="copy-input" value="${downloadLink}" id="copyClipboard" readonly>
                  <i class="ri-file-copy-line copy-btn"></i>
                </div>
                <div class="flex justify-center items-center mt-5">
                <img src="https://qrcode.tec-it.com/API/QRCode?data=${downloadLink}&color=%23ffffff&istransparent=True" class="w-36"/>
    </div>
                <div id="copied-success" class="copied">
                  <span>Copied!</span>
                </div>
  `;
  copyclipboard();
}
function copyclipboard() {
  let copyText = document.getElementById("copyClipboard");
  copyText.addEventListener("click", () => {
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