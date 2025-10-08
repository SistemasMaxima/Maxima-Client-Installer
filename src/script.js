 // Get the necessary elements from the DOM
const dropZone = document.getElementById('drop-zone');
const fileUpload = document.getElementById('file-upload');
const fileInfo = document.getElementById('file-info');
const fileNameDisplay = document.getElementById('file-name');

// --- Event Listeners for Window Controls ---

// Note: These require setup in your main Electron process and a preload script
// to expose the functionality to the renderer process.
document.getElementById('minimize-btn').addEventListener('click', () => {
        if (window.electronAPI) window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
});


// --- Event Listeners for Drag and Drop ---

// Prevent default browser behavior for drag events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Add a visual indicator when a file is dragged over the drop zone
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
});

// Remove the visual indicator when the file leaves the drop zone
['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
});

// Handle the dropped file
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// --- Event Listener for "Browse File" Button ---

// Handle file selection from the browse button
fileUpload.addEventListener('change', function() {
    handleFiles(this.files);
});

// Make the entire drop zone clickable
dropZone.addEventListener('click', () => {
    fileUpload.click();
});


// --- File Handling Logic ---

function handleFiles(files) {
    // We'll just handle the first file if multiple are selected/dropped
    if (files.length > 0) {
        const file = files[0];
        console.log('File selected:', file.name, file.path); // In Electron, file.path gives the full path
        
        // Display file information
        fileInfo.classList.remove('hidden');
        fileNameDisplay.textContent = file.name;

        // You can add your file processing logic for Electron here.
        // For example, sending the file path to the main process:
        // if (window.electronAPI) {
        //     window.electronAPI.sendFile(file.path);
        // }
    }
}