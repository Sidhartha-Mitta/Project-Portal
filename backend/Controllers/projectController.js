import Project from "../Models/Project.js";
import Team from "../Models/Team.js";
import User from "../Models/User.js";
import cloudinary, { configureCloudinary } from "../utils/cloudinary.js";

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      skillsRequired,
      difficulty,
      tags,
      duration,
      maxTeamSize,
      priority,
      deadline,
      attachments
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !difficulty || !duration || !maxTeamSize) {
      return res.status(400).json({ 
        message: "Please provide all required fields: title, description, category, difficulty, duration, maxTeamSize" 
      });
    }

    // Create project with postedBy from authenticated user
    const project = await Project.create({
      title,
      description,
      category,
      skillsRequired: skillsRequired || [],
      difficulty,
      tags: tags || [],
      duration,
      maxTeamSize,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : null,
      attachments: attachments || [],
      postedBy: req.user._id
    });

    // Create team for the project
    const team = await Team.create({
      name: `${title} Team`,
      description: `Team for project: ${title}`,
      project: project._id,
      leader: req.user._id,
      members: [{
        user: req.user._id,
        role: 'client',
        joinedAt: new Date()
      }]
    });

    // Update project with team reference
    project.team = team._id;
    await project.save();

    // Populate the postedBy field before sending response
    await project.populate('postedBy', 'name email avatar');
    await project.populate('team');

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
      team
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getAllProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('postedBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'name email avatar profile')
      .populate('applications.applicant', 'name email avatar')
      .populate('assignedTo');

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Increment views
    project.views += 1;
    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Submit project (zip or GitHub)
// @route   POST /api/projects/:id/submit
// @access  Private (Team members only)
export const submitProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is part of the team
    if (!project.team || !project.team.members.some(member =>
      member.user.toString() === req.user._id.toString() && member.status === 'active'
    )) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit for this project"
      });
    }

    const { repoLink, liveDemo } = req.body;

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Handle zip file upload using Cloudinary upload_stream
    if (req.file) {
      console.log('ZIP file detected, processing upload...');
      const streamifier = (await import('streamifier')).default;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'project-submissions',
          resource_type: 'raw',
          public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
        },
        async (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return res.status(500).json({
              success: false,
              message: "Failed to upload ZIP file"
            });
          }

          console.log('ZIP file uploaded successfully:', result.secure_url);

          const zipFile = {
            filename: req.file.originalname,
            url: result.secure_url,
            uploadedAt: new Date()
          };

          // Check if submission already exists
          const existingSubmission = project.submissions.find(sub =>
            sub.submittedBy.toString() === req.user._id.toString()
          );

          if (existingSubmission) {
            if (repoLink && repoLink.trim()) existingSubmission.repoLink = repoLink.trim();
            if (liveDemo && liveDemo.trim()) existingSubmission.liveDemo = liveDemo.trim();
            existingSubmission.zipFile = zipFile;
            existingSubmission.status = 'submitted';
            existingSubmission.submittedAt = new Date();
          } else {
            project.submissions.push({
              submittedBy: req.user._id,
              status: 'submitted',
              zipFile,
              repoLink: repoLink?.trim() || null,
              liveDemo: liveDemo?.trim() || null,
              submittedAt: new Date()
            });
          }

          // Update project status
          project.status = 'in-progress';
          await project.save();


          res.json({
            success: true,
            message: "Project submitted successfully",
            project
          });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } else {
      console.log('No ZIP file detected, processing text submission only');
      // No ZIP file, only repo/liveDemo
      const existingSubmission = project.submissions.find(sub =>
        sub.submittedBy.toString() === req.user._id.toString()
      );

      if (existingSubmission) {
        if (repoLink && repoLink.trim()) existingSubmission.repoLink = repoLink.trim();
        if (liveDemo && liveDemo.trim()) existingSubmission.liveDemo = liveDemo.trim();
        existingSubmission.status = 'submitted';
        existingSubmission.submittedAt = new Date();
      } else {
        project.submissions.push({
          submittedBy: req.user._id,
          status: 'submitted',
          repoLink: repoLink?.trim() || null,
          liveDemo: liveDemo?.trim() || null,
          submittedAt: new Date()
        });
      }

      project.status = 'in-progress';
      await project.save();


      res.json({
        success: true,
        message: "Project submitted successfully",
        project
      });
    }

  } catch (error) {
    console.error("Submit project error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update submission status (accept/modify)
// @route   PUT /api/projects/:id/submissions/:submissionId
// @access  Private (Project owner only)
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { status, feedback } = req.body;

    const project = await Project.findById(req.params.id)
      .populate('postedBy', 'name email avatar')
      .populate({ path: 'team', populate: { path: 'members.user', select: 'name email avatar' } });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update submission status"
      });
    }

    const submission = project.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    submission.status = status;
    if (feedback) {
      submission.feedback = feedback;
      submission.feedbackAt = new Date();
    }

    // If approved, mark project as completed
    if (status === 'approved') {
      project.status = 'completed';
    } else if (status === 'modify') {
      project.status = 'modify';
    }

    await project.save();


    res.json({
      success: true,
      message: "Submission status updated successfully",
      project
    });
  } catch (error) {
    console.error("Update submission status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve project (approve latest submission and mark as completed)
// @route   PUT /api/projects/:id/approve
// @access  Private (Project owner only)
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve this project"
      });
    }

    // Check if project has submissions
    if (!project.submissions || project.submissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No submissions found to approve"
      });
    }

    // Find the latest submission
    const latestSubmission = project.submissions[project.submissions.length - 1];

    // Update the latest submission status to approved
    latestSubmission.status = 'approved';
    latestSubmission.feedback = 'Project approved and completed';
    latestSubmission.feedbackAt = new Date();

    // Set project status to completed
    project.status = 'completed';

    await project.save();

    res.json({
      success: true,
      message: "Project approved and marked as completed successfully",
      project
    });
  } catch (error) {
    console.error("Approve project error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Rate project and team members
// @route   POST /api/projects/:id/rate
// @access  Private (Project owner only)
export const rateProject = async (req, res) => {
  try {
    const { rating, comment, memberRatings } = req.body;

    const project = await Project.findById(req.params.id)
      .populate('team')
      .populate({
        path: 'team.members.user',
        select: 'name email avatar'
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to rate this project"
      });
    }

    // Check if already rated
    const existingRating = project.ratings.find(r =>
      r.client.toString() === req.user._id.toString()
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.memberRatings = memberRatings || [];
      existingRating.createdAt = new Date();
    } else {
      // Create new rating
      project.ratings.push({
        client: req.user._id,
        team: project.team._id,
        rating,
        comment,
        memberRatings: memberRatings || []
      });
    }

    await project.save();

    res.json({
      success: true,
      message: "Project rated successfully",
      project
    });
  } catch (error) {
    console.error("Rate project error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard data
// @route   GET /api/projects/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    let appliedProjects = [];
    let acceptedProjects = [];
    let ongoingProjects = [];
    let completedProjects = [];
    let postedProjects = [];

    if (req.user.role === 'student') {
      // Get applied projects (applications)
      appliedProjects = await Project.find({
        'applications.applicant': req.user._id
      })
      .populate('postedBy', 'name email avatar')
      .select('title description status applications.$')
      .sort({ createdAt: -1 });

      // Get accepted projects (applications with status 'accepted')
      acceptedProjects = await Project.find({
        'applications': {
          $elemMatch: {
            applicant: req.user._id,
            status: 'accepted'
          }
        }
      })
      .populate('postedBy', 'name email avatar')
      .populate('team')
      .sort({ createdAt: -1 });

      // Get ongoing projects (assigned to teams where user is member)
      ongoingProjects = await Project.find({
        'team.members': {
          $elemMatch: {
            user: req.user._id,
            status: 'active'
          }
        },
        status: { $in: ['assigned', 'in-progress'] }
      })
      .populate('postedBy', 'name email avatar')
      .populate('team')
      .sort({ createdAt: -1 });

      // Get completed projects - find projects where user is a team member and status is completed
      completedProjects = await Project.find({
        'team.members': {
          $elemMatch: {
            user: req.user._id,
            status: 'active'
          }
        },
        status: 'completed'
      })
      .populate('postedBy', 'name email avatar')
      .populate({
        path: 'ratings',
        populate: {
          path: 'memberRatings.member',
          select: 'name email avatar'
        }
      })
      .sort({ createdAt: -1 });

    } else if (req.user.role === 'industry') {
      // Get all posted projects (all projects posted by the industry user)
      postedProjects = await Project.find({
        postedBy: req.user._id
      })
      .populate({
        path: 'team',
        populate: {
          path: 'members.user',
          select: 'name email avatar'
        }
      })
      .populate('submissions.submittedBy', 'name email avatar')
      .sort({ createdAt: -1 });

      // Get ongoing projects (projects that have been assigned to teams and are in progress)
      ongoingProjects = await Project.find({
        postedBy: req.user._id,
        status: { $in: ['assigned', 'in-progress', 'modify'] },
        team: { $exists: true, $ne: null }
      })
      .populate({
        path: 'team',
        populate: {
          path: 'members.user',
          select: 'name email avatar'
        }
      })
      .populate('submissions.submittedBy', 'name email avatar')
      .sort({ createdAt: -1 });

      // Get completed projects
      completedProjects = await Project.find({
        postedBy: req.user._id,
        status: 'completed'
      })
      .populate({
        path: 'team',
        populate: {
          path: 'members.user',
          select: 'name email avatar'
        }
      })
      .populate('ratings')
      .sort({ createdAt: -1 });
    }

    // Calculate overall rating for student
    let overallRating = null;
    if (req.user.role === 'student') {
      const allRatings = await Project.find({
        'ratings.memberRatings.member': req.user._id
      }).select('ratings.memberRatings');

      const memberRatings = [];
      allRatings.forEach(project => {
        project.ratings.forEach(rating => {
          rating.memberRatings.forEach(memberRating => {
            if (memberRating.member.toString() === req.user._id.toString()) {
              memberRatings.push(memberRating.rating);
            }
          });
        });
      });

      if (memberRatings.length > 0) {
        overallRating = (memberRatings.reduce((sum, r) => sum + r, 0) / memberRatings.length).toFixed(1);
      }
    }

    // Calculate accepted applications count for students
    let acceptedCount = 0;
    if (req.user.role === 'student') {
      const acceptedApplications = await Project.find({
        'applications': {
          $elemMatch: {
            applicant: req.user._id,
            status: 'accepted'
          }
        }
      });
      acceptedCount = acceptedApplications.length;
    }

    // Analytics data
    const analytics = {
      totalProjects: appliedProjects.length + ongoingProjects.length + completedProjects.length,
      completedCount: completedProjects.length,
      ongoingCount: ongoingProjects.length,
      appliedCount: appliedProjects.length,
      acceptedCount: acceptedCount,
      averageRating: overallRating
    };

    res.json({
      success: true,
      data: {
        appliedProjects,
        acceptedProjects,
        ongoingProjects,
        completedProjects,
        postedProjects,
        analytics,
        overallRating
      }
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Only project owner)
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to update this project" 
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email avatar');

    res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Only project owner)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Check if user is the project owner
    if (project.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to delete this project" 
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get projects posted by current user
// @route   GET /api/projects/my-projects
// @access  Private
export const getMyProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { postedBy: req.user._id };
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('postedBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get my projects error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get projects based on user role (industry sees only their projects, students see all)
// @route   GET /api/projects/session
// @access  Private
export const getProjectsForSession = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // If user is industry, only show their projects
    if (req.user.role === 'industry') {
      filter.postedBy = req.user._id;
    }
    // If user is student, show all projects (no additional filter needed)
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const projects = await Project.find(filter)
      .populate('postedBy', 'name email avatar role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // If user is student, populate applications to show applied status
    if (req.user.role === 'student') {
      await Project.populate(projects, {
        path: 'applications',
        match: { applicant: req.user._id },
        select: 'status'
      });
    }

    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get session projects error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};