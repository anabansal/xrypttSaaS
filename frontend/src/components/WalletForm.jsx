import React, { useState } from 'react';
import { TrashIcon, Cog6ToothIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { checkTransactions } from '../services/transactionService1.js';
import { LoadingSpinner } from './LoadingSpinner';

const WalletForm = ({ wallet, onChange, onRemove, onSaveSettings }) => {
  const [showMonitoringOptions, setShowMonitoringOptions] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState(wallet.nickname || '');

  const handleOptionChange = (e) => {
    const { name, type, checked, value } = e.target;
    onChange({
      ...wallet,
      monitorOptions: {
        ...wallet.monitorOptions,
        [name]: type === 'checkbox' ? checked : parseFloat(value)
      }
    });
  };

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    onChange({
      ...wallet,
      nickname: e.target.value
    });
  };

  const handleViewTransactions = async () => {
    setLoading(true);
    try {
      const txns = await checkTransactions(wallet.address);
      setTransactions(txns);
      setShowTransactions(true);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = () => {
    onRemove();
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="p-4 border rounded-lg mb-4 border-primary/10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow">
          <div className="text-xl font-bold text-primary">
            {wallet.nickname || wallet.address}
          </div>
          <div className="mt-2 block w-full text-sm text-primary/60 font-mono break-all">
            {wallet.address}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleViewTransactions}
            className="p-2 text-primary hover:bg-background-secondary rounded-lg transition-colors duration-200"
            title="View Transactions"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowMonitoringOptions(true)}
            className="p-2 text-primary hover:bg-background-secondary rounded-lg transition-colors duration-200"
            title="Monitoring Options"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Remove Wallet"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-bold text-primary mb-4">Confirm Deletion</h3>
            <p className="text-primary/80 mb-6">
              Are you sure you want to delete this wallet? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-primary hover:bg-background-secondary rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Options Modal */}
      {showMonitoringOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-bold text-primary mb-4">Monitoring Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Wallet Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={handleNicknameChange}
                  className="mt-1 block w-full rounded-lg border-primary/10 bg-background text-primary"
                  placeholder="Enter a nickname for this wallet"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="tokenTransfers"
                  checked={wallet.monitorOptions.tokenTransfers}
                  onChange={handleOptionChange}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <span className="ml-2 text-primary">Monitor Token Transfers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="tokenApprovals"
                  checked={wallet.monitorOptions.tokenApprovals}
                  onChange={handleOptionChange}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <span className="ml-2 text-primary">Monitor Token Approvals</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="etherTransfers"
                  checked={wallet.monitorOptions.etherTransfers}
                  onChange={handleOptionChange}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <span className="ml-2 text-primary">Monitor Ether Transfers</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Minimum Transaction Value (ETH)
                </label>
                <input
                  type="number"
                  name="minTransactionValue"
                  value={wallet.monitorOptions.minTransactionValue}
                  onChange={handleOptionChange}
                  min="0"
                  step="0.1"
                  className="mt-1 block w-full rounded-lg border-primary/10 bg-background text-primary"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowMonitoringOptions(false)}
                className="px-4 py-2 text-primary hover:bg-background-secondary rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMonitoringOptions(false);
                  onSaveSettings();
                }}
                className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary-hover"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactions && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
          onClick={() => setShowTransactions(false)}
          style={{ marginTop: '64px' }}
        >
          <div 
            className="bg-background rounded-lg p-6 max-w-4xl w-full m-4 overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ maxHeight: '200px' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary">
                Latest Transaction for {wallet.nickname || wallet.address}
              </h3>
              <button
                onClick={() => setShowTransactions(false)}
                className="text-primary/60 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div>
                {transactions.length > 0 ? (
                  <div className="bg-background-secondary p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-primary/60">Hash</p>
                        <p className="font-mono text-primary truncate">{transactions[0].hash}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary/60">Value</p>
                        <p className="text-primary">{transactions[0].value} ETH</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary/60">From</p>
                        <p className="font-mono text-primary truncate">{transactions[0].from}</p>
                      </div>
                      <div>
                        <p className="text-sm text-primary/60">To</p>
                        <p className="font-mono text-primary truncate">{transactions[0].to}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-primary/60">Time</p>
                        <p className="text-primary">
                          {new Date(transactions[0].timeStamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-primary/60">No transactions found</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletForm;