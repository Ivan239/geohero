import { useState } from 'react';
import './App.css';
// @ts-expect-error fddd
import logo from './assets/logo.svg';
import DeckGL from '@deck.gl/react';
import React from 'react';
import MapGl from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { Feature, Geometry } from 'geojson';
import mock from './mock.json';
import axios from 'axios';
import search from './search.json';

function App() {
  return <Map />;
}

export default App;

const Map = () => {
  // const clickInfo = useSelector((state) => state.app.clickInfo);
  const [radius, setRadius] = useState(100);
  const [limit, setLimit] = useState(100);
  const [threshold, setThreshold] = useState(1);
  const [showMap, setShowMap] = useState(true);
  const [showLayer, setShowLayer] = useState(true);
  const [searchLayer, setSearchLayer] = useState<GeoJsonLayer | undefined>(undefined);

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
      .post(
        `https://core.malevich.ai/api/v1/endpoints/run/ccde9f883c573c84e6d973569e38c1f11ea1b3a0e945e95f8e4464ca504a25ac`,
        {
          cfg: {
            appCfgExtension: {
              '41dd8bb794ad47b28f487caa3829b9da-scroll-scroll-1$41dd8bb794ad47b28f487caa3829b9da-scroll-scroll-1': `{"limit": 1, "collection_name": "greenvision_test", "filter": {"should": null, "must": [{"key": "location", "match": null, "range": null, "geo_bounding_box": null, "geo_radius": {"center": {"lon":${info.coordinate[0]},"lat":${info.coordinate[1]}}, "radius": ${radius}}, "geo_polygon": null, "values_count": null}], "must_not": null}}`,
              '0930ea255d1d4ecbb3b1507c2eca3f11-search-search-1$0930ea255d1d4ecbb3b1507c2eca3f11-search-search-1': `{"limit": ${limit}, "collection_name": "greenvision_test", "score_threshold": ${threshold}}`,
            },
          },
        },
      )
      .then(() => {
        /*
        const resData = Object.values(res.data.results)?.[0]?.[0];

        const data = resData?.map((elem) => JSON.parse(elem?.payload || '{}'));
        const scores = resData?.map((elem) => elem.score);
*/
        setSearchLayer(
          new GeoJsonLayer({
            id: 'srch',
            // @ts-expect-error fddd
            data: search,

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
          longitude: -115.0237089421788,
          latitude: 36.23890558133199,
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

