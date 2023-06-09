type TimePeriod = {
    time: number;
    subs: string[];
    GK?: string;
    LB?: string;
    CB?: string;
    RB?: string;
    LM?: string;
    RM?: string;
    LF?: string;
    RF?: string;
};

type Game = {
    name: string;
    time: number;
    formation: number;
    timePeriods: TimePeriod[];
}

function extractWords(input: string): string[] {
    let words = input.match(/[a-zA-Z]+/g);
    return words || [];
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

function generateSubList(playerMaxLen: number, timePeriod1: any, timePeriod2: any, positionKeys: string[]): HTMLUListElement {
    const subList: HTMLUListElement = document.createElement('ul');
    for (let positionKey of positionKeys) {
        const oldPlayer: string | undefined = timePeriod1[positionKey];
        const newPlayer: string | undefined = timePeriod2[positionKey];
        if (oldPlayer !== newPlayer) {
            const listItem: HTMLLIElement = document.createElement('li');
            listItem.textContent = `${positionKey} ${newPlayer} for ${oldPlayer}`;
            subList.appendChild(listItem);
        }
    }
    return subList;
}

function mkUrl(game: Game): string {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('name', game.name);
    currentUrl.searchParams.set('time', game.time.toString());
    currentUrl.searchParams.set('formation', game.formation.toString());
    const tpqs = encodeURIComponent(JSON.stringify(game.timePeriods));
    currentUrl.searchParams.set('timePeriods', tpqs);
    return currentUrl.toString();
}

function parseUrl(): Game {
    const urlParams = new URLSearchParams(window.location.search);
    const currTime = parseFloat(urlParams.get('time') ?? '0.0');

    var timePeriodStr = urlParams.get('timePeriods');
    if (timePeriodStr) {
        timePeriodStr = decodeURIComponent(timePeriodStr);
    } else {
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

    var name = urlParams.get('name') ?? 'No Name';

    return {
        name: name,
        time: currTime,
        formation: parseInt(urlParams.get('formation') ?? '322'),
        timePeriods: timePeriods
    };

}

function getCurrentPeriod(game: Game): TimePeriod {
    var currPeriod: TimePeriod | null = null;
    for (const p of game.timePeriods) {
        if (p.time == game.time) {
            currPeriod = p;
            break;
        }
    }
    if (!currPeriod) {
        throw new Error("Current period not found, game in invalid state")
    }
    return currPeriod;
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
