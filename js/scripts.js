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
            if (response.status === 403) {
                const resetTime = response.headers.get('X-RateLimit-Reset');
                const remaining = response.headers.get('X-RateLimit-Remaining');
                console.error(`Límite de tasa alcanzado. Intenta de nuevo después de ${new Date(resetTime * 1000).toLocaleTimeString()}.`);
                throw new Error('Límite de tasa alcanzado.');
            }
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
            tabContent.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
            tabContent.id = `exp${expId}`;
            tabContent.setAttribute('role', 'tabpanel');
            tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

            // Sección de videos
            const videoSectionHTML = `
                <div class="card my-4">
                    <div class="card-header bg-secondary text-white">
                        <h2>Videos del Experimento</h2>
                    </div>
                    <div class="card-body">
                        <div id="videoList${expId}" class="mb-3"></div>
                        <div class="ratio ratio-16x9">
                            <video id="mainVideo${expId}" controls>
                                <source src="" type="video/mp4">
                                Tu navegador no soporta la etiqueta de video.
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
                    const videoButton = document.createElement('a');
                    videoButton.href = "#";
                    videoButton.className = 'btn btn-outline-primary btn-sm m-1 video-link';
                    videoButton.textContent = video.name;
                    videoButton.dataset.videoSrc = `${rawBaseURL}/data/${experimentType}/${folderName}/${video.name}`;

                    videoButton.addEventListener('click', (event) => {
                        event.preventDefault();
                        const videoSrc = videoButton.dataset.videoSrc;
                        if (mainVideo) {
                            const sourceElement = mainVideo.querySelector('source');
                            if (sourceElement) {
                                sourceElement.src = videoSrc;
                                mainVideo.load(); // Recargar el video
                                mainVideo.play(); // Reproducir automáticamente
                            }
                        }
                    });

                    videoList.appendChild(videoButton);

                    // Cargar el primer video como predeterminado
                    if (index === 0 && mainVideo) {
                        const sourceElement = mainVideo.querySelector('source');
                        if (sourceElement) {
                            sourceElement.src = `${rawBaseURL}/data/${experimentType}/${folderName}/${video.name}`;
                            mainVideo.load();
                        }
                    }
                });
            } else {
                videoList.innerHTML = '<p>No hay videos disponibles para este experimento.</p>';
            }

            // Mostrar el gráfico interactivo (Pie Chart)
            const pieChartHTML = `
                <div class="card my-4">
                    <div class="card-header bg-success text-white">
                        <h2>Distribución de Resultados</h2>
                    </div>
                    <div class="card-body text-center">
                        <iframe src="${rawBaseURL}/data/${experimentType}/${folderName}/pie_chart.html" width="100%" height="600" frameborder="0"></iframe>
                    </div>
                </div>
            `;
            tabContent.innerHTML += pieChartHTML;

            // Cargar el gráfico interactivo de entrenamiento
            const plotlyHTML = `
                <div class="card my-4">
                    <div class="card-header bg-primary text-white">
                        <h2>Training Statistics</h2>
                    </div>
                    <div class="card-body text-center">
                        <iframe src="${rawBaseURL}/data/${experimentType}/${folderName}/training_statics.html" width="100%" height="600" frameborder="0"></iframe>
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

    // Iniciar la carga de las carpetas principales
    loadMainFolders();
});
