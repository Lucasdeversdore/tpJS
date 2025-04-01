import { CONFIG } from "./config.js";

class Items {
    constructor() {
        this.itemsData = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 60;
    }

    // Fonction pour récupérer les items
    async fetchItems() {
        try {
            const response = await fetch(CONFIG.itemsUrl);
            const data = await response.json();
            this.itemsData = Object.values(data); // Tous les objets
            this.filteredItems = [...this.itemsData];
            this.render();
            this.addSearchListener();  // Ajouter le listener de recherche après le chargement des données
        } catch (error) {
            console.error("Erreur lors du chargement des items :", error);
        }
    }

    // Fonction pour afficher la liste des items et la pagination et la recherche
    render() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h1>Liste des Items</h1>
            <input type="text" id="search-items" placeholder="Rechercher un item" />
            <ul id="items-list"></ul>
            <div id="pagination"></div>
        `;

        this.renderList(this.getPaginatedData());  // Afficher les items en fonction de la page actuelle
        this.renderPagination();  // Afficher la pagination
        this.lazyLoadImages(); // Appliquer le lazy loading sur les images
    }

    // Fonction pour afficher la liste des items
    renderList(items) {
        const list = document.getElementById("items-list");
        list.innerHTML = "";

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <div class="item-container">
                    <img class="lazy" 
                         data-src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image}" 
                         alt="${item.name}" 
                         src="https://via.placeholder.com/150x150?text=Loading" 
                         data-id="${item.id}" />
                    <span class="item-name">${item.name}</span>
                    <h2>${item.gold}</h2>
                </div>
            `;
            list.appendChild(div);
        });

        // Activer le lazy loading après le rendu
        this.lazyLoadImages();

        // Ajouter un gestionnaire d'événement pour les clics sur les images
        this.addItemClickListeners();
    }

    // Fonction pour ajouter un listener sur les images des items
    addItemClickListeners() {
        const itemImages = document.querySelectorAll(".item-container img");
        itemImages.forEach(image => {
            image.addEventListener("click", (event) => {
                const itemId = event.target.getAttribute("data-id");
                this.showItemDetails(itemId);
            });
        });
    }

    // Fonction pour afficher les détails d'un item
    // Fonction pour afficher les détails d'un item
    showItemDetails(itemId) {
        const item = this.itemsData.find(i => i.id == itemId);
        if (!item) return;

        const content = document.getElementById("content");
        content.innerHTML = `
        <button id="back-btn" style="position: absolute; top: 10px; left: 10px;">Retour</button>
        <h1>${item.name}</h1>
        <img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image}" alt="${item.name}" />
        <h2>Prix: ${item.gold}</h2>
        <p><strong>Stats :</strong></p>
        <ul>
            <li><strong>Attaque :</strong> ${item.stats.FlatPhysicalDamageMod || 'N/A'}</li>
            <li><strong>Défense :</strong> ${item.stats.FlatArmorMod || 'N/A'}</li>
            <li><strong>Magie :</strong> ${item.stats.FlatMagicDamageMod || 'N/A'}</li>
            <li><strong>Vitesse d'attaque :</strong> ${item.stats.PercentAttackSpeedMod ? (item.stats.PercentAttackSpeedMod * 100) + "%" : 'N/A'}</li>
            <li><strong>Vie :</strong> ${item.stats.FlatHPPoolMod || 'N/A'}</li>
            <li><strong>Mana :</strong> ${item.stats.FlatMPPoolMod || 'N/A'}</li>
            <li><strong>Résistance magique :</strong> ${item.stats.FlatSpellBlockMod || 'N/A'}</li>
            <li><strong>Coup critique :</strong> ${item.stats.FlatCritChanceMod ? (item.stats.FlatCritChanceMod * 100) + "%" : 'N/A'}</li>
            <li><strong>Vitesse de déplacement :</strong> ${item.stats.FlatMovementSpeedMod || 'N/A'}</li>
            <li><strong>Accélération des compétences :</strong> ${item.stats.CooldownReduction || 'N/A'}</li>
        </ul>
    `;

        // Ajouter l'événement pour revenir à la liste des items
        document.getElementById("back-btn").addEventListener("click", () => {
            this.render();
        });
    }


    // La pagination
    renderPagination() {
        const pagination = document.getElementById("pagination");
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);

        let paginationHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">Précédent</button>
            <span>Page ${this.currentPage} sur ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page">Suivant</button>
        `;

        pagination.innerHTML = paginationHTML;

        // Bouton pour changer de page
        document.getElementById("prev-page").addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderList(this.getPaginatedData());
                this.renderPagination();
            }
        });

        document.getElementById("next-page").addEventListener("click", () => {
            const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderList(this.getPaginatedData());
                this.renderPagination();
            }
        });
    }

    // Fonction pour obtenir les items pour la page actuelle
    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredItems.slice(startIndex, endIndex); // Paginer les items filtrés
    }

    // Fonction pour ajouter le listener de recherche
    addSearchListener() {
        const searchInput = document.getElementById("search-items");
        searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase();

            // Filtrer les items par nom ou prix
            this.filteredItems = this.itemsData.filter(item => {
                const itemNameMatch = item.name.toLowerCase().includes(searchTerm);
                const itemPriceMatch = item.gold.toString().toLowerCase().includes(searchTerm);
                return itemNameMatch || itemPriceMatch; // Retourner les items qui matchent soit par nom soit par prix
            });

            this.currentPage = 1;

            // Affichage avec pagination et filtre
            this.renderList(this.getPaginatedData());
            this.renderPagination();
        });
    }

    // Fonction de lazy loading pour les images
    lazyLoadImages() {
        const images = document.querySelectorAll('.lazy');

        const options = {
            rootMargin: '0px 0px 200px 0px', // Chargement des images légèrement avant qu'elles ne soient visibles en fonction de ou elle est vers le bas
            threshold: 0.01 // L'image doit être à 1% visible pour être chargée
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src; // Charge l'image
                    img.classList.remove('lazy'); // Empêche le rechargement
                    observer.unobserve(img);
                }
            });
        }, options);

        images.forEach(image => observer.observe(image));
    }
}

export function afficherItems() {
    const items = new Items();
    items.fetchItems();
}
