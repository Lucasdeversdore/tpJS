document.addEventListener("DOMContentLoaded", () => {
    fetch(CONFIG.championsUrl)
        .then(response => response.json())
        .then(data => afficherChampions(data.data)) // On récupère le sous-objet "data"
        .catch(error => console.error("Erreur lors du chargement des champions :", error));
});

function afficherChampions(champions) {
    const list = document.getElementById("champions-list");
    list.innerHTML = ""; // Nettoie la liste

    Object.values(champions).forEach(champion => {
        const li = document.createElement("li");

        // Création de l'image du champion
        const img = document.createElement("img");
        img.src = `https://ddragon.leagueoflegends.com/cdn/15.5.1/img/champion/${champion.image.full}`;
        img.alt = champion.name;
        img.width = 80;

        // Nom + titre du champion
        const text = document.createElement("span");
        text.textContent = `${champion.name} - ${champion.title}`;

        // Ajout à la liste
        li.appendChild(img);
        li.appendChild(text);
        list.appendChild(li);
    });
}
