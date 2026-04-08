# TP5 — Réponses v2

## Projet TaskFlow — JWT, Redux Toolkit & Performance

## Partie 1 — Sécurité XSS

### Q1 — Le script s'exécute-t-il avec `{dangerousName}` dans le JSX ?
Non, le script ne s'exécute pas. React échappe automatiquement les chaînes dans le JSX. Les caractères `<`, `>`, `"` sont transformés en entités HTML, donc `<img src=x onerror=alert("HACK")>` s'affiche comme du texte brut et n'est pas interprété par le navigateur.

### Q2 — Que se passe-t-il avec `dangerouslySetInnerHTML` ?
Avec `dangerouslySetInnerHTML`, React n'échappe plus le contenu. Le HTML est injecté tel quel dans le DOM, et le navigateur interprète le `<img>` ainsi que son attribut `onerror`. Cela provoque l'exécution du script malveillant. C'est une faille XSS réelle si le contenu provient d'un utilisateur ou d'une API.

## Partie 2 — Authentification JWT simulée

### Q3 — Voit-on le header `Authorization: Bearer ...` dans Network ?
Oui. Après connexion, l'intercepteur Axios doit ajouter automatiquement `Authorization: Bearer <token>` aux requêtes. Dans l'onglet Réseau de l'inspecteur, la requête `GET /projects` doit afficher ce header dans les Request Headers.

### Q4 — Pourquoi stocker le token dans le state React et PAS dans `localStorage` ?
- `localStorage` est accessible à tout code JavaScript exécuté sur la page.
- En cas de XSS, un script malveillant peut lire `localStorage` et voler le token.
- Le state React est stocké en mémoire et n'est pas exposé directement aux scripts externes.

Ce n'est pas une protection absolue, mais c'est plus sûr que `localStorage`. En production, la meilleure pratique est d'utiliser des cookies `HttpOnly` pour combiner persistance et protection contre le XSS.

## Partie 3 — Migration auth vers Redux Toolkit

### Q5 — Comparaison `authSlice.ts` vs ancien `authReducer.ts`
- `authReducer.ts` utilise un `switch/case` et des types d'action manuels comme `'LOGIN_START'`, `'LOGIN_SUCCESS'`, `'LOGIN_FAILURE'`.
- `authSlice.ts` utilise `createSlice()` de Redux Toolkit avec des reducers nommés : `loginStart`, `loginSuccess`, `loginFailure`, `logout`.
- Dans l'ancien reducer, l'immutabilité est gérée manuellement par des objets copiés (`return { ...state, loading: true }`).
- Dans `authSlice.ts`, Redux Toolkit utilise Immer : on peut écrire `state.user = ...` directement, et Immer produit un nouvel état immuable en interne.
- `authSlice.ts` réduit le boilerplate, génère automatiquement des action creators et améliore la lisibilité.

## Partie 4 — Performance

### Q6 — Quels composants se re-rendent au toggle sidebar ?
Avant optimisation, le toggle de la sidebar peut re-render :
- `Dashboard` (normal)
- `Sidebar` (normal)
- `Header` (inutile si ses props ne changent pas)
- `MainContent` (inutile si ses props ne changent pas)

Ceux qui ne devraient pas se re-render sont `Header` et `MainContent`.

### Q7 — Pourquoi `MainContent` ne se re-render plus avec `React.memo` ?
`React.memo` mémorise le composant et compare ses props en surface. Si les props ne changent pas entre deux renders (même référence), le composant n'est pas re-rendu. Pour `MainContent`, si `columns` conserve la même référence après le toggle sidebar, React saute le re-render.

### Q8 — Différence entre `useMemo` et `useCallback`
- `useMemo(fn, deps)` mémoïse le résultat d'un calcul. Il retourne une valeur.
- `useCallback(fn, deps)` mémoïse une fonction. Il retourne une référence de fonction.

On utilise `useCallback` quand on passe une fonction en prop à un composant mémoïsé, afin que la référence de la fonction ne change pas inutilement. On utilise `useMemo` pour éviter de recalculer une valeur coûteuse.

## Partie 5 — Custom Hook `useProjects`

### Q9 — Pourquoi extraire la logique dans un hook ?
Le custom hook `useProjects` permet de :
- centraliser la logique `fetch`, `addProject`, `renameProject`, `deleteProject`
- alléger le composant `Dashboard`
- réutiliser la logique ailleurs si nécessaire
- améliorer la testabilité et la lisibilité

En déplaçant la logique métier dans un hook, `Dashboard.tsx` devient un composant plus simple, centré sur l'affichage.

## Partie 6 — React Profiler

### Q10 — Résultats attendus du Profiler
- Avant optimisation : `Dashboard`, `Sidebar`, `Header` et `MainContent` peuvent se re-render lors du toggle sidebar.
- Après optimisation : `Header` et `MainContent` doivent être globalement skippés si leurs props ne changent pas.
- Le nombre de composants re-rendus diminue, et la durée du rendu est réduite.

### Autres points de profilage
- Si un callback est défini inline dans `Dashboard`, `Header` peut encore se re-render même avec `React.memo`.
- `useCallback` permet de stabiliser les fonctions passées en prop, ce qui évite des re-renders superflus.

## Notes finales
- `authSlice.ts` remplace `authReducer.ts` et `AuthContext.tsx`.
- `main.tsx` doit utiliser `<Provider store={store}>`.
- `Login` / `ProtectedRoute` / `Dashboard` / `ProjectDetail` doivent utiliser `useSelector` et `useDispatch`.
- `axios.ts` doit exposer `setAuthToken` pour synchroniser le token avec le header `Authorization`.
