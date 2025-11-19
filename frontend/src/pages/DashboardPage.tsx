import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { goalsAPI, sharedGoalsAPI } from '../api/auth';
import CreateGoalModal from '../components/CreateGoalModal';
import GoalCard from '../components/GoalCard';
import InvitationsPanel from '../components/InvitationsPanel';
import { useNotification } from '../context/NotificationContext';
import { isSessionExpired, clearSessionExpiry } from '../utils/sessionManager';

interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: bigint;
  currentAmount: bigint;
  targetDate: string;
  type: string;
  createdBy: string;
  transactions?: any[];
}

interface SharedGoal {
  id: string;
  goalId: string;
  goal: Goal;
  members: any[];
}

export default function DashboardPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [invitations, setInvitations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
    
    // Check session expiry every minute
    const sessionCheckInterval = setInterval(() => {
      if (isSessionExpired()) {
        handleLogout();
        addNotification('Sesi Anda telah berakhir. Silakan login kembali.', 'warning');
      }
    }, 60000); // Check every 1 minute

    return () => clearInterval(sessionCheckInterval);
  }, []);

  const fetchData = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const [goalsRes, sharedRes, invRes] = await Promise.all([
        goalsAPI.getGoals(token),
        sharedGoalsAPI.getSharedGoals(token),
        sharedGoalsAPI.getInvitations(token),
      ]);

      // Filter individual goals
      const individualGoals = goalsRes.data.filter((g: Goal) => g.type === 'INDIVIDUAL');
      setGoals(individualGoals);
      setSharedGoals(sharedRes.data);
      setInvitations(invRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearSessionExpiry();
    addNotification('Sampai jumpa! Anda telah logout 👋', 'info');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-bounce-in">
          <div className="text-indigo-600 text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💰</div>
              <div>
                <h1 className="text-3xl font-bold">Tabungan Bersama</h1>
                <p className="text-indigo-100">Selamat datang, {user.name}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="grid grid-cols-1 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Invitations Panel */}
          {invitations.length > 0 && (
            <motion.div variants={itemVariants}>
              <InvitationsPanel invitations={invitations} onAccept={fetchData} />
            </motion.div>
          )}

          {/* Create Goal Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition transform hover:scale-105 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            + Buat Tujuan Baru
          </motion.button>

          {/* Combined Goals View */}
          <motion.div variants={itemVariants} className="space-y-8">
            {/* Individual Goals Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📊 Tujuan Pribadi ({goals.length})
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {goals.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="col-span-full text-center py-8 text-gray-500"
                  >
                    <p>Belum ada tujuan pribadi</p>
                  </motion.div>
                ) : (
                  goals.map((goal) => (
                    <motion.div key={goal.id} variants={itemVariants}>
                      <GoalCard goal={goal} onUpdate={fetchData} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>

            {/* Divider */}
            {goals.length > 0 && sharedGoals.length > 0 && (
              <div className="border-t-2 border-gray-300 pt-8"></div>
            )}

            {/* Shared Goals Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                👥 Tujuan Bersama ({sharedGoals.length})
              </h2>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sharedGoals.length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="col-span-full text-center py-8 text-gray-500"
                  >
                    <p>Belum ada tujuan bersama</p>
                  </motion.div>
                ) : (
                  sharedGoals.map((shared) => (
                    <motion.div key={shared.id} variants={itemVariants}>
                      <GoalCard goal={shared.goal} shared={shared} onUpdate={fetchData} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
