//fonction popup
function onEachFeature(feature, layer) {
    if (feature.properties) {
        layer.bindPopup("<b>" + feature.properties.CODE_DEPT + "</b><br>" +
            feature.properties.NOM_DEPT);
    }
}