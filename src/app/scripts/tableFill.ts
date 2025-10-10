// Step 1: Define the shape of the API that the preload script WILL expose.
// This gives us type safety and autocomplete without needing an import.
interface IElectronAPI {
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    selectFile: () => Promise<string | null>;
    runParser: () => Promise<any>; 
}

// Step 2: Extend the global Window interface to tell TypeScript
// that our custom 'electronAPI' object will exist on the window.
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}

// Step 3: Now you can just use window.electronAPI directly.
// No import is necessary because the preload script has already attached it.
document.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.getElementById('minimize-window');
    const maximizeBtn = document.getElementById('maximize-window');
    const closeBtn = document.getElementById('close-window');

    const uploadButton = document.getElementById('upload-button');
    const processButton = document.getElementById('process-button') as HTMLButtonElement;
    const selectedFileSpan = document.getElementById('selected-file');
    
    const tableBody = document.getElementById('table-body');

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }

    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });
    }

   
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });
    }

    // (The rest of your event listeners for the table, file upload, etc.)
    if (tableBody) {
        const rowsHTML = Array(20).fill(0).map(() => `
            <tr class="hover:bg-gray-700/50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
            </tr>
        `).join('');
        tableBody.innerHTML = rowsHTML;
    }

    // --- File Selection & Processing Logic ---
    if (uploadButton && processButton && selectedFileSpan) {
        // Disable the process button initially
        processButton.disabled = true;

        // Add listener to the "Subir archivo" (Upload) button
        uploadButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Selecting...';
            const fileName = await window.electronAPI.selectFile();

            if (fileName) {
                selectedFileSpan.textContent = `${fileName}`;
                processButton.disabled = false; // Enable the process button
            } else {
                selectedFileSpan.textContent = 'No file selected';
                processButton.disabled = true; // Keep it disabled
            }
        });

        // Add listener to the "Process" button
        processButton.addEventListener('click', async () => {
            selectedFileSpan.textContent = 'Processing...';
            processButton.disabled = true; // Disable while processing
            try {
                const result = await window.electronAPI.runParser();
                console.log('Result from Python:', result);

                if (result.status === 'error') {
                    selectedFileSpan.textContent = `Error: ${result.message}`;
                } else {
                    selectedFileSpan.textContent = `Processed: ${result.message}`;
                }

            } catch (error) {
                console.error('An error occurred while running the Python script:', error);
                selectedFileSpan.textContent = 'Error during processing.';
            }
        });
    }

    const tabs = document.querySelectorAll<HTMLButtonElement>('#tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('border-blue-500', 'text-white');
                t.classList.add('border-transparent', 'text-gray-400');
            });
            tab.classList.add('border-blue-500', 'text-white');
            tab.classList.remove('border-transparent', 'text-gray-400');
            console.log(`Tab changed to: ${tab.textContent}`);
        });
    });
});

export {};