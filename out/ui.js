function drawTimePeriodLinks(periodLinks, game, positionKeys) {
    let totalRows = Math.max(game.timePeriods.length, positionKeys.length);
    for (var r = 0; r < totalRows; r++) {
        const row = periodLinks.insertRow();
        const timesCell = row.insertCell(0);
        timesCell.vAlign = "top";
        var listItem = '&nbsp;';
        const period = game.timePeriods[r];
        if (period) {
            const newUrl = mkUrl(Object.assign(Object.assign({}, game), { time: period.time }));
            var listItem = `<a href="${newUrl}">${minutesSeconds(period.time)}</a>`;
            if (game.time == period.time) {
                listItem = `<strong>${minutesSeconds(period.time)}</strong>`;
            }
        }
        timesCell.innerHTML = listItem;
    }
}
function mkSelectorDropdownHandler(game, allPlayers, currentPeriod) {
    return (event) => {
        const allDropdowns = document.querySelectorAll('#playerPositionsTable select');
        const selectedPlayers = [];
        for (const dropdown of allDropdowns) {
            const selectElement = dropdown;
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
function drawSelectors(tableBody, allPlayers, positionKeys, positionToPlayers, dropdownChangeHandler) {
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
function drawPlayerInfo(leCell, allPlayers, positions, minutesPlayed) {
    var playerMaxLen = 0;
    allPlayers.forEach((player) => {
        playerMaxLen = player.length > playerMaxLen ? player.length : playerMaxLen;
    });
    var html = "";
    for (const player of allPlayers) {
        html = html + "&nbsp;&nbsp;" + padStringWithSpaces(player, playerMaxLen + 1);
        if (positions.get(player)) {
            html = html + positions.get(player);
        }
        else {
            html = html + "--";
        }
        var mins = minutesPlayed.get(player) ? minutesPlayed.get(player) : 0;
        html = html + "&nbsp;&nbsp;" + mins + "<br/>\n";
    }
    leCell.innerHTML = html;
}
function drawSubInfo(sublistDiv, subActionTD, game, positionKeys) {
    for (var i = 0; i < game.timePeriods.length; i++) {
        if (game.time == game.timePeriods[i].time) {
            const subNames = generateSubNames(game.timePeriods[i]);
            const subActions = generateSubActions(game.timePeriods[i - 1], game.timePeriods[i], positionKeys);
            let lastPeriod = Object.assign(Object.assign({}, game.timePeriods[i - 1]), { time: game.timePeriods[i].time });
            let newPeriods = Array.from(game.timePeriods);
            newPeriods[i] = lastPeriod;
            let dupPrevGame = Object.assign(Object.assign({}, game), { timePeriods: newPeriods });
            console.log(subNames);
            console.log(game.timePeriods[i]);
            sublistDiv.appendChild(subNames);
            subActionTD.appendChild(subActions);
        }
    }
}
function mkRemovePlayerSelect(allPlayers) {
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
    return playerSelect;
}
//# sourceMappingURL=ui.js.map