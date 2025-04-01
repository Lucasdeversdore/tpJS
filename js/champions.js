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
            this.render();
            this.addSearchListener();
        } catch (error) {
            console.error("Erreur lors du chargement des champions :", error);
        }
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

        champions.forEach(champion => {
            const div = document.createElement("div");
            div.className = "champion";
            div.innerHTML = `
                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg" alt="${champion.name}">
                <h2>${champion.name}</h2>
                <p>${champion.title}</p>
            `;
            div.addEventListener("click", () => {
                history.pushState({}, "", `/champion/${champion.id}`);
                afficherChampionDetails(champion.id);
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
