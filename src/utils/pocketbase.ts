import PocketBase from 'pocketbase';

// Create a singleton instance of PocketBase
const pb = new PocketBase('https://rough-art.pockethost.io');

// Configure PocketBase instance
pb.autoCancellation(false); // Disable auto-cancellation of requests globally

// Add timestamp to prevent caching
const getRequestKey = () => `posts_${Date.now()}`;

export const fetchPosts = async () => {
  console.log('fetchPosts: Starting to fetch posts');
  
  try {
    console.log('fetchPosts: Making PocketBase request');
    const posts = await pb.collection('posts').getFullList(200, {
      sort: '-created',
      requestKey: getRequestKey(),
      $cancelKey: getRequestKey(),
    });
    
    console.log('fetchPosts: Posts fetched successfully', { 
      count: posts.length,
      firstPost: posts[0] ? { 
        id: posts[0].id,
        title: posts[0].title 
      } : null 
    });
    
    return posts;
  } catch (error: any) {
    console.error('fetchPosts: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Re-throw the error instead of returning empty array
    // This will help us see the actual error in the UI
    throw error;
  }
};

export default pb;
