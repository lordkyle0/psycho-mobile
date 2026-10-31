# Psycho · Maîtrise de soi

Application mobile React Native (CLI, sans Expo) de **contrôle de soi** et de **suivi psychologique quotidien** fondée
sur les archétypes masculins et féminins : programme du jour (exercices, lecture biblique, lecture philosophique), bilan
matin / soir, objectifs du jour à l'année avec notes, **graphiques de progression**, sauvegarde locale, synchronisation
Google Sheets et rappels natifs du matin et du soir.

Même socle que `kelasi-mobile` et `dilonga-mobile` : React Native **0.86.3**, React 19.2.3, CLI 20.2.0, React Navigation 7,
Zustand, AsyncStorage v3, NetInfo, react-native-dotenv, Zod, mêmes scripts PowerShell Android, mêmes thème,
composants (`Card`, `Button`, `Input`, `TabIcon`, `Screen`) et graphiques (`components/charts`).

## Applications similaires étudiées

| App | Points forts repris | Ce qui manquait |
| --- | --- | --- |
| **Stoic** | Check-up matin / soir guidés, citations stoïciennes, journal structuré | Pas d'archétypes, pas de dimension biblique, pas d'objectifs multi-horizons |
| **Reflectly** | Check-in émotionnel en une minute, prompts quotidiens | Peu de structure, pas d'export tableur |
| **Journey** | Suivi humeur ↔ activités, objectifs personnalisables, graphiques | Pas de programme quotidien proposé |
| **Life Note** | Réflexion profonde « avec les grands esprits », dimension spirituelle | Pas de suivi chiffré de l'état |
| **Stoic Journal AI** | Citation du jour + prompt de réflexion + humeur | Pas d'objectifs, pas de synchro tableur |
| **Mythos (quiz d'archétypes)** | Cartes quotidiennes par archétype | Pas de suivi dans la durée |
| **Template Notion KWML** | Fiches Roi / Guerrier / Magicien / Amant, suivi hebdo | Pas mobile, pas de rappels, pas de pendant féminin |

## Fonctionnalités

- **Profil** masculin (Roi, Guerrier, Magicien, Amant — Moore & Gillette), féminin (Reine, Mère, Amazone, Sage-Mystique,
  Amante — d'après Toni Wolff) ou intégral (les 9).
- **Aujourd'hui** : anneau d'avancement et barres des 7 derniers jours, archétype du jour (rotation, ou un jour sur deux
  l'archétype le plus faible), verset (Segond 1910), plan de lecture (Proverbes, Psaumes, Évangiles), citation
  philosophique, 6 pratiques à cocher, objectifs du jour, série de jours consécutifs.
- **Bilan** : matin (intention, sommeil, énergie), plénitude et ombre de chaque archétype, soir (humeur, stress,
  gratitudes, victoires, leçons, notes). Sauvegarde automatique pendant la frappe.
- **Objectifs** jour / semaine ISO / mois / trimestre / année : statut, progression, archétype associé, notes ; par
  période, une évaluation et une note de bilan ; anneau « atteints », répartition des statuts, progression moyenne.
- **Progrès** (7, 30 ou 90 jours) — graphiques :
  - anneau de régularité (jours avec bilan) et moyennes humeur / énergie / stress / sommeil ;
  - courbes d'humeur, d'énergie, de stress et de sommeil (par jour sur 7 jours, moyenne hebdomadaire au-delà) ;
  - barres de plénitude et d'ombre par archétype (aux couleurs de chaque archétype) ;
  - barres des pratiques des 7 derniers jours ;
  - taux d'objectifs atteints par horizon ;
  - historique jour par jour, éditable.
- **Fiche archétype** : courbes plénitude / ombre sur 30 jours, forme mature, ombres, exercices.
- **Rappels natifs** matin et soir via `react-native-notify-kit` (successeur maintenu de Notifee) : déclencheurs
  quotidiens AlarmManager, conservés après redémarrage ; un appui ouvre le programme (matin) ou le bilan (soir).
- **Hors ligne d'abord** : chaque écriture est enregistrée immédiatement sur le téléphone (AsyncStorage).
- **Synchronisation Google Sheets** bidirectionnelle : au retour de la connexion, au retour au premier plan, 5 s après
  chaque modification, et par bouton ; fusion « dernier écrit gagne », suppressions propagées.

## Démarrage (Windows / Android)

```powershell
npm install
copy .env.example .env      # puis renseigner la feuille Google (voir ci-dessous)
npm start                   # Metro
npm run android             # build + installation (scripts/run-android.ps1)
```

Scripts identiques aux autres apps : `android:devices`, `android:reverse` (port Metro 8081), `android:clean`.

`npm run icons` régénère les icônes Android (lanceur, thème monochrome, notification) depuis
[`scripts/generate-icons.js`](scripts/generate-icons.js). Le logo SVG et l'icône 512 × 512 de la fiche Play Store sont
dans `assets/brand/`.
JDK 17 (Eclipse Adoptium) et SDK Android sont configurés dans `scripts/android-env.ps1` et `android/gradle.properties`.

Vérifications : `npm run check` (ESLint + TypeScript) et `npm test` (Jest) — exécutés aussi par la CI GitHub.

> Android 12+ : pour des rappels à la minute près, autorisez « Alarmes et rappels » (bouton dans Réglages). Sans cette
> autorisation, Android peut décaler légèrement l'heure d'affichage.

## Synchronisation Google Sheets

1. Créez un Google Sheet vide, puis **Extensions › Apps Script**.
2. Remplacez le contenu de `Code.gs` par [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
3. **Paramètres du projet (⚙️) › Propriétés du script** : ajoutez `SYNC_TOKEN` avec un secret long et aléatoire.
4. **Déployer › Nouveau déploiement › Application Web** — « Exécuter en tant que : **Moi** », « Qui a accès : **Tout le
   monde** ». Autorisez l'accès à la feuille quand Google le demande.
5. Renseignez le fichier `.env` (non versionné) puis reconstruisez l'app — les valeurs sont lues à la compilation par
   `react-native-dotenv` :

   ```dotenv
   PSYCHO_SHEETS_SYNC_URL=https://script.google.com/macros/s/AKfy…/exec
   PSYCHO_SHEETS_SYNC_TOKEN=<valeur de SYNC_TOKEN>
   ```

   ```powershell
   npm start -- --reset-cache   # obligatoire après une modification de .env
   npm run android
   ```

   **Réglages › Synchronisation** indique alors « Feuille configurée » et propose « Synchroniser maintenant ». Si l'URL
   change, l'app renvoie et récupère tout depuis le début avec la nouvelle feuille.

> Les valeurs du `.env` sont intégrées au bundle JavaScript de l'APK : toute personne disposant de l'APK peut les
> extraire. Ne distribuez pas un APK construit avec votre jeton personnel.

Le script crée une feuille par table :

| Feuille | Clé `id` | Contenu |
| --- | --- | --- |
| `checkins` | `2026-10-31` | humeur, énergie, stress, sommeil, intention, gratitudes, victoires, leçons, notes, matin / soir validés |
| `archetype_scores` | `2026-10-31:roi` | plénitude (1–5), ombre (1–5) |
| `program_log` | `2026-10-31:bible` | pratique du jour cochée ou non |
| `goals` | UUID | période, clé (`2026-W44`, `2026-Q4`…), intitulé, notes, statut, progression, archétype |
| `reviews` | `week:2026-W44` | évaluation et note de bilan de la période |

Chaque ligne porte `updated_at`, `deleted` (suppression logique) et `_synced_at` (heure serveur, pour ne renvoyer que les
nouveautés). Les cellules sont au format texte pour que Google Sheets ne transforme pas les dates ; vous pouvez ajouter
vos propres onglets d'analyse (tableaux croisés, graphiques) qui lisent ces feuilles.

## Architecture

```
App.tsx / index.js        Point d'entrée (AppProviders) ; handler de notifications en arrière-plan
src/
  app/                    AppProviders : SafeArea › Theme › Navigation ; hydratation, synchro, notifications
  navigation/             RootNavigator (stack), MainTabs (onglets flottants), types, navigation-ref
  screens/                Today, Checkin, Goals, Progress, Settings, Onboarding, GoalDetail, Archetype, DayCheckin
  components/
    charts/               RingChart, BarChart, LineChart, ProgressBarsChart, SplitChart, StatsChart (repris de kelasi)
    checkin/              CheckinForm
    layout/ ui/           Screen, TabIcon, Button, Card, Input, Chip, Scale, ProgressBar, TimeStepper
  content/                Archétypes, exercices, versets, citations, générateur de programme
  services/               local-db (AsyncStorage + dirty flags), journal (requêtes), sync (Sheets), notifications
  stores/                 settings, sync, theme (Zustand, hydratation manuelle comme kelasi)
  theme/                  Couleurs (clair / sombre), espacements, typographie, ThemeContext
  utils/                  dates et périodes, stats (modèles de graphiques), uuid
  config/env.ts           Variables .env (URL et jeton de la feuille, logs de synchro)
google-apps-script/       Web App de synchronisation
__tests__/                Jest : dates & programme, graphiques, base locale & synchro, rendu des écrans
```

## Contenus et sources

- Archétypes : R. Moore & D. Gillette, *King, Warrior, Magician, Lover* (1990) ; Toni Wolff (Mère, Hétaïre, Amazone,
  Médiale) avec la Reine comme centre ordonnateur.
- Versets : Louis Segond 1910 (domaine public). Citations philosophiques : formulations françaises usuelles. Tout est
  modifiable dans `src/content/readings.ts`.

Cet outil d'introspection ne remplace pas un accompagnement médical ou psychologique.
