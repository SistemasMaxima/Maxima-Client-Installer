// Define the shape of the API that the preload script WILL expose.
interface IElectronAPI {
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    selectFile: () => Promise<string | null>;
    runParser: () => Promise<any>;
}

// Extend the global Window interface.
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}

// --- Helper Function to Populate the Table ---
function populateTable(data: any) {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;

    // Clear any existing rows from the table
    tableBody.innerHTML = '';

    // Check if the received data has the 'links' array
    if (data && Array.isArray(data.links)) {
        const rowsHTML = data.links.map((linkInfo: any) => {
            // Create a clickable link for the URL
            const linkElement = `<a href="${linkInfo.link}" target="_blank" class="text-blue-400 hover:underline">Open Link</a>`;
            
            // Create a button for the "Web Scrapping" action
            const scrapeButton = `<button class="bg-indigo-600 text-white px-2 py-1 text-xs rounded hover:bg-indigo-700">Scrape</button>`;

            return `
                <tr class="hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 border-r border-gray-700">${linkInfo.trackNumbersCount}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 border-r border-gray-700">${linkElement}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${scrapeButton}</td>
                </tr>
            `;
        }).join('');
        
        tableBody.innerHTML = rowsHTML;
    } else {
        // If the data is invalid or empty, show a message
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-gray-500">No data to display.</td></tr>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // --- Get Element References ---
    const uploadButton = document.getElementById('upload-button');
    const processButton = document.getElementById('process-button') as HTMLButtonElement;
    const selectedFileSpan = document.getElementById('selected-file');
    const minimizeBtn = document.getElementById('minimize-window');
    const maximizeBtn = document.getElementById('maximize-window');
    const closeBtn = document.getElementById('close-window');
    const tableBody = document.getElementById('table-body');

    // --- Window Controls ---
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
    if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());

    // --- File Selection & Processing Logic ---
    if (uploadButton && processButton && selectedFileSpan) {
        processButton.disabled = true;

        uploadButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Selecting...';
            const fileName = await window.electronAPI.selectFile();
            if (fileName) {
                selectedFileSpan.textContent = `${fileName}`;
                processButton.disabled = false;
                // Clear the table when a new file is selected
                if (tableBody) tableBody.innerHTML = '';
            } else {
                selectedFileSpan.textContent = 'No file selected';
                processButton.disabled = true;
            }
        });

        processButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Processing...';
            processButton.disabled = true;
            try {
                const result = await window.electronAPI.runParser();
                console.log('Result from Python:', result);

                if (result.status === 'error') {
                    selectedFileSpan.textContent = `Error: ${result.message}`;
                } else {
                    selectedFileSpan.textContent = `Processed: ${result.message || 'Success!'}`;
                    // Call the new function to populate the table with the result
                    populateTable(result);
                }

            } catch (error) {
                console.error('An error occurred:', error);
                selectedFileSpan.textContent = 'Error during processing.';
            } finally {
                // Re-enable the process button if a file is still selected
                if (selectedFileSpan.textContent?.startsWith('Processed:')) {
                   processButton.disabled = false;
                }
            }
        });
    }

    // --- Tab Controls ---
    const tabs = document.querySelectorAll<HTMLButtonElement>('#tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('border-blue-500', 'text-white');
                t.classList.add('border-transparent', 'text-gray-400');
            });
            tab.classList.add('border-blue-500', 'text-white');
            tab.classList.remove('border-transparent', 'text-gray-400');
        });
    });
});

export {};

