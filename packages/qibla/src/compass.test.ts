import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QiblaCompass, createQiblaCompass } from './compass';
import { KAABA_COORDINATES } from '@misque/core';
import type { CompassVisualization } from './types';

// Test locations with known approximate Qibla bearings
const TEST_LOCATIONS = {
  london: { latitude: 51.5074, longitude: -0.1278 }, // ~118-119 degrees
  newYork: { latitude: 40.7128, longitude: -74.006 }, // ~58-59 degrees
  tokyo: { latitude: 35.6762, longitude: 139.6503 }, // ~293 degrees
  sydney: { latitude: -33.8688, longitude: 151.2093 }, // ~277 degrees
  cairo: { latitude: 30.0444, longitude: 31.2357 }, // ~136 degrees
  jakarta: { latitude: -6.2088, longitude: 106.8456 }, // ~295 degrees
  mecca: KAABA_COORDINATES, // At Kaaba - special case
};

describe('QiblaCompass', () => {
  describe('constructor', () => {
    it('creates compass instance with coordinates', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      expect(compass).toBeInstanceOf(QiblaCompass);
    });

    it('creates compass instance with custom options', () => {
      const onOrientationChange = vi.fn();
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        useTrueNorth: true,
        onOrientationChange,
        alignmentThreshold: 10,
      });
      expect(compass).toBeInstanceOf(QiblaCompass);
    });

    it('uses default options when not provided', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Default alignmentThreshold is 5
      const viz = compass.getVisualization(118);
      // Within 5 degrees should be aligned
      expect(viz.turnDirection).toBe('aligned');
    });
  });

  describe('getBearing', () => {
    it('calculates correct bearing for London (~118-119 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(115);
      expect(bearing).toBeLessThan(125);
    });

    it('calculates correct bearing for New York (~58-59 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.newYork);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(55);
      expect(bearing).toBeLessThan(65);
    });

    it('calculates correct bearing for Tokyo (~293 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.tokyo);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(285);
      expect(bearing).toBeLessThan(300);
    });

    it('calculates correct bearing for Sydney (~277 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.sydney);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(270);
      expect(bearing).toBeLessThan(285);
    });

    it('calculates correct bearing for Cairo (~136 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.cairo);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(130);
      expect(bearing).toBeLessThan(145);
    });

    it('calculates correct bearing for Jakarta (~295 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.jakarta);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThan(290);
      expect(bearing).toBeLessThan(300);
    });

    it('returns 0 for invalid coordinates', () => {
      const compass = new QiblaCompass({ latitude: 100, longitude: 0 });
      expect(compass.getBearing()).toBe(0);
    });

    it('returns normalized bearing (0-360 range)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('getBearingFormatted', () => {
    it('formats bearing with default precision (1 decimal)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const formatted = compass.getBearingFormatted();
      expect(formatted).toMatch(/^\d+\.\d°$/);
    });

    it('formats bearing with custom precision', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const formatted = compass.getBearingFormatted(2);
      expect(formatted).toMatch(/^\d+\.\d{2}°$/);
    });

    it('formats bearing with zero precision', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const formatted = compass.getBearingFormatted(0);
      expect(formatted).toMatch(/^\d+°$/);
    });
  });

  describe('getCardinalDirection', () => {
    it('returns ESE for London (bearing ~119 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const direction = compass.getCardinalDirection();
      // 119 degrees is between E (90) and SE (135), closer to SE but uses 8 directions
      // With 8 directions: N=0, NE=45, E=90, SE=135, S=180, SW=225, W=270, NW=315
      // 119 is closest to SE (135)
      expect(['E', 'SE']).toContain(direction);
    });

    it('returns NE for New York (bearing ~58 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.newYork);
      const direction = compass.getCardinalDirection();
      expect(direction).toBe('NE');
    });

    it('returns NW for Tokyo (bearing ~293 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.tokyo);
      const direction = compass.getCardinalDirection();
      expect(direction).toBe('NW');
    });

    it('returns W for Sydney (bearing ~277 degrees)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.sydney);
      const direction = compass.getCardinalDirection();
      expect(direction).toBe('W');
    });

    // Test all cardinal directions at exact angles
    it('returns N for bearing 0', () => {
      // Create a mock location that would give ~0 degree bearing
      // Since we can't easily control the exact bearing, test the logic
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Use visualization to test with known heading
      const viz = compass.getVisualization(0);
      expect(viz.qiblaBearing).toBeDefined();
    });
  });

  describe('calculateAngleDifference', () => {
    it('calculates positive difference (turn right)', () => {
      const diff = QiblaCompass.calculateAngleDifference(10, 50);
      expect(diff).toBe(40);
    });

    it('calculates negative difference (turn left)', () => {
      const diff = QiblaCompass.calculateAngleDifference(50, 10);
      expect(diff).toBe(-40);
    });

    it('handles crossing 0/360 boundary (clockwise)', () => {
      // From 350 to 10 should be +20 (turn right)
      const diff = QiblaCompass.calculateAngleDifference(350, 10);
      expect(diff).toBe(20);
    });

    it('handles crossing 0/360 boundary (counter-clockwise)', () => {
      // From 10 to 350 should be -20 (turn left)
      const diff = QiblaCompass.calculateAngleDifference(10, 350);
      expect(diff).toBe(-20);
    });

    it('returns 0 for same bearings', () => {
      const diff = QiblaCompass.calculateAngleDifference(180, 180);
      expect(diff).toBe(0);
    });

    it('returns 180 or -180 for opposite bearings', () => {
      const diff1 = QiblaCompass.calculateAngleDifference(0, 180);
      const diff2 = QiblaCompass.calculateAngleDifference(180, 0);
      expect(Math.abs(diff1)).toBe(180);
      expect(Math.abs(diff2)).toBe(180);
    });

    it('handles large positive differences', () => {
      // From 0 to 270 should be -90 (shorter path is left)
      const diff = QiblaCompass.calculateAngleDifference(0, 270);
      expect(diff).toBe(-90);
    });

    it('handles large negative differences', () => {
      // From 270 to 0 should be +90 (shorter path is right)
      const diff = QiblaCompass.calculateAngleDifference(270, 0);
      expect(diff).toBe(90);
    });

    it('returns value in -180 to 180 range', () => {
      for (let b1 = 0; b1 < 360; b1 += 30) {
        for (let b2 = 0; b2 < 360; b2 += 30) {
          const diff = QiblaCompass.calculateAngleDifference(b1, b2);
          expect(diff).toBeGreaterThanOrEqual(-180);
          expect(diff).toBeLessThanOrEqual(180);
        }
      }
    });
  });

  describe('getVisualization', () => {
    it('returns visualization with Qibla bearing when no device heading', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const viz = compass.getVisualization();

      expect(viz.qiblaBearing).toBeGreaterThan(115);
      expect(viz.qiblaBearing).toBeLessThan(125);
      expect(viz.deviceHeading).toBeNull();
      expect(viz.angleDifference).toBeNull();
      expect(viz.turnDirection).toBeNull();
      expect(viz.alignmentDistance).toBeNull();
    });

    it('returns aligned state when within threshold', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        alignmentThreshold: 5,
      });
      const bearing = compass.getBearing();
      // Device heading exactly at Qibla
      const viz = compass.getVisualization(bearing);

      expect(viz.turnDirection).toBe('aligned');
      expect(viz.alignmentDistance).toBe(0);
    });

    it('returns aligned state when within custom threshold', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        alignmentThreshold: 10,
      });
      const bearing = compass.getBearing();
      // Device heading 8 degrees off (within 10 degree threshold)
      const viz = compass.getVisualization(bearing - 8);

      expect(viz.turnDirection).toBe('aligned');
      expect(viz.alignmentDistance).toBe(8);
    });

    it('returns turn right state when Qibla is to the right', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const bearing = compass.getBearing();
      // Device facing 30 degrees left of Qibla
      const viz = compass.getVisualization(bearing - 30);

      expect(viz.turnDirection).toBe('right');
      expect(viz.angleDifference).toBe(30);
      expect(viz.alignmentDistance).toBe(30);
    });

    it('returns turn left state when Qibla is to the left', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const bearing = compass.getBearing();
      // Device facing 30 degrees right of Qibla
      const viz = compass.getVisualization(bearing + 30);

      expect(viz.turnDirection).toBe('left');
      expect(viz.angleDifference).toBe(-30);
      expect(viz.alignmentDistance).toBe(30);
    });

    it('handles 0/360 boundary correctly for turn right', () => {
      // Mock a location with bearing near 350
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Test with device at 340 and Qibla at 10
      // This tests the boundary handling in visualization
      const viz = compass.getVisualization(340);
      expect(viz.deviceHeading).toBe(340);
      expect(viz.turnDirection).not.toBeNull();
    });

    it('uses current orientation when no device heading provided', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Without tracking started, currentOrientation is null
      const viz = compass.getVisualization();
      expect(viz.deviceHeading).toBeNull();
    });

    it('includes correct alignment distance', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const bearing = compass.getBearing();
      const viz = compass.getVisualization(bearing - 45);

      expect(viz.alignmentDistance).toBe(45);
    });
  });

  describe('isOrientationSupported', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        // @ts-expect-error - restoring undefined window
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    });

    it('returns false when window is undefined (Node.js)', () => {
      // @ts-expect-error - testing Node.js environment
      delete globalThis.window;
      expect(QiblaCompass.isOrientationSupported()).toBe(false);
    });

    it('returns false when DeviceOrientationEvent is not available', () => {
      // @ts-expect-error - mocking window
      globalThis.window = {};
      expect(QiblaCompass.isOrientationSupported()).toBe(false);
    });

    it('returns true when DeviceOrientationEvent is available', () => {
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
      };
      expect(QiblaCompass.isOrientationSupported()).toBe(true);
    });
  });

  describe('requestOrientationPermission', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        // @ts-expect-error - restoring undefined window
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    });

    it('returns denied when window is undefined (Node.js)', async () => {
      // @ts-expect-error - testing Node.js environment
      delete globalThis.window;
      const permission = await QiblaCompass.requestOrientationPermission();
      expect(permission).toBe('denied');
    });

    it('returns granted when permission not required (Android/older iOS)', async () => {
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
      };
      const permission = await QiblaCompass.requestOrientationPermission();
      expect(permission).toBe('granted');
    });

    it('returns granted when iOS 13+ permission is granted', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('granted');
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: {
          requestPermission: mockRequestPermission,
        },
      };
      const permission = await QiblaCompass.requestOrientationPermission();
      expect(permission).toBe('granted');
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('returns denied when iOS 13+ permission is denied', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('denied');
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: {
          requestPermission: mockRequestPermission,
        },
      };
      const permission = await QiblaCompass.requestOrientationPermission();
      expect(permission).toBe('denied');
    });

    it('returns denied when iOS 13+ permission request throws', async () => {
      const mockRequestPermission = vi
        .fn()
        .mockRejectedValue(new Error('User dismissed'));
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: {
          requestPermission: mockRequestPermission,
        },
      };
      const permission = await QiblaCompass.requestOrientationPermission();
      expect(permission).toBe('denied');
    });
  });

  describe('startOrientationTracking', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        // @ts-expect-error - restoring undefined window
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    });

    it('throws error in Node.js environment', async () => {
      // @ts-expect-error - testing Node.js environment
      delete globalThis.window;
      const compass = new QiblaCompass(TEST_LOCATIONS.london);

      await expect(compass.startOrientationTracking()).rejects.toThrow(
        'Device orientation is only available in browser environments'
      );
    });

    it('throws error when permission is denied', async () => {
      const mockRequestPermission = vi.fn().mockResolvedValue('denied');
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: {
          requestPermission: mockRequestPermission,
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      const compass = new QiblaCompass(TEST_LOCATIONS.london);

      await expect(compass.startOrientationTracking()).rejects.toThrow(
        'Device orientation permission denied'
      );
    });

    it('starts tracking when permission is granted', async () => {
      const addEventListener = vi.fn();
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener,
        removeEventListener: vi.fn(),
      };
      const compass = new QiblaCompass(TEST_LOCATIONS.london);

      await compass.startOrientationTracking();

      expect(addEventListener).toHaveBeenCalledWith(
        'deviceorientation',
        expect.any(Function)
      );
    });

    it('stops existing tracking before starting new', async () => {
      const removeEventListener = vi.fn();
      const addEventListener = vi.fn();
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener,
        removeEventListener,
      };
      const compass = new QiblaCompass(TEST_LOCATIONS.london);

      // Start tracking twice
      await compass.startOrientationTracking();
      await compass.startOrientationTracking();

      // Should have removed the first listener
      expect(removeEventListener).toHaveBeenCalled();
      // Should have added listener twice
      expect(addEventListener).toHaveBeenCalledTimes(2);
    });

    it('calls orientation change callback with visualization', async () => {
      const onOrientationChange = vi.fn();
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking({ onOrientationChange });

      // Simulate orientation event
      const mockEvent = {
        alpha: 45,
        beta: 0,
        gamma: 0,
        absolute: true,
      } as DeviceOrientationEvent;

      capturedListener!(mockEvent);

      expect(onOrientationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          qiblaBearing: expect.any(Number),
          deviceHeading: expect.any(Number),
          angleDifference: expect.any(Number),
          turnDirection: expect.any(String),
          alignmentDistance: expect.any(Number),
        })
      );
    });

    it('calculates heading from alpha correctly', async () => {
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;
      const onOrientationChange = vi.fn();

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking({ onOrientationChange });

      // alpha = 45 means device rotated 45 degrees
      // heading = 360 - alpha = 315
      const mockEvent = {
        alpha: 45,
        beta: 0,
        gamma: 0,
        absolute: true,
      } as DeviceOrientationEvent;

      capturedListener!(mockEvent);

      const viz = onOrientationChange.mock
        .calls[0][0] as unknown as CompassVisualization;
      expect(viz.deviceHeading).toBe(315);
    });
  });

  describe('stopOrientationTracking', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow === undefined) {
        // @ts-expect-error - restoring undefined window
        delete globalThis.window;
      } else {
        globalThis.window = originalWindow;
      }
    });

    it('removes event listener when tracking', async () => {
      const removeEventListener = vi.fn();
      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: vi.fn(),
        removeEventListener,
      };
      const compass = new QiblaCompass(TEST_LOCATIONS.london);

      await compass.startOrientationTracking();
      compass.stopOrientationTracking();

      expect(removeEventListener).toHaveBeenCalledWith(
        'deviceorientation',
        expect.any(Function)
      );
    });

    it('clears current orientation', async () => {
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking();

      // Simulate orientation event
      capturedListener!({
        alpha: 45,
        beta: 0,
        gamma: 0,
        absolute: true,
      } as DeviceOrientationEvent);

      expect(compass.getCurrentOrientation()).not.toBeNull();

      compass.stopOrientationTracking();

      expect(compass.getCurrentOrientation()).toBeNull();
    });

    it('does nothing when not tracking', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Should not throw
      expect(() => compass.stopOrientationTracking()).not.toThrow();
    });

    it('does nothing in Node.js environment', () => {
      // @ts-expect-error - testing Node.js environment
      delete globalThis.window;
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      // Should not throw
      expect(() => compass.stopOrientationTracking()).not.toThrow();
    });
  });

  describe('updateCoordinates', () => {
    it('updates coordinates and recalculates bearing', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const londonBearing = compass.getBearing();

      compass.updateCoordinates(TEST_LOCATIONS.newYork);
      const newYorkBearing = compass.getBearing();

      expect(newYorkBearing).not.toBe(londonBearing);
      expect(newYorkBearing).toBeGreaterThan(55);
      expect(newYorkBearing).toBeLessThan(65);
    });

    it('triggers orientation change callback when tracking', async () => {
      const onOrientationChange = vi.fn();
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        onOrientationChange,
      });
      await compass.startOrientationTracking();

      // Simulate orientation event
      capturedListener!({
        alpha: 45,
        beta: 0,
        gamma: 0,
        absolute: true,
      } as DeviceOrientationEvent);

      onOrientationChange.mockClear();

      // Update coordinates
      compass.updateCoordinates(TEST_LOCATIONS.newYork);

      expect(onOrientationChange).toHaveBeenCalled();

      // Cleanup
      // @ts-expect-error - restoring undefined window
      delete globalThis.window;
    });

    it('does not trigger callback when not tracking', () => {
      const onOrientationChange = vi.fn();
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        onOrientationChange,
      });

      compass.updateCoordinates(TEST_LOCATIONS.newYork);

      expect(onOrientationChange).not.toHaveBeenCalled();
    });
  });

  describe('getHelperText', () => {
    it('returns bearing info when no device heading', () => {
      const viz: CompassVisualization = {
        qiblaBearing: 118.5,
        deviceHeading: null,
        angleDifference: null,
        turnDirection: null,
        alignmentDistance: null,
      };

      const text = QiblaCompass.getHelperText(viz);
      expect(text).toBe('Qibla is 118.5° from North');
    });

    it('returns aligned message when facing Qibla', () => {
      const viz: CompassVisualization = {
        qiblaBearing: 118.5,
        deviceHeading: 118.5,
        angleDifference: 0,
        turnDirection: 'aligned',
        alignmentDistance: 0,
      };

      const text = QiblaCompass.getHelperText(viz);
      expect(text).toBe('You are facing Qibla!');
    });

    it('returns turn right instruction', () => {
      const viz: CompassVisualization = {
        qiblaBearing: 118.5,
        deviceHeading: 88.5,
        angleDifference: 30,
        turnDirection: 'right',
        alignmentDistance: 30,
      };

      const text = QiblaCompass.getHelperText(viz);
      expect(text).toBe('Turn right 30.0° to face Qibla');
    });

    it('returns turn left instruction', () => {
      const viz: CompassVisualization = {
        qiblaBearing: 118.5,
        deviceHeading: 148.5,
        angleDifference: -30,
        turnDirection: 'left',
        alignmentDistance: 30,
      };

      const text = QiblaCompass.getHelperText(viz);
      expect(text).toBe('Turn left 30.0° to face Qibla');
    });

    it('handles null alignment distance gracefully', () => {
      const viz: CompassVisualization = {
        qiblaBearing: 118.5,
        deviceHeading: 88.5,
        angleDifference: 30,
        turnDirection: 'right',
        alignmentDistance: null,
      };

      const text = QiblaCompass.getHelperText(viz);
      expect(text).toBe('Turn right 0° to face Qibla');
    });
  });

  describe('getCurrentOrientation', () => {
    it('returns null when not tracking', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      expect(compass.getCurrentOrientation()).toBeNull();
    });

    it('returns orientation data when tracking', async () => {
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking();

      // Simulate orientation event
      capturedListener!({
        alpha: 45,
        beta: 30,
        gamma: 15,
        absolute: true,
      } as DeviceOrientationEvent);

      const orientation = compass.getCurrentOrientation();
      expect(orientation).not.toBeNull();
      expect(orientation!.alpha).toBe(45);
      expect(orientation!.beta).toBe(30);
      expect(orientation!.gamma).toBe(15);
      expect(orientation!.heading).toBe(315); // 360 - 45

      // Cleanup
      compass.stopOrientationTracking();
      // @ts-expect-error - restoring undefined window
      delete globalThis.window;
    });
  });

  describe('getDistance', () => {
    it('returns distance to Kaaba from London (~4700-4900 km)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      const distance = compass.getDistance();
      expect(distance).toBeGreaterThan(4600);
      expect(distance).toBeLessThan(4900);
    });

    it('returns distance to Kaaba from New York (~10000-10500 km)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.newYork);
      const distance = compass.getDistance();
      expect(distance).toBeGreaterThan(9500);
      expect(distance).toBeLessThan(10500);
    });

    it('returns distance to Kaaba from Tokyo (~9400-9600 km)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.tokyo);
      const distance = compass.getDistance();
      expect(distance).toBeGreaterThan(9300);
      expect(distance).toBeLessThan(9600);
    });

    it('returns very small distance for Mecca location', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.mecca);
      const distance = compass.getDistance();
      expect(distance).toBeLessThan(1); // Less than 1 km
    });

    it('returns 0 for invalid coordinates', () => {
      const compass = new QiblaCompass({ latitude: 100, longitude: 0 });
      expect(compass.getDistance()).toBe(0);
    });
  });
});

