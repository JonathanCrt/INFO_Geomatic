import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import {Stroke, Style} from 'ol/style';
import Icon from 'ol/style/Icon';
import OSM from 'ol/source/OSM';
import * as olProj from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import XYZ from 'ol/source/XYZ';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  
  map: Map;

  constructor() {}

  ngOnInit() {

    var vectorSource = new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return (
          'http://151.80.57.175:8090/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&' +
          'typeName=zambia-wks:planet_osm_polygon&outputFormat=application/json'
        );
      },
      strategy: bboxStrategy,
    });


  


    var vector = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgba(0, 0, 255, 1.0)',
          width: 2,
        }),
      }),
    });




    this.map = new Map({
      target : 'myMap',
      layers : [
        new TileLayer({
          source: new XYZ({
            url:
              'http://151.80.57.175:9000/tile/{z}/{x}/{y}.png',
          }),
        }),
        vector],
      view : new View({
        center: [-15.416667, 28.283333],
        maxZoom: 19,
        zoom: 4,
      })
    });
  }

}
