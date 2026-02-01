'use client';
import React from 'react';
import Link from 'next/link';
import styles from './HRDashboard.module.css';
const HRDashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>HR Панель</h2>
        <p className={styles.subtitle}>Управление откликами на стажировки и вакансии</p>
      </div>
      <div className={styles.actions}>
        <Link href="/hr" className={styles.primaryButton}>
          <span className={styles.buttonIcon}>📋</span>
          Все заявки
        </Link>
      </div>
    </div>
  );
};
export default HRDashboard;
