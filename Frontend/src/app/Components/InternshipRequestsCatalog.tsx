'use client';

import React, { useState } from 'react';
import { 
  useGetPublicInternshipRequestsQuery,
  useRespondToInternshipRequestMutation 
} from '@/lib/api/internshipRequestsApi';
import styles from './InternshipRequestsCatalog.module.css';

interface InternshipRequestsCatalogProps {
  onRespond?: (requestId: string) => void;
}

const InternshipRequestsCatalog: React.FC<InternshipRequestsCatalogProps> = ({ 
  onRespond 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    location: '',
    isRemote: undefined as boolean | undefined,
    page: 1,
  });

  const [showResponseForm, setShowResponseForm] = useState<string | null>(null);
  const [responseData, setResponseData] = useState({
    message: '',
    contactEmail: '',
  });

  const { data: requestsData, isLoading, error, refetch } = useGetPublicInternshipRequestsQuery(filters);
  const [respondToRequest, { isLoading: isResponding }] = useRespondToInternshipRequestMutation();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleResponseSubmit = async (requestId: string) => {
    try {
      await respondToRequest({
        internshipRequestId: requestId,
        message: responseData.message,
        contactEmail: responseData.contactEmail,
      }).unwrap();
      
      setShowResponseForm(null);
      setResponseData({ message: '', contactEmail: '' });
      onRespond?.(requestId);
    } catch (err) {
      console.error('Failed to respond to internship request:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialty: '',
      location: '',
      isRemote: undefined,
      page: 1,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Каталог заявок на стажировки</h2>
        <p className={styles.subtitle}>
          Найдите подходящие заявки на стажировки от университетов
        </p>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Поиск</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={styles.filterInput}
              placeholder="Поиск по описанию или требованиям"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Специальность</label>
            <input
              type="text"
              value={filters.specialty}
              onChange={(e) => handleFilterChange('specialty', e.target.value)}
              className={styles.filterInput}
              placeholder="Например: Информатика"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Локация</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className={styles.filterInput}
              placeholder="Например: Москва"
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Тип работы</label>
            <select
              value={filters.isRemote === undefined ? '' : filters.isRemote.toString()}
              onChange={(e) => handleFilterChange('isRemote', e.target.value === '' ? undefined : e.target.value === 'true')}
              className={styles.filterSelect}
            >
              <option value="">Все</option>
              <option value="true">Удаленно</option>
              <option value="false">В офисе</option>
            </select>
          </div>

          <button onClick={clearFilters} className={styles.clearFiltersButton}>
            Очистить
          </button>
        </div>
      </div>

      {/* Результаты */}
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка заявок...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h3>Ошибка загрузки</h3>
            <p>Не удалось загрузить заявки. Попробуйте обновить страницу.</p>
            <button onClick={() => refetch()} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : !requestsData?.requests || requestsData.requests.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>Заявки не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className={styles.requestsList}>
            {requestsData.requests.map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.requestHeader}>
                  <div className={styles.requestInfo}>
                    <h3 className={styles.requestTitle}>{request.specialty}</h3>
                    <p className={styles.requestDetails}>
                      {request.studentCount} студентов • {request.period} • {request.location}
                      {request.isRemote && ' • Удаленно'}
                    </p>
                    <p className={styles.universityInfo}>
                      Университет: {request.university.name}
                    </p>
                  </div>
                  <div className={styles.requestActions}>
                    <button
                      onClick={() => setShowResponseForm(request.id)}
                      className={styles.respondButton}
                    >
                      Откликнуться
                    </button>
                  </div>
                </div>

                <div className={styles.requestContent}>
                  <div className={styles.requestDescription}>
                    <h4>Описание:</h4>
                    <p>{request.description}</p>
                  </div>

                  <div className={styles.requestRequirements}>
                    <h4>Требования:</h4>
                    <p>{request.requirements}</p>
                  </div>

                  {request.skills && request.skills.length > 0 && (
                    <div className={styles.requestSkills}>
                      <h4>Навыки:</h4>
                      <div className={styles.skillsList}>
                        {request.skills.map((skill, index) => (
                          <span key={index} className={styles.skillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.requestDates}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Начало:</span>
                      <span className={styles.dateValue}>
                        {formatDate(request.startDate)}
                      </span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Окончание:</span>
                      <span className={styles.dateValue}>
                        {formatDate(request.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Форма отклика */}
      {showResponseForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Отклик на заявку</h3>
              <button
                onClick={() => setShowResponseForm(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Контактный email *</label>
                <input
                  type="email"
                  value={responseData.contactEmail}
                  onChange={(e) => setResponseData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className={styles.formInput}
                  placeholder="your-email@company.com"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Сообщение *</label>
                <textarea
                  value={responseData.message}
                  onChange={(e) => setResponseData(prev => ({ ...prev, message: e.target.value }))}
                  className={styles.formTextarea}
                  placeholder="Расскажите о вашей компании и условиях стажировки"
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowResponseForm(null)}
                className={styles.cancelButton}
                disabled={isResponding}
              >
                Отмена
              </button>
              <button
                onClick={() => handleResponseSubmit(showResponseForm)}
                className={styles.submitButton}
                disabled={!responseData.contactEmail || !responseData.message || isResponding}
              >
                {isResponding ? 'Отправка...' : 'Отправить отклик'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipRequestsCatalog;
