import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

const containerStyle = {
  width: "400px",
  height: "400px",
};

const center = {
  lat: 17.4065,
  lng: 78.4772,
};

const MapComponent = (props) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey,
    libraries: ["places"],
  });

  const [map, setMap] = React.useState(null);
  const [photoUrls, setPhotoUrls] = React.useState([]);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    if (!window.google || !map) return;

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: { lat, lng },
      radius: 100,
      type: "point_of_interest",
    };

    console.log(service);

    service.nearbySearch(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length > 0
      ) {
        const allPhotos = [];
        console.log(results);

        results.forEach((place) => {
          if (place.photos && place.photos.length > 0) {
            place.photos.forEach((photo) => {
              allPhotos.push(photo.getUrl({ maxWidth: 400, maxHeight: 400 }));
            });
          }
        });
        if (allPhotos.length > 0) {
          setPhotoUrls(allPhotos);
        } else {
          setPhotoUrls([]);
          alert("No photos found for this location.");
        }
      } else {
        setPhotoUrls([]);
        alert("No photos found for this location.");
      }
    });
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
        >
          {props.isMarkerShown && <Marker position={center} />}
        </GoogleMap>
      ) : (
        <></>
      )}
      {photoUrls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {photoUrls.map((url, idx) => (
            <div className="relative" key={idx}>
              <img
                src={url}
                alt={`Location ${idx + 1}`}
                className=" object-cover h-[300px] w-[300px]"
              />
              <button
                className="bg-blue-300"
                onClick={() => {
                  setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(MapComponent);
