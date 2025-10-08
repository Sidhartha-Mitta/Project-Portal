import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FaTimes, FaUpload, FaGithub } from 'react-icons/fa';
import { useProjectStore } from '../../store/projectStore';
import toast from 'react-hot-toast';

const ProjectSubmissionModal = ({ isOpen, onClose, project }) => {
  const { submitProject, loading } = useProjectStore();
  const [formData, setFormData] = useState({
    repoLink: '',
    liveDemo: '',
    zipFile: null
  });

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFormData(prev => ({ ...prev, zipFile: acceptedFiles[0] }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitProject(project._id, formData);
      toast.success('Project submitted successfully!');
      onClose();
      setFormData({ repoLink: '', liveDemo: '', zipFile: null });
    } catch (error) {
      toast.error(error.message || 'Failed to submit project');
    }
  };

  const handleClose = () => {
    setFormData({ repoLink: '', liveDemo: '', zipFile: null });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Submit Project</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{project?.title}</h3>
                <p className="text-gray-600 text-sm">{project?.description}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository Link
                  </label>
                  <div className="relative">
                    <FaGithub className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={formData.repoLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, repoLink: e.target.value }))}
                      placeholder="https://github.com/username/repo"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live Demo Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.liveDemo}
                    onChange={(e) => setFormData(prev => ({ ...prev, liveDemo: e.target.value }))}
                    placeholder="https://your-demo-site.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload ZIP File (Optional)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <FaUpload className="mx-auto text-gray-400 mb-2" size={24} />
                    {formData.zipFile ? (
                      <p className="text-sm text-gray-600">
                        Selected: {formData.zipFile.name}
                      </p>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600">
                          {isDragActive ? 'Drop the ZIP file here' : 'Drag & drop a ZIP file here, or click to select'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Max size: 50MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (!formData.repoLink && !formData.zipFile)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <FaUpload className="mr-2" />
                        Submit
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

export default ProjectSubmissionModal;