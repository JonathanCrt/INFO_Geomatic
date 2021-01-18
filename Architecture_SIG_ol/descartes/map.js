/*****************************************Layers sources *****************************************/

const osmSource = new ol.source.OSM();
let projection = ol.proj.get('EPSG:3857');
let projectionExtent = projection.getExtent();
let size = ol.extent.getWidth(projectionExtent) / 256;
let resolutions = new Array(14);
let matrixIds = new Array(14);
for (let z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}


let layerRasterOSM = new ol.layer.Tile({
  title: 'OpenStreetMap',
  visible: true,
  source: osmSource,
  opacity: 1
});

let layerWMSGoogleSatFromQgisServer = new ol.layer.Image({
  title: 'Google Satellite bottom layer from Qgis Server',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'google_sat', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});


let layerWMSGoogleSatFromQgisServerTiles = new ol.layer.Tile({
  title: 'Google Satellite bottom layer Qgis Server with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'google_sat', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});

var wmsSource = new ol.source.ImageWMS({
  url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'descartes_batiments_and_transports', 'MAP': '/home/qgis/descartes/descartes.qgz' },
  crossOrigin: 'anonymous'
});

let layerWMSGoogleSatFromMapproxy = new ol.layer.Image({
  title: 'Google Satellite bottom layer from MapProxy',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'google_sat', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});


let layerWMSGoogleSatFromMapProxyTiles = new ol.layer.Tile({
  title: 'Google Satellite bottom layer from MapProxy with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'google_sat', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});


let layerBatimentsTransportsFromMapproxyInSingleImage = new ol.layer.Image({
  title: 'Batiments and transports from MapProxy',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'descartes_batiments_and_transports', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});

let layerBatimentsTransportsFromMapproxyTiles = new ol.layer.Tile({
  title: 'Batiments and transports from MapProxy with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'descartes_batiments_and_transports', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});


/**
 * autopartage
 * batiments
 * highway
 * poi_new
 * railway
 * railway_station
 * rerA
 * arret_bus
 * google_sat
 */

/***************************************** Extends functionnalities *****************************************/


// legend

let updateLegend =  (resolution) => {
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


/***************************************** Map *****************************************/

let map = new ol.Map({
  target: 'map',
  layers: [
    layerRasterOSM,
    layerWMSGoogleSatFromQgisServer,
    layerWMSGoogleSatFromQgisServerTiles,
    layerWMSGoogleSatFromMapproxy,
    layerWMSGoogleSatFromMapProxyTiles,
    layerBatimentsTransportsFromMapproxyInSingleImage,
    layerBatimentsTransportsFromMapproxyTiles,
    vector
  ],
  controls: ol.control.defaults().extend([mousePositionControl, overviewMapControl]),
  interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
  view: new ol.View({
    center: ol.proj.fromLonLat([2.58701415, 48.83945474]),
    minZoom: 16,
    maxZoom: 28,
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

// Initial legend
let resolution = map.getView().getResolution();
updateLegend(resolution);

// Update the legend when the resolution changes
map.getView().on('change:resolution', (event) => {
   resolution = event.target.getResolution();
  updateLegend(resolution);
});



let typeSelect = document.getElementById('type');
let draw;

let formatLength = (line) => {
  let length = ol.sphere.getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm';
  }
  return output;
};

let formatArea = (polygon) => {
  let area = ol.sphere.getArea(polygon);
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
  draw = new ol.interaction.Draw({
    source: source,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 0, 0.5)',
        lineDash: [10, 10],
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: 'rgba(0, 0, 0, 0.7)',
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
      }),
    }),
  });
  map.addInteraction(draw);

  createMeasureTooltip();
  createHelpTooltip();

  let listener;
  draw.on('drawstart', function (evt) {
    // set sketch
    sketch = evt.feature;

    let tooltipCoord = evt.coordinate;

    listener = sketch.getGeometry().on('change', (evt) => {
      let geom = evt.target;
      let output;
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom);
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom);
        tooltipCoord = geom.getLastCoordinate();
      }
      measureTooltipElement.innerHTML = output;
      measureTooltip.setPosition(tooltipCoord);
    });
  });

  draw.on('drawend', () => {
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    measureTooltip.setOffset([0, -7]);
    // unset sketch
    sketch = null;
    // unset tooltip so that a new one can be created
    measureTooltipElement = null;
    createMeasureTooltip();
    ol.Observable.unByKey(listener);
  });
}

/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center',
  });
  map.addOverlay(measureTooltip);
}

/**
 * Let user change the geometry type.
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();



jQuery(() => {


  $("#layerSelect").on('change', () => {
    let selectValue = $("#layerSelect").val();
    console.log(selectValue);

    const layers = [
      layerWMSGoogleSatFromQgisServer,
      layerWMSGoogleSatFromQgisServerTiles,
      layerWMSGoogleSatFromMapproxy,
      layerWMSGoogleSatFromMapProxyTiles,
      layerBatimentsTransportsFromMapproxyInSingleImage
    ];

    function hideAllWMSLayers() {
      layers.forEach((layer) => {
        layer.setVisible(false);
      });
      layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(true);
    }

    switch (selectValue) {
      case "google_qgis_single":
        hideAllWMSLayers();
        layerWMSGoogleSatFromQgisServer.setVisible(true);
        break;
      case "google_qgis_tiles":
        hideAllWMSLayers();
        layerWMSGoogleSatFromQgisServerTiles.setVisible(true);
        break;
      case "google_mapproxy_single":
        hideAllWMSLayers();
        layerWMSGoogleSatFromMapproxy.setVisible(true);
        break;
      case "google_mapproxy_tiles":
        hideAllWMSLayers();
        layerWMSGoogleSatFromMapProxyTiles.setVisible(true);
        break;
      default:
        hideAllWMSLayers();
        break;
    }

  });


  $("#combinedLayerSelect").on('change', () => {

    let selectValueSet = $("#combinedLayerSelect").val();
    console.log(selectValueSet);


    switch (selectValueSet) {
      case "combined_mapproxy_single":
        layerBatimentsTransportsFromMapproxyTiles.setVisible(false);
        layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(true);
        break;
      case "combined_mapproxy_tiles":
        layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(false);
        layerBatimentsTransportsFromMapproxyTiles.setVisible(true);
        break;
      default:
        layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(true);
        break;
    }

  });



})