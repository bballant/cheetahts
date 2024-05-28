
function drawTimePeriodLinks(periodLinks: HTMLTableSectionElement, game: Game, positionKeys: string[]) {
    // include an extra space for half-time in the period list
    let totalRows = game.timePeriods.length + 1;
    for (var r = 0; r < totalRows; r++) {
        // Think of periods (p) as 1-indexed
        const p = r + 1;
        const row = periodLinks.insertRow();
        const timesCell = row.insertCell(0)
        timesCell.vAlign = "top";
        var listItem = '&nbsp;';
        const period = game.timePeriods[r];
        if (period) {
            const newUrl = mkUrl({ ...game, period: p })
            var listItem = `<a href="${newUrl}">${minutesSeconds(period.time)}</a>`;
            if (p == game.period) {
                listItem = `<strong>${minutesSeconds(period.time)}</strong>`;
            }
        }
        timesCell.innerHTML = listItem;
        if (r == (game.timePeriods.length / 2) - 1) {
            const halftime = periodLinks.insertRow();
            const htCell = halftime.insertCell(0);
            htCell.innerHTML = '&nbsp;';
        }
    }
}

function addRemovePlayerButtonHandler(
    button: HTMLButtonElement,
    player: HTMLSelectElement,
    game: Game,
    positionKeys: string[]) {
    button.addEventListener('click', () => {
        if (!player.value) {
            throw ("No player selected to delete");
        }
        const newGame = removePlayerFromGame(game, player.value, positionKeys);
        const newUrl = mkUrl(newGame);
        window.location.href = newUrl;
    });
}

function addAddPlayerButtonHandler(
    button: HTMLButtonElement,
    player: HTMLInputElement,
    game: Game) {
    button.addEventListener('click', () => {
        if (!player.value) {
            throw ("No player selected to delete");
        }
        const newGame = addPlayerToGame(game, player.value);
        const newUrl = mkUrl(newGame);
        window.location.href = newUrl;
    });
}

function mkSelectorDropdownHandler(
    game: Game,
    allPlayers: string[],
    currentPeriod: TimePeriod):
    (el: HTMLSelectElement, ev: Event) => any {

    return (event) => {
        const allDropdowns = document.querySelectorAll('#playerPositionsTable select');
        const selectedPlayers = [];

        for (const dropdown of allDropdowns) {
            const selectElement = dropdown as HTMLSelectElement;
            if (selectElement.value) {
                selectedPlayers.push(selectElement.value);
                currentPeriod[dropdown.id] = selectElement.value;
            }
        }

        currentPeriod.subs = allPlayers.filter((player) => !selectedPlayers.includes(player));
        // update timePeriods
        for (var i = 0; i < game.timePeriods.length; i++) {
            if (game.timePeriods[i].time == currentPeriod.time) {
                game.timePeriods[i] = currentPeriod;
            }
        }

        window.location.href = mkUrl(game);
    };
}

function drawSelectors(
    tableBody: HTMLTableElement,
    allPlayers: string[],
    positionKeys: string[],
    positionToPlayers: Map<string, string>,
    dropdownChangeHandler: (this: HTMLSelectElement, ev: Event) => any 
) {
    // draw the selectors
    var pidx = 0;
    for (const positionKey of positionKeys) {
        // Insert the position key in the left column
        const positionCell = tableBody.rows[pidx].insertCell(0);
        positionCell.innerHTML = positionKey;

        // Create the dropdown list with all players in the right column
        const playerCell = tableBody.rows[pidx].insertCell(1);
        const playerSelect = document.createElement('select');
        playerSelect.id = positionKey;
        playerSelect.addEventListener('change', dropdownChangeHandler);
        const emptyOption = document.createElement('option');
        emptyOption.value = "";
        emptyOption.text = "None";
        playerSelect.add(emptyOption);
        allPlayers.forEach((player) => {
            const playerOption = document.createElement('option');
            playerOption.value = player;
            playerOption.text = player;
            if (positionToPlayers.get(positionKey) == player) {
                playerOption.selected = true;
            }
            playerSelect.add(playerOption);
        });
        playerCell.appendChild(playerSelect);
        pidx++;
    }
}

