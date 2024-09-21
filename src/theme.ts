import type {
  HeatmapLayer,
  SymbolLayer,
  CircleLayer,
} from 'react-map-gl/maplibre'

export const palette = {
  car: {
    value: '#564256',
    description: 'Auto (ml. kuorma-autot, yhdistelmät jne.)',
  },
  pedestrian: { value: '#862209', description: 'Jalankulkija' },
  bicycle: { value: '#3891A6', description: 'Polkypyörä' },
  motorcycle: { value: '#E9B872', description: 'Moottoripyörä (ml. mopot)' },
}

export const mapIcons = {
  pedestrian: 'pedestrian',
  bicycle: 'bicycle',
  motorcycle: 'motorcycle',
  car: 'car',
  default: 'default-icon',
} as const

const colors = [
  'JK',
  palette.pedestrian.value,
  'PP',
  palette.bicycle.value,
  'MP',
  palette.motorcycle.value,
  'MA',
  palette.car.value,
] as const

export const iconLayer = {
  id: 'accident-points-icon',
  source: '__parent__',
  type: 'symbol',
  layout: {
    'icon-image': [
      'match',
      ['get', 'kind'],
      'JK',
      mapIcons.pedestrian,
      'PP',
      mapIcons.bicycle,
      'MP',
      mapIcons.motorcycle,
      'MA',
      mapIcons.car,
      // else
      mapIcons.default,
    ],
    'icon-size': [
      'interpolate',
      ['exponential', 1.5],
      ['zoom'],
      ...[5, 0.1],
      ...[10, 0.5],
      ...[15, 1],
    ],
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
  },
  paint: {
    'icon-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
    'icon-color': ['match', ['get', 'kind'], ...colors, '#000'],
  },
} satisfies SymbolLayer

export const circleLayer = {
  id: 'accidents-points-circle',
  type: 'circle',
  source: '__parent__',
  paint: {
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 6],
    'circle-opacity': ['interpolate', ['linear'], ['zoom'], 13, 1, 14, 0],
    'circle-color': ['match', ['get', 'kind'], ...colors, '#000'],
  },
} satisfies CircleLayer

export const heatmapLayer = {
  id: 'heatmap',
  type: 'heatmap',
  source: '__parent__',
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 3, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 5],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0,
      'rgba(33,102,172,0)',
      0.2,
      'rgb(103,169,207)',
      0.4,
      'rgb(209,229,240)',
      0.6,
      'rgb(253,219,199)',
      0.8,
      'rgb(239,138,98)',
      1,
      'rgb(178,24,43)',
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 15, 30],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 15, 1],
  },
} satisfies HeatmapLayer
