let sketch;
let helpTooltipElement;
let helpToolTip;
let measureTootltipElement;
let measureTooltip;
let continuePolygonMsg = 'Click to continue drawing the polygon';
let continueLineMsg = 'Click to continue drawing the line';



/*****************************************Layers sources *****************************************/

const osmSource = new ol.source.OSM();

let layerRasterOSM = new ol.layer.Tile({
  title: 'OpenStreetMap',
  visible: true,
  source: osmSource,
  opacity: 1
});

let layerWMSCountries = new ol.layer.Image({
  title: 'Countries',
  visible: true,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'countries' }
  }),
  opacity: 0.4
});

let layerWMSAirports = new ol.layer.Image({
  title: 'Airports',
  visible: true,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'airports' }
  }),
  opacity: 1
});

let layerWMSPlaces = new ol.layer.Image({
  title: 'Places',
  visible: true,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'places' }
  }),
  opacity: 1
});

/***************************************** Extends functionnalities *****************************************/

let pointerMoveHandler = (evt) => {
  if (evt.dragging) {
    return;
  }
  let helpMsg = 'Click to start drawing';
  if (sketch) {
    let geom = sketch.getGeometry();
    if (geom instanceof Polygon) {
      helpMsg = continuePolygonMsg;
    } else if (geom instanceof LineString) {
      helpMsg = continueLineMsg;
    }
  }
  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
}

let overviewMapControl = new ol.control.OverviewMap({
  layers: [
    new ol.layer.Tile({
      source: osmSource,
      minResolution: 200,
      maxResolution: 2000,
    }),
  ],
});


let mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
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


/***************************************** Map *****************************************/

let map = new ol.Map({
  target: 'map',
  layers: [layerRasterOSM, layerWMSCountries, layerWMSAirports, layerWMSPlaces],
  controls: ol.control.defaults().extend([mousePositionControl, overviewMapControl]),
  view: new ol.View({
    center: ol.proj.fromLonLat([2.5854809914, 48.8368466526]),
    minZoom: 0,
    maxZoom: 12,
    zoom: 2,
    extent: ol.proj.transformExtent([-19.7168, 34.8448, 30.8477, 60.3544], 'EPSG:4326', 'EPSG:3857')
  })
});

// https://github.com/walkermatt/ol-layerswitcher
const layerSwitcher = new LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});
map.addControl(layerSwitcher);


map.on('pointermove', pointerMoveHandler);

map.getViewport().addEventListener('mouseout', () => {
  helpTooltipElement.classList.add('hidden');
});

let typeSelect = document.getElementById('type');

let draw;

let formatLength = (line) => {
  let length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

let formatArea = (polygon) => {
  let area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
  }
  return output;
};

function addInteraction() {
  let type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
  draw = new Draw({
    source: source,
    type: type,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new CircleStyle({
        radius: 5,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();

  let listener;
  draw.on('drawstart', (evt) => {
    // set sketch
    sketch = evt.feature;

    /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', (evt) => {
      let geom = evt.target;
      let output;
      if (geom instanceof Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  draw.on('drawend', function () {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    unByKey(listener);
  });
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

typeSelect.onchange = () => {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();