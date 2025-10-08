import Team from "../Models/Team.js";
import Project from "../Models/Project.js";
import User from "../Models/User.js";
import { uploadToCloudinary, configureCloudinary } from "../utils/cloudinary.js";
import cloudinary from "../utils/cloudinary.js";
import { io } from "../server.js";

// @desc    Get user's teams
// @route   GET /api/teams
// @access  Private
export const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      'members.user': req.user._id,
      'members.status': 'active'
    })
    .populate('project', 'title description status')
    .populate('leader', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ lastActivity: -1 });

    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error("Get user teams error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private (Team members only)
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('project', 'title description status postedBy')
      .populate('leader', 'name email avatar')
      .populate('members.user', 'name email avatar profile')
      .populate('messages.sender', 'name email avatar');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is a team member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this team"
      });
    }

    res.json({
      success: true,
      team
    });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send message to team
// @route   POST /api/teams/:id/messages
// @access  Private (Team members only)
export const sendMessage = async (req, res) => {
  try {
    console.log('Send message request:', {
      body: req.body,
      files: req.files ? req.files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        buffer: !!f.buffer
      })) : null,
      hasFiles: !!(req.files && req.files.length > 0)
    });

    // Extract content from FormData (multer puts text fields in req.body)
    const content = req.body.content || '';
    const messageType = req.body.messageType || 'text';
    const replyTo = req.body.replyTo || null;

    // Find the file in req.files
    const file = req.files && req.files.length > 0 ? req.files.find(f => f.fieldname === 'file') : null;

    // Check if there's either content or a file
    if (!content && !file) {
      return res.status(400).json({
        success: false,
        message: "Message content or file is required"
      });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is a team member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages to this team"
      });
    }

    let messageData = {
      sender: req.user._id,
      content: content || (file ? `📎 ${file.originalname}` : ''),
      messageType,
      replyTo: replyTo || null
    };

    // Handle file upload if present
    if (file) {
      try {
        console.log('Processing file upload:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          hasBuffer: !!file.buffer,
          hasPath: !!file.path,
          hasUrl: !!file.url,
          bufferLength: file.buffer ? file.buffer.length : 'N/A'
        });

        console.log('Calling uploadToCloudinary with:', {
          inputType: file.buffer ? 'buffer' : file.path ? 'path' : 'file',
          fileName: file.originalname,
          mimeType: file.mimetype
        });

        // Upload file to Cloudinary
        const uploadResult = await uploadToCloudinary(
          file.buffer || file.path || file,
          file.originalname,
          file.mimetype
        );

        console.log('Cloudinary upload result:', {
          url: uploadResult.url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.size
        });

        messageData.messageType = file.mimetype.startsWith('image/') ? 'image' :
                                  file.mimetype.startsWith('video/') ? 'video' : 'file';
        messageData.attachments = [{
          filename: file.originalname || 'uploaded-file',
          url: uploadResult.url,
          type: messageData.messageType,
          size: uploadResult.size,
          publicId: uploadResult.public_id
        }];
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        console.error('Upload error stack:', uploadError.stack);
        return res.status(500).json({
          success: false,
          message: "Failed to upload file",
          error: uploadError.message
        });
      }
    }

    const message = team.addMessage(messageData);
    await team.save();

    // Populate the new message
    await team.populate('messages.sender', 'name email avatar');

    const populatedMessage = team.messages[team.messages.length - 1];

    // Emit the new message to all team members via Socket.IO
    try {
      io.to(`team-${req.params.id}`).emit('new-message', {
        teamId: req.params.id,
        message: populatedMessage
      });
      console.log(`Emitted new message to team-${req.params.id}`);
    } catch (socketError) {
      console.error('Socket.IO emission error:', socketError);
      // Don't fail the request if socket emission fails
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message"
    });
  }
};
// @desc    Get team messages
// @route   GET /api/teams/:id/messages
// @access  Private (Team members only)
export const getTeamMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is a team member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view messages for this team"
      });
    }

    // Paginate messages (oldest first - chronological order)
    const totalMessages = team.messages.length;
    const skip = (page - 1) * limit;
    const paginatedMessages = team.messages
      .slice(skip, skip + limit); // Get messages in chronological order (oldest first)

    // Get unique sender IDs from the messages
    const senderIds = [...new Set(paginatedMessages.map(msg => msg.sender.toString()))];

    // Populate senders
    const senders = await User.find({ _id: { $in: senderIds } }, 'name email avatar userName');

    // Create a map for quick lookup
    const senderMap = senders.reduce((map, sender) => {
      map[sender._id.toString()] = sender;
      return map;
    }, {});

    // Attach populated sender data to messages
    const messages = paginatedMessages.map(msg => ({
      ...msg.toObject(),
      sender: senderMap[msg.sender.toString()] || msg.sender
    }));

    // Log attachment information for debugging
    const messagesWithAttachments = messages.filter(msg => msg.attachments && msg.attachments.length > 0);
    console.log('Get team messages response:', {
      totalMessages,
      messagesWithAttachments: messagesWithAttachments.length,
      attachmentDetails: messagesWithAttachments.map(msg => ({
        messageId: msg._id,
        attachmentCount: msg.attachments.length,
        attachments: msg.attachments.map(att => ({
          filename: att.filename,
          url: att.url,
          type: att.type,
          size: att.size
        }))
      }))
    });

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNext: skip + limit < totalMessages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get team messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/teams/:teamId/messages/:messageId/reactions
// @access  Private (Team members only)
export const addReaction = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required"
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is a team member
    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to react to messages in this team"
      });
    }

    const message = team.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(reaction => 
      reaction.user.toString() === req.user._id.toString() && reaction.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if it exists
      message.reactions.pull(existingReaction._id);
    } else {
      // Add new reaction
      message.reactions.push({
        user: req.user._id,
        emoji
      });
    }

    await team.save();

    res.json({
      success: true,
      message: existingReaction ? "Reaction removed" : "Reaction added",
      reactions: message.reactions
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Edit message
// @route   PUT /api/teams/:teamId/messages/:messageId
// @access  Private (Message sender only)
export const editMessage = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const message = team.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user is the message sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this message"
      });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();

    await team.save();

    res.json({
      success: true,
      message: "Message updated successfully",
      data: message
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/teams/:teamId/messages/:messageId
// @access  Private (Message sender or team leader only)
export const deleteMessage = async (req, res) => {
  try {
    const { teamId, messageId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    const message = team.messages.id(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Check if user is the message sender or team leader
    const isMessageSender = message.sender.toString() === req.user._id.toString();
    const isTeamLeader = team.leader.toString() === req.user._id.toString();

    if (!isMessageSender && !isTeamLeader) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message"
      });
    }

    team.messages.pull(messageId);
    await team.save();

    res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Team leader only)
export const addTeamMember = async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team leader can add members"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add member to team
    const member = team.addMember(userId, role);
    await team.save();

    // Populate the new member
    await team.populate('members.user', 'name email avatar');

    res.json({
      success: true,
      message: "Member added successfully",
      member
    });
  } catch (error) {
    console.error("Add team member error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download file attachment
// @route   GET /api/teams/:teamId/messages/:messageId/attachments/:attachmentIndex/download
// @access  Private (Team members only)
export const downloadAttachment = async (req, res) => {
  try {
    const { teamId, messageId, attachmentIndex } = req.params;

    console.log('🔄 Download attachment request:', {
      teamId,
      messageId,
      attachmentIndex,
      userId: req.user._id,
      userEmail: req.user.email
    });

    const team = await Team.findById(teamId);
    if (!team) {
      console.log('❌ Team not found:', teamId);
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    console.log('✅ Team found:', team.name);

    // Check if user is a team member
    if (!team.isMember(req.user._id)) {
      console.log('❌ User not authorized:', {
        userId: req.user._id,
        teamMembers: team.members.map(m => m.user.toString())
      });
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this team's files"
      });
    }

    console.log('✅ User authorized for team');

    const message = team.messages.id(messageId);
    if (!message) {
      console.log('❌ Message not found:', messageId);
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    console.log('✅ Message found');

    const attachmentIndexNum = parseInt(attachmentIndex);
    if (isNaN(attachmentIndexNum) || !message.attachments || attachmentIndexNum >= message.attachments.length) {
      console.log('❌ Attachment not found:', {
        attachmentIndex,
        attachmentIndexNum,
        hasAttachments: !!message.attachments,
        attachmentCount: message.attachments ? message.attachments.length : 0
      });
      return res.status(404).json({
        success: false,
        message: "Attachment not found"
      });
    }

    const attachment = message.attachments[attachmentIndexNum];

    if (!attachment || !attachment.url) {
      console.log('❌ Attachment or URL not found');
      return res.status(404).json({
        success: false,
        message: "Attachment not found"
      });
    }

    console.log('📎 Downloading attachment:', {
      filename: attachment.filename,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size,
      publicId: attachment.publicId
    });

    // Ensure Cloudinary is configured
    configureCloudinary();

    // Generate signed download URL
    let downloadUrl;
    try {
      const resource_type = attachment.type === 'image' ? 'image' : 'raw';
      downloadUrl = cloudinary.url(attachment.publicId, {
        resource_type,
        sign_url: true,
        ...(resource_type === 'image' ? { flags: 'attachment' } : {})
      });
      console.log('🔗 Generated signed download URL:', downloadUrl);
    } catch (urlError) {
      console.error('❌ Error generating download URL:', urlError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate download URL"
      });
    }

    // Fetch the file from Cloudinary and serve it for download
    try {
      console.log('🌐 Fetching file from Cloudinary...');
      const axios = (await import('axios')).default;
      const response = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 60000, // 60 second timeout
        validateStatus: function (status) {
          return status < 500; // Accept all status codes less than 500
        }
      });

      console.log('🌐 Cloudinary response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      });

      if (response.status !== 200) {
        console.error('❌ Cloudinary returned non-200 status:', response.status, response.statusText);
        return res.status(response.status).json({
          success: false,
          message: response.status === 404 ? "File not found" : `Failed to fetch file from storage (${response.status}: ${response.statusText})`
        });
      }

      // Check if response is an error page (HTML instead of file)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('❌ Cloudinary returned HTML error page instead of file');
        return res.status(404).json({
          success: false,
          message: "File not found or access denied"
        });
      }

      // Set proper headers for file download
      const responseContentType = response.headers['content-type'] || 'application/octet-stream';
      const contentDisposition = `attachment; filename="${attachment.filename}"`;

      console.log('📤 Setting response headers:', { responseContentType, contentDisposition });

      res.setHeader('Content-Type', responseContentType);
      res.setHeader('Content-Disposition', contentDisposition);
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }

      // Pipe the file stream to response
      response.data.pipe(res);

      console.log('✅ File download stream initiated successfully');
    } catch (fetchError) {
      console.error('❌ Error fetching file from Cloudinary:', {
        message: fetchError.message,
        code: fetchError.code,
        response: fetchError.response?.status
      });
      return res.status(500).json({
        success: false,
        message: "Failed to fetch file from storage"
      });
    }
  } catch (error) {
    console.error("❌ Download attachment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Team leader only)
export const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team leader can remove members"
      });
    }

    // Cannot remove team leader
    if (userId === team.leader.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove team leader"
      });
    }

    const success = team.removeMember(userId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Member not found in team"
      });
    }

    await team.save();

    res.json({
      success: true,
      message: "Member removed successfully"
    });
  } catch (error) {
    console.error("Remove team member error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};