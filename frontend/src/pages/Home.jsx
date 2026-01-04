import { useState, useEffect } from 'react';
import { postService } from '../services/api';
import MapComponent from '../components/MapComponent';
import PostCard from '../components/PostCard';
import { Search } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); 

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getAllPosts();
        // Backend returns { posts: [...] }
        setPosts(response.data.posts || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    if (filter === 'ALL') return true;
    return post.type === filter;
  });

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        
        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-full ${filter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            All posts
          </button>
          <button 
            onClick={() => setFilter('LOST')}
            className={`px-4 py-2 rounded-full ${filter === 'LOST' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Lost pets
          </button>
          <button 
            onClick={() => setFilter('FOUND')}
            className={`px-4 py-2 rounded-full ${filter === 'FOUND' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Found pets
          </button>
        </div>

        {/* Map View */}
        <div className="mb-8">
          <MapComponent posts={filteredPosts} />
        </div>

        {/* List View */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent posts</h2>
        {filteredPosts.length === 0 ? (
          <p className="text-gray-500">No posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
