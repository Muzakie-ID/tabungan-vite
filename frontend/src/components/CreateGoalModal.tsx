import { useState } from 'react';
import { motion } from 'framer-motion';
import { goalsAPI, sharedGoalsAPI } from '../api/auth';
import { useNotification } from '../context/NotificationContext';
import { formatNumberDisplay, parseFormattedNumber } from '../utils/numberFormat';

export default function CreateGoalModal({ onClose, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [goalType, setGoalType] = useState<'individual' | 'shared'>('individual');
  const [invitedEmails, setInvitedEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotification();

  const token = localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!token) return;

      const data = {
        title,
        description,
        targetAmount: targetAmount ? parseInt(parseFormattedNumber(targetAmount)) : 0,
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (goalType === 'individual') {
        await goalsAPI.createGoal(data, token);
        addNotification(`Tujuan "${title}" berhasil dibuat!`, 'success');
      } else {
        const emails = invitedEmails
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e);
        await sharedGoalsAPI.createSharedGoal(
          { ...data, invitedEmails: emails },
          token
        );
        addNotification(
          `Tujuan bersama "${title}" berhasil dibuat dan undangan dikirim ke ${emails.length} anggota!`,
          'success'
        );
      }

      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to create goal';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Buat Tujuan Baru</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded"
          >
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Type Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipe Tujuan</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={goalType === 'individual'}
                  onChange={() => setGoalType('individual')}
                  className="w-4 h-4"
                />
                <span>Pribadi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={goalType === 'shared'}
                  onChange={() => setGoalType('shared')}
                  className="w-4 h-4"
                />
                <span>Bersama</span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Judul Tujuan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              placeholder="Liburan ke Bali"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Rencana liburan keluarga"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Target Jumlah (Rp) <span className="text-gray-400 text-sm">(opsional - kosongkan untuk unlimited)</span>
            </label>
            <input
              type="text"
              value={targetAmount}
              onChange={(e) => setTargetAmount(formatNumberDisplay(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
              placeholder="5.000.000 atau kosongkan"
            />
          </div>

          {/* Invited Emails (if shared) */}
          {goalType === 'shared' && (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email yang Diundang (pisahkan dengan koma)
              </label>
              <textarea
                value={invitedEmails}
                onChange={(e) => setInvitedEmails(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                rows={3}
                placeholder="user1@email.com, user2@email.com"
              />
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Membuat...' : 'Buat Tujuan'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
