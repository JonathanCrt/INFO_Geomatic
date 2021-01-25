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
    vector,
    //layerPoiFromQgisServerWFS,
    layerBuildingFromQgisServerWFS

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
//layerBuildingFromQgisServerWFS.setVisible(false);

$("#wfsLayerCheckbox").change(() => {
  if ($("#wfsLayerCheckbox").is(':checked')) {
    map.addLayer(layerBuildingFromQgisServerWFS);
  }
  else {
    map.removeLayer(layerBuildingFromQgisServerWFS);
  }

});

/*
$("#hideAllLayersCheckbox").change(() => {
  let layersToRemove = [];
  map.getLayers().forEach(function (layer) {
    if (layer.get('name') != undefined) {
      layersToRemove.push(layer);
    }
  });

  var len = layersToRemove.length;
  for (var i = 0; i < len; i++) {
    map.removeLayer(layersToRemove[i]);
  }
});
*/


