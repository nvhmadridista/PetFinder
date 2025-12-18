import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

const PostCard = ({ post }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Placeholder for image if available, else a default color/icon */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {post.images && post.images.length > 0 ? (
           <img src={`http://localhost:5000/${post.images[0].image_url}`} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold truncate">{post.title}</h3>
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            post.type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {post.type}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate">{post.address || 'Unknown Location'}</span>
        </div>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        <Link 
          to={`/post/${post.id}`}
          className="block w-full text-center bg-indigo-50 text-indigo-600 py-2 rounded-md hover:bg-indigo-100 transition font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
