# Réponses TP2 - Auth Context & Protected Layout

## Partie 3 - Questions Auth Context

**Q2 : Pourquoi le useAuth() lance une erreur si le context est null ? Quel bug ça prévient ?**

Le useAuth() lance une erreur si le context est null pour prévenir le bug du "context manquant". Si un composant essaie d'utiliser useAuth() en dehors d'un AuthProvider, le context serait null et causerait des erreurs imprévisibles (accès à state.user, dispatch, etc.).

**Bugs prévenus :**
- Cannot read property 'user' of null
- Cannot read property 'dispatch' of null
- Erreurs silencieuses difficiles à debugger

**Solution :** L'erreur explicite "useAuth doit être utilisé dans un AuthProvider" aide immédiatement à identifier le problème structurel.

---

**Q3 : Sans Context, comment feriez-vous pour partager le user entre Header, Sidebar et Login ? Combien de props ?**

Sans Context, il faudrait faire du "prop drilling"  :

```
App (state auth)
 ├─ Login (user, setUser, loading, error)
 ├─ Dashboard (user, setUser)
     ├─ Header (user, onLogout)
     └─ Sidebar (user)
         └─ MainContent (user)
```

**Props nécessaires :**
- App → Login : `user`, `setUser`, `loading`, `error` (4 props)
- App → Dashboard : `user`, `setUser` (2 props)  
- Dashboard → Header : `user`, `onLogout` (2 props)
- Dashboard → Sidebar : `user` (1 prop)

**Total : 9 props à traverser les composants !**

**Problèmes :**
- Code répétitif
- Maintenance difficile (changer une prop = modifier plusieurs composants)
- Performance (re-rendus inutiles)
- Perte de lisibilité

**Avantage du Context :** Un seul Provider, un seul hook useAuth().

---

## Partie 4 - Questions Login

**Q4 : Pourquoi e.preventDefault() est indispensable dans handleSubmit ?**

e.preventDefault() est indispensable pour empêcher le comportement par défaut du formulaire qui est de :
1. Recharger la page
2. Envoyer les données du formulaire en HTTP (GET/POST)
3. Effacer le state React

**Sans preventDefault() :**
- Page recharge → perte du state React
- User revient au formulaire vide
- Requête fetch annulée
- Mauvaise expérience utilisateur
- **SPA cassé** : Single Page Application devient Multi Page Application

**Avec preventDefault() :**
- Pas de rechargement
- Contrôle total via React
- Gestion asynchrone possible
- State préservé
- **SPA respecté** : Navigation fluide sans rechargement

---

**Q5 : Que fait la destructuration { password: _, ...user } ? Pourquoi exclure le password ?**

La destructuration `{ password: _, ...user }` :
- `password: _` : Extrait le password dans une variable `_` (ignorée)
- `...user` : Copie toutes les autres propriétés dans un nouvel objet

**Pourquoi exclure le password :**
1. **Sécurité** : Ne jamais stocker le password en mémoire/localStorage
2. **Principe du moindre privilège** : Le UI n'a pas besoin du password
3. **Réduction des risques** : Si leak mémoire, password pas exposé
4. **Netteté** : State auth ne contient que les données utiles

**Important :** En production, les passwords seraient hashés (bcrypt), jamais stockés en clair !

---

## Partie 5 - Questions Protected Layout

**Q6 : Pourquoi le Dashboard est un composant séparé et pas tout dans App ?**

**Séparation des responsabilités :**
- **App** : Logique de routing (login vs dashboard)
- **Dashboard** : Logique métier (données, UI authentifiée)

**Avantages :**
1. **Lisibilité** : Chaque composant a une mission claire
2. **Maintenabilité** : Modifier le dashboard n'affecte pas la logique d'auth
3. **Performance** : Login ne charge pas les données du dashboard
4. **Testabilité** : Peut tester App et Dashboard séparément
5. **Réutilisabilité** : Dashboard pourrait être utilisé ailleurs

**Pattern "Container/Presentation" :**
- App = Container (logique, state)
- Dashboard = Presentation (UI authentifiée)

