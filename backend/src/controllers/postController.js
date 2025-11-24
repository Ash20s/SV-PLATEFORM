const Post = require('../models/Post');
const User = require('../models/User');
const Team = require('../models/Team');

// Create post (user or team)
exports.createPost = async (req, res) => {
  try {
    const { content, media, postType, tags, visibility, asTeam, teamId } = req.body;
    
    let authorType = 'User';
    let author = req.user._id;
    
    // Si le post est fait au nom d'une équipe
    if (asTeam && teamId) {
      const team = await Team.findById(teamId);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      // Vérifier que l'utilisateur est le captain
      if (team.captain.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only team captain can post as team' });
      }
      
      authorType = 'Team';
      author = teamId;
    }
    
    const post = new Post({
      authorType,
      author,
      content,
      media: media || [],
      postType: postType || 'general',
      tags: tags || [],
      visibility: visibility || 'public',
    });
    
    await post.save();
    
    // Populate author info
    await post.populate(authorType === 'user' 
      ? { path: 'author', select: 'username profile.avatar profile.banner' }
      : { path: 'author', select: 'name tag logo banner primaryColor secondaryColor' }
    );
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get posts feed
exports.getPosts = async (req, res) => {
  try {
    const { postType, authorType, limit = 20, skip = 0 } = req.query;
    
    const filter = { visibility: 'public', isHidden: false };
    
    if (postType) filter.postType = postType;
    if (authorType) filter.authorType = authorType;
    
    const posts = await Post.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('author')
      .populate('likes.user', 'username profile.avatar')
      .populate('comments.user', 'username profile.avatar');
    
    const total = await Post.countDocuments(filter);
    
    res.json({
      posts,
      total,
      hasMore: skip + posts.length < total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by user
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      authorType: 'user',
      author: req.params.userId,
      isHidden: false
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profile.avatar profile.banner')
      .populate('likes.user', 'username profile.avatar')
      .populate('comments.user', 'username profile.avatar');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get posts by team
exports.getTeamPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      authorType: 'team',
      author: req.params.teamId,
      isHidden: false
    })
      .sort({ createdAt: -1 })
      .populate('author', 'name tag logo banner primaryColor secondaryColor')
      .populate('likes.user', 'username profile.avatar')
      .populate('comments.user', 'username profile.avatar');
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }
    
    await post.save();
    await post.populate('likes.user', 'username profile.avatar');
    
    res.json({ likes: post.likes, likeCount: post.likes.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.user._id,
      content: content.trim()
    });
    
    await post.save();
    await post.populate('comments.user', 'username profile.avatar');
    
    res.json({ comments: post.comments });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Vérifier les permissions
    const isAuthor = (post.authorType === 'user' && post.author.toString() === req.user._id.toString()) ||
                     (post.authorType === 'team' && await Team.findOne({ _id: post.author, captain: req.user._id }));
    
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await post.deleteOne();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = exports;
