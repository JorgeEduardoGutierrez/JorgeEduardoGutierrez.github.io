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
                // Imprimir las claves disponibles en el JSON para depuración
                console.log("Claves en el archivo JSON:", Object.keys(data));

                // Verificar si las métricas esperadas están en el archivo JSON
                const expectedKeys = ['Loss/Q1_Loss', 'Accuracy/Q1_Accuracy', 'Loss/Q2_Loss', 'Accuracy/Q2_Accuracy'];
                const missingKeys = expectedKeys.filter(key => !(key in data));
                if (missingKeys.length > 0) {
                    console.error(`El archivo JSON no contiene las métricas esperadas: ${missingKeys.join(', ')}`);
                    return;
                }

                // Crear etiquetas de épocas basadas en la longitud de los datos
                const epochs = Array.from({ length: data['Loss/Q1_Loss'].length }, (_, i) => `Época ${i + 1}`);
                
                // Datos para las gráficas
                const lossData = data['Loss/Q1_Loss'];
                const accuracyData = data['Accuracy/Q1_Accuracy'];
                const valLossData = data['Loss/Q2_Loss'];
                const valAccuracyData = data['Accuracy/Q2_Accuracy'];

                // Gráfica de Pérdida
                const lossCtx = document.getElementById('lossChart').getContext('2d');
                new Chart(lossCtx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: [{
                            label: 'Pérdida de Entrenamiento',
                            data: lossData,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pérdida durante el Entrenamiento'
                            }
                        }
                    }
                });

                // Gráfica de Precisión
                const accuracyCtx = document.getElementById('accuracyChart').getContext('2d');
                new Chart(accuracyCtx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: [{
                            label: 'Precisión de Entrenamiento',
                            data: accuracyData,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Precisión durante el Entrenamiento'
                            }
                        }
                    }
                });

                // Gráfica de Pérdida de Validación
                const valLossCtx = document.getElementById('valLossChart').getContext('2d');
                new Chart(valLossCtx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: [{
                            label: 'Pérdida de Validación',
                            data: valLossData,
                            borderColor: 'rgba(255, 206, 86, 1)',
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Pérdida de Validación durante el Entrenamiento'
                            }
                        }
                    }
                });

                // Gráfica de Precisión de Validación
                const valAccuracyCtx = document.getElementById('valAccuracyChart').getContext('2d');
                new Chart(valAccuracyCtx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: [{
                            label: 'Precisión de Validación',
                            data: valAccuracyData,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Precisión de Validación durante el Entrenamiento'
                            }
                        }
                    }
                });
            })
            .catch(error => console.error('Error al cargar el archivo JSON:', error));
    }

    // Llamar a la función para cargar y mostrar las métricas
    loadMetrics();
});
