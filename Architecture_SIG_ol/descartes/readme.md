# "Cité DESCARTES" / SIG Architecture ESIPE 

What was done ....

## Interactive web map

Initial projections  : 
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

## Option : A selector of the bottom layer 


## A little style and responsive design... 



### mapproxy command  : 

mapproxy-util wms-capabilities --host http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util autoconfig --output=qgis-server.yaml --capabilities=http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util serve-develop -b 127.0.0.1:8080 qgis-server.yaml