document.addEventListener('DOMContentLoaded', () => {
    const githubUsername = 'JorgeEduardoGutierrez';
    const repositoryName = 'JorgeEduardoGutierrez.github.io';

    function loadMainFolders() {
        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data`)
            .then(response => response.json())
            .then(folders => {
                folders
                    .filter(folder => folder.type === 'dir')
                    .forEach(folder => {
                        const sidebarMenu = document.getElementById('sidebarMenu');
                        const link = document.createElement('a');
                        link.href = "#";
                        link.className = "nav-link";
                        link.textContent = folder.name;

                        // Añadir evento para resaltar el enlace seleccionado
                        link.onclick = (e) => {
                            e.preventDefault();
                            setActiveLink(link);  // Resalta el enlace seleccionado
                            loadExperimentSet(folder.name);
                        };

                        sidebarMenu.appendChild(link);
                    });

                if (folders.length > 0) {
                    // Resaltar el primer enlace automáticamente al cargar la página
                    const firstLink = document.querySelector('#sidebarMenu .nav-link');
                    setActiveLink(firstLink);
                    loadExperimentSet(folders[0].name);
                }
            })
            .catch(error => console.error('Error al cargar carpetas principales:', error));
    }

    function setActiveLink(selectedLink) {
        // Quitar la clase active de todos los enlaces
        document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.classList.remove('active'));
        // Añadir la clase active al enlace seleccionado
        selectedLink.classList.add('active');
    }

    function loadExperimentSet(experimentType) {
        document.getElementById('experimentTabs').innerHTML = '';
        document.getElementById('experimentTabsContent').innerHTML = '';

        fetch(`https://api.github.com/repos/${githubUsername}/${repositoryName}/contents/data/${experimentType}`)
            .then(response => response.json())
            .then(data => {
                const experimentFolders = data.filter(item => item.type === 'dir');
                experimentFolders.forEach((folder, index) => {
                    const expId = index + 1;
                    createExperimentTab(folder.name, expId);
                    createExperimentContent(folder.name, experimentType, expId);
                });
            })
            .catch(error => console.error('Error al cargar los experimentos:', error));
    }

    loadMainFolders();
});
