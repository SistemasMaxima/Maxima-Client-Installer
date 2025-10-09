// Step 1: Define the shape of the API that the preload script WILL expose.
// This gives us type safety and autocomplete without needing an import.
interface IElectronAPI {
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    sendFile: (filePath: string) => void;
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
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }

    const maximizeBtn = document.getElementById('maximize-window');
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            window.electronAPI.maximizeWindow();
        });
    }

    const closeBtn = document.getElementById('close-window');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeWindow();
        });
    }

    // (The rest of your event listeners for the table, file upload, etc.)
    const tableBody = document.getElementById('table-body');
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

    const uploadButton = document.getElementById('upload-button');
    const fileUploadInput = document.getElementById('file-upload') as HTMLInputElement;

    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            fileUploadInput.click();
        });
    }

    if(fileUploadInput) {
        fileUploadInput.addEventListener('change', (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                console.log('Archivo seleccionado:', file.name);
                window.electronAPI.sendFile(file.name); 
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