window.drawTratti = function(tratti, ctx, map) {
    ctx.strokeStyle = '#444'; //grigio (per ora)
    ctx.lineiwdth=1.5;
    for (const [start, end] of tratti) {
        const p1 = map.latLngToContainerPoint(start);
        const p2 = map.latLngToContainerPoint(end);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.stroke();
    }
};
