import { CONFIG } from "./config.js";

class Items {
    constructor() {
        this.itemsData = [];
    }

    async fetchItems() {
        try {
            const response = await fetch(CONFIG.itemsUrl);
            const data = await response.json();
            this.itemsData = Object.values(data);
            this.render();
        } catch (error) {
            console.error("Erreur lors du chargement des items :", error);
        }
    }

    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Items</h1>
            <ul id="items-list"></ul>
        `;

        const list = document.getElementById("items-list");
        this.itemsData.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image}" alt="${item.name}">
                <h2>${item.gold}</h2>
            `;
            list.appendChild(div);
        });
    }
}

export function afficherItems() {
    const items = new Items();
    items.fetchItems();
}
