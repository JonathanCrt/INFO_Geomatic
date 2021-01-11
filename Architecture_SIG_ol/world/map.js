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
  visible: true,
  source: osmSource,
  opacity: 1
});

let layerWMSCountriesFromQgisServer = new ol.layer.Image({
  title: 'Countries from Qgis Server',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'countries' }
  }),
  opacity: 0.4
});

let layerWMSCountriesFromQgisServerTiles = new ol.layer.Tile({
  title: 'Countries from Qgis Server with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'countries' }
  }),
  opacity: 0.4
});

let layerWMSCountriesFromMapProxy = new ol.layer.Image({
  title: 'Countries from MapProxy',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'countries' }
  }),
  opacity: 0.4
});


let layerWMSCountriesFromMapProxyTiles = new ol.layer.Tile({
  title: 'Countries from MapProxy with tiling',
  visible: false,
  source: new ol.source.TileWMS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'countries' }
  }),
  opacity: 0.4
});

let layerWMSAirports = new ol.layer.Image({
  title: 'Airports',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'airports' }
  }),
  opacity: 1
});

let layerWMSPlaces = new ol.layer.Image({
  title: 'Places',
  visible: false,
  source: new ol.source.ImageWMS({
    url: 'http://localhost/qgisserver?',
    params: { 'LAYERS': 'places' }
  }),
  opacity: 1
});


let layerWMTSCountries =  new ol.layer.Tile ({
  opacity: 0.7,
  visible: true,
  source: new ol.source.WMTS({
    url: 'http://localhost:8080/service?',
    params: { 'LAYERS': 'countries' },
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    projection: projection,
    tileGrid: new ol.tilegrid.WMTS({
        origin: ol.extent.getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
    }),
    style: 'default',
    wrapX: true,
  })
}); 



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
  layers: [
    layerRasterOSM, 
    layerWMSCountriesFromQgisServer, 
    layerWMSAirports, 
    layerWMSPlaces, 
    layerWMSCountriesFromMapProxy, 
    layerWMSCountriesFromQgisServerTiles, 
    layerWMSCountriesFromMapProxyTiles,
    layerWMTSCountries
  ],
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


jQuery(() => {
  $("#layerSelect").on('change', () => {
    let selectValue = $("#layerSelect").val();
    console.log(selectValue);

    const layers = [
      layerWMSCountriesFromQgisServer,
      layerWMSCountriesFromQgisServerTiles,
      layerWMSCountriesFromMapProxy,
      layerWMSCountriesFromMapProxyTiles
    ];

    function hideAllWMSLayers() {
      layers.forEach((layer) => {
        layer.setVisible(false);
      });
    }

    switch (selectValue) {
      case "osm":
        hideAllWMSLayers();
        break;
      case "world_qgis_single":
        hideAllWMSLayers();
        layerWMSCountriesFromQgisServer.setVisible(true);
        break;
      case "world_qgis_tiles":
        hideAllWMSLayers();
        layerWMSCountriesFromQgisServerTiles.setVisible(true);
        break;
      case "world_mapproxy_single":
        hideAllWMSLayers();
        layerWMSCountriesFromMapProxy.setVisible(true);
        break;
      case "world_mapproxy_tiles":
        layers.forEach((layer) => {
          layer.setVisible(false);
        });
        layerWMSCountriesFromMapProxyTiles.setVisible(true);
        break;
      default:
        hideAllWMSLayers();
        break;
    }
  });







})