/*****************************************Layers sources *****************************************/

const osmSource = new ol.source.OSM();
let projection = ol.proj.get('EPSG:3857');
let projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}


let layerRasterOSM = new ol.layer.Tile({
  title: 'OpenStreetMap',
  visible: false,
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
  visible: true,
  source: new ol.source.ImageWMS({
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




/***************************************** Map *****************************************/

let map = new ol.Map({
  target: 'map',
  layers: [
    layerRasterOSM,
    layerWMSGoogleSatFromQgisServer,
    layerWMSGoogleSatFromQgisServerTiles,
    layerWMSGoogleSatFromMapproxy,
    layerWMSGoogleSatFromMapProxyTiles,
    layerBatimentsTransportsFromMapproxyInSingleImage

  ],
  controls: ol.control.defaults().extend([mousePositionControl, overviewMapControl]),
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
      case "osm":
        hideAllWMSLayers();
        break;
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

})