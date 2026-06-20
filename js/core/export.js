/**
 * Lógica central para la exportación de proyectos
 */
export const exportUtils = {
    exportToJson(projectData) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "rack_project.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    },

    exportToPdf(projectData) {
        // Lógica para exportar a PDF (ej. usando jsPDF)
        console.warn("Exportación a PDF no implementada aún.");
    }
};
