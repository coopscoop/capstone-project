// hooks/useExplorePostsWithFavorites.ts
import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/types';
import { postService, favouriteService } from '@/services';

export const useExplorePostsWithFavorites = (userId?: number) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [favourites, setFavourites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadExplorePostsWithFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [postsData, favoritesData] = await Promise.all([
        postService.getAll(),
        userId ? favouriteService.getUserFavourites(userId) : Promise.resolve([])
      ]);

      setPosts(postsData);
      const favoritePostIds = new Set(favoritesData.map(fav => fav.postId));
      setFavourites(favoritePostIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts and favorites');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const toggleFavorite = async (postId: number, isFavorited: boolean) => {
    if (!userId) return;

    try {
      if (isFavorited) {
        await favouriteService.add(postId, userId);
        setFavourites(prev => new Set(prev).add(postId));
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

  // FIXED: Use userId as dependency instead of the function
  useEffect(() => {
    loadExplorePostsWithFavorites();
  }, [userId]); // Only depend on userId

  const postsWithFavorites = posts.map(post => ({
    ...post,
    isFavorited: favourites.has(post.postId)
  }));

  return {
    posts: postsWithFavorites,
    favourites,
    loading,
    error,
    refetch: loadExplorePostsWithFavorites,
    toggleFavorite
  };
};