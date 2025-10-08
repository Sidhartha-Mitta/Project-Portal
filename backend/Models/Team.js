import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'file'],
    default: 'text'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'file'],
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member', 'client'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'removed'],
      default: 'active'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'disbanded'],
    default: 'active'
  },
  messages: [messageSchema],
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowVideoSharing: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    allowedFileTypes: {
      type: [String],
      default: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf', 'text/plain']
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
teamSchema.index({ project: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ status: 1 });
teamSchema.index({ lastActivity: -1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Virtual for unread messages count (would need to be calculated per user)
teamSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Method to check if user is a member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
};

// Method to get user's role in team
teamSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
  return member ? member.role : null;
};

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    // Reactivate if previously removed
    if (existingMember.status === 'removed') {
      existingMember.status = 'active';
      existingMember.joinedAt = new Date();
    }
    return existingMember;
  }
  
  // Add new member
  const newMember = {
    user: userId,
    role: role,
    joinedAt: new Date(),
    status: 'active'
  };
  
  this.members.push(newMember);
  this.lastActivity = new Date();
  return newMember;
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.status = 'removed';
    this.lastActivity = new Date();
    return true;
  }
  return false;
};

// Method to add message
teamSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastActivity = new Date();
  return this.messages[this.messages.length - 1];
};

// Pre-save middleware to update lastActivity
teamSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

export default mongoose.model('Team', teamSchema);