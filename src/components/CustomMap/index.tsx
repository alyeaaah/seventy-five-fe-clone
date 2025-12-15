import { useEffect, useState, useRef } from "react";
import L, { LatLng, LatLngExpression, LatLngLiteral, Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import Lucide from "../Base/Lucide";
import LoadingIcon from "../Base/LoadingIcon";
import Button from "../Base/Button";

// Default center coordinates
const DEFAULT_CENTER: L.LatLngTuple = [-7.285764394531, 112.738866806];
const DEFAULT_ZOOM = 14;

// Fix marker icons
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Props {
  mapProps?: {
    center?: L.LatLngExpression;
    zoom?: number;
  };
  popupText?: string;
  onUseLocation?: (e: L.LatLngLiteral, address: string) => void;
  onUseLocationText?: string;
  onChange: (e: L.LatLngLiteral, address: string) => void;
}

const CustomMap = ({ mapProps, onChange, popupText, onUseLocationText, onUseLocation }: Props) => {
  const [currentAddress, setCurrentAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Safely convert any LatLngExpression to LatLng
  const toLatLng = (expression?: L.LatLngExpression): L.LatLng => {
    if (!expression) return L.latLng(DEFAULT_CENTER);
    if (expression instanceof L.LatLng) return expression;
    if (Array.isArray(expression)) return L.latLng(expression[0], expression[1]);
    return L.latLng(expression.lat, expression.lng);
  };

  const handleAddMarker = async (position: L.LatLngLiteral) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
      );
      const data = await response.json();
      const address = data.display_name || data.city || "";
      setCurrentAddress(address);
      onChange(position, address);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = toLatLng(mapProps?.center);
    const zoom = mapProps?.zoom || DEFAULT_ZOOM;

    mapRef.current = L.map(mapContainerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Add initial marker
    markerRef.current = L.marker(center).addTo(mapRef.current);
    markerRef.current.bindPopup(popupText || "Your Court").openPopup();

    // Click handler with null check
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!mapRef.current) return;
      const position = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      } else {
        markerRef.current = L.marker(position).addTo(mapRef.current);
        markerRef.current.bindPopup(popupText || "Court").openPopup();
      }
      handleAddMarker(position);
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  // Update map center when props change
  useEffect(() => {
    if (!mapRef.current || !mapProps?.center) return;

    const position = toLatLng(mapProps.center);
    mapRef.current.setView(position, mapProps?.zoom || DEFAULT_ZOOM);

    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else if (mapRef.current) {
      markerRef.current = L.marker(position).addTo(mapRef.current);
      markerRef.current.bindPopup(popupText || "Court").openPopup();
    }
  }, [mapProps?.center, mapProps?.zoom]);

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapContainerRef}
        style={{ height: "100%", width: "100%" }}
      />

      <div className="box p-2 bottom-4 absolute z-[400] left-4 right-4 max-w-max flex-row flex items-center">
        <Lucide icon="MapPin" className="mr-1 w-4 h-4 min-w-4" />
        {isLoading ? (
          <LoadingIcon icon="three-dots" />
        ) : (
          <span className="text-ellipsis line-clamp-1 text-xs">
            {currentAddress || "Click on the map to get address"}
          </span>
        )}
        {onUseLocation && <Button
          type="button"
          onClick={() =>  onUseLocation?.(markerRef.current?.getLatLng() || { lat: 0, lng: 0 }, currentAddress)}
          className="ml-2 text-xs whitespace-nowrap w-fit"
        >
          {onUseLocationText || "Use"}
        </Button>}
      </div>
    </div>
  );
};

export default CustomMap;