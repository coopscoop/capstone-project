import { useState, useCallback } from 'react';
import type { Post } from '@/types';
import { postService, tagService, favouriteService } from '@/services';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await postService.getAll();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPosts = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const data = await postService.getUserPosts(userId);
      setUserPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFavouritePosts = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const data = await postService.getAllUserFavourites(userId);
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favourite posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (
    userId: number,
    title: string,
    description: string,
    code: string,
    isVisible: boolean,
    tags: string[],
  ) => {
    try {
      const createdPost = await postService.create({
        userId,
        title,
        description,
        code,
        isVisible,
        tags: [],
        numberOfLikes: 1,
      });

      // add tags if any
      if (tags.length > 0) {
        await tagService.addMultipleTags(createdPost.postId, tags);
      }

      // auto-favorite the post
      await favouriteService.add(createdPost.postId, userId);

      setPosts(prev => [createdPost, ...prev]);
      setUserPosts(prev => [createdPost, ...prev]);

      return createdPost;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }, []);

  const updatePost = useCallback(async (
    postId: number,
    userId: number,
    title: string,
    description: string,
    code: string,
    numberOfLikes: number,
    isVisible: boolean,
    tags: string[]
  ) => {
    try {
      // First, always delete all existing tags for this post
      await tagService.deletePostTags(postId);
      
      // Then, update the post
      const updatedPost = await postService.update(postId, {
        postId,
        userId,
        title,
        description,
        code,
        isVisible,
        numberOfLikes,
        tags, // Send tags array even if empty
      });

      // Add new tags if any exist
      if (tags && tags.length > 0) {
        await tagService.addMultipleTags(postId, tags);
      }

      // Update local state with the returned post data
      if (updatedPost != null) {
        setPosts(prev => prev.map(post => 
          post.postId === postId ? { ...updatedPost, tags } : post
        ));
        setUserPosts(prev => prev.map(post => 
          post.postId === postId ? { ...updatedPost, tags } : post
        ));
      } else {
        // If no post returned, refresh from server
        await loadPosts();
      }

      return updatedPost;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }, [loadPosts]);

  const updatePostLikes = useCallback(async (postId: number, increment: boolean) => {
    setPosts(prev => prev.map(post => {
      if (post.postId === postId) {
        return {
          ...post,
          numberOfLikes: increment ? post.numberOfLikes + 1 : Math.max(0, post.numberOfLikes - 1)
        };
      }
      return post;
    }));

    setUserPosts(prev => prev.map(post => {
      if (post.postId === postId) {
        return {
          ...post,
          numberOfLikes: increment ? post.numberOfLikes + 1 : Math.max(0, post.numberOfLikes - 1)
        };
      }
      return post;
    }));
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    await postService.delete(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
    setUserPosts(prev => prev.filter(p => p.postId !== postId));
  }, []);

  return {
    posts,
    loading,
    error,
    userPosts,
    setPosts,
    loadPosts,
    createPost,
    updatePost,
    updatePostLikes,
    deletePost,
    getUserPosts,
    loadFavouritePosts,
  };
};