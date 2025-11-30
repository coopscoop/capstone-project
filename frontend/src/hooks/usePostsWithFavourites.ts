import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/types';
import { postService, favouriteService } from '@/services';

export const useUserPostsWithFavorites = (userId?: number) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [favourites, setFavourites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Single function to load both posts and favorites
  const loadUserPostsWithFavorites = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    try {
      // Load both in parallel
      const [userPostsData, favoritesData] = await Promise.all([
        postService.getUserPosts(userId),
        favouriteService.getUserFavourites(userId)
      ]);

      setPosts(userPostsData);
      
      // Create Set of favorite post IDs
      const favoritePostIds = new Set(favoritesData.map(fav => fav.postId));
      setFavourites(favoritePostIds);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts and favorites');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const postsWithFavorites = posts.map(post => ({
    ...post,
    isFavorited: favourites.has(post.postId)
  }));

  const toggleFavorite = async (postId: number, isFavorited: boolean) => {
    if (!userId) return;

    try {
      if (isFavorited) {
        await favouriteService.add(postId, userId);
        setFavourites(prev => new Set(prev).add(postId));
        // Update like count
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, numberOfLikes: post.numberOfLikes + 1 }
            : post
        ));
      } else {
        await favouriteService.remove(postId, userId);
        setFavourites(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        // Update like count
        setPosts(prev => prev.map(post => 
          post.postId === postId 
            ? { ...post, numberOfLikes: Math.max(0, post.numberOfLikes - 1) }
            : post
        ));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadUserPostsWithFavorites();
  }, [loadUserPostsWithFavorites]);

  return {
    posts: postsWithFavorites,
    favourites,
    loading,
    error,
    refetch: loadUserPostsWithFavorites,
    toggleFavorite
  };
};