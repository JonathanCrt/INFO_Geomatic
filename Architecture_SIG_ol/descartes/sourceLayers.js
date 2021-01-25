/*****************************************Layers sources *****************************************/

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
  title: 'Building and transports from MapProxy',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'descartes_batiments_and_transports', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});

let layerBatimentsTransportsFromMapproxyTiles = new ol.layer.Tile({
  title: 'Building and transports from MapProxy with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'descartes_batiments_and_transports', 'MAP': '/home/qgis/descartes/descartes.qgz' }
  }),
  opacity: 1
});


let layerBuildingSourceWFS = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: (extent) => {
    return (
      'http://localhost/qgisserver?MAP=/home/qgis/descartes/descartes.qgz&service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=batiments&' +
      'outputFormat=application/json&srsname=EPSG:3857&' +
      'bbox=' +
      extent.join(',') +
      ',EPSG:3857'
    );
  },
  strategy: ol.loadingstrategy.bbox,
});

let layerBuildingFromQgisServerWFS = new ol.layer.Vector({
  title: 'Building with WFS from QgisServer',
  source: layerBuildingSourceWFS,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2,
    }),
  }),
});

let layerArretBusSourceWFS = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: (extent) => {
    return (
      'http://localhost/qgisserver?MAP=/home/qgis/descartes/descartes.qgz&service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=arret_bus&' +
      'outputFormat=application/json&srsname=EPSG:3857&' +
      'bbox=' +
      extent.join(',') +
      ',EPSG:3857'
    );
  },
  strategy: ol.loadingstrategy.bbox,
});

let layerArretBusFromQgisServerWFS = new ol.layer.Vector({
  title: 'Bus with WFS from QgisServer',
  source: layerArretBusSourceWFS,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(255, 87, 51, 1.0)',
      width: 2,
    }),
  }),
});