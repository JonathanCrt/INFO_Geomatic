/***************************************** Extends functionnalities/options *****************************************/

// legend

let updateLegend = (resolution) => {
    let graphicUrl = wmsSource.getLegendUrl(resolution);
    let img = document.getElementById('legend');
    img.src = graphicUrl;
};


//  for measure tool
let sketch;
let helpTooltipElement;
let helpTooltip;
let measureTooltipElement;
let measureTooltip;
let continuePolygonMsg = 'Click to continue drawing the polygon';
let continueLineMsg = 'Click to continue drawing the line';
let source = new ol.source.Vector();

let rotateWithView = document.getElementById('rotateWithView');

let overviewMapControl = new ol.control.OverviewMap({
    className: 'ol-overviewmap ol-custom-overviewmap',
    layers: [
        new ol.layer.Tile({
            source: osmSource
        }),
    ],
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: false,
});

rotateWithView.addEventListener('change', function () {
    overviewMapControl.setRotateWithView(this.checked);
});

let mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:3857',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});

let projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', (event) => {
    mousePositionControl.setProjection(event.target.value);
});

let precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', (event) => {
    let format = createStringXY(event.target.valueAsNumber);
    mousePositionControl.setCoordinateFormat(format);
});


// Measure tool

let vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});


let pointerMoveHandler = (evt) => {
    if (evt.dragging) {
        return;
    }
    let helpMsg = 'Click to start drawing';

    if (sketch) {
        let geom = sketch.getGeometry();
        if (geom instanceof ol.geom.Polygon) {
            helpMsg = continuePolygonMsg;
        } else if (geom instanceof ol.geom.LineString) {
            helpMsg = continueLineMsg;
        }
    }

    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);

    helpTooltipElement.classList.remove('hidden');
};