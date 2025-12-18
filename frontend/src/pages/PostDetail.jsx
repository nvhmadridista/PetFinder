import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService, petService } from '../services/api';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const postRes = await postService.getPostById(id);
        // Backend returns { post: { ... } }
        const postData = postRes.data.post;
        setPost(postData);
        
        // The post object from backend already includes pets array
        if (postData.pets && postData.pets.length > 0) {
            setPet(postData.pets[0]);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load post details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!post) return <div className="text-center py-10">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center text-indigo-600 mb-4 hover:underline">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{post.title}</h1>
            <span className={`px-3 py-1 text-sm font-bold rounded-full ${
              post.type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {post.type}
            </span>
          </div>

          <div className="flex items-center text-gray-500 mb-6">
            <MapPin className="h-5 w-5 mr-2" />
            <span className="mr-6">{post.address || 'Unknown Location'}</span>
            <Calendar className="h-5 w-5 mr-2" />
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{post.description}</p>
          </div>

          {pet && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Pet Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="block text-gray-500 text-sm">Species</span>
                  <span className="font-medium">{pet.species}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Breed</span>
                  <span className="font-medium">{pet.breed || 'Unknown'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Color</span>
                  <span className="font-medium">{pet.color || 'Unknown'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-sm">Gender</span>
                  <span className="font-medium">{pet.gender}</span>
                </div>
              </div>
              {pet.characteristics && (
                <div className="mt-4">
                  <span className="block text-gray-500 text-sm">Characteristics</span>
                  <p className="font-medium">{pet.characteristics}</p>
                </div>
              )}
            </div>
          )}

          {post.latitude && post.longitude && (
            <div className="h-[400px] rounded-lg overflow-hidden shadow-inner">
              <MapContainer 
                center={[post.latitude, post.longitude]} 
                zoom={15} 
                scrollWheelZoom={false} 
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[post.latitude, post.longitude]}>
                  <Popup>{post.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
