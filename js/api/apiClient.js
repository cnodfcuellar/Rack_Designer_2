/**
 * Cliente API para comunicarse con el backend (si aplica).
 */
export const apiClient = {
    async fetchCatalog() {
        // return fetch('/api/catalog').then(r => r.json());
        return [];
    },

    async saveProject(projectData) {
        // return fetch('/api/projects', { method: 'POST', body: JSON.stringify(projectData) });
        console.log("Proyecto guardado:", projectData);
    },

    async loadProject(projectId) {
        // return fetch(`/api/projects/${projectId}`).then(r => r.json());
        return null;
    }
};
