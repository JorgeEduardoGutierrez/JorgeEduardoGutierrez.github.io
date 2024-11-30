document.addEventListener('DOMContentLoaded', () => {
    // Configuración
    const experimentTypes = ['classification', 'detection', 'segmentation']; // Tipos de experimentos

    function showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'block' : 'none';
        }
    }

    async function loadMainFolders() {
        try {
            const experimentLinks = document.getElementById('experimentLinks');
            experimentLinks.innerHTML = '';

            // Generar enlaces para cada tipo de experimento
            experimentTypes.forEach(type => {
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
            });

            // Cargar el primer conjunto de experimentos por defecto
            if (experimentTypes.length > 0) {
                setActiveLink(experimentLinks.firstChild);
                loadExperimentSet(experimentTypes[0]);
            }
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
            // Mostrar indicador de carga
            showLoading(true);

            // Limpiar contenido previo
            const experimentTabs = document.getElementById('experimentTabs');
            const experimentTabsContent = document.getElementById('experimentTabsContent');
            experimentTabs.innerHTML = '';
            experimentTabsContent.innerHTML = '';

            // Obtener la lista de experimentos para el tipo seleccionado
            const response = await fetch(`data/${experimentType}/experiments.json`);
            const experiments = await response.json();

            experiments.forEach((experiment, index) => {
                const isActive = index === 0;
                createExperimentTab(experiment.folderName, index, isActive);
                createExperimentContent(experiment.folderName, experimentType, index, isActive);
            });

            // Ocultar indicador de carga
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
            const response = await fetch(`data/${experimentType}/${folderName}/videos.json`);
            const videos = await response.json();

            const videoList = tabContent.querySelector(`#videoList${expId}`);
            const mainVideo = tabContent.querySelector(`#mainVideo${expId}`);

            if (videos.length > 0) {
                videos.forEach((video, index) => {
                    const videoButton = document.createElement('a');
                    videoButton.href = "#";
                    videoButton.className = 'btn btn-outline-primary btn-sm m-1 video-link';
                    videoButton.textContent = video.name;
                    videoButton.dataset.videoSrc = `data/${experimentType}/${folderName}/${video.name}`;

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
                            sourceElement.src = `data/${experimentType}/${folderName}/${video.name}`;
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
                        <iframe src="data/${experimentType}/${folderName}/pie_chart.html" width="100%" height="600" frameborder="0"></iframe>
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
                        <iframe src="data/${experimentType}/${folderName}/training_statistics.html" width="100%" height="600" frameborder="0"></iframe>
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
