import { CONFIG } from "./config.js";

class Champions {
    constructor() {
        this.championsData = []; // Toutes les données des champions
        this.filteredChampions = [];  // Liste des champions filtrés après recherche
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    // Fonction pour récupérer les champions
    async fetchChampions() {
        try {
            const response = await fetch(CONFIG.championsUrl);
            const data = await response.json();
            this.championsData = Object.values(data); // Tous les champions
            this.filteredChampions = [...this.championsData];  // Initialement, tous les champions sont affichés
            this.render();
            this.addSearchListener();  // Ajouter le listener de recherche après le chargement des données
        } catch (error) {
            console.error("Erreur lors du chargement des champions :", error);
        }
    }

    // Fonction pour afficher la liste des champions et la pagination
    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Champions</h1>
            <input type="text" id="search-champions" placeholder="Rechercher un champion" />
            <ul id="champions-list"></ul>
            <div id="pagination"></div>
        `;

        this.renderList(this.getPaginatedData()); // Afficher la liste des champions en fonction de la page actuelle
        this.renderPagination(); // Afficher la pagination
    }

    // Fonction pour afficher la liste des champions
    renderList(champions) {
        const list = document.getElementById("champions-list");
        list.innerHTML = "";

        champions.forEach(champion => {
            const div = document.createElement("div");
            div.className = "champion";
            div.innerHTML = `
                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg" alt="${champion.name}">
                <h2>${champion.name}</h2>
                <p>${champion.title}</p>
            `;
            list.appendChild(div);
        });
    }

    // Fonction pour afficher la pagination
    renderPagination() {
        const pagination = document.getElementById("pagination");
        const totalPages = Math.ceil(this.filteredChampions.length / this.itemsPerPage);

        let paginationHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">Précédent</button>
            <span>Page ${this.currentPage} sur ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page">Suivant</button>
        `;

        pagination.innerHTML = paginationHTML;

        // Écouteurs pour les boutons de pagination
        document.getElementById("prev-page").addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render();  // Re-render avec la page précédente
            }
        });

        document.getElementById("next-page").addEventListener("click", () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.render();  // Re-render avec la page suivante
            }
        });
    }

    // Fonction pour obtenir les champions pour la page actuelle
    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredChampions.slice(startIndex, endIndex);  // Paginer les champions filtrés
    }

    // Fonction pour ajouter le listener de recherche
    addSearchListener() {
        const searchInput = document.getElementById("search-champions");
        searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase();

            // Filtrer les champions par nom ou titre
            this.filteredChampions = this.championsData.filter(champion => 
                champion.name.toLowerCase().includes(searchTerm) || 
                champion.title.toLowerCase().includes(searchTerm)
            );

            // Réinitialiser la page à 1 après une recherche
            this.currentPage = 1;

            // Re-render avec les résultats filtrés et la pagination
            this.renderList(this.getPaginatedData());
            this.renderPagination(); // Re-render la pagination
        });
    }
}

export function afficherChampions() {
    const champions = new Champions();
    champions.fetchChampions();
}
