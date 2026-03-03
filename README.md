# Réponses TP TaskFlow - Séance 1

## Partie 1.2 - Question sur index.html

**➤ Ouvrez index.html. Que contient le <body> ? Lien avec le CSR ?**

Le `<body>` contient :
- `<div id="root"></div>` : Le point de montage où React va injecter l'application
- `<script type="module" src="/src/main.tsx"></script>` : Le script d'entrée qui lance l'application React

**Lien avec le CSR (Client-Side Rendering) :**
- Le HTML est minimal, juste un conteneur vide
- Le contenu est généré dynamiquement par React dans le navigateur
- Le script `main.tsx` prend le contrôle et rend les composants dans `#root`
- C'est du CSR pur : le serveur envoie un HTML vide, le client construit l'UI

## Partie 2.3 - Question sur API REST

**➤ Quelle différence entre des données en dur dans le code et une API REST ?**

**Données en dur (hardcoded data) :**
- Données écrites directement dans le code source
- Statiques, non modifiables sans recompiler
- Rapides à implémenter pour des tests ou prototypes
- Exemple: `const users = [{name: "Alice"}, {name: "Bob"}];`

**API REST :**
- Interface de communication standardisée entre un client (frontend) et un serveur (backend) via HTTP
- Données dynamiques, peuvent être mises à jour en temps réel
- Sépare clairement les responsabilités : frontend pour l'UI, backend pour la logique métier
- Permet la persistance des données
- Nécessite un serveur et une connexion réseau
- Exemple: `GET /api/users` retourne les utilisateurs depuis une base de données

**Principale différence :** Les données en dur sont statiques et intégrées au code, tandis qu'une API REST fournit un accès dynamique à des données externes via des requêtes HTTP.

## Partie 3.1 - Question sur className

**➤ Pourquoi className au lieu de class en JSX ?**

En JSX, `className` est utilisé au lieu de `class` car :
- `class` est un mot réservé en JavaScript (pour déclarer des classes ES6)
- JSX est une extension JavaScript, donc doit respecter les contraintes JS
- React transforme `className` en `class` HTML lors du rendu
- Évite les conflits de syntaxe avec le mot-clé `class`

## Partie 3.2 - Question sur key

**➤ Pourquoi key={p.id} est obligatoire dans .map() ? Que se passe-t-il avec l'index ?**

**Pourquoi `key` est obligatoire :**
- Aide React à identifier chaque élément de manière unique
- Optimise les mises à jour du DOM (reconciliation)
- Permet à React de réutiliser les éléments existants au lieu de les recréer
- Essentiel pour les animations et les performances

**Avec l'index comme clé :**
```jsx
{projects.map((p, i) => (
  <li key={i}> //  Problématique
```

**Problèmes avec l'index :**
- **Vrai danger** : Si les listes sont dynamiques (ajout/suppression/réorganisation), React peut réutiliser le mauvais élément et mélanger les états internes (ex: input, focus, animation)
- **Index non stable** : Si on insère un élément au début, tous les index changent → React pense que tous les éléments sont différents et les remonte tous
- Ajout/suppression d'éléments = **React recrée toute la liste** au lieu de faire des mises à jour ciblées
- Peut causer des bugs d'affichage et de performance
- **Conséquence** : React démonte tous les éléments et les remonte, même si seule la position a changé

**Solution :** Utiliser un identifiant unique stable (`p.id`)

## Partie 4 - Questions sur useEffect et fetch

**Q1 : Combien de fois le useEffect s'exécute-t-il ? Pourquoi ?**
Le useEffect s'exécute **2 fois** en développement avec `npm run dev` car :
- **Strict Mode de React** : En développement, React enveloppe l'application dans `<StrictMode>` pour détecter les problèmes
- **Purpose du Strict Mode** : Il exécute intentionnellement les effets deux fois pour :
  - Révéler les effets de bord imprévus
  - S'assurer que le code est résilient aux montages/démontages répétés
  - Détecter les fuites de mémoire ou les nettoyages manquants

**En production** : Le useEffect s'exécute **1 seule fois** (comportement normal)

**Solution pour observer le comportement normal** :
- Commenter `<StrictMode>` dans `main.tsx` OU
- Observer qu'en production le comportement sera correct (1 seule exécution)

**Q2 : Arrêtez json-server (Ctrl+C) et rechargez. Que se passe-t-il ?**
Si vous arrêtez json-server et rechargez la page :
- Les requêtes fetch vers `http://localhost:4000/projects` et `http://localhost:4000/columns` échoueront
- Le `catch` sera déclenché et affichera "Erreur:" dans la console
- `setLoading(false)` s'exécutera dans le `finally`
- L'état `projects` et `columns` restera vide (`[]`)
- L'interface s'affichera mais sans données (projects vide, columns vide)

**Q3 : Ouvrez Network (F12). Voyez-vous les requêtes vers localhost:4000 ? Code HTTP ?**
Oui, vous verrez deux requêtes :
- `GET http://localhost:4000/projects` → Code HTTP 200 (si json-server fonctionne)
- `GET http://localhost:4000/columns` → Code HTTP 200 (si json-server fonctionne)

Si json-server est arrêté, vous verrez des erreurs de connexion (échec de la requête).

**Q4 : Les nouvelles données s'affichent ? Décrivez le cycle complet.**
Oui, les nouvelles données s'affichent. Cycle complet :
1. Montage du composant App
2. useEffect se déclenche (une seule fois)
3. `fetchData()` est appelée
4. Deux requêtes fetch parallèles vers json-server
5. Réponses reçues (JSON)
6. `setProjects()` et `setColumns()` mettent à jour l'état
7. Re-rendu du composant avec les nouvelles données
8. Les composants Sidebar et MainContent reçoivent les props
9. L'affichage se met à jour avec les données

**Q5 : Dessinez le flux**
```
json-server (port 4000)
    ↓ (données JSON via API REST)
fetch() dans useEffect
    ↓ (promesses résolues)
await projRes.json() / await colRes.json()
    ↓ (données parsées)
setProjects() / setColumns() (useState)
    ↓ (mise à jour d'état)
Re-rendu du composant App
    ↓ (props passées)
Sidebar (projects={projects}) ← MainContent (columns={columns})
    ↓ (rendu UI)
Affichage des projets et colonnes dans l'interface
```

Le flux est unidirectionnel : **Serveur → Fetch → État → Composants → UI**
