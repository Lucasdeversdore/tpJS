import { CONFIG } from "./config.js";
import { afficherChampionDetails } from "./championDetails.js";

class Champions {
    constructor() {
        this.championsData = [];
        this.filteredChampions = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
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

            div.querySelector("input").addEventListener("change", () => {
                this.toggleFavorite(champion.id);
            });

            div.addEventListener("click", (e) => {
                if (e.target.tagName !== "INPUT" && e.target.tagName !== "LABEL") {
                    history.pushState({}, "", `/champion/${champion.id}`);
                    afficherChampionDetails(champion.id);
                }
            });

            list.appendChild(div);
        });
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
