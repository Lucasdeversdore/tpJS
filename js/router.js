import { afficherChampions } from "./champions.js";
import { afficherItems } from "./items.js";
import { afficherChampionDetails } from "./championDetails.js";

const routes = {
    "/": afficherChampions,
    "/items": afficherItems
};

export function router() {
    const path = window.location.pathname;
    console.log(path);

    // if (path.startsWith("/champion/")) {
    //     const championId = path.split("/").pop();
    //     console.log(championId);
    //     afficherChampionDetails(championId);
    // } else {
        (routes[path] || afficherChampions)();
    // }
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
