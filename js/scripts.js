document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar los datos de un experimento específico
    function loadExperimentData(experimentId) {
        const basePath = `data/experimento${experimentId}`;
        
        // Cargar archivo JSON de métricas
        fetch(`${basePath}/tensorflow.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const chartsContainer = document.getElementById(`chartsContainer${experimentId}`);
                chartsContainer.innerHTML = '';  // Limpiar el contenedor de gráficos

                // Generar una gráfica para cada métrica en el JSON
                Object.keys(data).forEach((key, index) => {
                    const metricData = data[key];
                    const labels = Array.from({ length: metricData.length }, (_, i) => i + 1);

                    // Crear elementos HTML para la gráfica
                    const chartWrapper = document.createElement('div');
                    chartWrapper.className = 'col-md-6 mb-4';

                    const card = document.createElement('div');
                    card.className = 'card';

                    const cardHeader = document.createElement('div');
                    cardHeader.className = 'card-header';
                    cardHeader.innerHTML = `<h3>${key.replace(/_/g, ' ')}</h3>`;

                    const cardBody = document.createElement('div');
                    cardBody.className = 'card-body';

                    const canvas = document.createElement('canvas');
                    canvas.id = `chart${experimentId}_${index}`;

                    // Añadir elementos al DOM
                    cardBody.appendChild(canvas);
                    card.appendChild(cardHeader);
                    card.appendChild(cardBody);
                    chartWrapper.appendChild(card);
                    chartsContainer.appendChild(chartWrapper);

                    // Crear la gráfica
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: key.replace(/_/g, ' '),
                                    data: metricData,
                                    borderColor: `hsl(${index * 50 % 360}, 70%, 50%)`,
                                    fill: false
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    title: {
                                        display: false
                                    }
                                }
                            }
                        });
                    }
                });
            })
            .catch(error => console.error('Error al cargar el archivo JSON:', error));

        // Cargar imagen debajo de las gráficas
        const imageElement = document.getElementById(`image${experimentId}`);
        imageElement.src = `${basePath}/pie_chart.png`;

        // Cargar videos disponibles en la subcarpeta
        const videoList = document.getElementById(`videoList${experimentId}`);
        const mainVideo = document.getElementById(`mainVideo${experimentId}`);
        videoList.innerHTML = ''; // Limpiar la lista de videos

        let videoIndex = 0;
        fetch(`${basePath}/video${videoIndex}.mp4`)
            .then(response => {
                while (response.ok) {
                    const videoItem = document.createElement('a');
                    videoItem.href = "#";
                    videoItem.className = "btn btn-outline-primary btn-sm m-1";
                    videoItem.textContent = `Video ${videoIndex + 1}`;
                    videoItem.addEventListener('click', () => {
                        mainVideo.src = `${basePath}/video${videoIndex}.mp4`;
                        mainVideo.play();
                    });
                    videoList.appendChild(videoItem);

                    videoIndex += 1;
                    response = fetch(`${basePath}/video${videoIndex}.mp4`);
                }
            })
            .catch(error => console.log(`No se encontraron más videos en ${basePath}. Error: ${error}`));
    }

    // Configuración de pestañas y carga de datos inicial
    const tabs = [1, 2]; // Lista de experimentos

    tabs.forEach(id => {
        document.getElementById(`exp${id}-tab`).addEventListener('click', () => {
            loadExperimentData(id);
        });
    });

    // Cargar el primer experimento de forma predeterminada
    loadExperimentData(1);
});


