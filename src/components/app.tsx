import type { MapStyleImageMissingEvent } from 'maplibre-gl'

import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import proj4 from 'proj4'
import { useEffect, useMemo, useRef } from 'react'
import { Map, MapRef } from 'react-map-gl/maplibre'

import { Chart } from '@/components/chart'

import { fetchPoints } from '../service'
import { PointsLayer } from './points-layer'

proj4.defs(
  'EPSG:3879',
  '+proj=tmerc +lat_0=0 +lon_0=25 +k=1 +x_0=25500000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
)

export const App = () => {
  const mapStyle = `https://api.protomaps.com/styles/v2/white.json?key=${import.meta.env.VITE_MAP_API_KEY}`
  const mapRef = useRef<MapRef>(null)
  const map = mapRef.current?.getMap()

  useEffect(() => {
    if (!map) return

    const onMapImageMissing = async (event: MapStyleImageMissingEvent) => {
      const imageId = event.id
      const iconUrl = `/icons/${imageId}.svg`

      const img = new Image(24, 24)
      img.onload = () => {
        if (!map.hasImage(imageId)) {
          map.addImage(imageId, img, { sdf: true })
        }
      }
      img.onerror = console.error
      img.src = iconUrl
    }

    map.on('styleimagemissing', onMapImageMissing)

    return () => void map?.off('styleimagemissing', onMapImageMissing)
  }, [map])

  const form = useForm({
    defaultValues: {
      seriousness: -1,
      year: 2022,
      heatmap: false,
    },
    validatorAdapter: zodValidator(),
  })

  const { data } = useQuery({
    queryKey: ['points'],
    queryFn: fetchPoints,
  })

  const year = form.getFieldValue('year')
  const seriousness = form.getFieldValue('seriousness')

  const filteredData = useMemo(() => {
    return data?.filter(entry => {
      const yearMatches = entry.year === year
      const severityMatches =
        seriousness !== -1 ? seriousness === entry.seriousness : true

      return yearMatches && severityMatches
    })
  }, [data, year, seriousness])

  return (
    <main className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 h-screen ">
      <article className="p-8 space-y-4 overflow-y-auto">
        <h1 className="text-2xl tracking-widest">
          Liikenneonnettomuudet Helsingissä
        </h1>

        <section>
          <Chart data={filteredData} />
        </section>

        <hr />

        <p className="text-xs text-gray-700">
          Liikenneonnettomuudet aikaväliltä 2000 — 2022, jotka ovat johtaneet
          omaisuusvahinkoon, loukkaantumiseen tai kuolemaan.
          Onnettomuusrekisteri perustuu poliisilta saatuihin tietoihin. Tiedot
          ovat täysin kattavia vain kuolemantapausten osalta. Aineistossa on
          puutteita mm. onnettomuusvahinkojen, lievien henkilövahinkojen sekä
          erityisesti jalankulkija-, polkupyörä- ja mopo-onnettomuuksien osalta.
        </p>

        <p className="text-xs text-gray-700">
          Lähde:{' '}
          <a
            target="_blank"
            className="text-blue-500 hover:brightness-125 visited:text-purple-500"
            href="https://hri.fi/data/fi/dataset/liikenneonnettomuudet-helsingissa"
          >
            Liikenneonnettomuudet Helsingissä
          </a>
          . Helsinki Region Infoshare 21.09.2024. Lisenssi Creative Commons
          Attribution 4.0. Esitetty data on ladattavissa{' '}
          <a
            className="text-blue-500 hover:brightness-125 visited:text-purple-500"
            href="/liikenneonnettomuudet_Helsingissa.csv"
          >
            csv tiedostona
          </a>
          .
        </p>

        <section className="bg-gray-100 rounded-sm px-2 py-1 shadow-sm">
          <h2 className="text-lg mb-2">Suodata dataa</h2>

          <form
            className="space-y-2"
            onSubmit={e => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="year"
              validators={{
                onChange: ({ value }) =>
                  value && (value < 2000 || value > 2022)
                    ? 'dataa on vain aikaväliltä 2000—2022'
                    : undefined,
              }}
              children={field => {
                return (
                  <>
                    <div className="border p-1 flex bg-white gap-2">
                      <label htmlFor={field.name}>Vuosi: </label>
                      <input
                        max={2022}
                        min={2000}
                        className="w-full"
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={e => {
                          field.handleChange(Number.parseInt(e.target.value))

                          if (+e.target.value > 0) form.handleSubmit()
                        }}
                      />
                    </div>

                    {field.state.meta.errors.length ? (
                      <em className="text-xs text-red-500">
                        {field.state.meta.errors.join(',')}
                      </em>
                    ) : null}
                  </>
                )
              }}
            />

            <form.Field
              name="seriousness"
              children={field => {
                return (
                  <div className="border p-1 flex bg-white gap-2">
                    <label className="min-w-fit" htmlFor={field.name}>
                      Vain:
                    </label>
                    <select
                      className="w-full leading-4 h-min my-auto px-2 py-0.5 rounded-sm bg-gray-200"
                      onChange={e => {
                        field.handleChange(Number.parseInt(e.target.value))
                        form.handleSubmit()
                      }}
                    >
                      {[
                        '',
                        'omaisuusvahingot',
                        'loukkaantumiseen johtaneet',
                        'kuolemaan johtaneet',
                      ].map((value, index) => (
                        <option value={index || -1}>{value}</option>
                      ))}
                    </select>
                  </div>
                )
              }}
            />

            <form.Field
              name="heatmap"
              children={field => {
                return (
                  <div className="flex justify-between px-1">
                    <label htmlFor={field.name}>Lämpökartta</label>

                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      value={String(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={e => {
                        field.handleChange(e.target.checked)
                        form.handleSubmit()
                      }}
                    />
                  </div>
                )
              }}
            />
          </form>
        </section>
      </article>

      <div className="col-span-2">
        <Map
          ref={mapRef}
          minZoom={10}
          mapStyle={mapStyle}
          initialViewState={{
            zoom: 11,
            // Helsinki
            latitude: 60.192059,
            longitude: 24.945831,
          }}
        >
          {filteredData && (
            <PointsLayer
              data={filteredData}
              heatmap={form.getFieldValue('heatmap')}
              pointmap={!form.getFieldValue('heatmap')}
            />
          )}
        </Map>
      </div>
    </main>
  )
}
