import Project from "../Models/Project.js";
import Team from "../Models/Team.js";
import User from "../Models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Apply to a project
// @route   POST /api/projects/:id/apply
// @access  Private (Students only)
export const applyToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      proposal,
      coverLetter,
      institute,
      availability,
      skills,
      experience,
      portfolio,
      phone,
      address,
      cgpa,
      yearOfStudy
    } = req.body;

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: "Only students can apply to projects"
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if project is still open for applications
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: project.status === 'closed' ? "This project registration is closed" : "This project is no longer accepting applications"
      });
    }

    // Check if user has already applied
    if (project.hasUserApplied(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this project"
      });
    }

    // Create application
    const application = {
      applicant: req.user._id,
      institute: institute || '',
      availability: availability || 'negotiable',
      skills: skills ? (Array.isArray(skills) ? skills : JSON.parse(skills)) : [],
      experience: experience || '',
      portfolio: portfolio || '',
      phone: phone || '',
      address: address || '',
      cgpa: cgpa ? parseFloat(cgpa) : null,
      yearOfStudy: yearOfStudy || '3rd',
      appliedAt: new Date()
    };

    // Handle resume file upload
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        application.resume = {
          filename: req.file.originalname,
          url: uploadResult.url,
          publicId: uploadResult.public_id,
          size: uploadResult.size,
          uploadedAt: new Date()
        };
      } catch (uploadError) {
        console.error('Resume upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload resume"
        });
      }
    } else if (req.user.profile && req.user.profile.resume) {
      // Use resume from user profile if no file uploaded
      application.resume = req.user.profile.resume;
    }

    project.applications.push(application);
    await project.save();

    // Populate the new application
    await project.populate('applications.applicant', 'name email avatar profile');

    const newApplication = project.applications[project.applications.length - 1];


    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: newApplication
    });
  } catch (error) {
    console.error("Apply to project error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get applications for a project
// @route   GET /api/projects/:id/applications
// @access  Private (Project owner only)
export const getProjectApplications = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const project = await Project.findById(id)
      .populate('applications.applicant', 'name email avatar profile')
      .populate('postedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is the project owner
    if (project.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this project"
      });
    }

    let applications = project.applications;

    // Filter by status if provided
    if (status) {
      applications = project.getApplicationsByStatus(status);
    }

    res.json({
      success: true,
      applications,
      totalApplications: project.applications.length,
      appliedApplications: project.getApplicationsByStatus('applied').length,
      acceptedApplications: project.getApplicationsByStatus('accepted').length,
      rejectedApplications: project.getApplicationsByStatus('rejected').length,
      shortlistedApplications: project.getApplicationsByStatus('shortlisted').length
    });
  } catch (error) {
    console.error("Get project applications error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/projects/:projectId/applications/:applicationId
// @access  Private (Project owner only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { projectId, applicationId } = req.params;
    const { status, feedback } = req.body;

    const project = await Project.findById(projectId)
      .populate('applications.applicant', 'name email avatar profile')
      .populate('postedBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is the project owner
    if (project.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update applications for this project"
      });
    }

    const application = project.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    let success = false;
    let message = "";

    switch (status) {
      case 'accepted':
        success = project.acceptApplication(applicationId);
        message = success ? "Application accepted successfully. Student has been added to the project team." : "Failed to accept application. Application must be in applied or shortlisted status.";
        break;
      case 'rejected':
        success = project.rejectApplication(applicationId, feedback);
        message = success ? "Application rejected" : "Failed to reject application";
        break;
      case 'shortlisted':
        success = project.shortlistApplication(applicationId);
        message = success ? "Application shortlisted" : "Failed to shortlist application";
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'accepted', 'rejected', or 'shortlisted'"
        });
    }

    if (success) {
      await project.save();

      // If accepted, create or update team
      if (status === 'accepted') {
        const studentId = application.applicant._id || application.applicant;
        await createOrUpdateProjectTeam(project, studentId);
      }


      res.json({
        success: true,
        message,
        application
      });
    } else {
      res.status(400).json({
        success: false,
        message
      });
    }
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to create or update project team
const createOrUpdateProjectTeam = async (project, studentId) => {
  try {
    // Ensure we have the project ID
    const projectId = project._id || project.id;
    if (!projectId) {
      throw new Error('Project ID is required to create team');
    }

    // Ensure we have the project owner
    const projectOwner = project.postedBy?._id || project.postedBy;
    if (!projectOwner) {
      throw new Error('Project owner is required to create team');
    }

    let team = await Team.findOne({ project: projectId });

    if (!team) {
      // Create new team
      team = new Team({
        name: `${project.title || 'Project'} Team`,
        description: `Team for project: ${project.title || 'Project'}`,
        project: projectId,
        leader: projectOwner,
        members: [
          {
            user: projectOwner,
            role: 'client',
            joinedAt: new Date()
          }
        ]
      });
    }

    // Add student to team
    team.addMember(studentId, 'member');
    await team.save();

    // Update project with team reference
    if (!project.team) {
      project.team = team._id;
      await project.save();
    }

    return team;
  } catch (error) {
    console.error("Create/update team error:", error);
    throw error;
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Students only)
export const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: "Only students can view their applications"
      });
    }

    const projects = await Project.find({
      'applications.applicant': req.user._id
    })
    .populate('postedBy', 'name email avatar')
    .select('title description category status applications createdAt deadline');

    const applications = [];

    projects.forEach(project => {
      const userApplication = project.applications.find(app => 
        app.applicant.toString() === req.user._id.toString()
      );
      
      if (userApplication) {
        applications.push({
          _id: userApplication._id,
          project: {
            _id: project._id,
            title: project.title,
            description: project.description,
            category: project.category,
            status: project.status,
            postedBy: project.postedBy,
            createdAt: project.createdAt,
            deadline: project.deadline
          },
          status: userApplication.status,
          appliedAt: userApplication.appliedAt,
          feedback: userApplication.feedback
        });
      }
    });

    res.json({
      success: true,
      applications,
      totalApplications: applications.length,
      appliedApplications: applications.filter(app => app.status === 'applied').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      shortlistedApplications: applications.filter(app => app.status === 'shortlisted').length
    });
  } catch (error) {
    console.error("Get my applications error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};