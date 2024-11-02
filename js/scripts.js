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
                throw new Error(`Error de GitHub API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al realizar la solicitud a la API de GitHub:', error);
            throw error;
        }
    }

    async function loadMainFolders() {
        try {
            showLoading(true);
            const folders = await fetchFromGitHubAPI('data');
            const sidebarMenu = document.getElementById('sidebarMenu');
            sidebarMenu.innerHTML = '';

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

            const data = await fetchFromGitHubAPI(`data/${experimentType}`);
            const experimentFolders = data.filter(item => item.type === 'dir');

            experimentFolders.forEach((folder, index) => {
                const expId = index + 1;
                const isActive = index === 0; // La primera pestaña es la activa
                createExperimentTab(folder.name, expId, isActive);
                createExperimentContent(folder.name, experimentType, expId, isActive);
            });
        } catch (error) {
            console.error('Error al cargar los experimentos:', error);
            alert('Hubo un error al cargar los experimentos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            showLoading(false);
        }
    }

    function createExperimentTab(folderName, expId, isActive) {
        const experimentTabs = document.getElementById('experimentTabs');
        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link ${isActive ? 'active' : ''}" id="exp${expId}-tab" data-bs-toggle="tab" data-bs-target="#exp${expId}" type="button" role="tab" aria-controls="exp${expId}" aria-selected="${isActive ? 'true' : 'false'}">
                ${folderName}
            </button>
        `;
        experimentTabs.appendChild(tabItem);
    }

    async function createExperimentContent(folderName, experimentType, expId, isActive) {
        try {
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            const tabContent = document.createElement('div');
            tabContent.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            tabContent.id = `exp${expId}`;
            tabContent.setAttribute('role', 'tabpanel');
            tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

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

            const imagenEnvHTML = `
                <div class="card my-4">
                    <div class="card-body text-center">
                        <img src="https://raw.githubusercontent.com/${githubUsername}/${repositoryName}/main/data/${experimentType}/${folderName}/env.png" alt="Imagen de Entorno" class="img-fluid">
                    </div>
                </div>
            `;
            tabContent.innerHTML += imagenEnvHTML;

            const chartsContainerId = `chartsContainer${expId}`;
            const chartsContainerHTML = `<div id="${chartsContainerId}" class="row my-4"></div>`;
            tabContent.innerHTML += chartsContainerHTML;

            experimentTabsContent.appendChild(tabContent);

            // Agrega el event listener para cargar los gráficos cuando la pestaña se muestre
            const tabButton = document.querySelector(`#exp${expId}-tab`);
            if (tabButton) {
                tabButton.addEventListener('shown.bs.tab', function(event) {
                    loadChartData(`data/${experimentType}/${folderName}/tensorflow.json`, chartsContainerId);
                });
            }

            // Si la pestaña es activa, carga los gráficos inmediatamente
            if (isActive) {
                loadChartData(`data/${experimentType}/${folderName}/tensorflow.json`, chartsContainerId);
            }

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

            await loadExperimentVideos(folderName, experimentType, expId, tabContent);
        } catch (error) {
            console.error('Error al cargar el contenido del experimento:', error);
            alert('Hubo un error al cargar el contenido del experimento. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    async function fetchGitHubFile(path) {
        const url = `https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.content) {
                const decodedContent = atob(data.content);
                return JSON.parse(decodedContent);
            }
            throw new Error('Contenido vacío o formato incorrecto');
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
            throw error;
        }
    }

    async function loadChartData(jsonPath, containerId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Contenedor con ID ${containerId} no encontrado en el DOM.`);
                return;
            }

            // Limpia el contenedor
            container.innerHTML = '';

            // Carga los datos del archivo JSON
            const data = await fetchGitHubFile(jsonPath);

            // Crea los gráficos para cada métrica
            const metrics = Object.keys(data);

            metrics.forEach((metric, index) => {
                const canvasId = `chartCanvas${containerId}_${index}`;
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                canvas.className = 'col-md-6';
                container.appendChild(canvas);

                const labels = data[metric].map((_, idx) => idx + 1);
                const chartData = {
                    labels: labels,
                    datasets: [{
                        label: metric,
                        data: data[metric],
                        borderColor: 'rgb(75, 192, 192)',
                        fill: false
                    }]
                };

                new Chart(canvas.getContext('2d'), {
                    type: 'line',
                    data: chartData,
                    options: { responsive: true }
                });
            });
        } catch (error) {
            console.error('Error en loadChartData:', error);
        }
    }

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
