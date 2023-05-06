
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
