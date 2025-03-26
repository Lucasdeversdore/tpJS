import { CONFIG } from "./config.js";
import { afficherChampions } from "./champions.js";

export async function afficherChampionDetails(championId) {
    const content = document.getElementById("content");
    content.innerHTML = "<h1>Chargement...</h1>";

    try {
        const response = await fetch(`${CONFIG.championsUrl}/${championId}.json`);
        const data = await response.json();
        const champion = data[championId]; 

        content.innerHTML = `
            <button id="back-button">← Retour</button>
            <h1>${champion.name}</h1>
            <div>
            <img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg" alt="${champion.name}" class="img-champion-details">
            <p>${champion.lore}</p>
            </div>
            
            <h2>${champion.title}</h2>
            <h3>Compétences</h3>
        `;

        document.getElementById("back-button").addEventListener("click", () => {
            history.pushState({}, "", "/");
            afficherChampions();
        });

    } catch (error) {
        console.error("Erreur lors du chargement des détails du champion :", error);
        content.innerHTML = "<h1>Erreur de chargement</h1>";
    }
}
