"use strict";
function mkUrl(game) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('time', game.time.toString());
    currentUrl.searchParams.set('formation', game.formation.toString());
    const tpqs = encodeURIComponent(JSON.stringify(game.timePeriods));
    currentUrl.searchParams.set('timePeriods', tpqs);
    return currentUrl.toString();
}
function parseUrl() {
    var _a, _b;
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
    return {
        time: currTime,
        formation: parseInt((_b = urlParams.get('formation')) !== null && _b !== void 0 ? _b : '322'),
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
