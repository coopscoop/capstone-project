import { useState, useEffect } from 'react';
import { favouriteService } from '@/services';

export const useFavourites = (userId?: number) => {
  const [favourites, setFavourites] = useState<Set<number>>(new Set());

  const loadFavourites = async () => {
    if (!userId) return;
    try {
      const data = await favouriteService.getUserFavourites(userId);
      const favoritePostIds = new Set(data.map(fav => fav.postId));
      setFavourites(favoritePostIds);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  useEffect(() => {
    loadFavourites();
  }, [userId]);

  const toggleFavourite = async (postId: number, isFavorited: boolean) => {
    if (!userId) return;

    try {
      if (isFavorited) {
        await favouriteService.add(postId, userId);
        setFavourites(prev => new Set(prev).add(postId));
      } else {
        await favouriteService.remove(postId, userId);
        setFavourites(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    }
  };

  return {
    favourites,
    toggleFavourite,
    loadFavourites,
  };
};