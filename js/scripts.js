document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar los datos de un experimento específico
    function loadExperimentData(experimentId, jsonFile) {
        fetch(`data/${jsonFile}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(`Cargando datos para ${jsonFile}:`, Object.keys(data));

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
                    } else {
                        console.error(`No se pudo obtener el contexto para el canvas con id: chart${experimentId}_${index}`);
                    }
                });
            })
            .catch(error => console.error('Error al cargar el archivo JSON:', error));
    }

    // Cargar datos del experimento al hacer clic en cada pestaña
    const tabs = [
        { id: '1', file: 'history_experiment1.json' },
        { id: '2', file: 'history_experiment2.json' },
        // Agregar más experimentos aquí
    ];

    tabs.forEach(tab => {
        document.getElementById(`exp${tab.id}-tab`).addEventListener('click', () => {
            loadExperimentData(tab.id, tab.file);
        });
    });

    // Cargar el primer experimento de forma predeterminada
    loadExperimentData('1', 'history_experiment1.json');
});


