document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';
    
    // TODO: Proporciona tu token de GitHub de forma segura
    // Es recomendable no incluir el token directamente en el código fuente
    // Puedes obtener el token de un archivo de configuración seguro o variable de entorno
    const githubToken = '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';

    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    async function fetchFromGitHubAPI(path) {
        const url = `https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`;
        console.log('URL solicitada:', url);
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `token ${githubToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de la API de GitHub:', errorData.message);
                throw new Error(`Error de GitHub API: ${response.status} ${response.statusText} - ${errorData.message}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al realizar la solicitud a la API de GitHub:', error);
            throw error;
        }
    }

    async function fetchGitHubFile(path) {
        const url = `https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/${path}`;
        console.log('URL solicitada para archivo:', url);
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `token ${githubToken}`,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de la API de GitHub:', errorData.message);
                throw new Error(`Error de GitHub API: ${response.status} ${response.statusText} - ${errorData.message}`);
            }
            const data = await response.json();
            if (data && data.content) {
                const decodedContent = atob(data.content.replace(/\s/g, ''));
                return JSON.parse(decodedContent);
            }
            throw new Error('Contenido vacío o formato incorrecto');
        } catch (error) {
            console.error('Error al cargar el archivo JSON:', error);
            throw error;
        }
    }

    async function loadMainFolders() {
        try {
            showLoading(true);
            console.log('Cargando carpetas principales...');
            const folders = await fetchFromGitHubAPI('data');
            console.log('Respuesta de folders:', folders);

            const sidebarMenu = document.getElementById('sidebarMenu');
            console.log('Elemento sidebarMenu:', sidebarMenu);
            sidebarMenu.innerHTML = '';

            const mainFolders = folders.filter(folder => folder.type === 'dir');
            console.log('Carpetas principales:', mainFolders);

            mainFolders.forEach(folder => {
                console.log('Procesando carpeta:', folder.name);
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
            experimentFolders.forEach((folder, index) => {
                const expId = index + 1;
                createExperimentTab(folder.name, expId);
                createExperimentContent(folder.name, experimentType, expId);
            });

            // Activar la pestaña Main si existe, o la primera de los experimentos
            const activeTab = document.querySelector(`#main-tab`) || document.querySelector(`#exp1-tab`);
            if (activeTab) {
                const tab = new bootstrap.Tab(activeTab);
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
            <button class="nav-link" id="main-tab" data-bs-toggle="tab" data-bs-target="#main" type="button" role="tab" aria-controls="main" aria-selected="false">
                Main
            </button>
        `;
        experimentTabs.appendChild(tabItem);

        // Crear el contenido de la pestaña
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-pane fade';
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

                // Agregar el gráfico de Training Results
                const trainingHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-primary text-white">
                            <h2>Training Results</h2>
                        </div>
                        <div class="card-body text-center">
                            <iframe src="data/${experimentType}/main/training_results.html" width="100%" height="600" frameborder="0"></iframe>
                        </div>
                    </div>
                `;

                // Agregar el gráfico de Test Results
                const testResultsHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-success text-white">
                            <h2>Test Results</h2>
                        </div>
                        <div class="card-body text-center">
                            <iframe src="data/${experimentType}/main/test_results.html" width="100%" height="600" frameborder="0"></iframe>
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

   async function createExperimentContent(folderName, experimentType, expId) {
    try {
        const experimentTabsContent = document.getElementById('experimentTabsContent');
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-pane fade';
        tabContent.id = `exp${expId}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

        // Cargar videos del experimento
        const files = await fetchFromGitHubAPI(`data/${experimentType}/${folderName}`);
        const videos = files.filter(file => file.name.endsWith('.mp4'));

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

        const videoList = tabContent.querySelector(`#videoList${expId}`);
        const mainVideo = tabContent.querySelector(`#mainVideo${expId}`);

        const baseURL = `https://${githubUsername}.github.io`; // Ajusta si es necesario

        if (videos.length > 0) {
            videos.forEach((video, index) => {
                let videoSrc = `${baseURL}/data/${experimentType}/${folderName}/${video.name}`;

                let videoButton = document.createElement('button');
                videoButton.className = 'btn btn-outline-primary btn-sm m-1';
                videoButton.textContent = video.name;

                videoButton.addEventListener('click', () => {
                    console.log('Botón de video clicado:', video.name);
                    console.log('Ruta del video:', videoSrc);
                    console.log('Elemento mainVideo:', mainVideo);
                    mainVideo.src = videoSrc;
                    mainVideo.play();
                });

                videoList.appendChild(videoButton);

                // Establecer el primer video como predeterminado
                if (index === 0) {
                    mainVideo.src = videoSrc;
                }
            });
        } else {
            videoList.innerHTML = '<p>No hay videos disponibles para este experimento.</p>';
        }

        // Mostrar el gráfico interactivo de entrenamiento
        const trainingHTML = `
            <div class="card my-4">
                <div class="card-header bg-primary text-white">
                    <h2>Training Statistics</h2>
                </div>
                <div class="card-body text-center">
                    <iframe src="${baseURL}/data/${experimentType}/${folderName}/training_statics.html" width="100%" height="600" frameborder="0"></iframe>
                </div>
            </div>
        `;
        tabContent.innerHTML += trainingHTML;

        experimentTabsContent.appendChild(tabContent);
        } catch (error) {
            console.error('Error al cargar el contenido del experimento:', error);
            alert('Hubo un error al cargar el contenido del experimento. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    loadMainFolders();
});
