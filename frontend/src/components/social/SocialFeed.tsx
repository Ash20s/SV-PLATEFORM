import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Heart, Send, Trash2, Users as UsersIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Post {
  _id: string;
  authorType: 'user' | 'team';
  author: any;
  content: string;
  media: Array<{ type: string; url: string }>;
  postType: string;
  likes: Array<{ user: string; likedAt: Date }>;
  comments: Array<{ user: any; content: string; createdAt: Date }>;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
}

interface SocialFeedProps {
  userTeams?: any[];
  currentUserId?: string;
}

export default function SocialFeed({ userTeams = [], currentUserId }: SocialFeedProps) {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState('');
  const [postAsTeam, setPostAsTeam] = useState<string | null>(null);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/posts`);
      return response.data;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; asTeam?: boolean; teamId?: string }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      setPostAsTeam(null);
    }
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/posts/${postId}/comment`, { content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCommentingOn(null);
      setCommentText('');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const handleCreatePost = () => {
    if (newPost.trim()) {
      createPostMutation.mutate({
        content: newPost,
        asTeam: !!postAsTeam,
        teamId: postAsTeam || undefined
      });
    }
  };

  const handleAddComment = (postId: string) => {
    if (commentText.trim()) {
      addCommentMutation.mutate({ postId, content: commentText });
    }
  };

  const isUserPost = (post: Post) => {
    return post.authorType === 'user' && post.author._id === currentUserId;
  };

  const isUserTeamPost = (post: Post) => {
    if (post.authorType !== 'team') return false;
    return userTeams.some(team => team._id === post.author._id);
  };

  const canDeletePost = (post: Post) => {
    return isUserPost(post) || isUserTeamPost(post);
  };

  const renderAuthorProfile = (post: Post) => {
    if (post.authorType === 'user') {
      return (
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden"
            style={post.author.profile?.avatar ? { backgroundImage: `url(${post.author.profile.avatar})`, backgroundSize: 'cover' } : {}}
          >
            {!post.author.profile?.avatar && (
              <div className="w-full h-full flex items-center justify-center text-background font-bold">
                {post.author.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold">{post.author.username}</p>
            {post.author.profile?.favoriteHunter && (
              <p className="text-xs text-gray-400">Plays {post.author.profile.favoriteHunter}</p>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full overflow-hidden border-2"
            style={{ 
              borderColor: post.author.primaryColor || '#00FFC6',
              backgroundColor: post.author.secondaryColor || '#19F9A9',
              backgroundImage: post.author.logo ? `url(${post.author.logo})` : undefined,
              backgroundSize: 'cover'
            }}
          >
            {!post.author.logo && (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg"
                style={{ color: post.author.primaryColor || '#00FFC6' }}
              >
                {post.author.tag}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">{post.author.name}</p>
              <span className="badge-accent text-xs">{post.author.tag}</span>
            </div>
            <p className="text-xs text-gray-400">{post.author.tier || 'Amateur'}</p>
          </div>
        </div>
      );
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  const posts: Post[] = postsData?.posts || [];

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="card-game p-6 space-y-4">
        <h3 className="text-xl font-bold text-gradient-primary">Create Post</h3>
        
        {userTeams.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setPostAsTeam(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                !postAsTeam ? 'bg-primary text-background' : 'bg-gray-800 text-gray-400'
              }`}
            >
              Post as Me
            </button>
            {userTeams.map(team => (
              <button
                key={team._id}
                onClick={() => setPostAsTeam(team._id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  postAsTeam === team._id ? 'bg-primary text-background' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <UsersIcon className="w-4 h-4" />
                {team.name}
              </button>
            ))}
          </div>
        )}
        
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="input-game w-full"
          rows={3}
          maxLength={2000}
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400">{newPost.length}/2000</p>
          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || createPostMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="card-game p-6 space-y-4">
            {/* Author Header */}
            <div className="flex justify-between items-start">
              {renderAuthorProfile(post)}
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                {canDeletePost(post) && (
                  <button
                    onClick={() => deletePostMutation.mutate(post._id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-gray-100 whitespace-pre-wrap">{post.content}</p>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.media.map((item, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden">
                    {item.type === 'image' && (
                      <img src={item.url} alt="" className="w-full h-48 object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
              <button
                onClick={() => toggleLikeMutation.mutate(post._id)}
                className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>{post.likeCount || 0}</span>
              </button>
              
              <button
                onClick={() => setCommentingOn(commentingOn === post._id ? null : post._id)}
                className="flex items-center gap-2 text-gray-400 hover:text-accent transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{post.commentCount || 0}</span>
              </button>
            </div>

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-800">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                      {comment.user.profile?.avatar ? (
                        <img src={comment.user.profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-background text-sm font-bold">
                          {comment.user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{comment.user.username}</p>
                      <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            {commentingOn === post._id && (
              <div className="flex gap-2 pt-4">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="input-game flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                />
                <button
                  onClick={() => handleAddComment(post._id)}
                  className="btn-secondary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="card-game p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">No posts yet. Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
