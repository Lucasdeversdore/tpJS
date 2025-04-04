import { CONFIG } from "./config.js";
import { afficherChampions } from "./champions.js";

export async function afficherChampionDetails(championId) {
    const content = document.getElementById("content");
    content.innerHTML = "<h1>Chargement...</h1>";

    try {
        const response = await fetch(`${CONFIG.championsUrl}/${championId}.json`);
        const data = await response.json();
        const champion = data[championId];

        // Récupérer la liste des items
        const itemsResponse = await fetch(CONFIG.itemsUrl);
        const itemsData = await itemsResponse.json();
        const items = Object.values(itemsData);

        // Charger les items favoris sauvegardés
        const savedItems = JSON.parse(localStorage.getItem(`items-fav-${championId}`)) || [];

        // Fonction pour récupérer les stats totales du champion
        function getStatsTotal(selectedItems) {
            const baseStats = { ...champion.stats }; // Copie des stats de base

            selectedItems.forEach(itemId => {
                if (!itemId) return;
                const item = items.find(i => i.image === itemId);
                if (item && item.stats) {
                    Object.keys(item.stats).forEach(stat => {
                        baseStats[stat] = (baseStats[stat] || 0) + item.stats[stat];
                    });
                }
            });

            return baseStats;
        }

        // Fonction pour mettre à jour l'affichage des statistiques
        function updateStatsDisplay(selectedItems) {
            const stats = getStatsTotal(selectedItems);
            document.getElementById("stats-display").innerHTML = `
                <h3>Statistiques</h3>
                <ul>
                    <li>PV : ${stats.hp}</li>
                    <li>Mana : ${stats.mp}</li>
                    <li>Armure : ${stats.armor}</li>
                    <li>Résistance magique : ${stats.spellblock}</li>
                    <li>Dégâts d'attaque : ${stats.attackdamage}</li>
                    <li>Vitesse d'attaque : ${stats.attackspeed.toFixed(3)}</li>
                    <li>Portée d'attaque : ${stats.attackrange}</li>
                    <li>Vitesse de déplacement : ${stats.movespeed}</li>
                </ul>
            `;
        }

        content.innerHTML = `
            <button id="back-button">← Retour</button>
            <h1>${champion.name}</h1>
            <div class="champion-details">
                <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg" alt="${champion.name}" class="img-champion-details">
                <div class="champion-details2">
                    <h2>${champion.title}</h2>
                    <p>${champion.lore}</p>
                    <h2>Sort</h2>
                    ${['passive', 'q', 'w', 'e', 'r'].map(spell => `
                        <img src="https://raw.communitydragon.org/15.6/game/assets/characters/${champion.id.toLowerCase()}/hud/icons2d/${champion.id.toLowerCase()}_${spell}.png" alt="${spell}">
                    `).join('')}
                </div>
            </div>
            <div id="stats-display"></div>
            <h3>Équipement</h3>
            <div class="items-selection">
                ${Array.from({ length: 6 }).map((_, i) => `
                    <div class="item-slot" id="item-slot-${i}">
                        <div class="item-preview" id="item-preview-${i}">
                            ${savedItems[i] ? `<img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${savedItems[i]}" alt="Item">` : ""}
                        </div>
                        <select class="item-dropdown" id="item-dropdown-${i}" style="display: none;">
                            <option value="">-- Choisir un item --</option>
                            ${items.map(item => `
                                <option value="${item.image}" ${savedItems[i] === item.image ? "selected" : ""}>${item.name}</option>
                            `).join("")}
                        </select>
                    </div>
                `).join("")}
            </div>
            <button id="save-button">Sauvegarder</button>
        `;

        document.getElementById("back-button").addEventListener("click", () => {
            history.pushState({}, "", "/");
            afficherChampions();
        });

        // Gestion des items
        for (let i = 0; i < 6; i++) {
            const itemSlot = document.getElementById(`item-slot-${i}`);
            const dropdown = document.getElementById(`item-dropdown-${i}`);
            const preview = document.getElementById(`item-preview-${i}`);

            itemSlot.addEventListener("click", () => {
                dropdown.style.display = "block";
                dropdown.focus();
            });

            dropdown.addEventListener("change", () => {
                const itemImage = dropdown.value;
                preview.innerHTML = itemImage ? `<img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${itemImage}" alt="Item">` : "";
                dropdown.style.display = "none";

                // Mettre à jour l'affichage des stats
                const selectedItems = Array.from({ length: 6 }).map((_, i) => document.getElementById(`item-dropdown-${i}`).value);
                updateStatsDisplay(selectedItems);
            });

            dropdown.addEventListener("blur", () => {
                dropdown.style.display = "none";
            });
        }

        // Sauvegarde des items
        document.getElementById("save-button").addEventListener("click", () => {
            const selectedItems = Array.from({ length: 6 }).map((_, i) => {
                const dropdown = document.getElementById(`item-dropdown-${i}`);
                return dropdown.value;
            });
            localStorage.setItem(`items-fav-${championId}`, JSON.stringify(selectedItems));
            alert("Items sauvegardés !");
        });

        // Afficher les stats initiales
        updateStatsDisplay(savedItems);

    } catch (error) {
        console.error("Erreur lors du chargement des détails du champion :", error);
        content.innerHTML = "<h1>Erreur de chargement</h1>";
    }
}
