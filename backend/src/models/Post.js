const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  // Auteur du post (peut être un user ou une team)
  authorType: {
    type: String,
    enum: ['User', 'Team'],
    required: true
  },
  
  // ID de l'auteur (User ou Team)
  author: {
    type: Schema.Types.ObjectId,
    refPath: 'authorType',
    required: true
  },
  
  // Contenu du post
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Média attaché (images, vidéos)
  media: [{
    type: { type: String, enum: ['image', 'video', 'gif'] },
    url: String,
    thumbnail: String,
  }],
  
  // Type de post
  postType: {
    type: String,
    enum: ['announcement', 'recruitment', 'achievement', 'general'],
    default: 'general'
  },
  
  // Tags
  tags: [String],
  
  // Interactions
  likes: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Visibilité
  visibility: {
    type: String,
    enum: ['public', 'followers', 'team'],
    default: 'public'
  },
  
  // Épinglé
  isPinned: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Modération
  isReported: { type: Boolean, default: false },
  reportCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false },
});

// Index pour recherches rapides
postSchema.index({ authorType: 1, author: 1, createdAt: -1 });
postSchema.index({ postType: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPinned: -1, createdAt: -1 });

// Virtuals pour le nombre de likes/comments
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Middleware pour populate l'auteur
postSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: authorType === 'user' 
      ? 'username profile.avatar profile.banner' 
      : 'name tag logo banner primaryColor secondaryColor'
  });
  next();
});

// Middleware pour mettre à jour updatedAt
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
