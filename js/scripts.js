document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';

    // Función para obtener el contenido de un archivo en GitHub
    function fetchGitHubFile(path) {
        return fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`)
            .then(response => response.json())
            .then(data => {
                if (data.encoding === 'base64') {
                    return JSON.parse(atob(data.content));
                }
                throw new Error('Error al decodificar el archivo');
            });
    }

    // Función para listar las carpetas de experimentos
    function fetchExperiments() {
        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data`)
            .then(response => response.json())
            .then(data => {
                const experimentFolders = data.filter(item => item.type === 'dir');
                experimentFolders.forEach((folder, index) => {
                    const expId = index + 1;
                    createExperimentTab(folder.name, expId);
                    createExperimentContent(folder.name, expId);
                });
            })
            .catch(error => console.error('Error al cargar los experimentos:', error));
    }

    // Crear pestañas dinámicas para cada experimento
    function createExperimentTab(folderName, expId) {
        const experimentTabs = document.getElementById('experimentTabs');
        const tab = document.createElement('li');
        tab.className = 'nav-item';
        tab.innerHTML = `
            <button class="nav-link ${expId === 1 ? 'active' : ''}" id="exp${expId}-tab" data-bs-toggle="tab" data-bs-target="#exp${expId}" type="button" role="tab" aria-controls="exp${expId}" aria-selected="${expId === 1}">
                ${folderName}
            </button>
        `;
        experimentTabs.appendChild(tab);
    }

    // Crear contenido de cada pestaña de experimento
    function createExperimentContent(folderName, expId) {
        const experimentTabsContent = document.getElementById('experimentTabsContent');
        const tabContent = document.createElement('div');
        tabContent.className = `tab-pane fade ${expId === 1 ? 'show active' : ''}`;
        tabContent.id = `exp${expId}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

        // Obtener config.json para configurar la sección de entorno
        fetchGitHubFile(`data/${folderName}/config.json`)
            .then(config => {
                const descripcionHTML = `<p class="mt-4">${config.Descripcion}</p>`;
                const configuracionHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Configuración del Entorno</h2>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Entrenamiento</h5>
                                    <pre>${Object.entries(config.Entrenamiento).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                                </div>
                                <div class="col-md-6">
                                    <h5>Test</h5>
                                    <pre>${Object.entries(config.Test).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                tabContent.innerHTML = descripcionHTML + configuracionHTML;

                // Cargar gráficas e imagen
                loadChartData(`data/${folderName}/tensorflow.json`, `chartsContainer${expId}`);


