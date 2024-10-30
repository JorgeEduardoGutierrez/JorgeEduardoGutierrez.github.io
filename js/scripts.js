document.addEventListener('DOMContentLoaded', () => {
    // Cargar información de los experimentos desde el servidor
    fetch('/api/experimentos')
        .then(response => response.json())
        .then(experimentos => {
            const experimentTabs = document.getElementById('experimentTabs');
            const experimentTabsContent = document.getElementById('experimentTabsContent');

            experimentos.forEach((exp, index) => {
                const expId = index + 1;

                // Crear pestaña
                const tab = document.createElement('li');
                tab.className = 'nav-item';
                tab.innerHTML = `
                    <button class="nav-link ${index === 0 ? 'active' : ''}" id="exp${expId}-tab" data-bs-toggle="tab" data-bs-target="#exp${expId}" type="button" role="tab" aria-controls="exp${expId}" aria-selected="${index === 0}">
                        ${exp.nombre}
                    </button>
                `;
                experimentTabs.appendChild(tab);

                // Crear contenido de la pestaña
                const tabContent = document.createElement('div');
                tabContent.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
                tabContent.id = `exp${expId}`;
                tabContent.setAttribute('role', 'tabpanel');
                tabContent.setAttribute('aria-labelledby', `exp${expId}-tab`);

                // Descripción de la configuración
                const descripcionHTML = `
                    <p class="mt-4">${exp.descripcion}</p>
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Configuración del Entorno</h2>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>Entrenamiento</h5>
                                    <pre>${Object.entries(exp.configuracion.Entrenamiento).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                                </div>
                                <div class="col-md-6">
                                    <h5>Test</h5>
                                    <pre>${Object.entries(exp.configuracion.Test).map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Contenedor de gráficos y carga de imagen
                const chartsContainerId = `chartsContainer${expId}`;
                const imageId = `image${expId}`;
                const imagenHTML = `
                    <div id="${chartsContainerId}" class="row my-4"></div>
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Gráfica de Avance</h2>
                        </div>
                        <div class="card-body text-center">
                            <img id="${imageId}" src="/data/${exp.nombre}/${exp.archivos.imagen}" alt="Pie Chart" class="img-fluid">
                        </div>
                    </div>
                `;

                // Lista de videos
                const videoListId = `videoList${expId}`;
                const mainVideoId = `mainVideo${expId}`;
                const videosHTML = `
                    <div class="card my-4">
                        <div class="card-header bg-secondary text-white">
                            <h2>Videos del Experimento</h2>
                        </div>
                        <div class="card-body">
                            <div id="${videoListId}" class="mb-3">
                                ${exp.archivos.videos.map((video, idx) => `
                                    <a href="#" class="btn btn-outline-primary btn-sm m-1" onclick="document.getElementById('${mainVideoId}').src='/data/${exp.nombre}/${video}'">
                                        Video ${idx + 1}
                                    </a>
                                `).join('')}
                            </div>
                            <div class="ratio ratio-16x9">
                                <video id="${mainVideoId}" controls>
                                    <source src="/data/${exp.nombre}/${exp.archivos.videos[0]}" type="video/mp4">
                                    Tu navegador no soporta la etiqueta de video.
                                </video>
                            </div>
                        </div>
                    </div>
                `;

                // Añadir contenido de la pestaña
                tabContent.innerHTML = descripcionHTML + imagenHTML + videosHTML;
                experimentTabsContent.appendChild(tabContent);

                // Cargar datos del gráfico
                loadChartData(`/data/${exp.nombre}/${exp.archivos.json}`, chartsContainerId);
            });
        })
        .catch(error => console.error('Error al cargar los experimentos:', error));
});

function loadChartData(jsonPath, containerId) {
    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            Object.keys(data).forEach((key, index) => {
                const chartId = `chart${containerId}_${index}`;
                const chartCanvas = document.createElement('canvas');
                chartCanvas.id = chartId;
                container.appendChild(chartCanvas);

                new Chart(chartCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: data[key].length }, (_, i) => i + 1),
                        datasets: [{
                            label: key.replace(/_/g, ' '),
                            data: data[key],
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


