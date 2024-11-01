document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';

    document.addEventListener('DOMContentLoaded', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    document.body.appendChild(testContainer); // Agrega el contenedor de prueba al final del body

    const testCanvas = document.createElement('canvas');
    testContainer.appendChild(testCanvas); // Agrega el canvas de prueba al contenedor

    new Chart(testCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: [1, 2, 3, 4, 5],
            datasets: [{
                label: 'Gráfico de Prueba',
                data: [1, 2, 3, 2, 1],
                borderColor: 'rgb(75, 192, 192)',
                fill: false
            }]
        },
        options: { responsive: true }
    });
});

    // Función para mostrar/ocultar el indicador de carga
    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    // Función para solicitar datos desde la API de GitHub sin autenticación
    async function fetchFromGitHubAPI(path) {
        const url = `https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error de GitHub API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al realizar la solicitud a la API de GitHub:', error);
            throw error;
        }
    }

    // Carga las carpetas principales desde GitHub y las agrega al menú lateral
    async function loadMainFolders() {
        try {
            showLoading(true);
            const folders = await fetchFromGitHubAPI('data');
            const sidebarMenu = document.getElementById('sidebarMenu');
            sidebarMenu.innerHTML = ''; // Limpiar contenido existente

            const mainFolders = folders.filter(folder => folder.type === 'dir');
            mainFolders.forEach(folder => {
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

            // Seleccionar y cargar la primera carpeta por defecto
            if (mainFolders.length > 0) {
                const firstLink = document.querySelector('#sidebarMenu .nav-link');
                setActiveLink(firstLink);
                await loadExperimentSet(mainFolders[0].name);
            }
        } catch (error) {
            console.error('Error al cargar carpetas principales:', error);
            alert('Hubo un error al cargar las carpetas principales. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    // Resalta el enlace activo en el menú lateral
    function setActiveLink(selectedLink) {
        const links = document.querySelectorAll('#sidebarMenu .nav-link');
        links.forEach(link => link.classList.remove('active'));
        selectedLink.classList.add('active');
    }

    // Carga el conjunto de experimentos para un tipo de experimento específico
    async function loadExperimentSet(experimentType) {
        try {
            showLoading(true);
            const experimentTabs = document.getElementById('experimentTabs');
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            experimentTabs.innerHTML = '';
            experimentTabsContent.innerHTML = '';

            const data = await fetchFromGitHubAPI(`data/${experimentType}`);
            const experimentFolders = data.filter(item => item.type === 'dir');

            experimentFolders.forEach((folder, index) => {
                const expId = index + 1;
                createExperimentTab(folder.name, expId);
                createExperimentContent(folder.name, experimentType, expId);
            });

            // Activar la primera pestaña por defecto
            const firstTab = document.querySelector('#experimentTabs .nav-link');
            if (firstTab) {
                firstTab.classList.add('active');
                const firstTabContent = document.querySelector('#experimentTabsContent .tab-pane');
                if (firstTabContent) {
                    firstTabContent.classList.add('show', 'active');
                }
            }
        } catch (error) {
            console.error('Error al cargar los experimentos:', error);
            alert('Hubo un error al cargar los experimentos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    // Crea una pestaña para un experimento
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

    // Crea y carga el contenido para un experimento específico
    async function createExperimentContent(folderName, experimentType, expId) {
        try {
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane fade`;
            tabContent.id = `exp${expId}`;
            tabContent.setAttribute('role', 'tabpanel');
            tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

            // Cargar el archivo config.json
            const config = await fetchGitHubFile(`data/${experimentType}/${folderName}/config.json`);
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

            // Cargar la imagen del entorno
            const imagenEnvHTML = `
                <div class="card my-4">
                    <div class="card-body text-center">
                        <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/env.png" alt="Imagen de Entorno" class="img-fluid">
                    </div>
                </div>
            `;
            tabContent.innerHTML += imagenEnvHTML;

            // Crear el contenedor para los gráficos antes de llamar a loadChartData
            const chartsContainerId = `chartsContainer${expId}`;
            const chartsContainerHTML = `<div id="${chartsContainerId}" class="row my-4"></div>`;
            tabContent.innerHTML += chartsContainerHTML;

            // Añadir el contenido de la pestaña al DOM antes de cargar los gráficos
            experimentTabsContent.appendChild(tabContent);

            // Cargar los datos del gráfico
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
        } catch (error) {
            console.error('Error al cargar el contenido del experimento:', error);
            alert('Hubo un error al cargar el contenido del experimento. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    // Carga un archivo JSON desde GitHub
    async function fetchGitHubFile(path) {
        const data = await fetchFromGitHubAPI(path);
        if (data && data.content) {
            return JSON.parse(atob(data.content));
        } else {
            throw new Error('Archivo no encontrado o formato incorrecto');
        }
    }

async function loadChartData(jsonPath, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Contenedor con ID ${containerId} no encontrado en el DOM.`);
            return;
        }

        const decodedData = await fetchGitHubFile(jsonPath);
        console.log("Datos del gráfico cargados:", decodedData); // Verifica el contenido de los datos

        container.innerHTML = ''; // Limpiar el contenedor de gráficos

        let index = 0;
        for (const key in decodedData) {
            const chartWrapper = document.createElement('div');
            chartWrapper.className = 'col-md-6 mb-4';
            const chartCanvas = document.createElement('canvas');
            chartCanvas.id = `${containerId}_${index}`;
            chartWrapper.appendChild(chartCanvas);
            container.appendChild(chartWrapper);

            console.log(`Creando gráfica para "${key}" con datos:`, decodedData[key]); // Log para cada gráfica

            const chart = new Chart(chartCanvas.getContext('2d'), {
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
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            suggestedMin: Math.min(...decodedData[key]) - 1,
                            suggestedMax: Math.max(...decodedData[key]) + 1
                        }
                    }
                }
            });

            chart.update(); // Forzar la actualización del gráfico
            index++;
        }

        // Agregar gráfico de prueba al final del contenedor para verificar que Chart.js funcione
        const testCanvas = document.createElement('canvas');
        container.appendChild(testCanvas); // Agrega el canvas de prueba al contenedor
        new Chart(testCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [1, 2, 3, 4, 5],
                datasets: [{
                    label: 'Gráfico de Prueba',
                    data: [1, 2, 3, 2, 1],
                    borderColor: 'rgb(75, 192, 192)',
                    fill: false
                }]
            },
            options: { responsive: true }
        });
    } catch (error) {
        console.error('Error al cargar los datos del gráfico:', error);
    }
}

    // Carga y muestra los videos del experimento
    async function loadExperimentVideos(folderName, experimentType, expId, tabContent) {
        try {
            const files = await fetchFromGitHubAPI(`data/${experimentType}/${folderName}`);
            const videos = files.filter(file => /^\d+\.mp4$/.test(file.name));

            if (videos.length === 0) return;

            const videoListHTML = videos.map(video => `
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

            const videoLinks = tabContent.querySelectorAll(`#videoList${expId} .video-link`);
            videoLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const videoSrc = link.getAttribute('data-video-src');
                    const mainVideo = tabContent.querySelector(`#mainVideo${expId}`);
                    if (mainVideo) {
                        mainVideo.src = videoSrc;
                        mainVideo.play();
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar los videos:', error);
        }
    }

    loadMainFolders();
});
