declare module '@mapbox/mapbox-gl-geocoder' {
  import { IControl, Map } from 'mapbox-gl';

  interface GeocodeOptions {
    accessToken?: string;
    [key: string]: unknown;
  }

  class MapboxGeocoder implements IControl {
    constructor(options?: GeocodeOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(): void;
  }

  export default MapboxGeocoder;
}
