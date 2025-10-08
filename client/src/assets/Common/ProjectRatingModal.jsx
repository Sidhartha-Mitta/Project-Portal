import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar } from 'react-icons/fa';
import { useProjectStore } from '../../store/projectStore';
import toast from 'react-hot-toast';

const ProjectRatingModal = ({ isOpen, onClose, project }) => {
  const { rateProject, loading } = useProjectStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [memberRatings, setMemberRatings] = useState([]);

  // Initialize member ratings if team exists
  React.useEffect(() => {
    if (project?.team?.members) {
      const initialRatings = project.team.members
        .filter(member => member.status === 'active')
        .map(member => ({
          member: member.user._id,
          rating: 5,
          feedback: ''
        }));
      setMemberRatings(initialRatings);
    }
  }, [project]);

  const handleMemberRatingChange = (memberId, field, value) => {
    setMemberRatings(prev =>
      prev.map(rating =>
        rating.member === memberId ? { ...rating, [field]: value } : rating
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await rateProject(project._id, {
        rating: parseInt(rating),
        comment,
        memberRatings
      });
      toast.success('Project rated successfully!');
      onClose();
      setRating(5);
      setComment('');
      setMemberRatings([]);
    } catch (error) {
      toast.error(error.message || 'Failed to rate project');
    }
  };

  const renderStars = (currentRating, onRatingChange) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`cursor-pointer text-lg ${
          star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => onRatingChange(star)}
      />
    ));
  };

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
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Rate Project</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{project?.title}</h3>
                <p className="text-gray-600 text-sm">{project?.description}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Project Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Overall Project Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating, setRating)}
                    <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                  </div>
                </div>

                {/* Project Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about the project..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Individual Member Ratings */}
                {memberRatings.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-4">Team Member Ratings</h4>
                    <div className="space-y-4">
                      {memberRatings.map((memberRating, index) => {
                        const member = project.team.members.find(m => m.user._id === memberRating.member);
                        return (
                          <div key={memberRating.member} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-3">
                              {member?.user?.name || `Member ${index + 1}`}
                            </h5>

                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                              </label>
                              <div className="flex items-center space-x-1">
                                {renderStars(
                                  memberRating.rating,
                                  (newRating) => handleMemberRatingChange(memberRating.member, 'rating', newRating)
                                )}
                                <span className="ml-2 text-sm text-gray-600">({memberRating.rating}/5)</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Feedback
                              </label>
                              <textarea
                                value={memberRating.feedback}
                                onChange={(e) => handleMemberRatingChange(memberRating.member, 'feedback', e.target.value)}
                                placeholder="Feedback for this team member..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <FaStar className="mr-2" />
                        Submit Rating
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectRatingModal;