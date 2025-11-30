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

  // funkly way of handling the increment/decrement of likes but it works without adding new stuff so this is how it's done
  const toggleFavourite = async (postId: number, isFavorited: boolean, onLikeUpdate?: (increment: boolean) => void) => {
    if (!userId) return;

    try {
      if (isFavorited) {
        await favouriteService.add(postId, userId);
        setFavourites(prev => new Set(prev).add(postId));
        onLikeUpdate?.(true); // increment like count
      } else {
        await favouriteService.remove(postId, userId);
        setFavourites(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        onLikeUpdate?.(false); // decrement like count
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