import { useState } from 'react';
import { motion } from 'framer-motion';
import { goalsAPI } from '../api/auth';
import { useNotification } from '../context/NotificationContext';
import { formatNumberDisplay, parseFormattedNumber } from '../utils/numberFormat';

export default function AddTransactionModal({
  goalId,
  currentAmount,
  onClose,
  onSuccess,
}: {
  goalId: string;
  currentAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'WITHDRAWAL'>('INCOME');
  const [note, setNote] = useState('');
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

      const cleanAmount = parseInt(parseFormattedNumber(amount));

      // Validasi: jika penarikan, cek apakah saldo cukup
      if (type === 'WITHDRAWAL' && cleanAmount > currentAmount) {
        setError(`Saldo tidak mencukupi. Saldo tersedia: Rp ${currentAmount.toLocaleString('id-ID')}`);
        setLoading(false);
        return;
      }

      await goalsAPI.addTransaction(
        goalId,
        {
          amount: cleanAmount,
          type,
          note,
        },
        token
      );

      addNotification(
        `${type === 'INCOME' ? 'Penambahan' : 'Penarikan'} Rp ${cleanAmount.toLocaleString('id-ID')} berhasil ditambahkan!`,
        'success'
      );
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to add transaction';
      setError(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tambah Transaksi</h2>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded"
          >
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Current Balance Info */}
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6 rounded">
          <p className="text-sm text-gray-600">Saldo tersedia:</p>
          <p className="text-xl font-bold text-indigo-600">Rp {currentAmount.toLocaleString('id-ID')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tipe</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'INCOME'}
                  onChange={() => setType('INCOME')}
                  className="w-4 h-4"
                />
                <span>Pemasukan ➕</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'WITHDRAWAL'}
                  onChange={() => setType('WITHDRAWAL')}
                  className="w-4 h-4"
                />
                <span>Penarikan ➖</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Jumlah (Rp)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(formatNumberDisplay(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none font-mono"
              placeholder="50.000"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              placeholder="Gaji bulan Desember"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Batal
            </motion.button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? 'Proses...' : 'Simpan'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
