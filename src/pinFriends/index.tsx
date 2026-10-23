/*
 * PinFriends, a Vencord userplugin
 * Copyright (c) 2026 MathDuck
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Written with the help of Claude (Anthropic), see README.md ("AI disclosure").
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import type { User } from "@vencord/discord-types";
import { Menu, RelationshipStore, UserStore } from "@webpack/common";

const RELATION_FRIEND = 1;

const settings = definePluginSettings({
    language: {
        type: OptionType.SELECT,
        description: "Language / Langue",
        options: [
            { label: "English", value: "en", default: true },
            { label: "Français", value: "fr" }
        ]
    },
    // { [currentUserId]: [friendId, ...] }, array order = display order
    pinnedByAccount: {
        type: OptionType.CUSTOM,
        default: {} as Record<string, string[]>
    }
});

const STRINGS = {
    en: {
        pin: "Pin as best friend",
        unpin: "Remove from best friends",
        tooltip: "Best friend",
        section: "Pinned"
    },
    fr: {
        pin: "Épingler en meilleur ami",
        unpin: "Retirer des meilleurs amis",
        tooltip: "Meilleur ami",
        section: "Épinglés"
    }
} as const;

type StringKey = keyof typeof STRINGS.en;

function t(key: StringKey): string {
    const lang = settings.store.language === "fr" ? "fr" : "en";
    return STRINGS[lang][key];
}

function currentPins(): string[] {
    const me = UserStore.getCurrentUser()?.id;
    if (!me) return [];
    return (settings.store.pinnedByAccount[me] ??= []);
}

const isPinned = (id: string) => currentPins().includes(id);

function togglePin(id: string) {
    const pins = currentPins();
    const idx = pins.indexOf(id);
    if (idx === -1) pins.push(id);
    else pins.splice(idx, 1);

    RelationshipStore.emitChange();
}

// Friends tab: pinned friends first, rest unchanged so the selected sort still applies to it
function pinFirst(rows: any[]): any[] {
    const pins = currentPins();
    if (!Array.isArray(rows) || pins.length === 0) return rows;

    const pinned: any[] = [];
    const others: any[] = [];
    for (const row of rows) {
        const isPinnedFriend = row?.type === RELATION_FRIEND && pins.includes(row.user?.id);
        (isPinnedFriend ? pinned : others).push(row);
    }
    pinned.sort((a, b) => pins.indexOf(a.user.id) - pins.indexOf(b.user.id));
    return [...pinned, ...others];
}

// Side panel rows look like { userId, status, ... }
const rowUserId = (row: any): string | undefined => row?.userId ?? row?.user?.id ?? row?.id;

function wrapComparator(cmp: any) {
    if (typeof cmp !== "function") return cmp;
    return (a: any, b: any) => {
        const pins = currentPins();
        const ia = pins.indexOf(rowUserId(a) as string);
        const ib = pins.indexOf(rowUserId(b) as string);
        if (ia === -1 && ib === -1) return cmp(a, b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        return ia !== -1 ? -1 : 1;
    };
}

function PinIcon({ size = 18 }: { size?: number; }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                fill="currentColor"
                d="M19.38 4.62 15.2.44a1 1 0 0 0-1.6.3l-1.2 3.15-4.02 2.3a1 1 0 0 0-.23.17L5.3 8.8a1 1 0 0 0 0 1.41l3.2 3.2-5.2 5.2a1 1 0 1 0 1.41 1.42l5.2-5.2 3.2 3.2a1 1 0 0 0 1.4 0l2.45-2.45c.07-.07.13-.15.18-.23l2.3-4.02 3.15-1.2a1 1 0 0 0 .3-1.6l-4.21-4.2Z"
                transform="translate(-1 1)"
            />
        </svg>
    );
}

// Discord has no section type for this, so reuse LETTER (its badge shows the emoji label)
function pinnedSection(row: any, letterType: unknown) {
    const id = rowUserId(row);
    if (!id || !isPinned(id)) return null;
    return { key: "pinned", type: letterType, label: "📌" };
}

function hoistPinned(sections: any[]) {
    const idx = sections.findIndex(sec => sec?.key === "pinned");
    if (idx > 0) sections.unshift(...sections.splice(idx, 1));
}

function renderActionPin(userId?: string) {
    if (!userId || !isPinned(userId)) return null;
    return (
        <span
            title={t("tooltip")}
            style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "center",
                flexShrink: 0,
                marginRight: 8,
                color: "var(--icon-secondary, var(--interactive-icon-default, #b5bac1))"
            }}
        >
            <PinIcon size={16} />
        </span>
    );
}

// Tried in order; falls back to the end of the menu if Discord renames these ids
const ANCHOR_IDS = ["remove-friend", "block", "ignore", "note"];

const UserContextPatch: NavContextMenuPatchCallback = (children, { user }: { user?: User; }) => {
    if (!user || !RelationshipStore.isFriend(user.id)) return;

    const item = (
        <Menu.MenuItem
            id="vc-pinfriends-toggle"
            label={t(isPinned(user.id) ? "unpin" : "pin")}
            icon={() => <PinIcon />}
            action={() => togglePin(user.id)}
        />
    );

    for (const id of ANCHOR_IDS) {
        const group = findGroupChildrenByChildId(id, children);
        if (!group) continue;
        const idx = group.findIndex(c => c?.props?.id === id);
        group.splice(Math.max(idx, 0), 0, item);
        return;
    }
    children.push(item);
};

export default definePlugin({
    name: "PinFriends",
    description: "Pin your best friends to the top of your friends list (right-click a friend).",
    tags: ["Friends", "Organisation"],
    authors: [{ name: "MathDuck", id: 0n }],
    settings,

    contextMenus: {
        "user-context": UserContextPatch
    },

    patches: [
        {
            // Friends tab: same module as SortFriendRequests. A .thru() step after the existing
            // sort keeps the selected sort for everyone who isn't pinned.
            find: "getRelationshipCounts(){",
            replacement: {
                match: /(\}\)\.sortBy\((.+?)\))\.value\(\)/,
                replace: "$1.thru(rows=>$self.pinFirst(rows)).value()"
            }
        },
        {
            // Friends tab row: pin icon as first child of the action area, before the message
            // button. Anchored on the ChatIcon button because a gift card in the same module has
            // the same `.isProvisional...children:[` shape earlier in the file.
            find: "null!=this.peopleListItemRef.current",
            replacement: {
                match: /(\.isProvisional\}\),\(0,\i\.jsxs\)\("div",\{className:\i\.\i,children:\[)(?=\(0,\i\.jsx\)\(\i\.\i,\{icon:\i\.ChatIcon,tooltip:)/,
                replace: "$1$self.renderActionPin(this?.props?.user?.id),"
            }
        },
        {
            // Side panel: pinned friends go in their own section whatever the sort, and that
            // section is moved first. The section type enum is read from the
            // {key:"active_now",type:<enum>.ACTIVE_NOW} declaration instead of hardcoding it.
            find: 'key:"active_now"',
            group: true,
            replacement: [
                {
                    match: /(function \i\(\i,\i\)\{)(?=switch\(\i\)\{case \i\.\i\.ACTIVE_NOW:)(?<=type:(\i\.\i)\.ACTIVE_NOW\}.+?)/,
                    replace: "$1const pinSection=$self.pinnedSection(arguments[0],$2.LETTER);if(pinSection)return pinSection;"
                },
                {
                    match: /for\(let (\i) of (\i)\)\{(let (\i)=)(\i\(\i\))(;for\(let \i of\(\1\.rows\.sort\(\4\),\i\.groups\)\))/,
                    replace: "$self.hoistPinned($2);for(let $1 of $2){$3$self.wrapComparator($5)$6"
                }
            ]
        },
        {
            // Side panel header: LETTER sections only draw a one-character badge, so return a text
            // label for ours and show the count like the Online section does.
            find: ".LETTER:return null",
            group: true,
            replacement: [
                {
                    match: /(function \i\((\i)\)\{switch\(\2\.type\)\{case \i\.\i\.ACTIVE_NOW:.{0,300}?case \i\.\i\.LETTER:)return null/,
                    replace: '$1return $2.key==="pinned"?$self.t("section"):null'
                },
                {
                    match: /(\i)\.type===(\i\.\i)\.ACTIVE_NOW\|\|\1\.type===\2\.ONLINE\?/,
                    replace: '$1.type===$2.ACTIVE_NOW||$1.type===$2.ONLINE||$1.key==="pinned"?'
                }
            ]
        }
    ],

    t,
    pinFirst,
    wrapComparator,
    pinnedSection,
    hoistPinned,
    renderActionPin
});
