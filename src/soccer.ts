type TimePeriod = {
    time: number;
    subs: string[];
    GK?: string;
    LB?: string;
    CB?: string;
    LCB?: string;
    RCB?: string;
    RB?: string;
    LM?: string;
    CM?: string;
    LCM?: string;
    RCM?: string;
    RM?: string;
    LF?: string;
    RF?: string;
    ST?: string;
};

type Game = {
    name: string;
    //time: number;
    period: number;
    formation: number;
    timePeriods: TimePeriod[];
}

function extractWords(input: string): string[] {
    let words = input.match(/[a-zA-Z ]+/g);
    return words.map(s => s.trim()) || [];
}

function minutesSeconds(decimalNumber: number): string {
    let minutes: number = Math.floor(decimalNumber);
    let seconds: number = Math.round((decimalNumber - minutes) * 60);

    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }

    const minutesString: string = minutes < 10 ? '0' + minutes : minutes.toString();
    const secondsString: string = seconds < 10 ? '0' + seconds : seconds.toString();

    return `${minutesString}:${secondsString}`;
}

function padStringWithSpaces(inputString: string, desiredLength: number): string {
    if (inputString.length >= desiredLength) {
        return inputString;
    }

    const paddingLength: number = desiredLength - inputString.length;
    const padding: string = '&nbsp;'.repeat(paddingLength);
    return inputString + padding;
}

function copyPrevPeriodIntoCurrent(game: Game): Game| undefined {
    const pIdx = game.period - 1;
    if (pIdx == 0 || !game.timePeriods[pIdx - 1] || !game.timePeriods[pIdx]) {
        // don't copy previous if there is no previous or current
        return undefined;
    };
    // new period is copy of last one with updated time
    let newPeriod = { ...game.timePeriods[pIdx - 1], time: game.timePeriods[pIdx].time };
    // this makes a copy
    let newPeriods = Array.from(game.timePeriods);
    newPeriods[pIdx] = newPeriod;
    return { ...game, timePeriods: newPeriods };
}

function addPlayerToGame(game: Game, player: string): Game {
    // copy of game periods
    let newPeriods: TimePeriod[] = [];
    for (let timePeriod of game.timePeriods) {
        let newPeriod = { ...timePeriod }; // make a copy
        newPeriod.subs.push(player);
        newPeriods.push(newPeriod);
    }
    return {...game, timePeriods: newPeriods };
}

function removePlayerFromGame(game: Game, player: string, positionKeys: string[]): Game {
    // copy of game periods
    let newPeriods: TimePeriod[] = [];
    for (let timePeriod of game.timePeriods) {
        let newPeriod = { ...timePeriod }; // make a copy
        for (let pos of positionKeys) {
            if (newPeriod[pos] == player) {
                newPeriod[pos] = null;
            }
        }
        newPeriod.subs = newPeriod.subs.filter(sub => sub !== player);
        newPeriods.push(newPeriod);
    }

    return {...game, timePeriods: newPeriods };
}

function generateSubNames(timePeriod: TimePeriod): HTMLUListElement {
    const subList: HTMLUListElement = document.createElement('ul');
    subList.id = "SubNames"
    for (let sub of timePeriod.subs) {
        const listItem: HTMLLIElement = document.createElement('li');
        listItem.innerHTML = sub;
        subList.appendChild(listItem);
    }
    return subList;
}

function generatePlayerNames(timePeriod: TimePeriod, positionKeys: string[]): HTMLUListElement {
    const playerList: HTMLUListElement = document.createElement('ul');
    playerList.id = "PlayerNames"
    for (let pos of positionKeys) {
        const player: string | undefined = timePeriod[pos];
        if (player) {
            const listItem: HTMLLIElement = document.createElement('li');
            listItem.textContent = `${pos} ${player}`;
            playerList.appendChild(listItem);

        }
    }
    return playerList;
}


///Biff, Grub, Flint, Nugget, Digg, Spark, Grit, Bolt, Muck, Slag, Clink, Fizz, Smelt, Chunk, Spade, Pebble, Gleam 
function generateSubActions(timePeriod1: any, timePeriod2: any, positionKeys: string[]): HTMLUListElement {
    const subList: HTMLUListElement = document.createElement('ul');
    let noChanges = true;
    if (timePeriod1 && timePeriod2) {
        for (let positionKey of positionKeys) {
            const oldPlayer: string | undefined = timePeriod1[positionKey];
            const newPlayer: string | undefined = timePeriod2[positionKey];
            if (oldPlayer && newPlayer && oldPlayer !== newPlayer) {
                noChanges = false;
                const listItem: HTMLLIElement = document.createElement('li');
                listItem.textContent = `${positionKey} ${newPlayer} for ${oldPlayer}`;
                subList.appendChild(listItem);
            }
        }
    }
    if (noChanges) {
        const listItem: HTMLLIElement = document.createElement('li');
        listItem.textContent = "No Changes";
        subList.appendChild(listItem);
    }
    return subList;
}

function getPositionKeys(game: Game): string[] {
    var positionKeys = [];
    switch (game.formation) {
        case 331:
            positionKeys = ['GK', 'LB', 'CB', 'RB', 'LM', 'CM', 'RM', 'ST'];
            break
        case 442:
            positionKeys = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'RCM', 'RM', 'LF', 'RF'];
            break
        case 433:
            positionKeys = ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM',  'CM',  'RM', 'LF', 'ST', 'RF'];
            break
        default: // 322
            positionKeys = ['GK', 'LB', 'CB', 'RB', 'LM', 'RM', 'LF', 'RF'];
    }

    return positionKeys;
}

