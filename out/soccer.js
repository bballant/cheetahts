function extractWords(input) {
    let words = input.match(/[a-zA-Z]+/g);
    return words || [];
}
function minutesSeconds(decimalNumber) {
    let minutes = Math.floor(decimalNumber);
    let seconds = Math.round((decimalNumber - minutes) * 60);
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    const minutesString = minutes < 10 ? '0' + minutes : minutes.toString();
    const secondsString = seconds < 10 ? '0' + seconds : seconds.toString();
    return `${minutesString}:${secondsString}`;
}
function padStringWithSpaces(inputString, desiredLength) {
    if (inputString.length >= desiredLength) {
        return inputString;
    }
    const paddingLength = desiredLength - inputString.length;
    const padding = '&nbsp;'.repeat(paddingLength);
    return inputString + padding;
}
function generateSubList(playerMaxLen, timePeriod1, timePeriod2, positionKeys) {
    const subList = document.createElement('ul');
    for (let positionKey of positionKeys) {
        const oldPlayer = timePeriod1[positionKey];
        const newPlayer = timePeriod2[positionKey];
        if (oldPlayer !== newPlayer) {
            const listItem = document.createElement('li');
            listItem.textContent = `${positionKey} ${newPlayer} for ${oldPlayer}`;
            subList.appendChild(listItem);
        }
    }
    return subList;
}
function mkUrl(game) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('name', game.name);
    currentUrl.searchParams.set('time', game.time.toString());
    currentUrl.searchParams.set('formation', game.formation.toString());
    const tpqs = encodeURIComponent(JSON.stringify(game.timePeriods));
    currentUrl.searchParams.set('timePeriods', tpqs);
    return currentUrl.toString();
}
function parseUrl() {
    var _a, _b, _c;
    const urlParams = new URLSearchParams(window.location.search);
    const currTime = parseFloat((_a = urlParams.get('time')) !== null && _a !== void 0 ? _a : '0.0');
    var timePeriodStr = urlParams.get('timePeriods');
    if (timePeriodStr) {
        timePeriodStr = decodeURIComponent(timePeriodStr);
    }
    else {
        timePeriodStr = '[\
                { "time": 0.0,  "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 6.5,  "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 13.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 19.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 26.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 32.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 39.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
                { "time": 45.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] }\
            ]';
    }
    const timePeriods = JSON.parse(timePeriodStr);
    var name = (_b = urlParams.get('name')) !== null && _b !== void 0 ? _b : 'No Name';
    return {
        name: name,
        time: currTime,
        formation: parseInt((_c = urlParams.get('formation')) !== null && _c !== void 0 ? _c : '322'),
        timePeriods: timePeriods
    };
}
function getCurrentPeriod(game) {
    var currPeriod = null;
    for (const p of game.timePeriods) {
        if (p.time == game.time) {
            currPeriod = p;
            break;
        }
    }
    if (!currPeriod) {
        throw new Error("Current period not found, game in invalid state");
    }
    return currPeriod;
}
function generateTimePeriods(subs) {
    let timePeriods = [];
    let time = 0.0;
    for (let i = 0; i < 8; i++) {
        timePeriods.push({ time: time, subs: [...subs] });
        time += 6.5;
    }
    return timePeriods;
}
function createCSV(positions, timePeriods) {
    let csvContent = positions.join(',') + '\n'; // Create the header row
    for (let timePeriod of timePeriods) {
        let row = [];
        for (let position of positions) {
            if (position in timePeriod) {
                row.push(timePeriod[position] || '');
            }
            else {
                row.push('');
            }
        }
        csvContent += row.join(',') + '\n'; // Add each row to the CSV content
    }
    return csvContent;
}
function calculateMinutesPlayed(periodMins, positions, timePeriods) {
    const minutesPlayed = new Map();
    for (let timePeriod of timePeriods) {
        for (let position of positions) {
            const player = timePeriod[position];
            if (player) {
                const currentMinutes = minutesPlayed.get(player) || 0;
                minutesPlayed.set(player, currentMinutes + periodMins);
            }
        }
    }
    return minutesPlayed;
}
function drawSoccerField(canvas, offsetX, offsetY, width, height, formation, playerPositions) {
    const ctx = canvas.getContext("2d");
    const getPositions = (formation) => {
        switch (formation) {
            case 322:
                return [
                    { position: "GK", x: width / 10 + offsetX, y: height / 2 + offsetY },
                    { position: "LB", x: width / 4 + offsetX, y: height / 4 + offsetY },
                    { position: "CB", x: width / 4 + offsetX, y: height / 2 + offsetY },
                    { position: "RB", x: width / 4 + offsetX, y: (height * 3) / 4 + offsetY },
                    { position: "LM", x: (width * 4) / 8 + offsetX, y: (height * 3) / 8 + offsetY },
                    { position: "RM", x: (width * 4) / 8 + offsetX, y: (height * 5) / 8 + offsetY },
                    { position: "LF", x: (width * 6) / 8 + offsetX, y: (height * 3) / 8 + offsetY },
                    { position: "RF", x: (width * 6) / 8 + offsetX, y: (height * 5) / 8 + offsetY },
                ];
            case 331:
                return [
                    { position: "GK", x: width / 10 + offsetX, y: height / 2 + offsetY },
                    { position: "LB", x: width / 4 + offsetX, y: height / 2 + offsetY },
                    { position: "CB", x: width / 4 + offsetX, y: height / 4 + offsetY },
                    { position: "RB", x: width / 4 + offsetX, y: (height * 3) / 4 + offsetY },
                    { position: "LM", x: (width * 4) / 8 + offsetX, y: height / 4 + offsetY },
                    { position: "CM", x: (width * 4) / 8 + offsetX, y: height / 2 + offsetY },
                    { position: "RM", x: (width * 4) / 8 + offsetX, y: (height * 3) / 4 + offsetY },
                    { position: "ST", x: (width * 6) / 8 + offsetX, y: height / 2 + offsetY },
                ];
            default:
                return [];
        }
    };
    const positions = getPositions(formation);
    if (ctx == null) {
        console.log("on no");
        return;
    }
    // Draw field lines
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, width, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2 + offsetX, height / 2 + offsetY, height / 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width / 2 + offsetX, offsetY);
    ctx.lineTo(width / 2 + offsetX, height + offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + 60);
    ctx.lineTo(offsetX + 60, offsetY + 60);
    ctx.lineTo(offsetX + 60, offsetY + height - 60);
    ctx.lineTo(offsetX, offsetY + height - 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX + width - 60, offsetY + 60);
    ctx.lineTo(offsetX + width, offsetY + 60);
    ctx.lineTo(offsetX + width, offsetY + height - 60);
    ctx.lineTo(offsetX + width - 60, offsetY + height - 60);
    ctx.lineTo(offsetX + width - 60, offsetY + 60);
    ctx.stroke();
    for (const pos of positions) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
        const labelText = playerPositions.get(pos.position) || pos.position;
        ctx.fillText(labelText, pos.x - 15, pos.y - 10);
    }
}
//# sourceMappingURL=soccer.js.map