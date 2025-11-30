import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/types';
import { postService, tagService } from '@/services';

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

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(async (
    userId: number,
    title: string,
    description: string,
    code: string,
    isVisible: boolean,
    tags: string[]
  ) => {
    const createdPost = await postService.create({
      userId,
      title,
      description,
      code,
      numberOfLikes: 0,
      isVisible,
      tags: [],
    });

    if (tags.length > 0) {
      await tagService.addMultipleTags(createdPost.postId, tags);
    }

    await loadPosts();
    return createdPost;
  }, [loadPosts]);

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
    await postService.update(postId, {
      postId,
      userId,
      title,
      description,
      code,
      isVisible,
      numberOfLikes,
      tags,
    });

    await tagService.deletePostTags(postId);
    if (tags.length > 0) {
      await tagService.addMultipleTags(postId, tags);
    }

    await loadPosts();
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
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    await postService.delete(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
  }, []);

  return {
    posts,
    loading,
    error,
    userPosts,
    loadPosts,
    createPost,
    updatePost,
    updatePostLikes,
    deletePost,
    getUserPosts,
  };
};