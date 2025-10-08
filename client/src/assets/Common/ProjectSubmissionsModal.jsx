import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaTimes as FaReject, FaComment, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { useProjectStore } from '../../store/projectStore';
import toast from 'react-hot-toast';

const ProjectSubmissionsModal = ({ isOpen, onClose, project }) => {
  const { updateSubmissionStatus, loading } = useProjectStore();
  const [feedback, setFeedback] = useState('');

  const handleStatusUpdate = async (submissionId, status) => {
    try {
      await updateSubmissionStatus(project._id, submissionId, status, feedback);
      toast.success(`Submission ${status} successfully!`);
      setFeedback('');
    } catch (error) {
      toast.error(error.message || 'Failed to update submission');
    }
  };

  const submissions = project?.submissions || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Project Submissions</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{project?.title}</h3>
                <p className="text-gray-600 text-sm">{project?.description}</p>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No submissions yet
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Submitted by: {submission.submittedBy?.name || 'Unknown'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'changes-requested' ? 'bg-yellow-100 text-yellow-800' :
                            submission.status === 'under-review' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {submission.repoLink && (
                            <a
                              href={submission.repoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-colors flex items-center text-sm"
                            >
                              <FaExternalLinkAlt className="mr-1" />
                              GitHub
                            </a>
                          )}
                          {submission.liveDemo && (
                            <a
                              href={submission.liveDemo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                            >
                              <FaExternalLinkAlt className="mr-1" />
                              Demo
                            </a>
                          )}
                          {submission.zipFile && (
                            <a
                              href={submission.zipFile.url}
                              download={submission.zipFile.filename}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center text-sm"
                            >
                              <FaDownload className="mr-1" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>

                      {submission.feedback && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Feedback:</strong> {submission.feedback}
                          </p>
                          {submission.feedbackAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Feedback given on {new Date(submission.feedbackAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {submission.status !== 'approved' && (
                        <div className="flex items-end space-x-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feedback (Optional)
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Provide feedback for the submission..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusUpdate(submission._id, 'changes-requested')}
                              disabled={loading}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 transition-colors flex items-center"
                            >
                              <FaComment className="mr-2" />
                              Request Changes
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(submission._id, 'approved')}
                              disabled={loading}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center"
                            >
                              <FaCheck className="mr-2" />
                              Approve
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSubmissionsModal;