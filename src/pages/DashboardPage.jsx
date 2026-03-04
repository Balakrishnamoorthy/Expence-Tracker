import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Hash, Users, TrendingUp, TrendingDown, ArrowRight, Home, RefreshCw } from 'lucide-react';
import Navbar from '../components/Common/Navbar';
import CreateRoomModal from '../components/Room/CreateRoomModal';
import JoinRoomModal from '../components/Room/JoinRoomModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { formatCurrency, formatDate, getInitials } from '../utils/format';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.rooms);
    } catch {
      toast.error('Failed to load rooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleRoomCreated = (room) => {
    setRooms(prev => [{ ...room, stats: { income: 0, expense: 0, balance: 0 } }, ...prev]);
    toast.success(`Room "${room.name}" created!`);
  };

  const handleRoomJoined = (room) => {
    setRooms(prev => {
      if (prev.find(r => r._id === room._id)) return prev;
      return [{ ...room, stats: { income: 0, expense: 0, balance: 0 } }, ...prev];
    });
    toast.success(`Joined "${room.name}"!`);
  };

  const totalRooms = rooms.length;
  const totalBalance = rooms.reduce((sum, r) => sum + (r.stats?.balance || 0), 0);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* ─── HERO ─── */}
          <div className={styles.hero}>
            <div>
              <h1 className={styles.heroTitle}>
                Hey, {user?.fullName?.split(' ')[0]} 👋
              </h1>
              <p className={styles.heroSub}>Manage your shared expense rooms below.</p>
            </div>
            <div className={styles.heroBtns}>
              <button className="btn btn-outline" onClick={() => setShowJoin(true)}>
                <Hash size={16} />
                Join Room
              </button>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={16} />
                Create Room
              </button>
            </div>
          </div>

          {/* ─── STAT STRIP ─── */}
          <div className={styles.statStrip}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{totalRooms}</span>
              <span className={styles.statLabel}>Rooms</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${totalBalance >= 0 ? styles.green : styles.red}`}>
                {formatCurrency(totalBalance)}
              </span>
              <span className={styles.statLabel}>Net Balance</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statValue}>{rooms.filter(r => r.host?._id === user?._id || r.host === user?._id).length}</span>
              <span className={styles.statLabel}>Hosted</span>
            </div>
            <button className={`btn btn-ghost btn-sm ${styles.refreshBtn}`} onClick={fetchRooms} title="Refresh">
              <RefreshCw size={14} />
            </button>
          </div>

          {/* ─── ROOMS GRID ─── */}
          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3].map(i => (
                <div key={i} className={`card ${styles.skeletonCard}`}>
                  <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 24 }} />
                  <div className="skeleton" style={{ height: 60, borderRadius: 10 }} />
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className={`card ${styles.emptyCard}`}>
              <div className="empty-state">
                <div className="empty-state-icon"><Home size={30} /></div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No rooms yet</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-400)', maxWidth: 280 }}>
                    Create a room to start tracking shared expenses, or join an existing one.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-outline" onClick={() => setShowJoin(true)}>
                    <Hash size={15} /> Join Room
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={15} /> Create Room
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {rooms.map((room, i) => {
                const isHost = room.host?._id === user?._id || room.host === user?._id;
                const stats = room.stats || { income: 0, expense: 0, balance: 0 };
                return (
                  <div
                    key={room._id}
                    className={`card card-hover ${styles.roomCard} animate-fade-in`}
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => navigate(`/room/${room.roomId}`)}
                  >
                    <div className={styles.roomCardHeader}>
                      <div className={styles.roomAvatar}>
                        {getInitials(room.name)}
                      </div>
                      <div className={styles.roomMeta}>
                        <h3 className={styles.roomName}>{room.name}</h3>
                        <div className={styles.roomInfo}>
                          <span className={`badge ${isHost ? 'badge-host' : 'badge-member'}`}>
                            {isHost ? '★ Host' : 'Member'}
                          </span>
                          <span className={styles.roomId}>#{room.roomId}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className={styles.roomArrow} />
                    </div>

                    <div className={styles.roomStats}>
                      <div className={styles.roomStat}>
                        <TrendingUp size={13} style={{ color: 'var(--emerald)' }} />
                        <span className={styles.roomStatLabel}>Income</span>
                        <span className={`${styles.roomStatValue} ${styles.green}`}>{formatCurrency(stats.income)}</span>
                      </div>
                      <div className={styles.roomStat}>
                        <TrendingDown size={13} style={{ color: 'var(--rose)' }} />
                        <span className={styles.roomStatLabel}>Expense</span>
                        <span className={`${styles.roomStatValue} ${styles.red}`}>{formatCurrency(stats.expense)}</span>
                      </div>
                    </div>

                    <div className={styles.roomBalance}>
                      <span className={styles.roomBalanceLabel}>Net Balance</span>
                      <span className={`${styles.roomBalanceValue} ${stats.balance >= 0 ? styles.green : styles.red}`}>
                        {stats.balance >= 0 ? '+' : ''}{formatCurrency(stats.balance)}
                      </span>
                    </div>

                    <div className={styles.roomFooter}>
                      <div className={styles.memberPills}>
                        {room.members?.slice(0, 4).map(m => (
                          <div key={m.user?._id || m.user} className={styles.memberPill} title={m.user?.fullName}>
                            {getInitials(m.user?.fullName)}
                          </div>
                        ))}
                        {room.members?.length > 4 && (
                          <div className={styles.memberPill}>+{room.members.length - 4}</div>
                        )}
                      </div>
                      <span className={styles.roomDate}>{formatDate(room.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
        />
      )}
      {showJoin && (
        <JoinRoomModal
          onClose={() => setShowJoin(false)}
          onJoined={handleRoomJoined}
        />
      )}
    </div>
  );
}
