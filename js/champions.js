import { CONFIG } from "./config.js";
import { afficherChampionDetails } from "./championDetails.js";

class Champions {
    constructor() {
        this.championsData = [];
        this.filteredChampions = [];
        this.currentPage = 1;
        this.itemsPerPage = 60;
    }

    // Fonction pour récupérer les champions
    async fetchChampions() {
        try {
            const response = await fetch(CONFIG.championsUrl);
            const data = await response.json();
            this.championsData = Object.values(data); // Tous les champions
            this.filteredChampions = [...this.championsData];
            this.render();
            this.addSearchListener(); // Ajouter le listener de recherche après le chargement des données
        } catch (error) {
            console.error("Erreur lors du chargement des champions :", error);
        }
    }

    // Fonction pour afficher la liste des champions + pagination et recherche
    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Champions</h1>
            <input type="text" id="search-champions" placeholder="Rechercher un champion" />
            <ul id="champions-list"></ul>
            <div id="pagination"></div>
        `;

        this.renderList(this.getPaginatedData()); // Afficher les champions en fonction de la page actuelle
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
                <img class="champion-img lazy" 
                     data-id="${champion.id}" 
                     src="https://via.placeholder.com/150x150?text=Loading" 
                     alt="${champion.name}" 
                     loading="lazy" />
                <h2>${champion.name}</h2>
                <p>${champion.title}</p>
            `;
            div.addEventListener("click", () => {
                history.pushState({}, "", `/champion/${champion.id}`);
                afficherChampionDetails(champion.id);
            });
            list.appendChild(div);
        });

        // Lazy loading des images sans cache
        this.lazyLoadImages();
    }

    // Fonction pour charger une image sans cache
    async loadImage(championId) {
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_0.jpg`;
        try {
            const response = await fetch(imageUrl, { cache: "no-store" });
            const blob = await response.blob();
            return URL.createObjectURL(blob); // URL temporaire pour éviter le cache
        } catch (error) {
            console.error(`Erreur lors du chargement de l'image pour ${championId}:`, error);
            return "https://via.placeholder.com/150x150?text=Error"; // Image de remplacement en cas d'erreur
        }
    }

    // Fonction de lazy loading pour les images sans cache
    lazyLoadImages() {
        const images = document.querySelectorAll('.lazy');

        const observer = new IntersectionObserver(async (entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    const championId = image.dataset.id;
                    image.src = await this.loadImage(championId);
                    image.classList.remove('lazy'); // Évite de le recharger
                    observer.unobserve(image);
                }
            }
        }, {
            rootMargin: '0px 0px 200px 0px' // Chargement des images légèrement avant qu'elles ne soient visibles
        });

        images.forEach(image => observer.observe(image));
    }

    // La pagination
    renderPagination() {
        const pagination = document.getElementById("pagination");
        const totalPages = Math.ceil(this.filteredChampions.length / this.itemsPerPage);

        let paginationHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">Précédent</button>
            <span>Page ${this.currentPage} sur ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page">Suivant</button>
        `;

        pagination.innerHTML = paginationHTML;

        // Boutons pour changer de page
        document.getElementById("prev-page").addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderList(this.getPaginatedData());
                this.renderPagination();
            }
        });

        document.getElementById("next-page").addEventListener("click", () => {
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderList(this.getPaginatedData());
                this.renderPagination();
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

            // Filtrer par nom ou titre
            this.filteredChampions = this.championsData.filter(champion => 
                champion.name.toLowerCase().includes(searchTerm) || 
                champion.title.toLowerCase().includes(searchTerm)
            );
            this.currentPage = 1;

            // Affichage avec pagination et filtre
            this.renderList(this.getPaginatedData());
            this.renderPagination();
        });
    }
}

export function afficherChampions() {
    const champions = new Champions();
    champions.fetchChampions();
}
