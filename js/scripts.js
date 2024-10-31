document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';

    function loadMainFolders() {
        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data`)
            .then(response => response.json())
            .then(folders => {
                folders
                    .filter(folder => folder.type === 'dir')
                    .forEach(folder => {
                        const sidebarMenu = document.getElementById('sidebarMenu');
                        const link = document.createElement('a');
                        link.href = "#";
                        link.className = "nav-link";
                        link.textContent = folder.name;

                        // Añadir evento para resaltar el enlace seleccionado y cargar los experimentos
                        link.onclick = (e) => {
                            e.preventDefault();
                            setActiveLink(link);  // Resalta el enlace seleccionado
                            loadExperimentSet(folder.name);  // Carga las pestañas de experimentos
                        };

                        sidebarMenu.appendChild(link);
                    });

                if (folders.length > 0) {
                    // Resaltar el primer enlace y cargar sus experimentos al inicio
                    const firstLink = document.querySelector('#sidebarMenu .nav-link');
                    setActiveLink(firstLink);
                    loadExperimentSet(folders[0].name);
                }
            })
            .catch(error => console.error('Error al cargar carpetas principales:', error));
    }

    function setActiveLink(selectedLink) {
        // Quitar la clase active de todos los enlaces
        document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.classList.remove('active'));
        // Añadir la clase active al enlace seleccionado
        selectedLink.classList.add('active');
    }

    function loadExperimentSet(experimentType) {
        // Limpiar pestañas y contenido actual
        document.getElementById('experimentTabs').innerHTML = '';
        document.getElementById('experimentTabsContent').innerHTML = '';

        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${experimentType}`)
            .then(response => response.json())
            .then(data => {
                const experimentFolders = data.filter(item => item.type === 'dir');
                experimentFolders.forEach((folder, index) => {
                    const expId = index + 1;
                    createExperimentTab(folder.name, expId);
                    createExperimentContent(folder.name, experimentType, expId);
                });
            })
            .catch(error => console.error('Error al cargar los experimentos:', error));
    }

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

    function createExperimentContent(folderName, experimentType, expId) {
        const experimentTabsContent = document.getElementById('experimentTabsContent');
        const tabContent = document.createElement('div');
        tabContent.className = `tab-pane fade ${expId === 1 ? 'show active' : ''}`;
        tabContent.id = `exp${expId}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

        // Cargar el archivo config.json de la carpeta específica
        fetchGitHubFile(`data/${experimentType}/${folderName}/config.json`)
            .then(config => {
                const descripcionHTML = `
                    <div class="row mb-3">
                        <div class="col-12">
                            <h5>Descripción</h5>
                            <pre>${Object.entries(config.Descripcion).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                        </div>
                    </div>
                `;
                
                const configuracionHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Configuración del Entorno</h2>
                        </div>
                        <div class="card-body">
                            ${descripcionHTML}
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
                tabContent.innerHTML = configuracionHTML;

                const imagenEnvHTML = `
                    <div class="card my-4">
                        <div class="card-body text-center">
                            <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/env.png" alt="Imagen de Entorno" class="img-fluid">
                        </div>
                    </div>
                `;
                tabContent.innerHTML += imagenEnvHTML;

                loadChartData(`data/${experimentType}/${folderName}/tensorflow.json`, `chartsContainer${expId}`);
                const imagenHTML = `
                    <div id="chartsContainer${expId}" class="row my-4"></div>
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Gráfica de Avance</h2>
                        </div>
                        <div class="card-body text-center">
                            <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/pie_chart.png" alt="Pie Chart" class="img-fluid">
                        </div>
                    </div>
                `;
                tabContent.innerHTML += imagenHTML;

                fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${experimentType}/${folderName}`)
                    .then(response => response.json())
                    .then(files => {
                        const videos = files.filter(file => /^\d+\.mp4$/.test(file.name));
                        const videoListHTML = videos.map((video, idx) => `
                            <a href="#" class="btn btn-outline-primary btn-sm m-1" onclick="event.preventDefault(); document.getElementById('mainVideo${expId}').src='https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/${video.name}'; document.getElementById('mainVideo${expId}').play()">
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
                                            ${videos.length > 0 ? `<source src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/${videos[0].name}" type="video/mp4">` : ''}
                                            Tu navegador no soporta la etiqueta de video.
                                        </video>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        tabContent.innerHTML += videosHTML;
                    })
                    .catch(error => console.error('Error al cargar los videos:', error));

                experimentTabsContent.appendChild(tabContent);
            });
    }

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

    function loadChartData(jsonPath, containerId) {
        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${jsonPath}`)
            .then(response => response.json())
            .then(data => {
                const decodedData = JSON.parse(atob(data.content));
                const container = document.getElementById(containerId);
                container.innerHTML = '';

                Object.keys(decodedData).forEach((key, index) => {
                    const chartWrapper = document.createElement('div');
                    chartWrapper.className = 'col-md-6 mb-4';
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

    loadMainFolders();
});
