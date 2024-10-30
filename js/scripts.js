document.addEventListener('DOMContentLoaded', () => {
    function loadMetrics() {
        fetch('data/history_experiment1.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Claves en el archivo JSON:", Object.keys(data));  // Para ver las claves disponibles

                // Crear un contenedor para las gráficas
                const chartsContainer = document.getElementById('chartsContainer');
                chartsContainer.innerHTML = '';  // Limpiar el contenedor por si hay gráficos previos

                // Para cada clave en el archivo JSON, crear una gráfica
                Object.keys(data).forEach((key, index) => {
                    const metricData = data[key];
                    const labels = Array.from({ length: metricData.length }, (_, i) => i + 1); // Etiquetas solo con números

                    // Crear elementos HTML para la gráfica
                    const chartWrapper = document.createElement('div');
                    chartWrapper.className = 'col-md-6 mb-4';  // Dos columnas

                    const card = document.createElement('div');
                    card.className = 'card';

                    const cardHeader = document.createElement('div');
                    cardHeader.className = 'card-header';
                    cardHeader.innerHTML = `<h3>${key.replace(/_/g, ' ')}</h3>`; // Título más pequeño y sin color

                    const cardBody = document.createElement('div');
                    cardBody.className = 'card-body';

                    const canvas = document.createElement('canvas');
                    canvas.id = `chart${index}`;

                    // Añadir elementos al DOM
                    cardBody.appendChild(canvas);
                    card.appendChild(cardHeader);
                    card.appendChild(cardBody);
                    chartWrapper.appendChild(card);
                    chartsContainer.appendChild(chartWrapper);

                    // Asegurarnos de que el canvas se agregó correctamente antes de acceder a él
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // Renderizar la gráfica en el canvas
                        new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: labels, // Etiquetas sin "Época"
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
                                        display: false // Oculta el título interno de Chart.js
                                    }
                                }
                            }
                        });
                    } else {
                        console.error(`No se pudo obtener el contexto para el canvas con id: chart${index}`);
                    }
                });
            })
            .catch(error => console.error('Error al cargar el archivo JSON:', error));
    }

    // Llamar a la función para cargar y mostrar las métricas
    loadMetrics();
});


