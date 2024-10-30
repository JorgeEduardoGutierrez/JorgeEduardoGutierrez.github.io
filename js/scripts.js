document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar el archivo JSON y renderizar las gráficas
    function loadMetrics() {
        fetch('data/history_experiment1.json')
            .then(response => response.json())
            .then(data => {
                const epochs = Array.from({ length: data['Loss/Q1_Loss'].length }, (_, i) => `Época ${i + 1}`);
                
                // Datos para la gráfica de pérdida
                const lossData = data['Loss/Q1_Loss'];
                const accuracyData = data['Accuracy/Q1_Accuracy'];
                const valLossData = data['Loss/Q2_Loss'];
                const valAccuracyData = data['Accuracy/Q2_Accuracy'];

                // Renderizar la gráfica de pérdida
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

                // Renderizar la gráfica de precisión
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

                // Renderizar la gráfica de pérdida de validación
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

                // Renderizar la gráfica de precisión de validación
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

