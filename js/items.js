import { CONFIG } from "./config.js";

class Items {
    constructor() {
        this.itemsData = []; // Contiendra les données des items
        this.filteredItems = []; // Contiendra les items filtrés en fonction de la recherche
        this.currentPage = 1; // Page actuelle pour la pagination
        this.itemsPerPage = 60; // Nombre d'items par page
    }

    // Fonction pour récupérer les items
    async fetchItems() {
        try {
            const response = await fetch(CONFIG.itemsUrl); // Récupère les données depuis l'URL configurée
            const data = await response.json(); // Convertit la réponse en format JSON
            this.itemsData = Object.values(data); // Transforme les données en un tableau d'objets
            this.filteredItems = [...this.itemsData]; // Initialisation des items filtrés
            this.render(); // Appelle la fonction render pour afficher les items
            this.addSearchListener();  // Ajoute le listener de recherche après le chargement des données
        } catch (error) {
            console.error("Erreur lors du chargement des items :", error); // Gère l'erreur si la récupération échoue
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

        this.renderList(this.getPaginatedData());  // Affiche les items en fonction de la page actuelle
        this.renderPagination();  // Affiche la pagination
        this.lazyLoadImages();  // Charge les images de façon différée pour améliorer les performances
    }

    // Fonction pour afficher la liste des items
    renderList(items) {
        const list = document.getElementById("items-list");
        list.innerHTML = ""; // Vide la liste avant d'ajouter les nouveaux éléments

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "item"; // Classe pour chaque élément de la liste
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

        this.lazyLoadImages(); // Fonction de lazy loading des images
        this.addItemClickListeners(); // Ajoute des listeners pour gérer les clics sur les items
    }

    // Fonction pour ajouter un listener sur les images des items
    addItemClickListeners() {
        const itemImages = document.querySelectorAll(".item-container img");
        itemImages.forEach(image => {
            image.addEventListener("click", (event) => {
                const itemId = event.target.getAttribute("data-id"); // Récupère l'ID de l'item sur lequel on a cliqué
                this.showItemDetails(itemId); // Affiche les détails de l'item
            });
        });
    }

    // Fonction pour afficher les détails d'un item lorsqu'il est cliqué
    showItemDetails(itemId) {
        const item = this.itemsData.find(i => i.id == itemId);
        if (!item) return;
    
        const content = document.getElementById("content");
        content.innerHTML = `
            <div class="item-details">
                <button id="back-btn">Retour</button>
                <h1>${item.name}</h1>
                <img src="https://ddragon.leagueoflegends.com/cdn/15.5.1/img/item/${item.image}?nocache=${new Date().getTime()}" alt="${item.name}" />
                <h2>Prix: ${item.gold}</h2>
                <p><strong>Description :</strong> ${item.plaintext || "Aucune description disponible"}</p>
                <p><strong>Stats :</strong></p>
                
                <div class="stats-container">
                    <ul class="stats-row">
                        <li><strong>Attaque :</strong> ${item.stats.FlatPhysicalDamageMod || 'N/A'}</li>
                        <li><strong>Défense :</strong> ${item.stats.FlatArmorMod || 'N/A'}</li>
                        <li><strong>Magie :</strong> ${item.stats.FlatMagicDamageMod || 'N/A'}</li>
                        <li><strong>Vitesse d'attaque :</strong> ${item.stats.PercentAttackSpeedMod ? `+${(item.stats.PercentAttackSpeedMod * 100).toFixed(0)}%` : 'N/A'}</li>
                        <li><strong>Vie :</strong> ${item.stats.FlatHPPoolMod || 'N/A'}</li>
                    </ul>
    
                    <ul class="stats-row">
                        <li><strong>Mana :</strong> ${item.stats.FlatMPPoolMod || 'N/A'}</li>
                        <li><strong>Résistance magique :</strong> ${item.stats.FlatSpellBlockMod || 'N/A'}</li>
                        <li><strong>Coup critique :</strong> ${item.stats.FlatCritChanceMod ? `+${(item.stats.FlatCritChanceMod * 100).toFixed(0)}%` : 'N/A'}</li>
                        <li><strong>Vitesse de déplacement :</strong> ${item.stats.FlatMovementSpeedMod || 'N/A'}</li>
                        <li><strong>Accélération des compétences :</strong> ${item.stats.CooldownReduction || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        `;
    
        // Ajouter l'événement pour revenir à la liste des items
        document.getElementById("back-btn").addEventListener("click", () => {
 
            this.currentPage = 1;
            this.render();
        });
    }

    // Fonction pour afficher la pagination
    renderPagination() {
        const pagination = document.getElementById("pagination");
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage); // Calcule le nombre total de pages

        let paginationHTML = `
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">Précédent</button>
            <span>Page ${this.currentPage} sur ${totalPages}</span>
            <button ${this.currentPage === totalPages ? 'disabled' : ''} id="next-page">Suivant</button>
        `;

        pagination.innerHTML = paginationHTML;

        // Boutons pour changer de page
        document.getElementById("prev-page").addEventListener("click", () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderList(this.getPaginatedData()); // Met à jour l'affichage
                this.renderPagination(); // Met à jour la pagination
            }
        });

        document.getElementById("next-page").addEventListener("click", () => {
            const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderList(this.getPaginatedData()); // Met à jour l'affichage
                this.renderPagination(); // Met à jour la pagination
            }
        });
    }

    // Fonction pour obtenir les items de la page actuelle
    getPaginatedData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredItems.slice(startIndex, endIndex); // Retourne les items filtrés pour la page actuelle
    }

    // Fonction pour ajouter le listener de recherche
    addSearchListener() {
        const searchInput = document.getElementById("search-items");
        searchInput.addEventListener("input", () => {
            const searchTerm = searchInput.value.toLowerCase(); // Récupère le terme de recherche en minuscule

            // Filtrer les items par nom ou prix
            this.filteredItems = this.itemsData.filter(item => {
                const itemNameMatch = item.name.toLowerCase().includes(searchTerm);
                const itemPriceMatch = item.gold.toString().toLowerCase().includes(searchTerm);
                return itemNameMatch || itemPriceMatch; // Retourne les items qui correspondent au nom ou au prix
            });

            this.currentPage = 1; // Réinitialise la page actuelle lors d'une nouvelle recherche

            // Affichage avec pagination et filtre
            this.renderList(this.getPaginatedData());
            this.renderPagination();
        });
    }

    // Fonction de lazy loading pour les images
    lazyLoadImages() {
        const images = document.querySelectorAll('.lazy');

        const options = {
            rootMargin: '0px 0px 200px 0px', // Chargement des images légèrement avant qu'elles ne soient visibles
            threshold: 0.01 // L'image doit être à 1% visible pour être chargée
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src; // Charge l'image
                    img.classList.remove('lazy'); // Enlève la classe lazy pour éviter de la charger à nouveau
                    observer.unobserve(img); // Arrête d'observer cette image
                }
            });
        }, options);

        images.forEach(image => observer.observe(image)); // Observateur pour chaque image
    }
}


export function afficherItems() {
    const items = new Items();
    items.fetchItems();
}
