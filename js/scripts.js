document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar el archivo JSON y renderizar las gráficas
    function loadMetrics() {
        fetch('data/history_experiment1.json')
            .then(response => response.json())
            .then(data => {
                const epochs = Array.from({ length: data['Loss/Q1_Loss'].length }, (_, i) => `Época ${i + 1}`);
                
                // Datos para la gráfica de pérdida
                const lossData = data['Loss/Q1_Loss'];

                // Renderizar la gráfica de pérdida
                const lossCtx = document.getElementById('lossChart').getContext('2d');
                new Chart(lossCtx, {
                    type: 'line',
                    data: {
                        labels: epochs,
                        datasets: [{
                            label: 'Pérdida',
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
            })
            .catch(error => console.error('Error al cargar el archivo JSON:', error));
    }

    // Llamar a la función para cargar y mostrar las métricas
    loadMetrics();
});

