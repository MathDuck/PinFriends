# PinFriends

**English** · [Français](#français)

A [Vencord](https://github.com/Vendicated/Vencord) userplugin that pins your best friends to the top of your Discord friends list.

- Right-click a friend: **Pin as best friend** / **Remove from best friends**.
- **Friends tab**: pinned friends come first, in pin order. Everyone else keeps the sort you picked.
- **Side friends panel** (the one you can open from anywhere): pinned friends get their own **Pinned** section at the top, whatever the sort (Online / Game / Alphabetical).
- A small pin icon shows left of the message button on pinned friends' rows in the Friends tab.
- **Language** option in the plugin settings: English or Français.

Pins are stored per account in the plugin settings.

> **Not affiliated with Discord or Vencord.** Client mods can go against Discord's Terms of Service. Use at your own risk.

## Install

Vencord has no store for custom plugins: the plugin is copied into a local Vencord clone, which you then build. The scripts do all of it.

**Requirements:** Git, Node.js 22+, pnpm (`npm install -g pnpm`).

```sh
git clone https://github.com/<your-username>/vencord-pinfriends.git
cd vencord-pinfriends
```

**Windows (PowerShell)**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

**Linux / macOS**

```sh
./scripts/install.sh
```

Quit Discord completely first (tray icon > Quit), otherwise the injection cannot replace it and Discord keeps running the old code.

The scripts clone Vencord into `./Vencord` if it is missing, copy the plugin to `Vencord/src/userplugins/pinFriends`, then run `pnpm install`, `pnpm build` and `pnpm inject`.

| Option (Windows / Linux) | Effect |
| --- | --- |
| `-VencordPath DIR` / `--vencord-path DIR` | Use an existing Vencord clone |
| `-Update` / `--update` | `git pull` Vencord before building |
| `-NoInject` / `--no-inject` | Build only, do not patch Discord |

Then restart Discord and enable **PinFriends** in Settings > Vencord > Plugins.

**Manual install:** copy `src/pinFriends` to `Vencord/src/userplugins/pinFriends` in your clone, then run `pnpm build` and `pnpm inject` there.

**Uninstall:** delete `Vencord/src/userplugins/pinFriends`, run `pnpm build` and `pnpm inject` again (or `pnpm uninject` to remove Vencord entirely).

## Platform status

- **Windows**: tested on Discord stable (October 2026), installed with `install.ps1`.
- **Linux**: `install.sh` and the build are verified (CI builds on Ubuntu and Windows). Running the plugin inside Discord on Linux has not been tested.
- **macOS**: untested.

## Troubleshooting

- **PowerShell says the script is not digitally signed.** Run it with `-ExecutionPolicy Bypass` as shown above, or run `Unblock-File .\scripts\install.ps1` first.
- **"Failed to kill Discord: Access is denied".** Quit Discord from the tray icon, then run the install again.
- **A feature stopped working after a Discord update.** The plugin patches Discord's minified code, which changes with updates. Open DevTools (`Ctrl+Shift+I`), filter the console on `PinFriends`: a "Patch by PinFriends had no effect" message tells you which patch broke. Open an issue with that message.
- **`pnpm` warns about its version.** Harmless: Vencord pins a pnpm version, newer ones still work.

## How it works

Five patches on Discord's client code, plus a context-menu entry:

| Where | What it does |
| --- | --- |
| Friends tab list | Adds a step after the existing sort so pinned friends come first |
| Friends tab row | Inserts the pin icon before the message button |
| Side panel sections | Puts pinned friends in a "Pinned" section whatever the selected sort |
| Side panel order | Moves that section first and keeps pin order inside it |
| Side panel header | Shows a text label and count for the Pinned section |

## Credits

- [**Vencord**](https://github.com/Vendicated/Vencord) by Vendicated and contributors (GPL-3.0): the plugin API and build system this runs on.
- **PinDMs** (Vencord): the idea of pinning came from it. No code was copied.
- **SortFriendRequests** and **UserVoiceShow** (Vencord): studied to find which Discord modules to patch for the friends list and its rows.
- Plugin by **MathDuck**, written with **Claude** (Anthropic), see below.

## AI disclosure

Most of the code in this repository was written by **Claude** (Anthropic) in a chat session with the author. The author decided what the plugin should do and how it should look, ran every build, tested each change on a real Discord client, and reported the results that guided the next fix. Documentation, install scripts and CI were also written with Claude's help.

Because of this, the plugin is **not** submitted to Vencord or Equicord, whose contribution rules do not accept this kind of authorship. It is shared here as a userplugin, as is.

## License

[GPL-3.0-or-later](LICENSE), the same license as Vencord.

---

# Français

[English](#pinfriends) · **Français**

Un userplugin [Vencord](https://github.com/Vendicated/Vencord) qui épingle tes meilleurs amis en haut de ta liste d'amis Discord.

- Clic droit sur un ami : **Épingler en meilleur ami** / **Retirer des meilleurs amis**.
- **Onglet Amis** : les amis épinglés passent en premier, dans l'ordre d'épinglage. Les autres gardent le tri choisi.
- **Panneau d'amis latéral** (celui qu'on peut ouvrir partout) : les amis épinglés ont leur propre section **Épinglés** tout en haut, quel que soit le tri (En ligne / Jeu / Alphabétique).
- Une petite épingle s'affiche à gauche du bouton de message sur la ligne des amis épinglés de l'onglet Amis.
- Option **Langue** dans les réglages du plugin : English ou Français.

Les épingles sont enregistrées par compte dans les réglages du plugin.

> **Sans lien avec Discord ni Vencord.** Les mods de client peuvent aller à l'encontre des conditions d'utilisation de Discord. À utiliser à tes risques.

## Installation

Vencord n'a pas de boutique pour les plugins perso : le plugin est copié dans un clone local de Vencord, que tu compiles ensuite. Les scripts font tout.

**Prérequis :** Git, Node.js 22+, pnpm (`npm install -g pnpm`).

```sh
git clone https://github.com/<your-username>/vencord-pinfriends.git
cd vencord-pinfriends
```

**Windows (PowerShell)**

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

**Linux / macOS**

```sh
./scripts/install.sh
```

Quitte complètement Discord avant (icône de la zone de notification > Quitter), sinon l'injection ne peut pas le remplacer et Discord garde l'ancien code.

Les scripts clonent Vencord dans `./Vencord` s'il est absent, copient le plugin dans `Vencord/src/userplugins/pinFriends`, puis lancent `pnpm install`, `pnpm build` et `pnpm inject`.

| Option (Windows / Linux) | Effet |
| --- | --- |
| `-VencordPath DIR` / `--vencord-path DIR` | Utiliser un clone de Vencord existant |
| `-Update` / `--update` | `git pull` de Vencord avant la compilation |
| `-NoInject` / `--no-inject` | Compiler seulement, sans patcher Discord |

Relance ensuite Discord et active **PinFriends** dans Paramètres > Vencord > Plugins.

**Installation manuelle :** copie `src/pinFriends` dans `Vencord/src/userplugins/pinFriends` de ton clone, puis lance `pnpm build` et `pnpm inject` dedans.

**Désinstallation :** supprime `Vencord/src/userplugins/pinFriends`, relance `pnpm build` et `pnpm inject` (ou `pnpm uninject` pour retirer Vencord entièrement).

## État par plateforme

- **Windows** : testé sur Discord stable (octobre 2026), installé avec `install.ps1`.
- **Linux** : `install.sh` et la compilation sont vérifiés (la CI compile sur Ubuntu et Windows). L'exécution du plugin dans Discord sous Linux n'a pas été testée.
- **macOS** : non testé.

## Dépannage

- **PowerShell dit que le script n'est pas signé numériquement.** Lance-le avec `-ExecutionPolicy Bypass` comme ci-dessus, ou exécute d'abord `Unblock-File .\scripts\install.ps1`.
- **« Failed to kill Discord: Access is denied ».** Quitte Discord depuis l'icône de la zone de notification, puis relance l'installation.
- **Une fonction ne marche plus après une mise à jour de Discord.** Le plugin patche le code minifié de Discord, qui change à chaque mise à jour. Ouvre les DevTools (`Ctrl+Maj+I`), filtre la console sur `PinFriends` : un message « Patch by PinFriends had no effect » indique quel patch est cassé. Ouvre une issue avec ce message.
- **`pnpm` avertit sur sa version.** Sans conséquence : Vencord fixe une version de pnpm, les plus récentes fonctionnent.

## Fonctionnement

Cinq patchs sur le code client de Discord, plus une entrée de menu contextuel :

| Où | Rôle |
| --- | --- |
| Liste de l'onglet Amis | Ajoute une étape après le tri existant pour mettre les épinglés en premier |
| Ligne de l'onglet Amis | Insère l'icône d'épingle avant le bouton de message |
| Sections du panneau latéral | Range les épinglés dans une section « Épinglés » quel que soit le tri choisi |
| Ordre du panneau latéral | Remonte cette section en premier et garde l'ordre d'épinglage |
| En-tête du panneau latéral | Affiche un libellé texte et le nombre d'amis pour la section Épinglés |

## Crédits

- [**Vencord**](https://github.com/Vendicated/Vencord) par Vendicated et contributeurs (GPL-3.0) : l'API de plugins et le système de build sur lesquels tout repose.
- **PinDMs** (Vencord) : l'idée d'épingler vient de là. Aucun code n'a été copié.
- **SortFriendRequests** et **UserVoiceShow** (Vencord) : étudiés pour trouver les modules Discord à patcher pour la liste d'amis et ses lignes.
- Plugin de **MathDuck**, écrit avec **Claude** (Anthropic), voir ci-dessous.

## Utilisation de l'IA

L'essentiel du code de ce dépôt a été écrit par **Claude** (Anthropic) lors d'une conversation avec l'auteur. L'auteur a décidé ce que le plugin devait faire et son apparence, a lancé chaque compilation, a testé chaque modification sur un vrai client Discord et a rapporté les résultats qui ont guidé la correction suivante. La documentation, les scripts d'installation et la CI ont aussi été écrits avec l'aide de Claude.

Pour cette raison, le plugin n'est **pas** proposé à Vencord ni à Equicord, dont les règles de contribution n'acceptent pas ce type de paternité. Il est partagé ici comme userplugin, tel quel.

## Licence

[GPL-3.0-or-later](LICENSE), la même licence que Vencord.
