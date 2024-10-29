// Ejemplo para el Primer Experimento

// Datos de entrenamiento
const trainCtx1 = document.getElementById('trainChart1').getContext('2d');
const trainChart1 = new Chart(trainCtx1, {
    type: 'line',
    data: {
        labels: ['Epoch 1', 'Epoch 2', 'Epoch 3', 'Epoch 4', 'Epoch 5'],
        datasets: [{
            label: 'Precisión',
            data: [0.6, 0.7, 0.75, 0.8, 0.85],
            borderColor: 'rgba(75, 192, 192, 1)',
            fill: false
        },
        {
            label: 'Pérdida',
            data: [0.8, 0.6, 0.5, 0.4, 0.3],
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Progreso del Entrenamiento'
            }
        }
    }
});

// Datos para la gráfica de pastel
const pieCtx1 = document.getElementById('pieChart1').getContext('2d');
const pieChart1 = new Chart(pieCtx1, {
    type: 'pie',
    data: {
        labels: ['Objetivo Alcanzado', 'Restante'],
        datasets: [{
            data: [85, 15],
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Alcance del Objetivo'
            }
        }
    }
});
