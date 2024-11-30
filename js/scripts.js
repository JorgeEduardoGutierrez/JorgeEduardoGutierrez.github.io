document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';

    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    async function fetchFromGitHubAPI(path) {
        const url = `https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al obtener datos de GitHub API: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en fetchFromGitHubAPI:', error);
            throw error;
        }
    }

    async function loadMainFolders() {
        try {
            const experimentLinks = document.getElementById('experimentLinks');
            experimentLinks.innerHTML = '';

            // Obtener los tipos de experimentos (carpetas principales)
            const mainFolders = await fetchFromGitHubAPI('data');
            const experimentTypes = mainFolders.filter(item => item.type === 'dir').map(item => item.name);

            // Generar enlaces para cada tipo de experimento
            experimentTypes.forEach((type, index) => {
                const link = document.createElement('a');
                link.href = '#';
                link.className = 'list-group-item list-group-item-action';
                link.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    setActiveLink(link);
                    loadExperimentSet(type);
                });
                experimentLinks.appendChild(link);

                // Cargar el primer tipo de experimento por defecto
                if (index === 0) {
                    setActiveLink(link);
                    loadExperimentSet(type);
                }
            });
        } catch (error) {
            console.error('Error al cargar las carpetas principales:', error);
        }
    }

    function setActiveLink(selectedLink) {
        const links = document.querySelectorAll('#experimentLinks a');
        links.forEach(link => {
            link.classList.remove('active');
        });
        selectedLink.classList.add('active');
    }

    async function loadExperimentSet(experimentType) {
        try {
            showLoading(true);

            const experimentTabs = document.getElementById('experimentTabs');
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            experimentTabs.innerHTML = '';
            experimentTabsContent.innerHTML = '';

            // Obtener las carpetas de experimentos dentro del tipo seleccionado
            const experimentFolders = await fetchFromGitHubAPI(`data/${experimentType}`);
            const experiments = experimentFolders.filter(item => item.type === 'dir').map(item => item.name);

            experiments.forEach((folderName, index) => {
                const isActive = index === 0;
                createExperimentTab(folderName, index, isActive);
                createExperimentContent(folderName, experimentType, index, isActive);
            });

            showLoading(false);
        } catch (error) {
            console.error('Error al cargar el conjunto de experimentos:', error);
            showLoading(false);
        }
    }

    function createExperimentTab(folderName, expId, isActive) {
        const experimentTabs = document.getElementById('experimentTabs');

        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.setAttribute('role', 'presentation');

        const button = document.createElement('button');
        button.className = `nav-link ${isActive ? 'active' : ''}`;
        button.id = `exp${expId}-tab`;
        button.setAttribute('data-bs-toggle', 'tab');
        button.setAttribute('data-bs-target', `#exp${expId}`);
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `exp${expId}`);
        button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        button.textContent = folderName;

        tab.appendChild(button);
        experimentTabs.appendChild(tab);
    }

    async function createExperimentContent(folderName, experimentType, expId, isActive) {
        try {
            const rawBaseURL = `https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main`;

            const experimentTabsContent = document.getElementById('experimentTabsContent');
            const tabContent = document.createElement('div');
         
