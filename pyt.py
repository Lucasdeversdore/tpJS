import json

with open("./data/item.json", encoding="utf-8") as f:
    data = json.load(f)

# Extraire uniquement les champs nécessaires
items_simplified = {}
for item_id, item_data in data["data"].items():
    if item_data["gold"]["total"] == 0 or item_data["maps"]["11"] is False or item_data["maps"]["21"] is False or "Consumable" in item_data["tags"] or item_data["stats"] == {}:
        pass
    else:
        items_simplified[item_id] = {
            "id": item_id,
            "name": item_data["name"],
            "plaintext": item_data["plaintext"],
            "image": item_data["image"]["full"],
            "gold": item_data["gold"]["total"],
            "tags": item_data["tags"],
            "stats": item_data["stats"]
        }

# Sauvegarder en JSON simplifié
with open("./data/items_simplified.json", "w", encoding="utf-8") as f:
    json.dump(items_simplified, f, ensure_ascii=False, indent=4)

print("JSON pour les items simplifié généré avec succès !")

with open("./data/champion.json", encoding="utf-8") as f:
    data = json.load(f)

# Extraire uniquement les champs nécessaires
champions_simplified = {}
for champion_id, champion_data in data["data"].items():
    champions_simplified[champion_id] = {
        "id": champion_data["id"],
        "name": champion_data["name"],
        "title": champion_data["title"],
        "image": champion_data["image"]["full"],
        "tags": champion_data["tags"],
        "stats": {
            "hp" : champion_data["stats"]["hp"],
            "mp" : champion_data["stats"]["mp"],
            "armor" : champion_data["stats"]["armor"],
            "spellblock" : champion_data["stats"]["spellblock"],
            "attackdamage" : champion_data["stats"]["attackdamage"],
            "attackspeed" : champion_data["stats"]["attackspeed"],
            "attackrange" : champion_data["stats"]["attackrange"],
            "movespeed" : champion_data["stats"]["movespeed"],
            "crit" : champion_data["stats"]["crit"],
            "attackspeed" : champion_data["stats"]["attackspeed"]
        }
    }

# Sauvegarder en JSON simplifié
with open("./data/champions_simplified.json", "w", encoding="utf-8") as f:
    json.dump(champions_simplified, f, ensure_ascii=False, indent=4)

print("JSON pour les champions simplifié généré avec succès !")