---

## Partie 7 - Questions useLayoutEffect

**Q9 : Pourquoi le flash disparaît avec useLayoutEffect ?**

**Avec useEffect (flash visible) :**
```
1. Render initial → position = {0, 0}
2. Commit → DOM peint avec tooltip en (0,0) 
3. useEffect s'exécute → setPosition(position réelle)
4. Re-render → tooltip saute à la bonne position
```
**Résultat :** L'utilisateur voit le tooltip apparaître en (0,0) puis sauter.

**Avec useLayoutEffect (pas de flash) :**
```
1. Render initial → position = {0, 0}
2. Commit → DOM prêt mais PAS encore peint
3. useLayoutEffect s'exécute → setPosition(position réelle)
4. Paint → DOM peint directement avec la bonne position
```
**Résultat :** L'utilisateur ne voit que la position finale, pas de flash.

**Différence clé :** useLayoutEffect s'exécute AVANT le paint, useEffect APRÈS le paint.

---

**Q10 : Pourquoi ne pas utiliser useLayoutEffect partout si c'est mieux ?**

**useLayoutEffect n'est PAS "mieux", c'est différent :**

**Problèmes de useLayoutEffect :**
1. **Performance** : Bloque le paint → peut causer du lag
2. **UX** : Si l'opération est longue, l'écran reste figé
3. **Complexité** : Plus difficile à debugger (pas visible dans DevTools)
4. **Rarement nécessaire** : 95% des cas = useEffect suffit

**Quand utiliser useLayoutEffect :**
- Calculs de position DOM (getBoundingClientRect)
- Animations synchrones
- Mesures avant le premier paint
- Éviter les flashes visuels

**Quand utiliser useEffect :**
- Requêtes API
- Souscriptions (WebSocket, events)
- Side effects non bloquants
- La plupart des cas d'usage

**Règle d'or :** 
- Commencez avec useEffect
- Passez à useLayoutEffect SEULEMENT si vous voyez un flash/bug visuel

---

## Partie 6 - Questions Header & Flux

**Q7 : Testez le flux complet : login avec admin@taskflow.com / admin123 → Dashboard → Déconnexion → Login.**

**Flux testé et fonctionnel :**
1. **Login** : admin@taskflow.com / admin123
2. **Dashboard** : Header affiche "Admin" + bouton déconnexion
3. **Déconnexion** : Retour au formulaire login
4. **State** : Correctement réinitialisé à chaque étape

**Points vérifiés :**
- Requête fetch vers /users?email=admin@taskflow.com
- Validation password admin123
- Extraction user sans password
- Mise à jour state auth
- Header conditionnel (userName + logout)
- Protected layout fonctionne

---

**Q8 : onLogout est un CALLBACK. Dessinez le flux : Header → onClick → onLogout → dispatch LOGOUT → App re-render → Login.**

```
Header (bouton Déconnexion)
    ↓ onClick
onLogout (callback prop)
    ↓ appel
dispatch({ type: 'LOGOUT' })
    ↓ reducer
authReducer(LOGOUT) → initialState
    ↓ state change
useAuth() hook → state.user = null
    ↓ re-render
App() → !authState.user ? <Login /> : <Dashboard />
    ↓ condition
return <Login />
    ↓ render
Login component affiché
```

**Flux détaillé :**
1. **User action** : Click sur bouton "Déconnexion"
2. **Event handler** : Header appelle `onLogout()`
3. **Callback** : `onLogout` vient de App = `() => dispatch({ type: 'LOGOUT' })`
4. **Dispatch** : Action LOGOUT envoyée au reducer
5. **Reducer** : `authReducer` retourne `initialState`
6. **State update** : `authState.user` devient `null`
7. **Hook update** : `useAuth()` détecte le changement
8. **Re-render** : App re-rend avec nouveau state
9. **Conditional render** : `!authState.user` = true → affiche `<Login />`
10. **UI result** : Page de login affichée

**Key insight :** Le callback permet au composant enfant (Header) de déclencher une action dans le parent (App) sans connaître les détails de l'implémentation.