function mkUrl(game: Game): string {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('name', game.name);
    currentUrl.searchParams.set('period', game.period.toString());
    currentUrl.searchParams.set('formation', game.formation.toString());
    const tpqs = encodeURIComponent(JSON.stringify(game.timePeriods));
    currentUrl.searchParams.set('timePeriods', tpqs);
    return currentUrl.toString();
}

function debugGame(): Game {
    var timePeriodStr = '[\
            { "time": 0.0,\
            "GK": "Puma", "LB": "Lynx", "CB":"Leopard", "RB":"Bobcat", "LM":"Margay", "RM":"Tiger", "LF":"Caracal", "RF":"Ocelot",\
            "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 6.5,  "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 13.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 19.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 26.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 32.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 39.0, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] },\
            { "time": 45.5, "subs": ["Puma", "Lynx", "Leopard", "Bobcat", "Margay", "Lion", "Jaguar", "Tiger", "Caracal", "Ocelot"] }\
        ]';
    const timePeriods = JSON.parse(timePeriodStr);
    return {
        name: "CheetahTS",
        period: 1,
        formation: 322,
        timePeriods: timePeriods
    };
}

function parseUrl(): Game | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const currPeriod = parseInt(urlParams.get('period'));
    var timePeriodStr = urlParams.get('timePeriods');
    if (!timePeriodStr) {
        return undefined;
    }
    timePeriodStr = decodeURIComponent(timePeriodStr);
    const timePeriods = JSON.parse(timePeriodStr);
    var name = urlParams.get('name') ?? 'No Name';
    return {
        name: name,
        period: currPeriod,
        formation: parseInt(urlParams.get('formation') ?? '322'),
        timePeriods: timePeriods
    };
}

function getCurrentPeriod(game: Game): TimePeriod {
    if (!game.timePeriods[game.period - 1]) {
        throw new Error("Current period not found, game in invalid state")
    }
    return game.timePeriods[game.period - 1];
}

function generateTimePeriods(subs: string[]): TimePeriod[] {
    let timePeriods: TimePeriod[] = [];
    let time = 0.0;
    for (let i = 0; i < 8; i++) {
        timePeriods.push({ time: time, subs: [...subs] });
        time += 6.5;
    }
    return timePeriods;
}

function createCSV(positions: string[], timePeriods: any[]): string {
    let csvContent = positions.join(',') + '\n'; // Create the header row

    for (let timePeriod of timePeriods) {
        let row: string[] = [];
        for (let position of positions) {
            if (position in timePeriod) {
                row.push(timePeriod[position] || '');
            } else {
                row.push('');
            }
        }
        csvContent += row.join(',') + '\n'; // Add each row to the CSV content
    }

    return csvContent;
}

function calculateMinutesPlayed(periodMins: number, positions: string[], timePeriods: any[]): Map<string, number> {
    const minutesPlayed = new Map<string, number>();

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

type Position = {
    position: string;
    x: number;
    y: number;
}

function drawSoccerField(
    canvas: HTMLCanvasElement,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number,
    formation: number,
    playerPositions: Map<string, string>,
): void {
    const ctx = canvas.getContext("2d");

    const getPositions = (formation: number): Position[] => {
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
            case 442:
                return [
                    { position: "GK", x: width / 10 + offsetX, y: height / 2 + offsetY },

                    { position: "LB", x: width / 4 + offsetX,  y: height / 5 + offsetY },
                    { position: "LCB", x: width / 4 + offsetX, y: (height * 2) / 5 + offsetY },
                    { position: "RCB", x: width / 4 + offsetX, y: (height * 3) / 5 + offsetY },
                    { position: "RB", x: width / 4 + offsetX,  y: (height * 4) / 5 + offsetY },

                    { position: "LM", x: (width * 4) / 8 + offsetX,  y: height / 5 + offsetY },
                    { position: "LCM", x: (width * 4) / 8 + offsetX, y: (height * 2) / 5 + offsetY },
                    { position: "RCM", x: (width * 4) / 8 + offsetX, y: (height * 3) / 5 + offsetY },
                    { position: "RM", x: (width * 4) / 8 + offsetX,  y: (height * 4) / 5 + offsetY },

                    { position: "LF", x: (width * 6) / 8 + offsetX, y: height / 3 + offsetY },
                    { position: "RF", x: (width * 6) / 8 + offsetX, y: (height * 2) / 3 + offsetY },
                ];
            case 433:
                return [
                    { position: "GK", x: width / 10 + offsetX, y: height / 2 + offsetY },

                    { position: "LB", x: width / 4 + offsetX,  y: height / 5 + offsetY },
                    { position: "LCB", x: width / 4 + offsetX, y: (height * 2) / 5 + offsetY },
                    { position: "RCB", x: width / 4 + offsetX, y: (height * 3) / 5 + offsetY },
                    { position: "RB", x: width / 4 + offsetX,  y: (height * 4) / 5 + offsetY },

                    { position: "LM", x: (width * 4) / 8 + offsetX, y: height / 4 + offsetY },
                    { position: "CM", x: (width * 4) / 8 + offsetX, y: height / 2 + offsetY },
                    { position: "RM", x: (width * 4) / 8 + offsetX, y: (height * 3) / 4 + offsetY },
                    { position: "LF", x: (width * 6) / 8 + offsetX, y: height / 4 + offsetY },

                    { position: "ST", x: (width * 6) / 8 + offsetX, y: height / 2 + offsetY },
                    { position: "RF", x: (width * 6) / 8 + offsetX, y: (height * 3) / 4 + offsetY },
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
