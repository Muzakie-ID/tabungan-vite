import { useState } from 'react';
import { motion } from 'framer-motion';
import { goalsAPI } from '../api/auth';
import AddTransactionModal from './AddTransactionModal';
import DetailModal from './DetailModal';
import { useNotification } from '../context/NotificationContext';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: bigint;
  currentAmount: bigint;
  targetDate: string;
  createdBy: string;
}

interface SharedGoal {
  goal: Goal;
  members: any[];
}

export default function GoalCard({
  goal,
  shared,
  onUpdate,
}: {
  goal: Goal;
  shared?: SharedGoal;
  onUpdate: () => void;
}) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const currentAmount = Number(goal.currentAmount);
  const targetAmount = Number(goal.targetAmount);
  const isUnlimited = targetAmount === 0;
  const progress = isUnlimited ? 0 : Math.min((currentAmount / targetAmount) * 100, 100);

  const handleDelete = async () => {
    if (!window.confirm('Hapus tujuan ini?')) return;

    setLoading(true);
    try {
      if (token) {
        await goalsAPI.deleteGoal(goal.id, token);
        addNotification(`Tujuan "${goal.title}" berhasil dihapus`, 'success');
        onUpdate();

      }
    } catch (error) {
      addNotification('Gagal menghapus tujuan', 'error');
      console.error('Failed to delete goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCreator = goal.createdBy === user.id;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)' },
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col"
        variants={cardVariants}
        whileHover="hover"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
            )}
          </div>
          {shared && <span className="text-2xl">👥</span>}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex-grow">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
            <motion.div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Rp {currentAmount.toLocaleString('id-ID')}</span>
            <span>{Math.round(progress)}%</span>
            <span>{isUnlimited ? '♾️ Unlimited' : 'Rp ' + targetAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="bg-indigo-50 p-2 rounded">
            <p className="text-gray-600">Tipe</p>
            <p className="font-semibold text-indigo-600">
              {shared ? '👥 Bersama' : '👤 Pribadi'}
            </p>
          </div>
        </div>

        {/* Members (if shared) */}
        {shared && shared.members && shared.members.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Anggota ({shared.members.length})</p>
            <div className="flex flex-wrap gap-2">
              {shared.members.map((member: any) => (
                <span
                  key={member.id}
                  className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full"
                >
                  {member.user.name}
                  {member.role === 'creator' && ' 👑'}
                </span>
              ))}
            </div>
          </div>
        )}



        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={() => setShowAddTransaction(true)}
            className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Tambah
          </motion.button>

          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Detail
          </motion.button>

          {isCreator && (
            <motion.button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🗑️
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      {showAddTransaction && (
        <AddTransactionModal
          goalId={goal.id}
          currentAmount={currentAmount}
          onClose={() => setShowAddTransaction(false)}
          onSuccess={() => {
            setShowAddTransaction(false);
            onUpdate();
          }}
        />
      )}

      {showDetails && (
        <DetailModal
          goal={goal}
          transactions={goal.transactions || []}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
