document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';
    const githubToken = ''; // Agrega tu token de GitHub si decides usar autenticación

    // Función auxiliar para mostrar el indicador de carga
    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    // Función auxiliar para realizar solicitudes a la API de GitHub con autenticación opcional
    async function fetchFromGitHubAPI(url) {
        const headers = {};
        if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
        }
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Error de la API de GitHub: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    // Cargar las carpetas principales
    async function loadMainFolders() {
        try {
            showLoading(true);
            const folders = await fetchFromGitHubAPI(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data`);
            const sidebarMenu = document.getElementById('sidebarMenu');
            sidebarMenu.innerHTML = ''; // Limpiar contenido existente

            const mainFolders = folders.filter(folder => folder.type === 'dir');
            if (mainFolders.length === 0) {
                sidebarMenu.innerHTML = '<p>No se encontraron carpetas principales.</p>';
                return;
            }

            mainFolders.forEach((folder, index) => {
                const link = document.createElement('a');
                link.href = "#";
                link.className = "nav-link";
                link.textContent = folder.name;

                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    setActiveLink(link);
                    await loadExperimentSet(folder.name);
                });

                sidebarMenu.appendChild(link);
            });

            // Seleccionar y cargar la primera carpeta por defecto
            const firstLink = document.querySelector('#sidebarMenu .nav-link');
            setActiveLink(firstLink);
            await loadExperimentSet(mainFolders[0].name);
        } catch (error) {
            console.error('Error al cargar carpetas principales:', error);
            alert('Hubo un error al cargar las carpetas principales. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    // Resaltar el enlace activo en el menú lateral
    function setActiveLink(selectedLink) {
        document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.classList.remove('active'));
        selectedLink.classList.add('active');
    }

    // Cargar el conjunto de experimentos para el tipo seleccionado
    async function loadExperimentSet(experimentType) {
        try {
            showLoading(true);
            document.getElementById('experimentTabs').innerHTML = '';
            document.getElementById('experimentTabsContent').innerHTML = '';

            const data = await fetchFromGitHubAPI(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${experimentType}`);
            const experimentFolders = data.filter(item => item.type === 'dir');

            if (experimentFolders.length === 0) {
                document.getElementById('experimentTabsContent').innerHTML = '<p>No se encontraron experimentos.</p>';
                return;
            }

            for (let index = 0; index < experimentFolders.length; index++) {
                const folder = experimentFolders[index];
                const expId = index + 1;
                createExperimentTab(folder.name, expId);
                await createExperimentContent(folder.name, experimentType, expId);
            }
        } catch (error) {
            console.error('Error al cargar los experimentos:', error);
            alert('Hubo un error al cargar los experimentos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    // Crear una pestaña para cada experimento
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

    // Crear y cargar el contenido para cada experimento
    async function createExperimentContent(folderName, experimentType, expId) {
        try {
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane fade ${expId === 1 ? 'show active' : ''}`;
            tabContent.id = `exp${expId}`;
            tabContent.setAttribute('role', 'tabpanel');
            tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

            // Cargar el archivo config.json
            const config = await fetchGitHubFile(`data/${experimentType}/${folderName}/config.json`);

            // Construir el HTML para la descripción
            const descripcionHTML = `
                <div class="row mb-3">
                    <div class="col-12">
                        <h5>Descripción</h5>
                        <pre>${Object.entries(config.Descripcion).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                    </div>
                </div>
            `;

            // Construir el HTML para la configuración
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

            // Cargar la imagen del entorno
            const imagenEnvHTML = `
                <div class="card my-4">
                    <div class="card-body text-center">
                        <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/env.png" alt="Imagen de Entorno" class="img-fluid">
                    </div>
                </div>
            `;
            tabContent.innerHTML += imagenEnvHTML;

            // Cargar los datos del gráfico
            const chartsContainerId = `chartsContainer${expId}`;
            const chartsContainerHTML = `<div id="${chartsContainerId}" class="row my-4"></div>`;
            tabContent.innerHTML += chartsContainerHTML;

            await loadChartData(`data/${experimentType}/${folderName}/tensorflow.json`, chartsContainerId);

            // Cargar la imagen de resultados
            const imagenHTML = `
                <div class="card my-4">
                    <div class="card-header bg-secondary text-white">
                        <h2>Gráfica resultados del test del modelo aprendido</h2>
                    </div>
                    <div class="card-body text-center">
                        <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/pie_chart.png" alt="Pie Chart" class="img-fluid">
                    </div>
                </div>
            `;
            tabContent.innerHTML += imagenHTML;

            // Cargar los videos del experimento
            await loadExperimentVideos(folderName, experimentType, expId, tabContent);

            experimentTabsContent.appendChild(tabContent);
        } catch (error) {
            console.error('Error al cargar el contenido del experimento:', error);
            alert('Hubo un error al cargar el contenido del experimento. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    // Función para cargar un archivo JSON desde GitHub
    async function fetchGitHubFile(path) {
        try {
            const data = await fetchFromGitHubAPI(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`);
            if (data && data.encoding === 'base64') {
                const decodedContent = atob(data.content);
                return JSON.parse(decodedContent);
            } else {
                throw new Error('Archivo no encontrado o formato incorrecto');
            }
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
            throw error;
        }
    }

    // Función para cargar y mostrar los datos del gráfico
    async function loadChartData(jsonPath, containerId) {
        try {
            const data = await fetchFromGitHubAPI(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${jsonPath}`);
            if (data && data.content) {
                const decodedData = JSON.parse(atob(data.content));
                const container = document.getElementById(containerId);
                container.innerHTML = '';

                let index = 0;
                for (const key in decodedData) {
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
                    index++;
                }
            } else {
                console.error('Datos JSON no encontrados o malformados');
            }
        } catch (error) {
            console.error('Error al cargar los datos del gráfico:', error);
        }
    }

    // Función para cargar y mostrar los videos del experimento
    async function loadExperimentVideos(folderName, experimentType, expId, tabContent) {
        try {
            const files = await fetchFromGitHubAPI(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${experimentType}/${folderName}`);
            const videos = files.filter(file => /^\d+\.mp4$/.test(file.name));

            if (videos.length === 0) {
                return; // No hay videos para mostrar
            }

            const videoListHTML = videos.map((video) => `
                <a href="#" class="btn btn-outline-primary btn-sm m-1 video-link" data-video-src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/${video.name}">
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
                                <source src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/${videos[0].name}" type="video/mp4">
                                Tu navegador no soporta la etiqueta de video.
                            </video>
                        </div>
                    </div>
                </div>
            `;

            tabContent.innerHTML += videosHTML;

            // Añadir manejadores de eventos a los enlaces de video
            const videoLinks = tabContent.querySelectorAll(`#videoList${expId} .video-link`);
            videoLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const videoSrc = link.getAttribute('data-video-src');
                    const mainVideo = tabContent.querySelector(`#mainVideo${expId}`);
                    mainVideo.src = videoSrc;
                    mainVideo.play();
                });
            });
        } catch (error) {
            console.error('Error al cargar los videos:', error);
        }
    }

    // Iniciar la aplicación
    loadMainFolders();
});
