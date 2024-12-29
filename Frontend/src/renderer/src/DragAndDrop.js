document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput')
    const selectedFilesContainer = document.getElementById('selectedFiles')
    const uploadedFilesContainer = document.getElementById('uploadedFiles')
    const fileUploadForm = document.getElementById('fileUploadForm')
    let selectedFiles = []
    let uploadedFiles = []

    const formatFileSize = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
    }

    const renderFiles = (files, container, isUploaded) => {
        container.innerHTML = ''
        files.forEach((file) => {
            const fileDiv = document.createElement('div')
            fileDiv.classList.add('file-atc-box')

            fileDiv.innerHTML = `
                ${file.type.match(/.(jpg|jpeg|png|gif|svg)$/i)
                    ? (
                        `<div class="file-image"><img src="${file.image}" alt="${file.name}"></div>`
                    ) : (
                        `<div class="file-image"><i>${(file.name.split('.').pop())}</i></div>`
                    )
                }
                <div class="file-detail">
                    <h6>${file.name}</h6>
                    <p>
                        <span>Size: ${file.size}</span>
                        <span class="ml-2">Modified: ${file.modified}</span>
                    </p>
                    <div class="file-actions">
                        <button type="button" class="file-action-btn" id="detete" data-id="${file.id}" data-type="${isUploaded ? 'uploaded' : 'selected'}">Delete</button>
                      <span id='status'>  ${isUploaded ? `Scan...` : ''}<span>
                    </div>
                </div>
            `
            container.appendChild(fileDiv)
        })
    }


   




    const deleteFile = (id, isUploaded) => {
        const conf = confirm('Are you sure you want to delete this file?')
        if (conf) {
            if (isUploaded === "uploaded") {
                uploadedFiles = uploadedFiles.filter((file) => file.id !== id)
                renderFiles(uploadedFiles, uploadedFilesContainer, true)
            } else {
                selectedFiles = []
                renderFiles(selectedFiles, selectedFilesContainer, false)
            }
            fileInput.value = '' // Reset file input
        }
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; // Handle only single file
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                selectedFiles = [{  // Replace array instead of pushing
                    id: Date.now() + Math.random().toString(36).slice(2, 11),
                    name: file.name,
                    type: file.type,
                    size: formatFileSize(file.size),
                    modified: file.lastModifiedDate.toLocaleString(),
                    image: reader.result
                }]
                renderFiles(selectedFiles, selectedFilesContainer, false)
            }
            reader.readAsDataURL(file)
        }
    })

    const submitButton = document.querySelector('#submit')
    const changestatus =()=>{
        const fileInput = document.querySelector('input')
        if (selectedFiles.length > 0) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Uploading...';
            fileInput.disabled = true
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Upload';
            fileInput.disabled = false
        }
    }

    fileUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        changestatus();
        if (selectedFiles.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            uploadedFiles = [...uploadedFiles, ...selectedFiles]
            selectedFiles = []
            renderFiles(selectedFiles, selectedFilesContainer, false)
            renderFiles(uploadedFiles, uploadedFilesContainer, true)

            if (uploadedFiles.length > 0) {
                submitButton.innerHTML = 'Uploaded'
            }
        } else {
           
            alert('Please select files to upload.')
        }
    })


    // Event delegation for delete actions
    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'detete') {
            changestatus();
            const fileId = e.target.dataset.id
            const fileType = e.target.dataset.type
            deleteFile(fileId, fileType)
        }
    })
})