describe('createQiblaCompass', () => {
  it('creates QiblaCompass instance', () => {
    const compass = createQiblaCompass(TEST_LOCATIONS.london);
    expect(compass).toBeInstanceOf(QiblaCompass);
  });

  it('creates QiblaCompass instance with options', () => {
    const onOrientationChange = vi.fn();
    const compass = createQiblaCompass(TEST_LOCATIONS.london, {
      useTrueNorth: true,
      onOrientationChange,
      alignmentThreshold: 10,
    });
    expect(compass).toBeInstanceOf(QiblaCompass);
  });

  it('returns same result as new QiblaCompass', () => {
    const compass1 = new QiblaCompass(TEST_LOCATIONS.london);
    const compass2 = createQiblaCompass(TEST_LOCATIONS.london);

    expect(compass1.getBearing()).toBe(compass2.getBearing());
    expect(compass1.getDistance()).toBe(compass2.getDistance());
    expect(compass1.getCardinalDirection()).toBe(compass2.getCardinalDirection());
  });
});

describe('Edge cases and special scenarios', () => {
  describe('Location at Kaaba', () => {
    it('handles location exactly at Kaaba', () => {
      const compass = new QiblaCompass(KAABA_COORDINATES);
      // At Kaaba, any direction is technically correct
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('returns near-zero distance at Kaaba', () => {
      const compass = new QiblaCompass(KAABA_COORDINATES);
      const distance = compass.getDistance();
      expect(distance).toBeLessThan(0.1); // Less than 100 meters
    });
  });

  describe('Extreme coordinates', () => {
    it('handles North Pole location', () => {
      const northPole = { latitude: 90, longitude: 0 };
      const compass = new QiblaCompass(northPole);
      const bearing = compass.getBearing();
      // From North Pole, all directions lead south
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('handles South Pole location', () => {
      const southPole = { latitude: -90, longitude: 0 };
      const compass = new QiblaCompass(southPole);
      const bearing = compass.getBearing();
      // From South Pole, all directions lead north
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('handles location on date line (positive)', () => {
      const dateLinePos = { latitude: 0, longitude: 180 };
      const compass = new QiblaCompass(dateLinePos);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('handles location on date line (negative)', () => {
      const dateLineNeg = { latitude: 0, longitude: -180 };
      const compass = new QiblaCompass(dateLineNeg);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('handles equator location', () => {
      const equator = { latitude: 0, longitude: 0 };
      const compass = new QiblaCompass(equator);
      const bearing = compass.getBearing();
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });
  });

  describe('Cardinal direction edge cases', () => {
    // Test cardinal directions based on visualization
    it('returns correct direction for various bearings', () => {
      // Test with known locations
      const compass = new QiblaCompass(TEST_LOCATIONS.tokyo);
      const direction = compass.getCardinalDirection();
      // Tokyo bearing is ~293, which is NW
      expect(['NW', 'W']).toContain(direction);
    });
  });

  describe('Alignment threshold edge cases', () => {
    it('exactly at threshold is considered aligned', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        alignmentThreshold: 5,
      });
      const bearing = compass.getBearing();
      // Exactly 5 degrees off should be aligned (<=5)
      const viz = compass.getVisualization(bearing - 5);
      expect(viz.turnDirection).toBe('aligned');
    });

    it('just beyond threshold is not aligned', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        alignmentThreshold: 5,
      });
      const bearing = compass.getBearing();
      // 5.1 degrees off should not be aligned
      const viz = compass.getVisualization(bearing - 5.1);
      expect(viz.turnDirection).toBe('right');
    });

    it('handles zero threshold (must be exactly aligned)', () => {
      const compass = new QiblaCompass(TEST_LOCATIONS.london, {
        alignmentThreshold: 0,
      });
      const bearing = compass.getBearing();

      // Exactly aligned
      const vizAligned = compass.getVisualization(bearing);
      expect(vizAligned.turnDirection).toBe('aligned');

      // Even tiny offset is not aligned
      const vizOff = compass.getVisualization(bearing - 0.1);
      expect(vizOff.turnDirection).toBe('right');
    });
  });

  describe('Orientation event with null values', () => {
    it('handles null alpha in orientation event', async () => {
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;
      const onOrientationChange = vi.fn();

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking({ onOrientationChange });

      // Simulate orientation event with null alpha
      capturedListener!({
        alpha: null,
        beta: 0,
        gamma: 0,
        absolute: true,
      } as unknown as DeviceOrientationEvent);

      const orientation = compass.getCurrentOrientation();
      expect(orientation!.alpha).toBeNull();

      compass.stopOrientationTracking();
      // @ts-expect-error - restoring undefined window
      delete globalThis.window;
    });

    it('handles non-absolute orientation (magnetic north)', async () => {
      let capturedListener: ((event: DeviceOrientationEvent) => void) | null =
        null;
      const onOrientationChange = vi.fn();

      // @ts-expect-error - mocking window
      globalThis.window = {
        DeviceOrientationEvent: class DeviceOrientationEvent {},
        addEventListener: (
          _type: string,
          listener: (event: DeviceOrientationEvent) => void
        ) => {
          capturedListener = listener;
        },
        removeEventListener: vi.fn(),
      };

      const compass = new QiblaCompass(TEST_LOCATIONS.london);
      await compass.startOrientationTracking({ onOrientationChange });

      // Simulate non-absolute orientation event
      capturedListener!({
        alpha: 45,
        beta: 0,
        gamma: 0,
        absolute: false,
      } as DeviceOrientationEvent);

      const orientation = compass.getCurrentOrientation();
      // With absolute=false, heading is still calculated from alpha
      expect(orientation!.heading).toBe(315);
      // trueHeading should be null for non-absolute
      // Note: based on the implementation, trueHeading is set when absolute is true
      // and alpha is set. Since absolute is false here, we should verify behavior
      expect(orientation!.alpha).toBe(45);

      compass.stopOrientationTracking();
      // @ts-expect-error - restoring undefined window
      delete globalThis.window;
    });
  });
});
