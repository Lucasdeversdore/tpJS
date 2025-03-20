import json

# Charger le JSON des items (remplace 'item.json' par le bon fichier)
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

print("JSON simplifié généré avec succès !")