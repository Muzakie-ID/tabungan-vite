import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  amount: bigint;
  type: string;
  note?: string;
  createdAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DetailModal({
  goal,
  transactions,
  onClose,
}: {
  goal: any;
  transactions: Transaction[];
  onClose: () => void;
}) {
  // Sort transactions by createdAt descending (newest first)
  const sortedTransactions = [...(transactions || [])].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  // Calculate breakdown per user for shared goals
  const getUserBreakdown = () => {
    const breakdown: Record<string, { name: string; email: string; total: number }> = {};
    
    sortedTransactions?.forEach((tx: any) => {
      if (tx.type === 'INCOME' && tx.user) {
        if (!breakdown[tx.user.id]) {
          breakdown[tx.user.id] = {
            name: tx.user.name,
            email: tx.user.email,
            total: 0,
          };
        }
        breakdown[tx.user.id].total += Number(tx.amount);
      }
    });

    return Object.values(breakdown).sort((a, b) => b.total - a.total);
  };

  const isSharedGoal = goal.type === 'SHARED';
  const userBreakdown = isSharedGoal ? getUserBreakdown() : [];

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
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">📋 Detail Transaksi</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Goal Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{goal.title}</h3>
          {goal.description && (
            <p className="text-gray-600 mb-2">{goal.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Terkumpul</p>
              <p className="text-xl font-bold text-indigo-600">
                Rp {Number(goal.currentAmount).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Target</p>
              <p className="text-xl font-bold text-purple-600">
                {Number(goal.targetAmount) === 0 ? '♾️ Unlimited' : 'Rp ' + Number(goal.targetAmount).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown per User (untuk Shared Goals) */}
        {isSharedGoal && userBreakdown.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Penambahan Per Anggota</h3>
            <div className="space-y-2">
              {userBreakdown.map((user, idx) => (
                <motion.div
                  key={user.email}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Rp {user.total.toLocaleString('id-ID')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Riwayat Transaksi</h3>
          {sortedTransactions && sortedTransactions.length > 0 ? (
            <div className="space-y-2">
              {sortedTransactions.map((tx: any) => (
                <motion.div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${tx.type === 'INCOME' ? '✅' : '❌'}`} />
                      <div>
                        <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'INCOME' ? 'Penambahan' : 'Penarikan'}
                          {tx.user && ` - ${tx.user.name}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          {new Date(tx.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                        {tx.note && (
                          <p className="text-xs text-gray-600 mt-1">💬 {tx.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'} Rp {Math.abs(Number(tx.amount)).toLocaleString('id-ID')}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Belum ada transaksi</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Tutup
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
