import { GeoVector, Body, RotateVector, Rotation_EQD_ECL, SphereFromVector, SiderealTime } from 'astronomy-engine';

export const ZODIAC_SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ",
  "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"
];

function getSignFromLon(lon: number) {
  const index = Math.floor(lon / 30) % 12;
  return ZODIAC_SIGNS[index];
}

function getEclipticLongitude(body: Body, date: Date) {
  const vec = GeoVector(body, date, true); // true for aberration
  const rot = Rotation_EQD_ECL(date);
  const ecl_vec = RotateVector(rot, vec);
  const sphere = SphereFromVector(ecl_vec);
  return (sphere.lon + 360) % 360;
}

function getAscendant(date: Date, lat: number, lon: number) {
  const gmst = SiderealTime(date);
  const lst = (gmst + lon / 15) % 24;
  const ramc_deg = lst * 15;
  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;

  const ramc = ramc_deg * DEG2RAD;
  const eps = 23.4392911 * DEG2RAD; 
  const lat_rad = lat * DEG2RAD;

  let asc_rad = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat_rad) * Math.sin(eps)));
  let asc_deg = asc_rad * RAD2DEG;
  return (asc_deg + 360) % 360;
}

export function generateNatalChart(name: string, dateStr: string, timeStr: string) {
    // If no time is provided, assume 12:00 PM UTC+7
    let dateInputStr = `${dateStr}T${timeStr || '12:00'}:00+07:00`;
    let birthDate = new Date(dateInputStr);
    
    if (isNaN(birthDate.getTime())) {
      // Fallback
      birthDate = new Date();
    }
    
    // Calculate precise longitudes
    const sunLon = getEclipticLongitude(Body.Sun, birthDate);
    const moonLon = getEclipticLongitude(Body.Moon, birthDate);
    
    // Calculate Ascendant (Using assumed coordinates for Vietnam: 21.0285 N, 105.8542 E)
    const ascLon = getAscendant(birthDate, 21.0285, 105.8542);
    
    const sunSign = getSignFromLon(sunLon);
    const moonSign = getSignFromLon(moonLon);
    const risingSign = getSignFromLon(ascLon);
    
    const houses = [];
    const risingIndex = ZODIAC_SIGNS.indexOf(risingSign);
    
    // Traditionally, the 1st house is the rising sign, the 2nd is the next sign, etc. (Whole Sign Houses)
    for (let i = 0; i < 12; i++) {
        houses.push({
            houseNumber: i + 1,
            sign: ZODIAC_SIGNS[(risingIndex + i) % 12],
        });
    }

    return {
        sunSign,
        moonSign,
        risingSign,
        houses
    };
}
