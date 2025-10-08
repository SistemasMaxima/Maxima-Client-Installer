document.addEventListener('DOMContentLoaded', () => {
            // --- Window Controls ---
            const minimizeBtn = document.getElementById('minimize-window');
            const maximizeBtn = document.getElementById('maximize-window');
            const closeBtn = document.getElementById('close-window');

            if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI?.minimizeWindow());
            if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.electronAPI?.maximizeWindow());
            if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI?.closeWindow());
            
            // --- Generate Table Rows ---
            const tableBody = document.getElementById('table-body');
            if (tableBody) {
                const rowsHTML = Array(20).fill().map(() => `
                    <tr class="hover:bg-gray-700/50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400"></td>
                    </tr>
                `).join('');
                tableBody.innerHTML = rowsHTML;
            }

            // --- File Upload ---
            const uploadButton = document.getElementById('upload-button');
            const fileUploadInput = document.getElementById('file-upload');

            if (uploadButton) {
                uploadButton.addEventListener('click', () => {
                    fileUploadInput.click();
                });
            }

            if(fileUploadInput) {
                fileUploadInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        console.log('Archivo seleccionado:', file.name);
                        // You can send the file path to the main process if needed
                        window.electronAPI?.sendFile(file.path);
                    }
                });
            }

            // --- Tab Controls ---
            const tabs = document.querySelectorAll('#tabs button');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active styles from all tabs
                    tabs.forEach(t => {
                        t.classList.remove('border-blue-500', 'text-white');
                        t.classList.add('border-transparent', 'text-gray-400');
                    });
                    // Add active styles to clicked tab
                    tab.classList.add('border-blue-500', 'text-white');
                    tab.classList.remove('border-transparent', 'text-gray-400');

                    console.log(`Tab changed to: ${tab.textContent}`);
                    // Here you would typically load the data for the selected tab
                });
            });
        });