import { CONFIG } from "./config.js";
import { afficherChampionDetails } from "./championDetails.js";

class Champions {
    constructor() {
        this.championsData = [];
        this.filteredChampions = [];
        this.currentPage = 1;
        this.itemsPerPage = 60;
    }

    async fetchChampions() {
        try {
            const response = await fetch(CONFIG.championsUrl);
            const data = await response.json();
            this.championsData = Object.values(data);
            this.loadFavorites();
            this.filteredChampions = [...this.championsData];
            this.sortChampions();
            this.render();
            this.addSearchListener();
        } catch (error) {
            console.error("Erreur lors du chargement des champions :", error);
        }
    }

    loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem("championFavorites")) || {};
        this.championsData.forEach(champion => {
            champion.favorite = !!favorites[champion.id];
        });
    }

    toggleFavorite(championId) {
        const favorites = JSON.parse(localStorage.getItem("championFavorites")) || {};
        favorites[championId] = !favorites[championId];
        localStorage.setItem("championFavorites", JSON.stringify(favorites));
        this.loadFavorites();
        this.sortChampions();
        this.currentPage = 1;
        this.renderList(this.getPaginatedData());
        this.renderPagination();
    }

    sortChampions() {
        this.championsData.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
        this.filteredChampions = [...this.championsData];
    }

    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Champions</h1>
            <input type="text" id="search-champions" placeholder="Rechercher un champion" />
            <ul id="champions-list"></ul>
            <div id="pagination"></div>
        `;
        this.renderList(this.getPaginatedData());
        this.renderPagination();
    }

    renderList(champions) {
        const list = document.getElementById("champions-list");
        list.innerHTML = "";

        champions.forEach(champion => {
            const div = document.createElement("div");
            div.className = "champion";

            div.innerHTML = `
                <input type="checkbox" id="fav-${champion.id}" ${champion.favorite ? "checked" : ""} />
                <label for="fav-${champion.id}">★</label>
                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg" alt="${champion.name}">
                <h2>${champion.name}</h2>
                <p>${champion.title}</p>
            `;

            // Ajouter l'événement pour mettre à jour le favori
            div.querySelector("input").addEventListener("change", () => {
                this.toggleFavorite(champion.id);
            });

            // Ajouter l'événement pour la navigation vers la page de détails du champion
            div.addEventListener("click", (e) => {
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "LABEL") {
                    history.pushState({}, "", `/champion/${champion.id}`);
                    afficherChampionDetails(champion.id);
                }
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

    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredChampions.slice(startIndex, endIndex);
    }

    renderPagination() {
        const pagination = document.getElementById("pagination");
        const totalPages = Math.ceil(this.filteredChampions.length / this.itemsPerPage);
        let paginationHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">Précédent</button>
            <span>Page ${this.currentPage} sur ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page">Suivant</button>
        `;

        pagination.innerHTML = paginationHTML;

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
}

export function afficherChampions() {
    const champions = new Champions();
    champions.fetchChampions();
}
