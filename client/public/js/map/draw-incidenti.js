window.drawIncidenti = function(incidenti, ctx, map) {
    for (const coord of incidenti) {
        const pos = map.latLngToContainerPoint(coord);
        ctx.fillRect(pos.x, pos.y, 1, 1);
    }
};
