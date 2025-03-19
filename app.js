document.addEventListener("DOMContentLoaded", () => {
    // Charger les champions
    fetch(CONFIG.championsUrl)
        .then(response => response.json())
        .then(dataChampion => afficherChampions(dataChampion.data))
        .catch(error => console.error("Erreur lors du chargement des champions :", error));

    // Charger les items
    fetch(CONFIG.itemsUrl)
        .then(response => response.json())
        .then(dataItems => afficherItems(dataItems.data))
        .catch(error => console.error("Erreur lors du chargement des items :", error));
});

function afficherChampions(champions) {
    const list = document.getElementById("champions-list");
    list.innerHTML = ""; // Nettoie la liste

    Object.values(champions).forEach(champion => {
        const div = document.createElement("div");
        div.className = "champion";

        // Création de l'image du champion
        const img = document.createElement("img");
        console.log(champion.id);
        img.src = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`;
        img.alt = champion.name;
        
        // Nom + titre du champion
        const nom = document.createElement("h2");
        nom.textContent = champion.name;

        const titre = document.createElement("p");
        titre.textContent = champion.title;

        // Ajout à la liste
        div.appendChild(img);
        div.appendChild(nom);
        div.appendChild(titre);
        list.appendChild(div);
    });
}

function afficherItems(items) {
    const list = document.getElementById("items-list");
    list.innerHTML = ""; // Nettoie la liste

    Object.values(items).forEach(item => {
        // console.log(item.maps);
        if (item.maps[11] === false || item.gold.total === 0 || item.maps[21] === false || item.tags.includes('Consumable') || item.consumed === true) {
            // pass
        }
        // if (item.consumed === true || item.maps[11] === false || item.gold.total === 0 || item.maps[21] === false) {
        //     // pass
        // }
        else {
            const div = document.createElement("div");
            div.className = "item";

            // Création de l'image de l'item
            const img = document.createElement("img");
            img.src = `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image.full}`;
            img.alt = item.name;
            
            // Nom + titre du champion
            const nom = document.createElement("h2");
            nom.textContent = item.gold.total;

            // Ajout à la liste
            div.appendChild(img);
            div.appendChild(nom);
            list.appendChild(div);
        }
    });
}