function drawPlayerInfo(
    leCell: HTMLTableCellElement,
    allPlayers: string[],
    positions: Map<string, string>,
    minutesPlayed: Map<string, number>) {
    var playerMaxLen = 0;
    allPlayers.forEach((player) => {
        playerMaxLen = player.length > playerMaxLen ? player.length : playerMaxLen;
    });
    var html = "";
    for (const player of allPlayers) {
        html = html + "&nbsp;&nbsp;" + padStringWithSpaces(player, playerMaxLen + 1);
        if (positions.get(player)) {
            html = html + positions.get(player);
            if (positions.get(player).length == 2) {
                html = html + " ";
            }
        } else {
            html = html + "-- ";
        }
        var mins = minutesPlayed.get(player) ? minutesPlayed.get(player) : 0;
        html = html + "&nbsp;&nbsp;" + Math.round(mins) + "<br/>\n";
    }
    leCell.innerHTML = html;
}

function drawSubNames(
    subNamesDiv: HTMLDivElement,
    game: Game) {
    const pIdx = game.period - 1;
    const subNames = generateSubNames(game.timePeriods[pIdx]);
    subNamesDiv.appendChild(subNames);
}

function drawPlayerNames(
    playerNamesDiv: HTMLDivElement,
    game: Game,
    positionKeys: string[]) {
    const pIdx = game.period - 1;
    const playerNames = generatePlayerNames(game.timePeriods[pIdx], positionKeys);
    playerNamesDiv.appendChild(playerNames);
}

function drawSubActions(
    subActionTD: HTMLTableCellElement,
    game: Game,
    positionKeys: string[]) {
    const pIdx = game.period - 1;
    const subActions = generateSubActions(game.timePeriods[pIdx - 1], game.timePeriods[pIdx], positionKeys);
    subActionTD.appendChild(subActions);
}

function drawSubInfo(
    subNameDiv: HTMLDivElement,
    playerNameDiv: HTMLDivElement,
    subActionTD: HTMLTableCellElement,
    game: Game,
    positionKeys: string[]) {
    drawSubNames(subNameDiv, game);
    drawPlayerNames(playerNameDiv, game, positionKeys);
    drawSubActions(subActionTD, game, positionKeys);
}

function mkCopyUrl(game: Game): string | undefined {
    const newGame = copyPrevPeriodIntoCurrent(game);
    if (!newGame) {
        return undefined;
    }
    return mkUrl(newGame);
}

function drawManagePlayersHeader(game: Game, managePlayersHeaderDiv: HTMLDivElement) {
    const currentTime = minutesSeconds(game.timePeriods[game.period - 1].time);
    let innerHTML = `<span class="title">Manage Players for Period ${game.period} (${currentTime})</span>`;
    if (game.period != game.timePeriods.length) {
        let nextUrl = mkUrl({ ...game, period: game.period + 1 });
        innerHTML = innerHTML + `&nbsp;<a href=${nextUrl}>next</a>`
    }
    managePlayersHeaderDiv.innerHTML = innerHTML;
}

function drawManagePlayersFooter(game: Game, managePlayersFooterDiv: HTMLDivElement) {
    let innerHTML = "";
    const copyUrl = mkCopyUrl(game);
    if (copyUrl) {
        innerHTML += `<span class="copy"><a href="${copyUrl}">copy line-up</a> from previous period</span>`
    }
    managePlayersFooterDiv.innerHTML = innerHTML;
}

function mkRemovePlayerSelect(allPlayers: string[]): HTMLSelectElement {
    const playerSelect = document.createElement('select');
    playerSelect.id = "RemovePlayerSelect";
    //playerSelect.addEventListener('change', dropdownChangeHandler);
    const emptyOption = document.createElement('option');
    emptyOption.value = "";
    emptyOption.text = "None";
    playerSelect.add(emptyOption);
    allPlayers.forEach((player) => {
        const playerOption = document.createElement('option');
        playerOption.value = player;
        playerOption.text = player;
        playerSelect.add(playerOption);
    });
    return playerSelect
}
