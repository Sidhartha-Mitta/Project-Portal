import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);
  const service = process.env.EMAIL_SERVICE; // e.g., 'gmail', 'hotmail', etc.
  const baseConfig = service
    ? { service }
    : { host: process.env.EMAIL_HOST || 'smtp.gmail.com', port };

  return nodemailer.createTransport({
    ...baseConfig,
    secure: port === 465, // true for 465, false otherwise
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    pool: true,
    maxConnections: Number(process.env.EMAIL_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.EMAIL_MAX_MESSAGES || 100),
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 30000),
    tls: {
      // Allow overriding TLS verification in environments with intercepting proxies
      rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED === 'false' ? false : true
    }
  });
};

// Email templates
const emailTemplates = {
  studentApplication: (student, project) => ({
    subject: `Application Submitted - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Submitted Successfully!</h2>
        <p>Dear ${student.name},</p>
        <p>Your application for the project <strong>"${project.title}"</strong> has been submitted successfully.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Difficulty:</strong> ${project.difficulty}</p>
          <p><strong>Duration:</strong> ${project.duration} weeks</p>
        </div>
        <p>You will be notified once the industry partner reviews your application.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  industryApplicationNotification: (student, project) => ({
    subject: `New Application Received - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Application Received!</h2>
        <p>Dear Industry Partner,</p>
        <p>A new student has applied for your project <strong>"${project.title}"</strong>.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Role:</strong> Student</p>
        </div>
        <div style="background: #e8f4f8; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Status:</strong> ${project.status}</p>
        </div>
        <p>Please review the application in your dashboard and respond accordingly.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  applicationAccepted: (student, project) => ({
    subject: `Application Accepted - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Congratulations! Application Accepted</h2>
        <p>Dear ${student.name},</p>
        <p>Great news! Your application for the project <strong>"${project.title}"</strong> has been accepted.</p>
        <div style="background: #f0fdf4; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10B981;">
          <h3>Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Team Size:</strong> ${project.maxTeamSize} members</p>
        </div>
        <p>You are now part of the project team! You can start working on the project and submit your progress.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  applicationRejected: (student, project, feedback) => ({
    subject: `Application Update - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Application Update</h2>
        <p>Dear ${student.name},</p>
        <p>We regret to inform you that your application for the project <strong>"${project.title}"</strong> was not selected at this time.</p>
        ${feedback ? `
        <div style="background: #fef2f2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #EF4444;">
          <h3>Feedback from Industry Partner:</h3>
          <p>${feedback}</p>
        </div>
        ` : ''}
        <p>Don't be discouraged! There are many other exciting projects available. Keep exploring and applying to projects that match your skills and interests.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  projectSubmitted: (project, teamMembers) => ({
    subject: `Project Submitted - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Project Submitted!</h2>
        <p>Dear Industry Partner,</p>
        <p>The team has successfully submitted their work for the project <strong>"${project.title}"</strong>.</p>
        <div style="background: #eff6ff; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Submission Details:</h3>
          <p><strong>Project:</strong> ${project.title}</p>
          <p><strong>Team Members:</strong> ${teamMembers.map(m => m.name).join(', ')}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Please review the submission in your dashboard and provide feedback or approval.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  modificationRequested: (project, teamMembers, feedback) => ({
    subject: `Modification Requested - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">Modification Requested</h2>
        <p>Dear Team Members,</p>
        <p>The industry partner has requested modifications for your project <strong>"${project.title}"</strong>.</p>
        <div style="background: #fffbeb; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #F59E0B;">
          <h3>Feedback:</h3>
          <p>${feedback}</p>
        </div>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
        </div>
        <p>Please review the feedback and resubmit your project with the requested changes.</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  }),

  projectApproved: (project, teamMembers) => ({
    subject: `Project Approved - ${project.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Congratulations! Project Approved</h2>
        <p>Dear Team Members,</p>
        <p>Excellent work! Your project <strong>"${project.title}"</strong> has been approved by the industry partner.</p>
        <div style="background: #f0fdf4; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10B981;">
          <h3>Project Details:</h3>
          <p><strong>Title:</strong> ${project.title}</p>
          <p><strong>Description:</strong> ${project.description}</p>
          <p><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Thank you for your hard work and dedication. This project has been successfully completed!</p>
        <p>Best regards,<br>Project Portal Team</p>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](...data);

    const mailOptions = {
      from: `"Project Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Specific email functions
export const sendStudentApplicationEmail = async (student, project) => {
  // Send to student
  await sendEmail(student.email, 'studentApplication', [student, project]);

  // Send to industry
  const industryEmail = project.postedBy.email;
  await sendEmail(industryEmail, 'industryApplicationNotification', [student, project]);
};

export const sendApplicationStatusEmail = async (student, project, status, feedback = null) => {
  if (status === 'accepted') {
    await sendEmail(student.email, 'applicationAccepted', [student, project]);
  } else if (status === 'rejected') {
    await sendEmail(student.email, 'applicationRejected', [student, project, feedback]);
  }
};

export const sendProjectSubmissionEmail = async (project, teamMembers) => {
  const industryEmail = project.postedBy.email;
  await sendEmail(industryEmail, 'projectSubmitted', [project, teamMembers]);
};

export const sendModificationRequestEmail = async (project, teamMembers, feedback) => {
  const teamEmails = teamMembers.map(member => member.email);
  for (const email of teamEmails) {
    await sendEmail(email, 'modificationRequested', [project, teamMembers, feedback]);
  }
};

export const sendProjectApprovalEmail = async (project, teamMembers) => {
  const teamEmails = teamMembers.map(member => member.email);
  for (const email of teamEmails) {
    await sendEmail(email, 'projectApproved', [project, teamMembers]);
  }
};

export default {
  sendEmail,
  sendStudentApplicationEmail,
  sendApplicationStatusEmail,
  sendProjectSubmissionEmail,
  sendModificationRequestEmail,
  sendProjectApprovalEmail
};