# Réponses aux questions du TP — Séance 3

## Q1 — Pourquoi `<Navigate />` et pas `navigate()` ici ?

`ProtectedRoute` s'exécute au moment du render. Le hook `navigate()` ne peut pas être appelé directement dans le JSX (Rules of Hooks : pas d'appel conditionnel dans le render). `<Navigate />` est un composant React qui peut être retourné comme du JSX, ce qui est la bonne façon de rediriger pendant le rendu.

---

## Q2 — Différence entre `navigate(from)` et `navigate(from, { replace: true })`

- `navigate(from)` empile une nouvelle entrée dans l'historique du navigateur → le bouton Retour revient sur `/login`.
- `navigate(from, { replace: true })` remplace l'entrée courante dans l'historique → le bouton Retour ne peut plus revenir sur `/login`, il remonte à la page précédente.

---

## Q3 — Pourquoi `setProjects(prev => [...prev, data])` plutôt qu'un re-fetch GET ?

Pour éviter un aller-retour réseau inutile. Le serveur nous a déjà renvoyé la donnée créée dans la réponse POST (`data`). Mettre à jour le state directement est plus rapide, évite une race condition, et améliore la réactivité de l'interface (optimisme UI).

---

## Q4 — Scénarios de navigation

- **a) `/dashboard` sans être connecté** → redirigé vers `/login` par `ProtectedRoute`
- **b) `/projects/1` sans être connecté** → redirigé vers `/login` par `ProtectedRoute`
- **c) `/nimportequoi`** → redirigé vers `/dashboard` par la route `path="*"`
- **d) `/` (racine)** → redirigé vers `/dashboard` par `<Navigate to="/dashboard" replace />`
- **e) Connecté puis bouton Retour** → grâce à `replace: true` dans le `useEffect` de Login, le bouton Retour saute par-dessus `/login` et remonte à la page précédente, sans repasser par l'écran de connexion.

---

## Q5 — Différence entre `<Link>` et `<NavLink>` — Pourquoi NavLink ici ?

- `<Link>` génère simplement un `<a>` qui navigue sans recharger la page.
- `<NavLink>` fait la même chose mais expose en plus une prop `isActive` qui indique si le lien correspond à la route courante. Cela permet d'appliquer dynamiquement une classe CSS (`.active`) pour indiquer visuellement à l'utilisateur sur quel projet il se trouve — parfait pour une sidebar de navigation.

---

## Q6 — Ce qui change entre l'usage POST et PUT de `ProjectForm`

Le composant est identique, seules les props changent :

- **POST (création)** : `initialName=""`, `initialColor="#3498db"`, `submitLabel="Créer"`
- **PUT (modification)** : `initialName={project.name}`, `initialColor={project.color}`, `submitLabel="Modifier"`

C'est l'intérêt d'un composant réutilisable : même logique, comportement différent selon les props reçues.

---

## Q7 — Test sans json-server : le message d'erreur s'affiche-t-il ?

Oui. En arrêtant json-server et en tentant un POST, Axios lève une exception capturée dans le `catch`. Grâce à `axios.isAxiosError(err)`, on affiche un message d'erreur précis dans l'interface via le state `error`.

---

## Q8 — Comportement d'Axios vs fetch sur les erreurs HTTP

- Avec `fetch` : un code 404 ou 500 ne lève **pas** d'exception. Il faut vérifier manuellement `response.ok` pour détecter l'erreur.
- Avec **Axios** : toute réponse avec un code ≥ 400 lève automatiquement une exception, ce qui simplifie la gestion d'erreurs. `axios.isAxiosError(err)` permet d'accéder à `err.response?.status` et `err.response?.data` facilement.
