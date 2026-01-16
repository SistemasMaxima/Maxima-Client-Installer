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
            
            return `
                <tr class="hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 border-r border-gray-700">${linkInfo.trackNumbersCount}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400 border-r border-gray-700">${linkElement}</td>
                </tr>
            `;
        }).join('');
        
        tableBody.innerHTML = rowsHTML;
    } else {
        // If the data is invalid or empty, show a message
        tableBody.innerHTML = `<tr><td colspan="2" class="text-center py-4 text-gray-500">No data to display.</td></tr>`;
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
    const fileTab = document.getElementById('file-tab-1'); // Get the tab element

    // --- ADDED: Variable to store the file name ---
    let selectedFileName: string | null = null;

    // --- Window Controls ---
    if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI.minimizeWindow());
    if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.electronAPI.maximizeWindow());
    if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI.closeWindow());

    // --- File Selection & Processing Logic ---
    if (uploadButton && processButton && selectedFileSpan && fileTab) { // Check for fileTab
        processButton.disabled = true;

        uploadButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Seleccionando...';
            // Reset tab text when selecting a new file
            fileTab.textContent = 'Archivo'; 
            
            const fileName = await window.electronAPI.selectFile();
            if (fileName) {
                selectedFileSpan.textContent = `${fileName}`;
                selectedFileName = fileName; // <-- 1. STORE the name
                processButton.disabled = false;
                // Clear the table when a new file is selected
                if (tableBody) tableBody.innerHTML = '';
            } else {
                selectedFileSpan.textContent = 'Ningun archivo seleccionado';
                selectedFileName = null; // <-- RESET the stored name
                processButton.disabled = true;
            }
        });

        processButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Procesando...';
            processButton.disabled = true;
            try {
                const result = await window.electronAPI.runParser();
                console.log('Result from Python:', result);

                if (result.status === 'error') {
                    selectedFileSpan.textContent = `Error: ${result.message}`;
                } else {
                    selectedFileSpan.textContent = `Procesado: ${result.message || 'Exitoso!'}`;
                    // Call the new function to populate the table with the result
                    populateTable(result);

                    // 2. UPDATE THE TAB TEXT ON SUCCESS
                    if (selectedFileName) {
                        fileTab.textContent = selectedFileName;
                    }
                }

            } catch (error) {
                console.error('Ocurrio un error:', error);
                selectedFileSpan.textContent = 'Error durante procesado.';
            } finally {
                // Re-enable the process button if a file is still selected
                if (selectedFileName) {
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