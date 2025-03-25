document.addEventListener("DOMContentLoaded", () => {
    const routes = {
        "/": afficherChampions,
        "/items": afficherItems
    };

    function router() {
        const path = window.location.pathname;
        const renderFunction = routes[path] || afficherChampions;
        renderFunction();
    }

    document.getElementById("champions-link").addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({}, "", "/");
        router();
    });

    document.getElementById("items-link").addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({}, "", "/items");
        router();
    });

    window.addEventListener("popstate", router);
    router();
});

function afficherChampions() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h1>Liste des Champions</h1>
        <input type="text" id="search-champions" placeholder="Rechercher un champion" />
        <ul id="champions-list"></ul>
    `;

    fetch(CONFIG.championsUrl)
        .then(response => response.json())
        .then(data => {
            window.championsData = Object.values(data); // Stocker les champions pour la recherche
            afficherChampionsFiltrés(window.championsData);
            ajouterRechercheChampions(); // Réactiver la recherche
        });
}

function afficherChampionsFiltrés(champions) {
    const list = document.getElementById("champions-list");
    list.innerHTML = "";

    champions.forEach(champion => {
        const div = document.createElement("div");
        div.className = "champion";
        div.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg" alt="${champion.name}">
                         <h2>${champion.name}</h2><p>${champion.title}</p>`;
        list.appendChild(div);
    });
}

function ajouterRechercheChampions() {
    const searchInput = document.getElementById("search-champions");
    
    searchInput.addEventListener("input", function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredChampions = window.championsData.filter(champion => 
            champion.name.toLowerCase().includes(searchTerm) || 
            champion.title.toLowerCase().includes(searchTerm)
        );
        afficherChampionsFiltrés(filteredChampions);
    });
}

function afficherItems() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h1>Liste des Items</h1>
        <ul id="items-list"></ul>
    `;

    fetch(CONFIG.itemsUrl)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("items-list");
            list.innerHTML = "";

            Object.values(data).forEach(item => {
                const div = document.createElement("div");
                div.className = "item";
                div.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image}" alt="${item.name}">
                                 <h2>${item.gold}</h2>`;
                list.appendChild(div);
            });
        });
}
