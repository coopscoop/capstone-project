import { useState, useEffect } from 'react';
import type { Post } from '@/types';
import { postService, tagService } from '@/services';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadPosts = async () => {
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
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const createPost = async (
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
  };

  const updatePost = async (
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
  };

  const deletePost = async (postId: number) => {
    await postService.delete(postId);
    setPosts(prev => prev.filter(p => p.postId !== postId));
  };

  return {
    posts,
    loading,
    error,
    loadPosts,
    createPost,
    updatePost,
    deletePost,
  };
};