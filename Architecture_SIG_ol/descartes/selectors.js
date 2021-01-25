jQuery(() => {

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
    }
  
    $("#layerSelect").on('change', () => {
      let selectValue = $("#layerSelect").val();
      console.log(selectValue);
  
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
          hideAllWMSLayers();
          layerWMSGoogleSatFromMapproxy.setVisible(true);
          layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(true);
          break;
        case "combined_mapproxy_tiles":
          hideAllWMSLayers();
          layerWMSGoogleSatFromMapproxy.setVisible(true);
          layerBatimentsTransportsFromMapproxyTiles.setVisible(true);
          break;
        default:
          layerBatimentsTransportsFromMapproxyInSingleImage.setVisible(true);
          break;
      }
  
    });
  
  })