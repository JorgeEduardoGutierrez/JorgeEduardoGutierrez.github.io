document.addEventListener('DOMContentLoaded', () => {

    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    async function fetchLocalJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Error al obtener el archivo: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
            throw error;
        }
    }

    async function loadMainFolders() {
        try {
            showLoading(true);
            const data = await fetchLocalJSON('data/folders.json');
            const folders = data.folders;
            const sidebarMenu = document.getElementById('sidebarMenu');
            sidebarMenu.innerHTML = '';

            folders.forEach(folder => {
                const listItem = document.createElement('li');
                listItem.className = 'nav-item';

                const link = document.createElement('a');
                link.href = '#';
                link.className = 'nav-link';
                link.textContent = folder.name;

                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    setActiveLink(link);
                    await loadExperimentSet(folder.name);
                });

                listItem.appendChild(link);
                sidebarMenu.appendChild(listItem);
            });

            if (folders.length > 0) {
                const firstLink = document.querySelector('#sidebarMenu .nav-link');
                setActiveLink(firstLink);
                await loadExperimentSet(folders[0].name);
            }
        } catch (error) {
            console.error('Error al cargar carpetas principales:', error);
            alert('Hubo un error al cargar las carpetas principales. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    function setActiveLink(selectedLink) {
        const links = document.querySelectorAll('#sidebarMenu .nav-link');
        links.forEach(link => link.classList.remove('active'));
        selectedLink.classList.add('active');
    }

    async function loadExperimentSet(experimentType) {
        try {
            showLoading(true);
            const experimentTabs = document.getElementById('experimentTabs');
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            experimentTabs.innerHTML = '';
            experimentTabsContent.innerHTML = '';

            const data = await fetchLocalJSON(`data/${experimentType}/experiments.json`);
            const mainExists = data.includes('main');
            const experimentFolders = data.filter(folder => folder !== 'main');

            if (mainExists) {
                createMainTab(experimentType);
            }

            experimentFolders.forEach((folderName, index) => {
                const expId = index + 1;
                createExperimentTab(folderName, expId);
                createExperimentContent(folderName, experimentType, expId);
            });

            const firstTab = document.querySelector(`#experimentTabs .nav-link`);
            if (firstTab) {
                const tab = new bootstrap.Tab(firstTab);
                tab.show();
            }
        } catch (error) {
            console.error('Error al cargar los experimentos:', error);
            alert('Hubo un error al cargar los experimentos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    function createMainTab(experimentType) {
        const experimentTabs = document.getElementById('experimentTabs');
        const experimentTabsContent = document.getElementById('experimentTabsContent');

        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link active" id="main-tab" data-bs-toggle="tab" data-bs-target="#main" type="button" role="tab" aria-controls="main" aria-selected="true">
                Main
            </button>
        `;
        experimentTabs.appendChild(tabItem);

        const tabContent = document.createElement('div');
        tabContent.className = 'tab-pane fade show active';
        tabContent.id = 'main';
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', 'main-tab');

        fetchLocalJSON(`data/${experimentType}/main/config.json`)
            .then(config => {
                // Procesa y muestra la configuración
                // ...
            })
            .catch(error => {
                console.error('Error al cargar el contenido de la pestaña principal:', error);
                tabContent.innerHTML = '<p>Error al cargar la configuración principal.</p>';
            });

        experimentTabsContent.appendChild(tabContent);
    }

    function createExperimentTab(folderName, expId) {
        const experimentTabs = document.getElementById('experimentTabs');

        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link" id="exp${expId}-tab" data-bs-toggle="tab" data-bs-target="#exp${expId}" type="button" role="tab" aria-controls="exp${expId}" aria-selected="false">
                ${folderName}
            </button>
        `;
        experimentTabs.appendChild(tabItem);
    }

    function createExperimentContent(folderName, experimentType, expId) {
        const experimentTabsContent = document.getElementById('experimentTabsContent');
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-pane fade';
        tabContent.id = `exp${expId}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

        // Carga y muestra el contenido del experimento
        // ...

        experimentTabsContent.appendChild(tabContent);
    }

    loadMainFolders();
});
