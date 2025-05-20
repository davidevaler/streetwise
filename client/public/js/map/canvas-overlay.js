L.CanvasOverlay = L.Layer.extend({
  initialize: function (drawCallback, options = {}) {
    this._drawCallback = drawCallback;
    this.options = options
  },

  onAdd: function (map) {
    this._map = map;
    this._canvas = L.DomUtil.create('canvas', 'leaflet-canvas-overlay');
    this._canvas.dataset.layer = this.options.pane || 'default';
    this._canvas.style.position = 'absolute';
    this._ctx = this._canvas.getContext('2d');

    const paneName = this.options.pane || 'overlayPane';
    const pane = map.getPane(paneName);
    pane.appendChild(this._canvas);

    map.on('move zoom resize', this._reset, this);
    
    this._reset();
  },

  onRemove: function () {
    L.DomUtil.remove(this._canvas);
    this._map.off('move zoom resize', this._reset, this);
  },

  _reset: function () {
    const size = this._map.getSize();
    const pos = this._map.containerPointToLayerPoint([0, 0]);

    this._canvas.width = size.x;
    this._canvas.height = size.y;
    L.DomUtil.setPosition(this._canvas, pos);
    let redrawTimeout = 0;
    clearTimeout(redrawTimeout);
    redrawTimeout = setTimeout(() => {
      this._ctx.clearRect(0, 0, size.x, size.y);
      this._drawCallback(this._canvas, this._ctx, this._map);
    }, 40); // Pausa per il movimento (altirmenti lagga)
  }
});

