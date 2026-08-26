# Campagne email — lancement stores (août 2026)

Segmented lists are built locally (gitignored). Regenerate with:

```bash
npm run merge:launch-lists
# If path-with-spaces fails via npm, use:
npx tsx --use-system-ca src/scripts/merge-launch-lists.ts
```

**Outputs:** `tmp/launch-emails/` — `form_ios.csv`, `form_android.csv`, `testers.csv`, `accounts.csv`, `overlap.csv` (audit), `_excluded.csv`, `summary.json`.

**Last run counts** (see `summary.json` for current numbers):


| List               | Recipients | Email                               |
| ------------------ | ---------- | ----------------------------------- |
| `form_ios.csv`     | 14         | App Store — “c’est prêt”            |
| `form_android.csv` | 3          | Play Store — “l’app est officielle” |
| `testers.csv`      | 51         | Migration version test → store      |
| `accounts.csv`     | 17         | Les deux stores + encart test       |
| **Total**          | **85**     | One email per address               |


Dedup rule: **tester > account > form**. No duplicate sends.

Store links:

- App Store: [https://apps.apple.com/fr/app/latingo/id6783507682](https://apps.apple.com/fr/app/latingo/id6783507682)
- Play Store: [https://play.google.com/store/apps/details?id=fr.latingo.app](https://play.google.com/store/apps/details?id=fr.latingo.app)
- Site (backup): [https://www.latingo.fr](https://www.latingo.fr)

---

## Mise en forme HTML (Zimbra)

Les versions **HTML** sont dans [`docs/campaigns/html/`](html/) — police **DM Sans**, fond crème, boutons corail, **logo LatinGo en bas**.

| Liste | Fichier HTML | Objet |
|-------|--------------|-------|
| `form_ios.csv` | [form-ios.html](html/form-ios.html) | LatinGo est dispo sur iPhone |
| `form_android.csv` | [form-android.html](html/form-android.html) | LatinGo est officiel sur Android |
| `testers.csv` (Android) | [testers-android.html](html/testers-android.html) | Passe à la version officielle de LatinGo |
| `testers.csv` (iOS) | [testers-ios.html](html/testers-ios.html) | idem |
| `testers.csv` (both) | [testers-both.html](html/testers-both.html) | idem |
| `accounts.csv` | [accounts.html](html/accounts.html) | LatinGo est officiel sur Android et iPhone |

**Zimbra (contact@latingo.fr) :**

1. Ouvrir le `.html` dans un éditeur → tout sélectionner → copier.
2. Nouveau message → menu **⋮** → **Source HTML** (ou « Éditeur HTML »).
3. Coller le HTML. Vérifier l’aperçu (police + logo en bas).
4. **To :** toi-même · **Bcc :** emails du CSV · **From :** contact@latingo.fr
5. Envoyer un test à toi-même avant le Bcc réel.

**Logo :** URL hébergée `https://www.latingo.fr/images/latingo-logo.png` (les clients mail type Gmail **bloquent** le base64 — il peut s’afficher dans Zimbra mais pas chez le destinataire). Fichier source : `landing/public/images/latingo-logo.png`. Régénérer les HTML après changement : `node docs/campaigns/html/embed-logo.mjs`

Versions texte brut ci-dessous (secours si HTML bloqué).

---

## 1. Form iPhone (`form_ios.csv`)

→ **HTML :** [html/form-ios.html](html/form-ios.html)

**Objet:** LatinGo est dispo sur iPhone  
**Aperçu:** L’app que tu as demandée est sur l’App Store.

```
Salut,

Tu t’étais inscrit·e pour être prévenu·e : LatinGo est sur l’App Store.

Toutes les soirées salsa, bachata et kizomba du Sud-Ouest, près de chez toi — en une seule app.

→ Télécharger sur l’App Store :
https://apps.apple.com/fr/app/latingo/id6783507682

Tu ouvres l'appli, tu vois ce qu'il se passe ce week-end, tu y vas !

Une question ? Écris à contact@latingo.fr — on te répond.

L'équipe LatinGo

```

---



## 2. Form Android (`form_android.csv`)

→ **HTML :** [html/form-android.html](html/form-android.html)
**Objet:** LatinGo est officiel sur Android  
**Aperçu:** L’app que tu as demandée est sur le Play Store.

```
Salut,

Tu t’étais inscrit·e pour être prévenu·e : LatinGo est disponible sur le Play Store.

Toutes les soirées salsa, bachata et kizomba du Sud-Ouest, près de chez toi — en une seule app.

→ Télécharger sur le Play Store :
https://play.google.com/store/apps/details?id=fr.latingo.app

(L’app est aussi sur iPhone si tu veux la partager à des amis.)

Une question ? Écris à contact@latingo.fr — on te répond.

L'équipe LatinGo
```

---



## 3. Testeurs (`testers.csv`)

→ **HTML :** [testers-android.html](html/testers-android.html) · [testers-ios.html](html/testers-ios.html) · [testers-both.html](html/testers-both.html)
**Objet:** Passe à la version officielle de LatinGo  
**Aperçu:** La version test ne sera plus mise à jour.

Use `platform` column from CSV:

- `ios` → App Store link only
- `android` → Play Store link only
- `both` → both links

```
Salut,

Merci d’avoir testé LatinGo en avant-première.

Si tu utilises encore la version test (TestFlight ou bêta Android), il faut passer à la version officielle sur le store — c’est elle qui recevra les mises à jour.

→ Même compte : reconnecte-toi avec le même email et mot de passe. Rien ne se perd.

App Store : https://apps.apple.com/fr/app/latingo/id6783507682

Play Store : https://play.google.com/store/apps/details?id=fr.latingo.app

Tu peux supprimer l’ancienne app de test une fois la version store installée.

Une question ? Écris à contact@latingo.fr — on te répond.

L'équipe LatinGo
```

*(Replace* `{{#ios}}` *blocks manually per row, or send two batches: iOS-only testers vs Android-only.)*

**Suggested batches from last merge:**

- iOS-only testers: 3
- Android-only testers: 47
- Both tracks: 1

---



## 4. Comptes (`accounts.csv`)

→ **HTML :** [html/accounts.html](html/accounts.html)
**Objet:** LatinGo est officiel sur Android et iPhone  
**Aperçu:** Partage l’App Store à tes amis sur iPhone.

```
Salut,

LatinGo est maintenant officiel sur les deux stores — Android et iPhone.

Toutes les soirées SBK du Sud-Ouest, en une seule app. 3 secondes pour savoir où sortir ce week-end.

→ Android : https://play.google.com/store/apps/details?id=fr.latingo.app
→ iPhone : https://apps.apple.com/fr/app/latingo/id6783507682

Si tu as des amis sur iPhone, envoie-leur le lien App Store — plus besoin d’attendre.

---
Tu avais la version test ?
Si tu as installé LatinGo en version de test, télécharge la version officielle aux liens ci-dessus. Même email, même mot de passe.

Une question ? Écris à contact@latingo.fr — on te répond.

L'équipe LatinGo
```

---



## Checklist d’envoi



### Avant d’envoyer

- [ ] Relancer `merge:launch-lists` si Formspree ou comptes ont changé
- [ ] Ouvrir `overlap.csv` — vérifier que les gens form+tester ne sont que sur `testers.csv`
- [ ] Test sur ton téléphone : liens App Store et Play Store
- [ ] Envoyer un exemplaire à toi-même (chaque variante)



### Ordre recommandé (jeudi matin, Europe/Paris)

1. **Form iPhone** (14) — valide le lien App Store
2. **Form Android** (3)
3. **Testeurs** — iOS batch puis Android batch (ou les deux liens pour `both`)
4. **Comptes** (17)



### Outils

- **Recommandé :** Zimbra `contact@latingo.fr` — coller le HTML depuis `docs/campaigns/html/` (voir section ci-dessus)
- **Secours :** BCC en texte brut (blocs ci-dessus)
- **Resend :** importer CSV + coller le HTML si tu préfères automatiser le `{{prenom}}`
- **Ne pas utiliser :** Admin → Broadcast (un seul message à tous, inclut les admins)



### Après l’email

- [ ] Message TestFlight dans App Store Connect (testeurs iOS)
- [ ] Note sur la piste de test Play Console si possible
- [ ] Blurb WhatsApp (4 lignes) pour les groupes de danse :

```
LatinGo est sur iPhone et Android.
Toutes les soirées SBK du Sud-Ouest, au même endroit.
iPhone : https://apps.apple.com/fr/app/latingo/id6783507682
Android : https://play.google.com/store/apps/details?id=fr.latingo.app
```



## Exclusions (`_excluded.csv`)

Typiquement : `test@gmail.com`, compte fondateur (preview), compte admin service.

Ne pas envoyer ces adresses.

## Adresse de test

[tomhadrian.sy@gmail.com](mailto:tomhadrian.sy@gmail.com)