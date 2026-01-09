import type { Coordinates } from './types';

/**
 * Kaaba coordinates in Mecca, Saudi Arabia
 */
export const KAABA_COORDINATES: Coordinates = {
  latitude: 21.4225,
  longitude: 39.8262,
};

/**
 * Islamic months
 */
export const ISLAMIC_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah',
] as const;

/**
 * Islamic months in Arabic
 */
export const ISLAMIC_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الثاني',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
] as const;

/**
 * Days of the week in Arabic
 */
export const DAYS_OF_WEEK_AR = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

/**
 * Prayer names
 */
export const PRAYER_NAMES = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
] as const;

/**
 * Prayer names in Arabic
 */
export const PRAYER_NAMES_AR = [
  'الفجر',
  'الشروق',
  'الظهر',
  'العصر',
  'المغرب',
  'العشاء',
] as const;

export type IslamicMonth = (typeof ISLAMIC_MONTHS)[number];
export type PrayerName = (typeof PRAYER_NAMES)[number];
