# "Cité DESCARTES" / SIG Architecture ESIPE 

What was done ....

## An Interactive web map...

This map display the "Cité Descartes" with the following layers : 
 * autopartage -> EPSG:2154
 * batiments -> EPSG:4326
 * highway -> EPSG:4326
 * poi_new -> EPSG:2154
 * railway -> EPSG:4326
 * railway_station -> EPSG:4326
 * rerA -> EPSG:4326
 * arret_bus -> EPSG:4326
 * google_sat -> EPSG:2154

translate to EPSG:3857 because EPSG;2154 is not supported by MapProxy

## ... enclosed with some features


- An overwiew at the top right of the map (https://openlayers.org/en/latest/examples/overviewmap.html)
- Displaying mouse coordinates (https://openlayers.org/en/latest/examples/mouse-position.html)
- Measure (https://openlayers.org/en/latest/examples/measure.html)
- Two selectors to choose display modes (single image/tiling) of upper/bottom layers


## A little style and responsive design... 

I addded Bootstrap 5 (beta) to give a clean style to the project
https://getbootstrap.com/

### mapproxy command  : 

mapproxy-util wms-capabilities --host http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util autoconfig --output=qgis-server.yaml --capabilities=http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util serve-develop -b 127.0.0.1:8080 qgis-server.yaml