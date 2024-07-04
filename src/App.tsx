import { useState } from 'react';
import './App.css';
// @ts-expect-error fddd
import logo from './assets/logo.svg';
import DeckGL from '@deck.gl/react';
import React from 'react';
import MapGl from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { Feature, Geometry } from 'geojson';
import mock from './mock2.json';
import axios from 'axios';
import { parse } from 'wkt';

function App() {
  return <Map />;
}

export default App;

const Map = () => {
  // const clickInfo = useSelector((state) => state.app.clickInfo);
  const [radius, setRadius] = useState(100);
  const [limit, setLimit] = useState(100);
  const [threshold, setThreshold] = useState(0.9);
  const [showMap, setShowMap] = useState(true);
  const [showLayer, setShowLayer] = useState(true);
  const [searchLayer, setSearchLayer] = useState<GeoJsonLayer | undefined>(undefined);
  const [server, setServer] = useState(
    'https://core.malevich.ai/api/v1/endpoints/run/4fe91c227b673b416fc3c3cae059410d850f1aa411a048cc14e2905758cb11ca',
  );
  const [name, setName] = useState('greenvision_military_bases_dakota');
  const [first, setFirst] = useState(
    'aff85793cb534fb99717ca30229a2225-scroll-scroll$aff85793cb534fb99717ca30229a2225-scroll-scroll',
  );
  const [second, setSecond] = useState(
    'f90f6c69c80d4909a9f80c8d29eaf3e8-search-search$f90f6c69c80d4909a9f80c8d29eaf3e8-search-search',
  );

  type PropertiesType = {
    name: string;
    color: string;
  };

  const geolayer = new GeoJsonLayer({
    id: 'GeoJsonLayer',
    // @ts-expect-error fddd
    data: mock,
    opacity: 0.5,

    stroked: true,
    filled: true,
    pointType: 'circle+text',
    pickable: true,

    getFillColor: [160, 160, 180, 0],
    // @ts-expect-error fddd
    getLineColor: (f: Feature<Geometry, PropertiesType>) => {
      const hex = f.properties.color;
      // convert to RGB
      return hex ? hex?.match(/[0-9a-f]{2}/g)?.map((x) => parseInt(x, 16)) : [0, 0, 0];
    },
    getText: (f: Feature<Geometry, PropertiesType>) => f.properties.name,
    getLineWidth: 6,
    getPointRadius: 4,
    getTextSize: 12,
    onClick: (info) => onLayerClick(info),
  });

  const onLayerClick = (info): void => {
    axios
      .post(server, {
        cfg: {
          appCfgExtension: {
            [first]: `{"limit": 1, "collection_name": ${name}, "filter": {"should": null, "must": [{"key": "location", "match": null, "range": null, "geo_bounding_box": null, "geo_radius": {"center": {"lon":${info.coordinate[0]},"lat":${info.coordinate[1]}}, "radius": ${radius}}, "geo_polygon": null, "values_count": null}], "must_not": null}}`,
            [second]: `{"limit": ${limit}, "collection_name": ${name}, "score_threshold": ${threshold}, "timeout": 100}`,
          },
        },
      })
      .then((res) => {
        const resData = Object.values(res.data.results)?.[0]?.[0] || [];
        console.log(res, resData);

        const newData = {
          type: 'FeatureCollection',
          name: 'search_greenvision_military_bases',
          features: resData?.map((elem) => ({
            geometry: parse(JSON.parse(elem.payload).geometry),
            type: 'Feature',
            properties: {
              id: '00467443-5305-4e7a-bb38-6fa14042eef4',
              score: elem.score,
            },
          })),
        };

        setSearchLayer(
          new GeoJsonLayer({
            id: 'srch',
            // @ts-expect-error fddd
            data: newData,

            stroked: false,
            filled: true,
            pointType: 'circle+text',
            pickable: true,

            getFillColor: (e) => {
              return [255, 0, 0, e.properties.score * 255];
            },
            // @ts-expect-error fddd
            getLineColor: (f: Feature<Geometry, PropertiesType>) => {
              const hex = f.properties.color;
              // convert to RGB
              return hex ? hex?.match(/[0-9a-f]{2}/g)?.map((x) => parseInt(x, 16)) : [0, 0, 0];
            },
            getText: (f: Feature<Geometry, PropertiesType>) => f.properties.name,
            getLineWidth: 20,
            getPointRadius: 4,
            getTextSize: 12,
            onClick: (info) => onLayerClick(info),
          }),
        );
        /**/
      });
  };

  return (
    <div className="app">
      <img src={logo} alt="logo" className="logo" />
      <DeckGL
        id="covid"
        controller
        initialViewState={{
          longitude: -101.5023345190481,
          latitude: 48.40310747969382,
          zoom: 11,
        }}
        layers={[...(showLayer ? [geolayer] : []), searchLayer]}
      >
        {showMap ? (
          <MapGl
            mapStyle="mapbox://styles/furiousteabag/cly30kekk006y01pm2qtfa3df"
            mapboxAccessToken="pk.eyJ1IjoiZnVyaW91c3RlYWJhZyIsImEiOiJjbHkzMGlscXQwMm13MmlxdmU5eHR2cDlyIn0.ECMzl_a3SSikTroNnU1NbA"
          />
        ) : null}
      </DeckGL>
      <div className="input_wrap">
        <div className="input_text">Endpoint</div>
        <input
          type="string"
          value={server}
          onChange={(e) => setServer(e.target.value)}
          className="input"
          placeholder="Endpoint link"
        />
        <div className="input_text">Index</div>
        <input
          type="string"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Index"
        />
        <div className="input_text">First config ID</div>
        <input
          type="string"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
          className="input"
          placeholder="ID"
        />
        <div className="input_text">Second config ID</div>
        <input
          type="string"
          value={second}
          onChange={(e) => setSecond(e.target.value)}
          className="input"
          placeholder="ID"
        />
        <div className="input_text">Limit</div>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value) || 0)}
          className="input"
          placeholder="Limit"
        />
        <div className="input_text">Radius</div>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
          className="input"
          placeholder="Radius"
        />
        <div className="input_text">Score threshold</div>
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
          className="input"
          placeholder="Radius"
          max={1}
          min={0}
        />
        <div className="input_text">Show map</div>
        <input
          type="checkbox"
          checked={showMap}
          onChange={() => setShowMap((prev) => !prev)}
          className="checkbox"
        />
        <div className="input_text">Show layer</div>
        <input
          type="checkbox"
          checked={showLayer}
          onChange={() => setShowLayer((prev) => !prev)}
          className="checkbox"
        />
      </div>
    </div>
  );
};

