'use client';
import React, { useState } from 'react';
import { 
  useGetMyApplicationsQuery, 
  useUpdateApplicationStatusMutation,
  DetailedApplication 
} from '@/entities/job';
import styles from './JobApplicationsPanel.module.css';
interface JobApplicationsPanelProps {
  onClose?: () => void;
}
const JobApplicationsPanel: React.FC<JobApplicationsPanelProps> = ({ onClose }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    jobId: 'all',
  });
  const [selectedApplication, setSelectedApplication] = useState<DetailedApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [notes, setNotes] = useState('');
  const { data: applications, isLoading, error, refetch } = useGetMyApplicationsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const handleStatusUpdate = async (applicationId: string, newStatus: 'ACCEPTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'HIRED') => {
    try {
      await updateStatus({ 
        applicationId, 
        status: newStatus, 
        notes: notes.trim() || undefined 
      }).unwrap();
      setShowDetailsModal(false);
      setNotes('');
    } catch (err) {
          }
  };
  const handleShowDetails = (application: DetailedApplication) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b';
      case 'ACCEPTED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      case 'INTERVIEW_SCHEDULED':
        return '#3b82f6';
      case 'HIRED':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'На рассмотрении';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      case 'INTERVIEW_SCHEDULED':
        return 'Собеседование назначено';
      case 'HIRED':
        return 'Нанят';
      default:
        return status;
    }
  };
  const filteredApplications = applications?.filter(application => {
    const matchesSearch = 
      application.candidate.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      application.candidate.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      application.candidate.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      application.job.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = filters.status === 'all' || application.status === filters.status;
    const matchesJob = filters.jobId === 'all' || application.job.id === filters.jobId;
    return matchesSearch && matchesStatus && matchesJob;
  }) || [];
  const uniqueJobs = applications?.reduce((acc, app) => {
    if (!acc.find(job => job.id === app.job.id)) {
      acc.push(app.job);
    }
    return acc;
  }, [] as any[]) || [];
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка откликов на вакансии...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить отклики на вакансии. Попробуйте обновить страницу.</p>
          <button onClick={() => refetch()} className={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Отклики на мои вакансии</h1>
          <p className={styles.subtitle}>
            Управляйте откликами кандидатов на ваши вакансии
          </p>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      {}
      {applications && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{applications.length}</div>
            <div className={styles.statLabel}>Всего откликов</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#f59e0b' }}>
              {applications.filter(a => a.status === 'PENDING').length}
            </div>
            <div className={styles.statLabel}>На рассмотрении</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#10b981' }}>
              {applications.filter(a => a.status === 'ACCEPTED').length}
            </div>
            <div className={styles.statLabel}>Принято</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#3b82f6' }}>
              {applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length}
            </div>
            <div className={styles.statLabel}>Собеседования</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#8b5cf6' }}>
              {applications.filter(a => a.status === 'HIRED').length}
            </div>
            <div className={styles.statLabel}>Нанято</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber} style={{ color: '#ef4444' }}>
              {applications.filter(a => a.status === 'REJECTED').length}
            </div>
            <div className={styles.statLabel}>Отклонено</div>
          </div>
        </div>
      )}
      {}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск по имени, email, вакансии..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.statusFilter}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.statusSelect}
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">На рассмотрении</option>
            <option value="ACCEPTED">Принятые</option>
            <option value="REJECTED">Отклоненные</option>
            <option value="INTERVIEW_SCHEDULED">Собеседования</option>
            <option value="HIRED">Нанятые</option>
          </select>
        </div>
        <div className={styles.jobFilter}>
          <select
            value={filters.jobId}
            onChange={(e) => handleFilterChange('jobId', e.target.value)}
            className={styles.jobSelect}
          >
            <option value="all">Все вакансии</option>
            {uniqueJobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      {}
      <div className={styles.applicationsList}>
        {filteredApplications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>Нет откликов</h3>
            <p>Отклики кандидатов на ваши вакансии появятся здесь</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className={styles.applicationCard}>
              <div className={styles.applicationHeader}>
                <div className={styles.applicationInfo}>
                  <h3 className={styles.candidateName}>
                    {application.candidate.firstName} {application.candidate.lastName}
                  </h3>
                  <p className={styles.candidateEmail}>📧 {application.candidate.email}</p>
                  {application.candidate.phone && (
                    <p className={styles.candidatePhone}>📞 {application.candidate.phone}</p>
                  )}
                  <p className={styles.jobTitle}>
                    <strong>Вакансия:</strong> {application.job.title}
                  </p>
                  <p className={styles.applicationDate}>
                    Отклик: {formatDate(application.appliedAt)}
                  </p>
                </div>
                <div className={styles.applicationStatus}>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>
              <div className={styles.applicationContent}>
                {application.coverLetter && (
                  <div className={styles.coverLetter}>
                    <h4>Сопроводительное письмо:</h4>
                    <p>{application.coverLetter}</p>
                  </div>
                )}
                <div className={styles.candidateProfile}>
                  <h4>Профиль кандидата:</h4>
                  <div className={styles.profileInfo}>
                    <p><strong>Опыт:</strong> {application.candidate.profile.experience}</p>
                    <p><strong>Образование:</strong> {application.candidate.profile.education}</p>
                    {application.candidate.profile.skills.length > 0 && (
                      <div className={styles.skillsList}>
                        <strong>Навыки:</strong>
                        <div className={styles.skillsTags}>
                          {application.candidate.profile.skills.map((skill, index) => (
                            <span key={index} className={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {application.resumeUrl && (
                  <div className={styles.resumeSection}>
                    <h4>Резюме:</h4>
                    <a 
                      href={application.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.resumeLink}
                    >
                    </a>
                  </div>
                )}
              </div>
              <div className={styles.applicationActions}>
                {application.status === 'PENDING' && (
                  <>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleShowDetails(application)}
                    >
                      ✓ Принять
                    </button>
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleShowDetails(application)}
                    >
                      ✗ Отклонить
                    </button>
                    <button
                      className={styles.interviewButton}
                      onClick={() => handleShowDetails(application)}
                    >
                      📅 Собеседование
                    </button>
                  </>
                )}
                <button 
                  className={styles.detailsButton}
                  onClick={() => handleShowDetails(application)}
                >
                  👁 Подробнее
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {}
      {selectedApplication && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Детали отклика</h2>
              <button className={styles.modalCloseButton} onClick={() => setShowDetailsModal(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.candidateDetails}>
                <h3>{selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}</h3>
                <p>📧 {selectedApplication.candidate.email}</p>
                {selectedApplication.candidate.phone && (
                  <p>📞 {selectedApplication.candidate.phone}</p>
                )}
              </div>
              <div className={styles.jobDetails}>
                <h4>Вакансия: {selectedApplication.job.title}</h4>
                <p><strong>Локация:</strong> {selectedApplication.job.location}</p>
                <p><strong>Тип:</strong> {selectedApplication.job.type}</p>
              </div>
              {selectedApplication.coverLetter && (
                <div className={styles.coverLetterDetails}>
                  <h4>Сопроводительное письмо:</h4>
                  <p>{selectedApplication.coverLetter}</p>
                </div>
              )}
              <div className={styles.notesSection}>
                <label htmlFor="notes">Заметки HR:</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Добавьте заметки о кандидате..."
                  className={styles.notesTextarea}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              {selectedApplication.status === 'PENDING' && (
                <>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'ACCEPTED')}
                    disabled={isUpdating}
                  >
                    ✓ Принять
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'REJECTED')}
                    disabled={isUpdating}
                  >
                    ✗ Отклонить
                  </button>
                  <button
                    className={styles.interviewButton}
                    onClick={() => handleStatusUpdate(selectedApplication.id, 'INTERVIEW_SCHEDULED')}
                    disabled={isUpdating}
                  >
                    📅 Назначить собеседование
                  </button>
                </>
              )}
              {selectedApplication.status === 'ACCEPTED' && (
                <button
                  className={styles.hireButton}
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'HIRED')}
                  disabled={isUpdating}
                >
                  🎉 Нанять
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default JobApplicationsPanel;
