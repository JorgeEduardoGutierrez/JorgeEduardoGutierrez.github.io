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
            const mainFolder = data.find(item => item.type === 'dir' && item.name === 'main');
            const experimentFolders = data.filter(item => item.type === 'dir' && item.name !== 'main');
    
            // Cargar contenido de 'main' si existe
            if (mainFolder) {
                createMainTab(experimentType);
            }
    
            // Cargar otros experimentos
            if (experimentFolders.length === 0) {
                experimentTabsContent.innerHTML = '<p>No hay experimentos disponibles.</p>';
                return;
            }
    
            experimentFolders.forEach((folder, index) => {
                const expId = index + 1;
                const isActive = index === 0 && !mainFolder; // La primera pestaña activa, salvo que exista 'main'
                createExperimentTab(folder.name, expId, isActive);
                createExperimentContent(folder.name, experimentType, expId, isActive);
            });
    
            // Activar la pestaña Main si existe, o la primera de los experimentos
            if (document.querySelector(`#main-tab`)) {
                const mainTab = document.querySelector(`#main-tab`);
                const tab = new bootstrap.Tab(mainTab);
                tab.show();
            } else if (document.querySelector(`#exp1-tab`)) {
                const firstTabButton = document.querySelector(`#exp1-tab`);
                const tab = new bootstrap.Tab(firstTabButton);
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
    
        // Crear la pestaña
        const tabItem = document.createElement('li');
        tabItem.className = 'nav-item';
        tabItem.innerHTML = `
            <button class="nav-link active" id="main-tab" data-bs-toggle="tab" data-bs-target="#main" type="button" role="tab" aria-controls="main" aria-selected="true">
                Main
            </button>
        `;
        experimentTabs.appendChild(tabItem);
    
        // Crear el contenido de la pestaña
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-pane fade show active';
        tabContent.id = 'main';
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', 'main-tab');
    
        fetchGitHubFile(`data/${experimentType}/main/config.json`)
            .then(config => {
                // Agregar Descripción, Entrenamiento y Test
                const descripcionHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Descripción</h2>
                        </div>
                        <div class="card-body">
                            <pre>${Object.entries(config.Descripcion).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                        </div>
                    </div>
                `;
                const entrenamientoHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Entrenamiento</h2>
                        </div>
                        <div class="card-body">
                            <pre>${Object.entries(config.Entrenamiento).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                        </div>
                    </div>
                `;
                const testHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Test</h2>
                        </div>
                        <div class="card-body">
                            <pre>${Object.entries(config.Test).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                        </div>
                    </div>
                `;
    
                // Agregar el primer gráfico (Training Statistics)
                const trainingHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-primary text-white">
                            <h2>Training Statistics</h2>
                        </div>
                        <div class="card-body text-center">
                            <iframe src="data/${experimentType}/main/plotly_tensorboard.html" width="100%" height="600" frameborder="0"></iframe>
                        </div>
                    </div>
                `;
    
                // Agregar el segundo gráfico (Test Results)
                const testResultsHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-success text-white">
                            <h2>Test Results</h2>
                        </div>
                        <div class="card-body text-center">
                            <iframe src="data/${experimentType}/main/plotly_results.html" width="100%" height="600" frameborder="0"></iframe>
                        </div>
                    </div>
                `;
    
                // Unir todo el contenido
                tabContent.innerHTML = descripcionHTML + entrenamientoHTML + testHTML + trainingHTML + testResultsHTML;
            })
            .catch(error => {
                console.error('Error al cargar el contenido de la pestaña principal:', error);
                tabContent.innerHTML = '<p>Error al cargar la configuración principal.</p>';
            });
    
        experimentTabsContent.appendChild(tabContent);
    }


    async function loadPlotlyChart(jsonPath, containerId) {
        try {
            const data = await fetchGitHubFile(jsonPath); // Obtener datos desde GitHub
            const container = document.getElementById(containerId);
    
            if (!container) {
                console.error(`Contenedor ${containerId} no encontrado.`);
                return;
            }
    
            // Crear trazas para el gráfico
            const traces = Object.keys(data).map(metric => ({
                x: data[metric].indices,
                y: data[metric].values,
                mode: 'lines',
                name: metric
            }));
    
            // Renderizar el gráfico
            Plotly.newPlot(containerId, traces, {
                title: 'Gráfica Interactiva',
                xaxis: { title: 'Iteración' },
                yaxis: { title: 'Valores' }
            });
        } catch (error) {
            console.error('Error al cargar el gráfico de Plotly:', error);
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
    
            // Subir la sección de videos
            const videoSectionHTML = `
                <div class="card my-4">
                    <div class="card-header bg-secondary text-white">
                        <h2>Videos del Experimento</h2>
                    </div>
                    <div class="card-body">
                        <div id="videoList${expId}" class="mb-3"></div>
                        <div class="ratio ratio-16x9">
                            <video id="mainVideo${expId}" controls>
                                <!-- Video dinámico -->
                            </video>
                        </div>
                    </div>
                </div>
            `;
            tabContent.innerHTML += videoSectionHTML;
    
            // Cargar videos dinámicamente
            const files = await fetchFromGitHubAPI(`data/${experimentType}/${folderName}`);
            const videos = files.filter(file => file.name.endsWith('.mp4'));
    
            const videoList = tabContent.querySelector(`#videoList${expId}`);
            const mainVideo = tabContent.querySelector(`#mainVideo${expId}`);
    
            if (videos.length > 0) {
                videos.forEach((video, index) => {
                    const videoButton = document.createElement('button');
                    videoButton.className = 'btn btn-outline-primary btn-sm m-1';
                    videoButton.textContent = video.name;
                    videoButton.addEventListener('click', () => {
                        mainVideo.src = `data/${experimentType}/${folderName}/${video.name}`;
                        mainVideo.play();
                    });
                    videoList.appendChild(videoButton);
    
                    // Establecer el primer video como predeterminado
                    if (index === 0) {
                        mainVideo.src = `data/${experimentType}/${folderName}/${video.name}`;
                    }
                });
            } else {
                videoList.innerHTML = '<p>No hay videos disponibles para este experimento.</p>';
            }
    
            // Mostrar la segunda imagen (gráfica de resultados)
            const testResultsHTML = `
                <div class="card my-4">
                    <div class="card-header bg-success text-white">
                        <h2>Gráfica de Resultados</h2>
                    </div>
                    <div class="card-body text-center">
                        <img src="data/${experimentType}/${folderName}/pie_chart.png" alt="Gráfica de Resultados" class="img-fluid">
                    </div>
                </div>
            `;
            tabContent.innerHTML += testResultsHTML;
    
            // Cargar el gráfico interactivo desde plotly_tensorboard.html
            const plotlyHTML = `
                <div class="card my-4">
                    <div class="card-header bg-primary text-white">
                        <h2>Training Statistics</h2>
                    </div>
                    <div class="card-body text-center">
                        <iframe src="data/${experimentType}/${folderName}/plotly_tensorboard.html" width="100%" height="600" frameborder="0"></iframe>
                    </div>
                </div>
            `;
            tabContent.innerHTML += plotlyHTML;
    
            experimentTabsContent.appendChild(tabContent);
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
                const decodedContent = atob(data.content.replace(/\s/g, '')); // Eliminar espacios en blanco
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
            if (!data || Object.keys(data).length === 0) {
                console.warn(`No se encontraron datos en ${jsonPath}.`);
                container.innerHTML = '<p>No hay datos disponibles para mostrar los gráficos.</p>';
                return;
            }

            // Crea los gráficos para cada métrica
            const metrics = Object.keys(data);

            metrics.forEach((metric, index) => {
                const canvasId = `chartCanvas${containerId}_${index}`;
                
                // Crear la columna para el gráfico
                const colDiv = document.createElement('div');
                colDiv.className = 'col-md-6 mb-4 custom-chart-col'; // Usar clase personalizada

                // Crear el contenedor del gráfico
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';

                // Crear el canvas
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                chartContainer.appendChild(canvas);
                colDiv.appendChild(chartContainer);
                container.appendChild(colDiv);

                // Inicializar el gráfico después de asegurarse de que el canvas esté visible
                setTimeout(() => {
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        console.error(`No se pudo obtener el contexto para el canvas ${canvasId}.`);
                        return;
                    }

                    // const labels = data[metric].map((_, idx) => `Punto ${idx + 1}`);
                    // const chartData = {
                    //     labels: labels,
                    //     datasets: [{
                    //         label: metric,
                    //         data: data[metric],
                    //         borderColor: 'rgb(75, 192, 192)',
                    //         backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    //         fill: true,
                    //         tension: 0.1
                    //     }]
                    // };

                    const indices = data[metric].indices; // Tomar los índices originales
                    const values = data[metric].values;
    
                    const chartData = {
                        labels: indices,
                        datasets: [{
                            label: metric,
                            data: values,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.1
                        }]
                    };

                    new Chart(ctx, {
                        type: 'line',
                        data: chartData,
                        options: { 
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: `Evolución de ${metric}`
                                }
                            },
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Iteración'
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: metric
                                    },
                                    beginAtZero: true
                                }
                            }
                        }
                    });

                    console.log(`Gráfico creado: ${canvasId}`);
                }, 100); // Retraso de 100ms para asegurar que el canvas esté visible
            });
        } catch (error) {
            console.error('Error en loadChartData:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<p>Error al cargar los datos del gráfico.</p>';
            }
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
