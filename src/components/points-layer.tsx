import { useMemo } from 'react'
import { Layer, Source } from 'react-map-gl/maplibre'
import type { DataEntry } from '@/service'
import { circleLayer, heatmapLayer, iconLayer } from '@/theme'

interface PointsLayerProps {
  /** @default true */
  heatmap?: boolean
  /** @default true */
  pointmap?: boolean
  data: DataEntry[]
}

export const PointsLayer = (props: PointsLayerProps) => {
  const geojsonData = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features:
        props.data?.map(entry => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: entry.coordinates,
          },
          properties: {
            kind: entry.kind,
            seriousness: entry.seriousness,
          },
        })) ?? [],
    } satisfies GeoJSON.FeatureCollection
  }, [props.data])

  return (
    <Source type="geojson" data={geojsonData}>
      {props.heatmap !== false && <Layer {...heatmapLayer} />}
      {props.pointmap !== false && <Layer {...iconLayer} />}
      {props.pointmap !== false && <Layer {...circleLayer} />}
    </Source>
  )
}
