import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, FileText, Share2, Users, Copy, Check,
  TrendingUp, TrendingDown, Wallet, Trash2, RefreshCw,
  Crown, User as UserIcon
} from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import AddTransactionModal from '../components/Transactions/AddTransactionModal';
import PaymentSettlementCard from '../components/Room/PaymentSettlementCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '../utils/format';
import styles from './RoomPage.module.css';

export default function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [roomRes, txnRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.get(`/transactions/${roomId}?limit=100`),
      ]);
      setRoom(roomRes.data.room);
      setTransactions(txnRes.data.transactions);
      setSummary(txnRes.data.summary);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        toast.error(err.response.data.message || 'Room not found.');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Polling every 15s
  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const isHost = room?.host?._id === user?._id || room?.host === user?._id;

  const handleTransactionAdded = (txn) => {
    setTransactions(prev => [txn, ...prev]);
    setSummary(prev => ({
      ...prev,
      totalIncome: txn.type === 'income' ? prev.totalIncome + txn.amount : prev.totalIncome,
      totalExpense: txn.type === 'expense' ? prev.totalExpense + txn.amount : prev.totalExpense,
      netBalance: txn.type === 'income' ? prev.netBalance + txn.amount : prev.netBalance - txn.amount,
    }));
    toast.success('Transaction added!');
  };

  const handleDelete = async (txnId) => {
    setDeletingId(txnId);
    try {
      const txn = transactions.find(t => t._id === txnId);
      await api.delete(`/transactions/${roomId}/${txnId}`);
      setTransactions(prev => prev.filter(t => t._id !== txnId));
      if (txn) {
        setSummary(prev => ({
          ...prev,
          totalIncome: txn.type === 'income' ? prev.totalIncome - txn.amount : prev.totalIncome,
          totalExpense: txn.type === 'expense' ? prev.totalExpense - txn.amount : prev.totalExpense,
          netBalance: txn.type === 'income' ? prev.netBalance - txn.amount : prev.netBalance + txn.amount,
        }));
      }
      toast.success('Transaction deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('et_token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/reports/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` }, credentials: 'include' }
      );
      if (!res.ok) throw new Error('Report generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Download
      const a = document.createElement('a');
      a.href = url;
      a.download = `ExpenceReport-${roomId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // WhatsApp share
      const msg = encodeURIComponent(
        `📊 Expense report for *${room.name}* is ready!\n\nRoom ID: ${roomId}\nBalance: ${formatCurrency(summary.netBalance)}\n\nDownloaded via Expence-Tracker`
      );
      window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');

      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room ID copied!');
  };

  const filteredTxns = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className={styles.main}>
          <div className="container">
            <div className={styles.loadingState}>
              <div className="spinner" style={{ width: 32, height: 32, color: 'var(--ink-300)' }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* ─── BREADCRUMB ─── */}
          <div className={styles.breadcrumb}>
            <Link to="/dashboard" className={styles.backLink}>
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>{room?.name}</span>
          </div>

          {/* ─── ROOM HEADER ─── */}
          <div className={styles.roomHeader}>
            <div className={styles.roomHeaderLeft}>
              <div className={styles.roomAvatar}>{getInitials(room?.name)}</div>
              <div>
                <h1 className={styles.roomTitle}>{room?.name}</h1>
                {room?.description && <p className={styles.roomDesc}>{room.description}</p>}
                <div className={styles.roomMeta}>
                  <button className={styles.roomIdChip} onClick={copyRoomId} title="Copy Room ID">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>#{room?.roomId}</span>
                  </button>
                  <span className={styles.metaDot} />
                  <Users size={13} style={{ color: 'var(--ink-400)' }} />
                  <span className={styles.metaText}>{room?.members?.length} members</span>
                  {isHost && (
                    <>
                      <span className={styles.metaDot} />
                      <span className="badge badge-host"><Crown size={10} /> Host</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.roomHeaderRight}>
              {isHost && (
                <button
                  className="btn btn-outline"
                  onClick={handleGenerateReport}
                  disabled={generating}
                >
                  {generating ? <><span className="spinner" />Generating…</> : <><FileText size={15} />Report + Share</>}
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setShowAddTxn(true)}>
                <Plus size={15} /> Add Transaction
              </button>
            </div>
          </div>

          {/* ─── SUMMARY CARDS ─── */}
          <div className={styles.summaryGrid}>
            <div className={`${styles.summaryCard} ${styles.summaryIncome}`}>
              <div className={styles.summaryIcon}><TrendingUp size={18} /></div>
              <div>
                <div className={styles.summaryLabel}>Total Income</div>
                <div className={styles.summaryValue}>{formatCurrency(summary.totalIncome)}</div>
              </div>
            </div>
            <div className={`${styles.summaryCard} ${styles.summaryExpense}`}>
              <div className={styles.summaryIcon}><TrendingDown size={18} /></div>
              <div>
                <div className={styles.summaryLabel}>Total Expense</div>
                <div className={styles.summaryValue}>{formatCurrency(summary.totalExpense)}</div>
              </div>
            </div>
            <div className={`${styles.summaryCard} ${summary.netBalance >= 0 ? styles.summaryPositive : styles.summaryNegative}`}>
              <div className={styles.summaryIcon}><Wallet size={18} /></div>
              <div>
                <div className={styles.summaryLabel}>Net Balance</div>
                <div className={styles.summaryValue}>
                  {summary.netBalance >= 0 ? '+' : ''}{formatCurrency(summary.netBalance)}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.layout}>
            {/* ─── TRANSACTIONS ─── */}
            <div className={styles.txnSection}>
              <div className={styles.txnHeader}>
                <h2 className={styles.sectionTitle}>Transactions</h2>
                <div className={styles.filterTabs}>
                  {['all', 'income', 'expense'].map(f => (
                    <button
                      key={f}
                      className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={fetchData} title="Refresh">
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {filteredTxns.length === 0 ? (
                <div className="card">
                  <div className="empty-state">
                    <div className="empty-state-icon"><Wallet size={28} /></div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No transactions yet</h3>
                      <p style={{ fontSize: 14, color: 'var(--ink-400)' }}>Add your first transaction to get started.</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddTxn(true)}>
                      <Plus size={14} /> Add Transaction
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.txnList}>
                  {filteredTxns.map((txn, i) => {
                    const canDelete = isHost || txn.addedBy?._id === user?._id;
                    return (
                      <div
                        key={txn._id}
                        className={`card ${styles.txnCard} animate-fade-in`}
                        style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                      >
                        <div className={`${styles.txnIndicator} ${txn.type === 'income' ? styles.txnIndicatorIncome : styles.txnIndicatorExpense}`} />
                        <div className={styles.txnIconWrap}>
                          <div className={`${styles.txnIcon} ${txn.type === 'income' ? styles.txnIconIncome : styles.txnIconExpense}`}>
                            {txn.type === 'income' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                          </div>
                        </div>
                        <div className={styles.txnInfo}>
                          <div className={styles.txnCategory}>{txn.category}</div>
                          {txn.description && <div className={styles.txnDesc}>{txn.description}</div>}
                          <div className={styles.txnMeta}>
                            <span>{formatRelativeTime(txn.date)}</span>
                            <span className={styles.metaDot} />
                            <span>{txn.addedBy?.fullName || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className={styles.txnRight}>
                          <div className={`${styles.txnAmount} ${txn.type === 'income' ? styles.txnAmountIncome : styles.txnAmountExpense}`}>
                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </div>
                          <span className={`badge ${txn.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                            {txn.type}
                          </span>
                        </div>
                        {canDelete && (
                          <button
                            className={styles.deleteTxnBtn}
                            onClick={() => handleDelete(txn._id)}
                            disabled={deletingId === txn._id}
                            title="Delete"
                          >
                            {deletingId === txn._id ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Trash2 size={13} />}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── SIDEBAR ─── */}
            <div className={styles.sidebar}>
              {/* Payment Settlement Card */}
              <PaymentSettlementCard room={room} hostName={room?.host?.fullName} />

              {/* Members */}
              <div className="card" style={{ padding: 20 }}>
                <h3 className={styles.sideTitle}>Members ({room?.members?.length})</h3>
                <div className={styles.memberList}>
                  {room?.members?.map(m => {
                    const memberIsHost = m.user?._id === room.host?._id;
                    return (
                      <div key={m.user?._id} className={styles.memberRow}>
                        <div className={styles.memberAvatar}>{getInitials(m.user?.fullName)}</div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>{m.user?.fullName}</span>
                          {memberIsHost && <span className="badge badge-host" style={{ fontSize: 10 }}><Crown size={9} /> Host</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Share Room */}
              <div className="card" style={{ padding: 20 }}>
                <h3 className={styles.sideTitle}>Invite Members</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-400)', marginBottom: 14 }}>
                  Share the Room ID to invite others.
                </p>
                <div className={styles.shareRow}>
                  <div className={styles.shareId}>#{room?.roomId}</div>
                  <button className={`btn btn-outline btn-sm`} onClick={copyRoomId}>
                    {copied ? <><Check size={13} />Copied!</> : <><Copy size={13} />Copy</>}
                  </button>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
                  onClick={() => {
                    const msg = encodeURIComponent(`Join my expense room on Expence-Tracker!\nRoom ID: ${room?.roomId}`);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                >
                  <Share2 size={13} /> Share via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAddTxn && (
        <AddTransactionModal
          roomId={roomId}
          onClose={() => setShowAddTxn(false)}
          onAdded={handleTransactionAdded}
        />
      )}
    </div>
  );
}
