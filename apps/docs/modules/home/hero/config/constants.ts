export const tabs: { name: 'prayer-times.ts' | 'qibla.ts'; code: string }[] = [
  {
    name: 'prayer-times.ts',
    code: `import { 
    calculatePrayerTimes 
} from '@misque/prayer-times';

const times = calculatePrayerTimes(
  new Date(),
  { latitude: 21.4225, longitude: 39.8262 },
  { method: 'makkah' }
);

console.log(times.fajr);   // "04:47"
console.log(times.dhuhr);  // "12:21"
console.log(times.asr);    // "15:45"`,
  },
  {
    name: 'qibla.ts',
    code: `import { 
    getQiblaDirection 
} from '@misque/qibla';

const direction = getQiblaDirection({
  latitude: 40.7128,
  longitude: -74.0060
});

console.log(direction); // 58.48`,
  },
];
