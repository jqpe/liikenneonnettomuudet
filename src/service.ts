import proj4 from 'proj4'

export const fetchPoints = async () => {
  const response = await fetch(DATA_URI)
  const text = await response.text()
  const csv = text.split('\r\n')

  // skip header
  const rows: string[] = csv.slice(1)
  const entries: DataEntry[] = []

  for (const row of rows) {
    const columns = row.split(';')
    if (columns.length >= 5) {
      const [
        kind,
        /** in ETRS-GK25 */
        coordNorth,
        coordEast,
        seriousness,
        year,
      ] = columns

      // The csv might contain reports of accidents without location
      if (!coordNorth || !coordEast) {
        continue
      }

      const coordinates = convertToLatLon(
        Number.parseFloat(coordNorth),
        Number.parseFloat(coordEast)
      )

      if (isValidKind(kind) && coordinates !== null) {
        entries.push({
          kind,
          coordinates,
          seriousness: Number.parseInt(seriousness) as Seriousness,
          year: Number.parseInt(year),
        })
      }
    }
  }

  return entries
}

const isValidKind = (value: string): value is KindU => {
  return (['JK', 'MA', 'MP', 'PP'] as const).includes(value as KindU)
}

function convertToLatLon(north: number, east: number): [number, number] {
  return proj4('EPSG:3879', 'WGS84', [east, north])
}

type KindU = 'JK' | 'PP' | 'MP' | 'MA'

export interface DataEntry {
  /** JK = pedestrian, PP = bicycle, MP = two-wheeled motor vehicle, MA = motor vehicle  */
  kind: KindU
  /** latitude longitude */
  coordinates: [number, number]
  seriousness: Seriousness
  year: number
}

const DATA_URI = '/liikenneonnettomuudet_Helsingissa.csv'

enum Seriousness {
  Property = 1,
  Injury,
  Death,
}
