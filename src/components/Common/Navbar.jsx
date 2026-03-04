import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/format';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/dashboard" className={styles.brand}>
          <div className={styles.brandIcon}><Wallet size={18} /></div>
          <span className={styles.brandName}>Expence<span>Tracker</span></span>
        </Link>

        <div className={styles.right}>
          <div className={styles.userMenu} onClick={() => setOpen(!open)}>
            <div className={styles.avatar}>{getInitials(user?.fullName)}</div>
            <span className={styles.userName}>{user?.fullName?.split(' ')[0]}</span>
            <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
          </div>

          {open && (
            <>
              <div className={styles.overlay} onClick={() => setOpen(false)} />
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.avatarLg}>{getInitials(user?.fullName)}</div>
                  <div>
                    <div className={styles.dropdownName}>{user?.fullName}</div>
                    <div className={styles.dropdownPhone}>{user?.phone}</div>
                  </div>
                </div>
                <hr className="divider" />
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
