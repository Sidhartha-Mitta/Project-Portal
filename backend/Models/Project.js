// models/Project.js
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  // Core project information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Project categorization
  category: {
    type: String,
    required: true,
    enum: ['web-development', 'mobile-app', 'data-science', 'ai-ml', 'iot', 'blockchain', 'cybersecurity', 'game-development', 'ui-ux']
  },
  skillsRequired: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tags: [String],
  
  // Project timeline and team
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  maxTeamSize: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Project ownership and status
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'assigned', 'in-progress', 'modify', 'completed', 'cancelled'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Project visibility and engagement
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Team assignment (if selected)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Team created for this project
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  
  // Applications from students
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'rejected', 'shortlisted'],
      default: 'applied'
    },
    proposal: {
      type: String,
      maxlength: 1000
    },
    resume: {
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    coverLetter: {
      type: String,
      maxlength: 2000
    },
    institute: {
      type: String,
      trim: true
    },
    availability: {
      type: String,
      enum: ['immediate', '2-weeks', '1-month', 'negotiable'],
      default: 'negotiable'
    },
    skills: [String],
    experience: String,
    portfolio: String,
    // Industry feedback on application
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }],
  
  // Selected students for the project
  selectedStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    selectedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      default: 'Developer'
    }
  }],
  
  // Project submissions
  submissions: [{
    repoLink: String,
    liveDemo: String,
    zipFile: {
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['submitted', 'under-review', 'changes-requested', 'approved', 'modify'],
      default: 'submitted'
    },
    feedback: String,
    feedbackAt: Date
  }],
  
  // Ratings and reviews
  ratings: [{
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    memberRatings: [{
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional metadata
  deadline: Date,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Discussion and communication
  discussions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ difficulty: 1 });
ProjectSchema.index({ postedBy: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ featured: -1, createdAt: -1 });
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ 'applications.applicant': 1 });
ProjectSchema.index({ 'applications.status': 1 });

// Virtual for average rating
ProjectSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Virtual for application count
ProjectSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Method to check if user has applied
ProjectSchema.methods.hasUserApplied = function(userId) {
  return this.applications.some(app => 
    app.applicant && app.applicant.toString() === userId.toString()
  );
};

// Method to get active applications (not rejected)
ProjectSchema.methods.getActiveApplications = function() {
  return this.applications.filter(app => app.status !== 'rejected');
};

// Method to get applications by status
ProjectSchema.methods.getApplicationsByStatus = function(status) {
  return this.applications.filter(app => app.status === status);
};

// Method to accept application and add to selected students
ProjectSchema.methods.acceptApplication = function(applicationId) {
  const application = this.applications.id(applicationId);
  if (application && (application.status === 'applied' || application.status === 'shortlisted')) {
    application.status = 'accepted';

    // Initialize selectedStudents array if it doesn't exist
    if (!this.selectedStudents) {
      this.selectedStudents = [];
    }

    // Add to selected students if not already added
    const alreadySelected = this.selectedStudents.some(selected =>
      selected.student.toString() === application.applicant.toString()
    );

    if (!alreadySelected) {
      this.selectedStudents.push({
        student: application.applicant,
        selectedAt: new Date(),
        role: 'Developer'
      });
    }

    return true;
  }
  return false;
};

// Method to reject application
ProjectSchema.methods.rejectApplication = function(applicationId, feedback) {
  const application = this.applications.id(applicationId);
  if (application && application.status === 'applied') {
    application.status = 'rejected';
    if (feedback) {
      application.feedback = feedback;
    }
    return true;
  }
  return false;
};

// Method to shortlist application
ProjectSchema.methods.shortlistApplication = function(applicationId) {
  const application = this.applications.id(applicationId);
  if (application && application.status === 'applied') {
    application.status = 'shortlisted';
    return true;
  }
  return false;
};

export default mongoose.model('Project', ProjectSchema);