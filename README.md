# Upload-Scan-Share Documentation

## Table of Contents
- [Introduction](#introduction)
- [Key Features](#key-features)
- [Technology Used](#technology-used)
- [Hardware and Software Requirements](#hardware-and-software-requirements)
- [Backend](#backend)
    - [Setup](#setup)
    - [Endpoints](#endpoints)
- [Frontend](#frontend)
    - [Setup](#setup-1)
    - [Structure](#structure)
- [Usage](#usage)
- [Additional Information](#additional-information)

## Introduction
Upload-Scan-Share is a web application that allows users to upload files, scan them for viruses, and share them securely with a password and expiry time. The application ensures that files are safe to share by integrating with the VirusTotal API for virus scanning.

## Key Features
- **File Upload**: Users can upload files to the server.
- **Virus Scanning**: Files are scanned using the VirusTotal API to ensure they are safe.
- **Secure Sharing**: Files can be shared with a password and an expiry time.
- **Download Links**: Generates secure download links for shared files.
- **File Expiry**: Automatically deletes expired files from the server.

## Technology Used
- **Backend**: Node.js, Express.js, MongoDB, Multer, Bcrypt.js
- **Frontend**: Electron, Tailwind CSS, Vite
- **Virus Scanning**: VirusTotal API

## Hardware and Software Requirements

### Hardware Requirements
- **Processor**: Intel Core i3 or equivalent
- **RAM**: 4 GB or more
- **Storage**: 500 MB of free space

### Software Requirements
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 14 or higher
- **MongoDB**: Version 4.4 or higher
- **Electron**: Version 31 or higher

## Backend

### Setup
1. Navigate to the Backend directory:
     ```sh
     cd backend
     ```
2. Install the dependencies:
     ```sh
     npm install
     ```
3. Start the server:
     ```sh
     npm start
     ```

### Endpoints

- **POST /upload**
    - Uploads a file with a password and expiry time.
    - **Request Body**:
        ```json
        {
            "file": "file",
            "password": "string",
            "expiryTime": "string"
        }
        ```
    - **Response**:
        ```json
        {
            "link": "string"
        }
        ```

- **GET /verify/:link**
    - Verifies the download link and prompts for a password.
    - **Response**: HTML form for password input.

- **POST /verify/:link**
    - Verifies the password for the file.
    - **Request Body**:
        ```json
        {
            "password": "string"
        }
        ```
    - **Response**:
        ```json
        {
            "valid": "boolean"
        }
        ```

- **GET /download/:link**
    - Downloads the file if the password is correct and the link is not expired.
    - **Response**: File download.

## Frontend

### Setup
1. Navigate to the Frontend directory:
     ```sh
     cd frontend
     ```
2. Install the dependencies:
     ```sh
     npm install
     ```
3. Start the development server:
     ```sh
     npm run dev
     ```

### Structure
- **Main Process**
    - `src/main/index.js`: Main Electron process.
- **Preload Script**
    - `src/preload/index.js`: Preload script for exposing APIs.
- **Renderer Process**
    - `src/renderer/index.html`: Main HTML file.
    - `src/renderer/src/renderer.js`: Main renderer script.
    - `src/renderer/src/DragAndDrop.js`: Drag and drop functionality.
    - `src/renderer/src/sendFile.js`: File sending functionality.
    - `src/renderer/assets/main.css`: Main CSS file.

## Usage
1. Open the application.
2. Drag and drop a file or choose a file to upload.
3. Set a password and expiry time.
4. Click "Upload" to upload the file.
5. Share the generated download link.

## Additional Information
- The backend uses Express.js, MongoDB, and Multer for file handling.
- The frontend uses Electron, Tailwind CSS, and Vite for development and build processes.
- The application scans files using the VirusTotal API before allowing them to be shared.