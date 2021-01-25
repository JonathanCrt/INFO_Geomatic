# "Cité DESCARTES" / SIG Architecture ESIPE 

What was done ....

## An Interactive web map...

This map display "Cité Descartes" with the following layers : 
 * autopartage -> EPSG:2154
 * batiments -> EPSG:4326
 * highway -> EPSG:4326
 * poi_new -> EPSG:2154
 * railway -> EPSG:4326
 * railway_station -> EPSG:4326
 * rerA -> EPSG:4326
 * arret_bus -> EPSG:4326
 * google_sat -> EPSG:2154

translate to EPSG:3857 because EPSG:2154 is not supported by MapProxy

## ... enclosed with some features

- An overwiew at the top right of the map (https://openlayers.org/en/latest/examples/overviewmap.html)
- Displaying mouse coordinates (https://openlayers.org/en/latest/examples/mouse-position.html)
- Measure (https://openlayers.org/en/latest/examples/measure.html)
- Two selectors to choose display modes (single image/tiling) of upper/bottom layers

## Request layers with WFS

https://openlayers.org/en/latest/examples/vector-wfs.html

## A little style and responsive design... 

I addded Bootstrap 5 (beta) to give a clean style to the project
https://getbootstrap.com/

### mapproxy command  : 

mapproxy-util wms-capabilities --host http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util autoconfig --output=qgis-server.yaml --capabilities=http://localhost/qgisserver?map=/home/qgis/descartes/descartes.qgz
sudo mapproxy-util serve-develop -b 127.0.0.1:8080 qgis-server.yaml


### WMS Qgis requests to postgis  : 

data source : database crete from psotgis / host 127.0.0.1 / port 5432 / 

Command in terminal : tail -f /var/log/postgresql/postgresql-VERSION-main.log

SELECT st_asbinary("geom",'NDR'),"id","name"::text FROM "public"."batiments" WHERE "geom" && st_makeenvelope(2.58106571311475363,48.83425100000000185,2.59402628688524661,48.84641400000000289,4326)


### PostGis Raster : 

- L'image raster se stocke dans la base en une table, chaque ligne est une tuile dans le processus de tuilage/maillage.
- Raster overview (diff map overview) : on génére la miniature de l'imgae raster, afin de voir l'image dans sa globalité.Le format tiff permet de réaliser des overview

- Un GéoTiff contient le géoréfencement d'un fichier Tiff
Un png, jpeg a besoin d'un fichier de géoréférencement (pgw)
Ce fichier contient-il le CRS (coordinates reference system) ? Non, il faut le préciser 
- Il faut ajouter des contraintes raster : 

https://gdal.org/drivers/raster/postgisraster.html

