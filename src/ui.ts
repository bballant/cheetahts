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
        } else {
            html = html + "--";
        }
        var mins = minutesPlayed.get(player) ? minutesPlayed.get(player) : 0;
        html = html + "&nbsp;&nbsp;" + mins + "<br/>\n";
    }
    leCell.innerHTML = html;
}

function drawSubInfo(
    sublistDiv: HTMLDivElement,
    subActionTD: HTMLTableCellElement,
    game: Game,
    positionKeys: string[]) {
    for (var i = 0; i < game.timePeriods.length; i++) {
        if (i == 0) {
            continue;
        }
        if (game.time == game.timePeriods[i].time) {
            const subNames = generateSubNames(game.timePeriods[i]);
            const subActions = generateSubActions(game.timePeriods[i - 1], game.timePeriods[i], positionKeys);
            let lastPeriod = { ...game.timePeriods[i - 1], time: game.timePeriods[i].time };
            let newPeriods = Array.from(game.timePeriods);
            newPeriods[i] = lastPeriod;
            let dupPrevGame = { ...game, timePeriods: newPeriods };
            console.log(subNames);
            console.log(game.timePeriods[i]);
            sublistDiv.appendChild(subNames);
            subActionTD.appendChild(subActions);
        }
    }
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
