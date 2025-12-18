import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ posts }) => {
  // Default center (e.g., New York or user's location)
  const defaultCenter = [40.7128, -74.0060]; 

  return (
    <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="h-[500px] w-full rounded-lg shadow-md z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {posts.map((post) => (
        post.latitude && post.longitude && (
          <Marker key={post.id} position={[post.latitude, post.longitude]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{post.title}</h3>
                <p className={`text-sm font-semibold ${post.type === 'LOST' ? 'text-red-500' : 'text-green-500'}`}>
                  {post.type}
                </p>
                <Link to={`/post/${post.id}`} className="text-indigo-600 text-sm hover:underline">
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default MapComponent;
