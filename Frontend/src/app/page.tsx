'use client';
import { useState, useEffect } from 'react';
import styles from "./page.module.css";
import Link from "next/link";
import { useGetJobsQuery } from '@/entities/job';
import { useGetUsersStatsQuery, useGetUsersQuery } from '@/entities/user';
import { useGetAnalyticsOverviewQuery } from '@/shared/api/analyticsApi';
import { useAuth } from '@/features/auth';
function AnimatedNumber({ value, isLoading, error }: { value: number; isLoading: boolean; error: unknown }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (isLoading) {
      setDisplayValue(0);
      return;
    }
    if (error) {
      setDisplayValue(0);
      return;
    }
    if (value !== displayValue) {
      setIsAnimating(true);
      const duration = 1000; 
      const steps = 30;
      const stepDuration = duration / steps;
      const increment = (value - displayValue) / steps;
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(displayValue + (increment * currentStep));
        setDisplayValue(newValue);
        if (currentStep >= steps) {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(timer);
        }
      }, stepDuration);
      return () => clearInterval(timer);
    }
  }, [value, isLoading, error, displayValue]);
  if (isLoading) {
    return (
      <div className={styles.statNumber}>
        <div className={styles.loadingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.statNumber}>
        <span className={styles.errorNumber}>—</span>
      </div>
    );
  }
  return (
    <div className={`${styles.statNumber} ${isAnimating ? styles.animating : ''}`}>
      {displayValue.toLocaleString()}
    </div>
  );
}
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usersCount, setUsersCount] = useState(22); 
  const [useFallbackData, setUseFallbackData] = useState(false); 
  const { isAuthenticated, user } = useAuth();
  const { data: jobsData, isLoading, error } = useGetJobsQuery({});
  const { data: internshipsData, isLoading: internshipsLoading, error: internshipsError } = useGetJobsQuery({ type: 'INTERNSHIP' });
  const { data: usersStats, isLoading: usersLoading, error: usersError } = useGetUsersStatsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'ADMIN'
  });
  const { data: usersData, isLoading: usersDataLoading, error: usersDataError } = useGetUsersQuery({ page: 1, limit: 1 }, {
    skip: !isAuthenticated || user?.role !== 'ADMIN'
  });
  const { data: analyticsOverview, isLoading: analyticsLoading, error: analyticsError } = useGetAnalyticsOverviewQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'ADMIN'
  });
  useEffect(() => {
    if (useFallbackData) {
      setUsersCount(22);
      return;
    }
    if (usersStats?.totalUsers && !usersError) {
      setUsersCount(usersStats.totalUsers);
    } else if (analyticsOverview?.overview?.totalUsers && !analyticsError) {
      setUsersCount(analyticsOverview.overview.totalUsers);
    } else if (usersData?.pagination?.total && !usersDataError) {
      setUsersCount(usersData.pagination.total);
    } else {
      setUsersCount(22);
    }
  }, [usersStats, analyticsOverview, usersData, usersError, analyticsError, usersDataError, useFallbackData]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const testAPIs = () => {
    fetch('/admin/analytics/overview')
      .then(response => {
        if (!response.ok) {
          return null; 
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return response.text(); 
      })
      .then(text => {
        if (text === null) {
          return;
        }
        try {
          const data = JSON.parse(text);
        } catch (parseError) {
        }
      })
      .catch(error => {
      });

    fetch('/admin/analytics/users')
      .then(response => {
        if (!response.ok) {
          return null; 
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return response.text();
      })
      .then(text => {
        if (text === null) {
          return;
        }
        try {
          const data = JSON.parse(text);
        } catch (parseError) {
        }
      })
      .catch(error => {
      });

    fetch('/admin/users?page=1&limit=1')
      .then(response => {
        if (!response.ok) {
          return null; 
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        return response.text();
      })
      .then(text => {
        if (text === null) {
          return;
        }
        try {
          const data = JSON.parse(text);
        } catch (parseError) {
        }
      })
      .catch(error => {
      });
  };
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.leftSection}>
              <div className={styles.badge}>
                <svg className={styles.badgeIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
                RaxatJob - твоя карьера начинается здесь
              </div>
              <h1 className={styles.title}>
                Найди работу <span className={styles.gradient}>мечты</span><br />
                уже сегодня
              </h1>
              <p className={styles.description}>
                Платформа нового поколения для поиска работы. Тысячи актуальных вакансий,
                умный поиск по навыкам и персональные рекомендации от ИИ.
              </p>
              <div className={styles.actions}>
                <Link href="/jobs" className={styles.primaryButton}>
                  <span>Найти работу</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="m11 11-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </Link>
                <button className={styles.secondaryButton} onClick={openModal}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="8" y1="5" x2="8" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="8" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Как это работает
                </button>
              </div>
            </div>
            <div className={styles.rightSection}>
              <div className={styles.featuresGrid}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Умный поиск</h3>
                    <p>ИИ подбирает вакансии по навыкам</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M20 8v6M23 11l-3 3-3-3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Профиль кандидата</h3>
                    <p>Создай резюме за 5 минут</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.featureContent}>
                    <h3>Карьерная аналитика</h3>
                    <p>Отслеживай тренды рынка</p>
                  </div>
                </div>
              </div>
              {}
              <div className={styles.stats}>
                <div className={`${styles.stat} ${styles.statPrimary}`}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.statContent}>
                    <AnimatedNumber 
                      value={internshipsData?.total || 5} 
                      isLoading={internshipsLoading} 
                      error={internshipsError} 
                    />
                    <div className={styles.statLabel}>Активных стажировок</div>
                  </div>
                </div>
                <div className={`${styles.stat} ${styles.statPrimary}`}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.statContent}>
                    <AnimatedNumber 
                      value={jobsData?.total || 10} 
                      isLoading={isLoading} 
                      error={error} 
                    />
                    <div className={styles.statLabel}>Активных вакансий</div>
                  </div>
                </div>
                <div className={`${styles.stat} ${styles.statPrimary}`}>
                  <div className={styles.statIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M20 8v6M23 11l-3 3-3-3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.statContent}>
                    <AnimatedNumber 
                      value={usersCount} 
                      isLoading={usersLoading || usersDataLoading || analyticsLoading} 
                      error={usersError || usersDataError || analyticsError} 
                    />
                    <div className={styles.statLabel}>Пользователей</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Как найти идеальную работу</h2>
              <button className={styles.closeButton} onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>    
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <div className={styles.modalFeature}>
                  <div className={styles.modalFeatureIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className={styles.modalFeatureContent}>
                    <h3>Умный поиск вакансий</h3>
                    <p>Наш ИИ анализирует ваше резюме и навыки, предлагая наиболее подходящие вакансии. Система учитывает не только требования, но и культуру компании, карьерные перспективы и ваши предпочтения по зарплате и локации.</p>
                  </div>
                </div>
                <div className={styles.modalFeature}>
                  <div className={styles.modalFeatureIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M20 8v6M23 11l-3 3-3-3" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.modalFeatureContent}>
                    <h3>Персональный профиль</h3>
                    <p>Создайте профессиональное резюме за несколько минут. Наша платформа поможет выделить ключевые навыки, опыт и достижения, а также оптимизирует профиль для алгоритмов поиска работодателей.</p>
                  </div>
                </div>
                <div className={styles.modalFeature}>
                  <div className={styles.modalFeatureIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className={styles.modalFeatureContent}>
                    <h3>Карьерная аналитика</h3>
                    <p>Получайте актуальную статистику рынка труда: зарплатные ожидания по профессиям, востребованные навыки, тренды индустрии. Планируйте карьерный рост на основе данных.</p>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <div className={styles.modalCTA}>
                  <h3>Готовы найти работу мечты?</h3>
                  <p>Присоединяйтесь к тысячам успешных кандидатов и найдите идеальную вакансию уже сегодня</p>
                  <Link href="/jobs" className={styles.modalButton} onClick={closeModal}>
                    Найти работу
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
