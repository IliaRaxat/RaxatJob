'use client';

import { useState, useRef, useEffect } from 'react';
import {
  useGetModerationJobsQuery,
  useApproveJobMutation,
  useRejectJobMutation,
  useReturnJobMutation,
  useBulkApproveJobsMutation,
  useBulkRejectJobsMutation,
  useGetModerationStatsQuery,
  // useGetModerationHistoryQuery, // Для будущего использования
  ModerationJobsParams,
} from '../../../lib/api/analyticsApi';
import styles from './moderation.module.css';

// Типы теперь импортируются из API файла

export default function ModerationPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Параметры для API запросов
  const params: ModerationJobsParams = {
    status: filter,
    page,
    limit,
    ...(searchQuery && { search: searchQuery }),
  };

  // RTK Query хуки для данных модерации
  const { data: moderationData, isLoading, error, refetch } = useGetModerationJobsQuery(params);
  const { data: statsData } = useGetModerationStatsQuery();
  // const { data: historyData } = useGetModerationHistoryQuery({ limit: 10 }); // Для будущего использования
  
  // Мутации для действий с вакансиями
  const [approveJob] = useApproveJobMutation();
  const [rejectJob] = useRejectJobMutation();
  const [returnJob] = useReturnJobMutation();
  const [bulkApproveJobs] = useBulkApproveJobsMutation();
  const [bulkRejectJobs] = useBulkRejectJobsMutation();

  // Закрытие дропдауна и модалки при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsBulkModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Закрытие модалки по Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBulkModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Автоматическое закрытие модалки при отсутствии выбранных вакансий
  useEffect(() => {
    if (selectedJobs.length === 0 && isBulkModalOpen) {
      setIsBulkModalOpen(false);
    }
  }, [selectedJobs.length, isBulkModalOpen]);

  // Обработка действий с отдельной вакансией
  const handleJobAction = async (jobId: string, action: 'approve' | 'reject' | 'return', notes?: string) => {
    setActionLoading(jobId);
    
    try {
      let result;
      
      switch (action) {
        case 'approve':
          result = await approveJob({ jobId, notes }).unwrap();
          console.log('✅ Вакансия одобрена:', result);
          break;
        case 'reject':
          result = await rejectJob({ jobId, notes }).unwrap();
          console.log('❌ Вакансия отклонена:', result);
          break;
        case 'return':
          result = await returnJob({ jobId, notes }).unwrap();
          console.log('🔄 Вакансия возвращена на доработку:', result);
          break;
      }
      
      // Обновляем данные после успешного действия
      refetch();
    } catch (error) {
      console.error('❌ Ошибка при выполнении действия:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Обработка массовых действий
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedJobs.length === 0) return;
    
    setActionLoading('bulk');
    
    try {
      let result;
      
      if (action === 'approve') {
        result = await bulkApproveJobs({ jobIds: selectedJobs }).unwrap();
        console.log(`✅ Одобрено ${selectedJobs.length} вакансий:`, result);
      } else {
        result = await bulkRejectJobs({ jobIds: selectedJobs }).unwrap();
        console.log(`❌ Отклонено ${selectedJobs.length} вакансий:`, result);
      }
      
      // Очищаем выбор и обновляем данные
      setSelectedJobs([]);
      refetch();
    } catch (error) {
      console.error('❌ Ошибка при массовом действии:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Утилиты
  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return `${styles.badge} ${styles.badgePending}`;
      case 'APPROVED':
        return `${styles.badge} ${styles.badgeApproved}`;
      case 'REJECTED':
        return `${styles.badge} ${styles.badgeRejected}`;
      case 'RETURNED':
        return `${styles.badge} ${styles.badgeReturned}`;
      default:
        return `${styles.badge} ${styles.badgePending}`;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'На модерации';
      case 'APPROVED':
        return 'Одобрена';
      case 'REJECTED':
        return 'Отклонена';
      case 'RETURNED':
        return 'Возвращена';
      default:
        return status;
    }
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setPage(1);
    setSelectedJobs([]);
    setIsFilterOpen(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setSelectedJobs([]);
  };

  const getFilterLabel = (filterValue: typeof filter) => {
    switch (filterValue) {
      case 'PENDING':
        return 'На модерации';
      case 'APPROVED':
        return 'Одобренные';
      case 'REJECTED':
        return 'Отклоненные';
      case 'DRAFT':
        return 'Черновики';
      default:
        return 'Все статусы';
    }
  };

  const filterOptions = [
    { value: 'PENDING' as const, label: 'На модерации' },
    { value: 'APPROVED' as const, label: 'Одобренные' },
    { value: 'REJECTED' as const, label: 'Отклоненные' },
    { value: 'DRAFT' as const, label: 'Черновики' },
  ];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && moderationData && newPage <= moderationData.totalPages) {
      setPage(newPage);
      setSelectedJobs([]);
    }
  };

  // Состояния загрузки и ошибок
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных модерации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>Ошибка загрузки данных</h3>
          <p>Не удалось загрузить данные модерации. Попробуйте обновить страницу.</p>
          <button onClick={() => refetch()} className={styles.refreshButton}>
            🔄 Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>
                <span className={styles.highlight}>Модерация</span> вакансий
              </h1>
              <p className={styles.subtitle}>
                Управление и модерация вакансий на платформе SmartMatch
              </p>
            </div>
            <div className={styles.headerActions}>
              <button
                onClick={() => refetch()}
                className={styles.refreshButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 4V10H9M21 20V14H15M20.49 9A9 9 0 0 0 5.64 5.64L3 9M1.51 15A9 9 0 0 0 18.36 18.36L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {isLoading ? 'Обновление...' : 'Обновить'}
              </button>
              <div className={styles.headerIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Stats */}
        {statsData && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.total.pending}</div>
              <div className={styles.statLabel}>На модерации</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.total.approved}</div>
              <div className={styles.statLabel}>Одобрено</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.total.rejected}</div>
              <div className={styles.statLabel}>Отклонено</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.total.returned}</div>
              <div className={styles.statLabel}>Возвращено</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.today.pending}</div>
              <div className={styles.statLabel}>Сегодня</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{statsData.thisWeek.pending}</div>
              <div className={styles.statLabel}>На неделе</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filtersCard}>
          <div className={styles.filters}>
            {/* Поиск */}
            <div className={styles.searchContainer}>
              <div className={styles.searchInputWrapper}>
                <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию, компании..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className={styles.searchClear}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <span className={styles.filterLabel}>Статус:</span>
            
            {/* Кастомный дропдаун */}
            <div className={styles.customStatusSelect} ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`${styles.statusSelectButton} ${isFilterOpen ? styles.statusSelectButtonOpen : ''}`}
                disabled={isLoading}
              >
                <span className={styles.statusSelectText}>{getFilterLabel(filter)}</span>
                <svg 
                  className={`${styles.statusSelectIcon} ${isFilterOpen ? styles.statusSelectIconOpen : ''}`}
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {isFilterOpen && (
                <div className={styles.statusSelectDropdown}>
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`${styles.statusSelectOption} ${filter === option.value ? styles.statusSelectOptionActive : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {moderationData && (
              <span style={{ fontSize: '0.875rem', color: '#555' }}>
                Показано {moderationData.jobs.length} из {moderationData.total} вакансий
              </span>
            )}
          </div>
        </div>

        {/* Floating Bulk Actions Button */}
        {selectedJobs.length > 0 && (
          <div className={styles.floatingBulkButton}>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className={styles.bulkActionsTrigger}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Выбрано {selectedJobs.length}</span>
              <div className={styles.bulkActionsPreview}>
                <button className={styles.previewButton}>✓</button>
                <button className={styles.previewButton}>✕</button>
              </div>
            </button>
          </div>
        )}

        {/* Bulk Actions Modal */}
        {isBulkModalOpen && selectedJobs.length > 0 && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} ref={modalRef}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Массовые действия
                </div>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className={styles.modalCloseButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.modalInfo}>
                  <div className={styles.modalInfoIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.modalInfoText}>
                    <h3>Выбрано {selectedJobs.length} {selectedJobs.length === 1 ? 'вакансия' : selectedJobs.length < 5 ? 'вакансии' : 'вакансий'}</h3>
                    <p>Выберите действие, которое хотите применить ко всем выбранным вакансиям</p>
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button
                    onClick={() => handleBulkAction('approve')}
                    disabled={actionLoading === 'bulk'}
                    className={`${styles.modalButton} ${styles.modalButtonApprove}`}
                  >
                    {actionLoading === 'bulk' ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    <span>Одобрить все</span>
                  </button>
                  
                  <button
                    onClick={() => handleBulkAction('reject')}
                    disabled={actionLoading === 'bulk'}
                    className={`${styles.modalButton} ${styles.modalButtonReject}`}
                  >
                    {actionLoading === 'bulk' ? (
                      <div className={styles.spinner}></div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    <span>Отклонить все</span>
                  </button>
                </div>
                
                <div className={styles.modalFooter}>
                  <button
                    onClick={() => {
                      setSelectedJobs([]);
                      setIsBulkModalOpen(false);
                    }}
                    className={styles.modalCancelButton}
                  >
                    Отменить выбор
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className={styles.jobsGrid}>
          {moderationData && moderationData.jobs && moderationData.jobs.length > 0 ? (
            moderationData.jobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobCardHeader}>
                  <div className={styles.jobCardLeft}>
                    <div className={styles.jobCheckbox}>
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                      />
                    </div>
                    <div className={styles.jobInfo}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <p className={styles.jobCompany}>
                        {job.hr?.company || 'Неизвестная компания'} • {job.hr?.firstName} {job.hr?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className={styles.jobCardRight}>
                    <span className={getStatusBadge(filter)}>
                      {getStatusLabel(filter)}
                    </span>
                    <span className={styles.jobDate}>
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>
                
                <p className={styles.jobDescription}>
                  {job.description && job.description.length > 200 
                    ? `${job.description.substring(0, 200)}...` 
                    : job.description || 'Описание не указано'
                  }
                </p>
                
                <div className={styles.jobSkills}>
                  {job.skills?.map((skillItem, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skillItem.skill?.name || 'Неизвестный навык'}
                    </span>
                  )) || []}
                </div>
                
                <div className={styles.jobFooter}>
                  <div className={styles.jobMeta}>
                    <span>{job._count?.applications || 0} откликов</span>
                  </div>
                  
                  {filter === 'PENDING' && (
                    <div className={styles.jobActions}>
                      <button
                        onClick={() => handleJobAction(job.id, 'approve')}
                        disabled={actionLoading === job.id}
                        className={`${styles.actionButton} ${styles.actionButtonApprove}`}
                      >
                        {actionLoading === job.id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        Одобрить
                      </button>
                      <button
                        onClick={() => handleJobAction(job.id, 'reject')}
                        disabled={actionLoading === job.id}
                        className={`${styles.actionButton} ${styles.actionButtonReject}`}
                      >
                        {actionLoading === job.id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        Отклонить
                      </button>
                      <button
                        onClick={() => handleJobAction(job.id, 'return')}
                        disabled={actionLoading === job.id}
                        className={`${styles.actionButton} ${styles.actionButtonReturn}`}
                      >
                        {actionLoading === job.id ? (
                          <div className={styles.spinner}></div>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12H21M3 12L7 8M3 12L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        Вернуть
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Нет вакансий</h3>
              <p>
                {filter === 'PENDING' 
                  ? 'Все вакансии обработаны или еще не отправлены на модерацию'
                  : `Нет ${getStatusLabel(filter).toLowerCase()} вакансий`
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {moderationData && moderationData.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={styles.paginationButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {Array.from({ length: moderationData.totalPages }, (_, i) => i + 1)
              .filter(p => {
                if (moderationData.totalPages <= 7) return true;
                if (p === 1 || p === moderationData.totalPages) return true;
                if (p >= page - 1 && p <= page + 1) return true;
                return false;
              })
              .map((p, index, arr) => {
                const shouldShowEllipsis = index > 0 && arr[index - 1] !== p - 1;
                return (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {shouldShowEllipsis && <span style={{ color: '#999' }}>...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`${styles.paginationButton} ${page === p ? styles.paginationButtonActive : ''}`}
                    >
                      {p}
                    </button>
                  </div>
                );
              })
            }
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!moderationData || page >= moderationData.totalPages}
              className={styles.paginationButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
