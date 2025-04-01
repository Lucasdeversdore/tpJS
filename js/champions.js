import { CONFIG } from "./config.js";
import { afficherChampionDetails } from "./championDetails.js";

class Champions {
    constructor() {
        this.championsData = [];
    }

    async fetchChampions() {
        try {
            const response = await fetch(CONFIG.championsUrl);
            const data = await response.json();
            this.championsData = Object.values(data);
            this.loadFavorites();
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
        this.renderList(this.championsData);
    }

    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Champions</h1>
            <input type="text" id="search-champions" placeholder="Rechercher un champion" />
            <ul id="champions-list"></ul>
        `;
        this.renderList(this.championsData);
    }

    renderList(champions) {
        const list = document.getElementById("champions-list");
        list.innerHTML = "";

        champions.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));

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

    addSearchListener() {
        const searchInput = document.getElementById("search-champions");
        searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredChampions = this.championsData.filter(champion => 
                champion.name.toLowerCase().includes(searchTerm) || 
                champion.title.toLowerCase().includes(searchTerm)
            );
            this.renderList(filteredChampions);
        });
    }
}

export function afficherChampions() {
    const champions = new Champions();
    champions.fetchChampions();
}
