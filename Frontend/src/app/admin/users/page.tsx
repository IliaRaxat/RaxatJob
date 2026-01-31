'use client';


import { useState, useEffect, useRef } from 'react';
import styles from './users.module.css';
import { 
  useGetUsersQuery, 
  useGetUsersStatsQuery,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useBulkToggleStatusMutation,
  useBulkDeleteUsersMutation,
  User,
  UsersParams
} from '../../../lib/api/usersApi';

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

function CustomSelect({ options, value, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.selectContainer} ref={selectRef}>
      <button
        className={`${styles.selectButton} ${isOpen ? styles.selectOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {options.find(opt => opt.value === value)?.label || options[0].label}
        <svg 
          className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isOpen && (
        <div className={styles.selectDropdown}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.selectOption} ${option.value === value ? styles.selectOptionActive : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  const [filter, setFilter] = useState<'ALL' | 'CANDIDATE' | 'HR' | 'UNIVERSITY' | 'ADMIN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // API параметры
  const usersParams: UsersParams = {
    role: filter === 'ALL' ? undefined : filter,
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm || undefined,
  };

  // Отладочная информация
  console.log('🔍 Users Search Debug:', {
    searchTerm,
    debouncedSearchTerm,
    usersParams
  });

  // API хуки
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useGetUsersQuery(usersParams);

  // Отладочная информация для API
  console.log('🔍 Users API Debug:', {
    usersData,
    isLoading: usersLoading,
    error: usersError
  });

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useGetUsersStatsQuery();

  // Мутации
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [bulkToggleStatus] = useBulkToggleStatusMutation();
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();

  // Fallback данные для тестирования
  const fallbackUsers: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      role: 'CANDIDATE',
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      candidateProfile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    {
      id: '2',
      email: 'hr@techcorp.com',
      role: 'HR',
      isActive: true,
      lastLogin: '2024-01-14T15:20:00Z',
      createdAt: '2023-12-15T00:00:00Z',
      hrProfile: {
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'TechCorp'
      }
    },
    {
      id: '3',
      email: 'university@msu.ru',
      role: 'UNIVERSITY',
      isActive: false,
      lastLogin: null,
      createdAt: '2023-11-01T00:00:00Z',
      universityProfile: {
        name: 'МГУ',
        address: 'Москва, Ленинские горы, 1'
      }
    }
  ];

  // Клиентская фильтрация для fallback данных
  const filteredFallbackUsers = fallbackUsers.filter(user => {
    const matchesRole = filter === 'ALL' || user.role === filter;
    const matchesSearch = !debouncedSearchTerm || 
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (user.hrProfile && 
        (`${user.hrProfile.firstName} ${user.hrProfile.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
         user.hrProfile.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))) ||
      (user.candidateProfile && 
        `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (user.universityProfile && 
        (user.universityProfile.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
         user.universityProfile.address.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
    
    return matchesRole && matchesSearch;
  });

  const users = usersData?.users || filteredFallbackUsers;
  const stats = statsData || {
    totalUsers: fallbackUsers.length,
    activeUsers: fallbackUsers.filter(u => u.isActive).length,
    newUsers: 1,
    usersByRole: [
      { role: 'CANDIDATE', _count: 1 },
      { role: 'HR', _count: 1 },
      { role: 'UNIVERSITY', _count: 1 }
    ]
  };
  const loading = usersLoading || statsLoading;

  const roleOptions = [
    { value: 'ALL', label: 'Все роли' },
    { value: 'CANDIDATE', label: 'Кандидаты' },
    { value: 'HR', label: 'HR' },
    { value: 'UNIVERSITY', label: 'Университеты' },
    { value: 'ADMIN', label: 'Администраторы' }
  ];

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      if (action === 'delete') {
        await deleteUser(userId).unwrap();
      } else {
        await toggleUserStatus({ 
          userId, 
          isActive: action === 'activate' 
        }).unwrap();
      }
      
      refetchUsers();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) return;
    
    try {
      if (action === 'delete') {
        await bulkDeleteUsers(selectedUsers).unwrap();
      } else {
        await bulkToggleStatus({ 
          userIds: selectedUsers, 
          isActive: action === 'activate' 
        }).unwrap();
      }
      
      setSelectedUsers([]);
      refetchUsers();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Никогда';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getRoleBadgeClass = (role: string) => {
    const roleClasses = {
      'CANDIDATE': styles.roleBadgeCandidate,
      'HR': styles.roleBadgeHr,
      'UNIVERSITY': styles.roleBadgeUniversity,
      'ADMIN': styles.roleBadgeAdmin,
      'MODERATOR': styles.roleBadgeModerator
    };
    return `${styles.roleBadge} ${roleClasses[role as keyof typeof roleClasses] || roleClasses.CANDIDATE}`;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      'CANDIDATE': 'Кандидат',
      'HR': 'HR',
      'UNIVERSITY': 'Университет',
      'ADMIN': 'Администратор',
      'MODERATOR': 'Модератор'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getUserDisplayName = (user: User) => {
    if (user.hrProfile) {
      return `${user.hrProfile.firstName} ${user.hrProfile.lastName}`;
    }
    if (user.candidateProfile) {
      return `${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`;
    }
    if (user.universityProfile) {
      return user.universityProfile.name;
    }
    return user.email;
  };

  const getUserOrganization = (user: User) => {
    if (user.hrProfile) {
      return user.hrProfile.company;
    }
    if (user.universityProfile) {
      return user.universityProfile.address;
    }
    return null;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && usersData && newPage <= usersData.pagination.totalPages) {
      setCurrentPage(newPage);
      setSelectedUsers([]);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          <h3>Ошибка загрузки данных</h3>
          <p>Не удалось загрузить список пользователей. Попробуйте обновить страницу.</p>
          <button 
            onClick={() => refetchUsers()}
            className={styles.retryBtn}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero секция */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Управление <span className={styles.highlight}>пользователями</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Управление пользователями, их ролями и активностью на платформе
          </p>
          
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск по email, имени, компании..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19 19L13 13L19 19ZM15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className={styles.filters}>
              <CustomSelect
                options={roleOptions}
                value={filter}
                onChange={(value) => setFilter(value as 'ALL' | 'CANDIDATE' | 'HR' | 'UNIVERSITY' | 'ADMIN')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className={styles.bulkActions}>
          <div className={styles.bulkActionsContent}>
            <span>Выбрано пользователей: {selectedUsers.length}</span>
            <div className={styles.bulkButtons}>
              <button
                onClick={() => handleBulkAction('activate')}
                className={styles.bulkBtn}
              >
                Активировать
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className={styles.bulkBtn}
              >
                Деактивировать
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Результаты */}
      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>Найдено {users.length} пользователей</h2>
          {stats && (
            <div className={styles.statsInfo}>
              <span>Всего: {stats.totalUsers}</span>
              <span>Активных: {stats.activeUsers}</span>
              <span>Новых: {stats.newUsers}</span>
            </div>
          )}
        </div>

        <div className={styles.usersGrid}>
          {users.map((user) => (
            <article key={user.id} className={styles.userCard}>
              <div className={styles.userCardHeader}>
                <div className={styles.userCardTitle}>
                  <h3>{getUserDisplayName(user)}</h3>
                  <div className={styles.userCardMeta}>
                    <span className={styles.userEmail}>{user.email}</span>
                    {getUserOrganization(user) && (
                      <>
                        <span className={styles.separator}>•</span>
                        <span className={styles.userOrganization}>{getUserOrganization(user)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.userCardCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                </div>
              </div>

              <div className={styles.userTags}>
                <span className={getRoleBadgeClass(user.role)}>
                  {getRoleLabel(user.role)}
                </span>
                <span className={`${styles.statusBadge} ${user.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
                  {user.isActive ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              <div className={styles.userCardFooter}>
                <div className={styles.userDates}>
                  <span>Регистрация: {formatDate(user.createdAt)}</span>
                  <span>Последний вход: {formatDate(user.lastLogin)}</span>
                </div>
                
                {user.role !== 'ADMIN' && (
                  <div className={styles.userActions}>
                    <button
                      onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                      className={styles.actionBtn}
                    >
                      {user.isActive ? 'Деактивировать' : 'Активировать'}
                    </button>
                    <button
                      onClick={() => handleUserAction(user.id, 'delete')}
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {users.length === 0 && (
          <div className={styles.noResults}>
            <h3>Пользователи не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {usersData?.pagination && usersData.pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={styles.paginationBtn}
          >
            Назад
          </button>
          
          <span className={styles.paginationInfo}>
            Страница {currentPage} из {usersData.pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= usersData.pagination.totalPages}
            className={styles.paginationBtn}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}