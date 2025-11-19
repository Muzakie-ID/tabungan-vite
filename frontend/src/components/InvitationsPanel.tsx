import { useState } from 'react';
import { motion } from 'framer-motion';
import { sharedGoalsAPI } from '../api/auth';
import { useNotification } from '../context/NotificationContext';

export default function InvitationsPanel({
  invitations,
  onAccept,
}: {
  invitations: any[];
  onAccept: () => void;
}) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const token = localStorage.getItem('token');

  const handleAccept = async (invitationId: string, goalTitle: string) => {
    setProcessingId(invitationId);
    try {
      if (token) {
        await sharedGoalsAPI.acceptInvitation(invitationId, token);
        addNotification(`Berhasil bergabung dengan tujuan "${goalTitle}"!`, 'success');
        onAccept();
      }
    } catch (error) {
      addNotification('Gagal menerima undangan', 'error');
      console.error('Failed to accept invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invitationId: string, goalTitle: string) => {
    setProcessingId(invitationId);
    try {
      if (token) {
        await sharedGoalsAPI.rejectInvitation(invitationId, token);
        addNotification(`Undangan untuk "${goalTitle}" ditolak`, 'info');
        onAccept();
      }
    } catch (error) {
      addNotification('Gagal menolak undangan', 'error');
      console.error('Failed to reject invitation:', error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📬</span>
        <h2 className="text-xl font-bold text-gray-800">
          Undangan Tabungan Bersama ({invitations.length})
        </h2>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <motion.div
            key={invitation.id}
            className="bg-white rounded-lg p-4 flex justify-between items-center"
            whileHover={{ scale: 1.02 }}
          >
            <div>
              <h3 className="font-semibold text-gray-800">
                {invitation.sharedGoal.goal.title}
              </h3>
              <p className="text-sm text-gray-600">
                dari {invitation.invitedBy.name} ({invitation.invitedBy.email})
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Target: Rp {Number(invitation.sharedGoal.goal.targetAmount).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => handleAccept(invitation.id, invitation.sharedGoal.goal.title)}
                disabled={processingId === invitation.id}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✓ Terima
              </motion.button>
              <motion.button
                onClick={() => handleReject(invitation.id, invitation.sharedGoal.goal.title)}
                disabled={processingId === invitation.id}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕ Tolak
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
