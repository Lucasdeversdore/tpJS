import { afficherChampions } from "./champions.js";
import { afficherItems } from "./items.js";

const routes = {
    "/": afficherChampions,
    "/items": afficherItems
};

export function router() {
    const path = window.location.pathname;
    const renderFunction = routes[path] || afficherChampions;
    renderFunction();
}

export function initRouter() {
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
}
