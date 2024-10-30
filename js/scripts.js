document.addEventListener('DOMContentLoaded', () => {
    // Función para renderizar una gráfica de línea
    function renderLineChart(jsonPath, canvasId, datasetLabels, datasetColors, title) {
        fetch(jsonPath)
            .then(response => response.json())
            .then(data => {
                // Verificar que las métricas existen en el JSON
                if (!data.loss || !data.accuracy || !data.val_loss || !data.val_accuracy) {
                    console.error(`El archivo ${jsonPath} no contiene las métricas esperadas.`);
                    return;
                }

                // Generar etiquetas de épocas basadas en la longitud de 'loss'
                const epochs = data.loss.map((_, index) => `Época ${index + 1}`);

                const ctx = document.getElementById(canvasId).getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: datasetLabels.map((label, index) => ({
                            label: label,
                            data: data[label.toLowerCase().replace(' ', '_')],
                            borderColor: datasetColors[index],
                            fill: false
                        }))
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: title
                            },
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Épocas'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Valor'
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => console.error(`Error al cargar ${jsonPath}:`, error));
    }

    // Lista de experimentos con sus respectivas configuraciones
    const experiments = [
        {
            name: 'Experimento 1: Reconocimiento de Imágenes',
            json: 'data/history_experiment1.json',
            lossChart: 'lossChart1',
            accuracyChart: 'accuracyChart1',
            lossTitle: 'Pérdida por Época - Experimento 1',
            accuracyTitle: 'Precisión por Época - Experimento 1',
            lossDatasetLabels: ['Pérdida de Entrenamiento', 'Pérdida de Validación'],
            lossDatasetColors: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            accuracyDatasetLabels: ['Precisión de Entrenamiento', 'Precisión de Validación'],
            accuracyDatasetColors: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)']
        },
        {
            name: 'Experimento 2: Clasificación de Texto',
            json: 'data/history_experiment2.json',
            lossChart: 'lossChart2',
            accuracyChart: 'accuracyChart2',
            lossTitle: 'Pérdida por Época - Experimento 2',
            accuracyTitle: 'Precisión por Época - Experimento 2',
            lossDatasetLabels: ['Pérdida de Entrenamiento', 'Pérdida de Validación'],
            lossDatasetColors: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            accuracyDatasetLabels: ['Precisión de Entrenamiento', 'Precisión de Validación'],
            accuracyDatasetColors: ['rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)']
        }
        // Añade más experimentos según sea necesario
    ];

    // Iterar sobre cada experimento y renderizar las gráficas
    experiments.forEach(exp => {
        // Renderizar Gráfica de Pérdida
        renderLineChart(
            exp.json,
            exp.lossChart,
            exp.lossDatasetLabels,
            exp.lossDatasetColors,
            exp.lossTitle
        );

        // Renderizar Gráfica de Precisión
        renderLineChart(
            exp.json,
            exp.accuracyChart,
            exp.accuracyDatasetLabels,
            exp.accuracyDatasetColors,
            exp.accuracyTitle
        );
    });
});

