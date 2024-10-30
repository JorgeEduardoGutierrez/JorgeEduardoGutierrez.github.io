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
                const imagenHTML = `
                    <div id="chartsContainer${expId}" class="row my-4"></div>
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Gráfica de Avance</h2>
                        </div>
                        <div class="card-body text-center">
                            <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${folderName}/pie_chart.png" alt="Pie Chart" class="img-fluid">
                        </div>
                    </div>
                `;
                tabContent.innerHTML += imagenHTML;

                // Listar y cargar videos
                fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${folderName}`)
                    .then(response => response.json())
                    .then(files => {
                        const videos = files.filter(file => /^\d+\.mp4$/.test(file.name));
                        const videoListHTML = videos.map((video, idx) => `
                            <a href="#" class="btn btn-outline-primary btn-sm m-1" onclick="document.getElementById('mainVideo${expId}').src='https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${folderName}/${video.name}'">
                                ${video.name}
                            </a>
                        `).join('');
                        const videosHTML = `
                            <div class="card my-4">
                                <div class="card-header bg-secondary text-white">
                                    <h2>Videos del Experimento</h2>
                                </div>
                                <div class="card-body">
                                    <div id="videoList${expId}" class="mb-3">${videoListHTML}</div>
                                    <div class="ratio ratio-16x9">
                                        <video id="mainVideo${expId}" controls>
                                            ${videos.length > 0 ? `<source src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${folderName}/${videos[0].name}" type="video/mp4">` : ''}
                                            Tu navegador no soporta la etiqueta de video.
                                        </video>
                                    </div>
                                </div>
                            </div>
                        `;
                        tabContent.innerHTML += videosHTML;
                    });

                experimentTabsContent.appendChild(tabContent);
            });
    }

    // Cargar datos de gráficos en dos columnas
    function loadChartData(jsonPath, containerId) {
        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${jsonPath}`)
            .then(response => response.json())
            .then(data => {
                const decodedData = JSON.parse(atob(data.content));
                const container = document.getElementById(containerId);
                container.innerHTML = '';

                Object.keys(decodedData).forEach((key, index) => {
                    const chartWrapper = document.createElement('div');
                    chartWrapper.className = 'col-md-6 mb-4'; // Dos columnas
                    const chartCanvas = document.createElement('canvas');
                    chartCanvas.id = `${containerId}_${index}`;
                    chartWrapper.appendChild(chartCanvas);
                    container.appendChild(chartWrapper);

                    new Chart(chartCanvas.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: Array.from({ length: decodedData[key].length }, (_, i) => i + 1),
                            datasets: [{
                                label: key.replace(/_/g, ' '),
                                data: decodedData[key],
                                borderColor: `hsl(${index * 50 % 360}, 70%, 50%)`,
                                fill: false
                            }]
                        },
                        options: { responsive: true }
                    });
                });
            })
            .catch(error => console.error('Error al cargar los datos del gráfico:', error));
    }

    fetchExperiments();
});
