'use client';

import React, { useState } from 'react';
import { 
  useGetHRCompanyResponsesQuery, 
  useUpdateCompanyResponseStatusMutation
} from '@/lib/api/internshipRequestsApi';
import { 
  useGetMyApplicationsQuery, 
  useUpdateApplicationStatusMutation
} from '@/lib/api/jobsApi';
import { 
  analyzeJobCandidates, 
  getJobAnalysisResults,
  checkHRAIServiceHealth,
  JobAnalysisResponse,
  JobCandidateAnalysis
} from '@/lib/api/aiApi';
import { useHRToken } from '@/lib/hooks/useAuthToken';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './UnifiedHRPanel.module.css';

const UnifiedHRPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'internships' | 'jobs'>('jobs');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  // AI Analysis states
  const [aiAnalysis, setAiAnalysis] = useState<JobAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState<string | null>(null);
  
  // Get HR token for API calls
  const hrToken = useHRToken();

  // Данные для откликов на стажировки
  const { data: internshipResponses, isLoading: internshipLoading, error: internshipError } = useGetHRCompanyResponsesQuery(filters);
  const [updateInternshipStatus] = useUpdateCompanyResponseStatusMutation();

  // Данные для откликов на вакансии
  const { data: jobApplications, isLoading: jobLoading, error: jobError } = useGetMyApplicationsQuery();
  const [updateJobStatus] = useUpdateApplicationStatusMutation();

  // Отладочная информация
  console.log('jobApplications:', jobApplications);
  console.log('jobLoading:', jobLoading);
  console.log('jobError:', jobError);
  
  // Дополнительная отладочная информация для понимания структуры данных
  if (Array.isArray(jobApplications) && jobApplications.length > 0) {
    console.log('First application structure:', jobApplications[0]);
    console.log('First application candidate:', jobApplications[0]?.candidate);
    console.log('First application job:', jobApplications[0]?.job);
  }

  const handleStatusUpdate = async (id: string, status: string, type: 'internship' | 'job') => {
    try {
      if (type === 'internship') {
        await updateInternshipStatus({ id, status: status as 'ACCEPTED' | 'REJECTED' }).unwrap();
      } else {
        await updateJobStatus({ 
          applicationId: id, 
          status: status as 'ACCEPTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' 
        }).unwrap();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // AI Analysis functions
  const handleAIAnalysis = async (jobId: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedJobForAnalysis(jobId);
    
    try {
      const result = await analyzeJobCandidates(jobId, hrToken || undefined);
      
      if (result.success) {
        setAiAnalysis(result);
      } else {
        setAnalysisError(result.error || 'Ошибка анализа');
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetAnalysisResults = async (jobId: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSelectedJobForAnalysis(jobId);
    
    try {
      const result = await getJobAnalysisResults(jobId, hrToken || undefined);
      
      if (result.success) {
        setAiAnalysis(result);
      } else {
        setAnalysisError(result.error || 'Ошибка получения результатов');
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setAiAnalysis(null);
    setAnalysisError(null);
    setSelectedJobForAnalysis(null);
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
        return 'Ожидает рассмотрения';
      case 'REVIEWED':
        return 'Рассмотрен HR';
      case 'ACCEPTED':
        return 'Принят';
      case 'REJECTED':
        return 'Отклонен';
      case 'INTERVIEW_SCHEDULED':
        return 'Собеседование назначено';
      case 'HIRED':
        return 'Нанят';
      case 'WITHDRAWN':
        return 'Отозван кандидатом';
      default:
        return status;
    }
  };

  const isLoading = internshipLoading || jobLoading;
  const error = internshipError || jobError;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Ошибка загрузки</h2>
          <p>Не удалось загрузить заявки. Попробуйте обновить страницу.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
         <div className={styles.headerContent}>
           <h1 className={styles.title}>HR Панель - Управление заявками</h1>
           <p className={styles.subtitle}>
             Заявки от вузов на стажировки и заявки кандидатов на вакансии
           </p>
         </div>
         <div className={styles.headerActions}>
           {activeTab === 'jobs' && Array.isArray(jobApplications) && jobApplications.length > 0 && (
             <div className={styles.aiAnalysisSection}>
               <button
                 className={styles.aiAnalyzeButton}
                 onClick={() => {
                   // Находим первую вакансию с откликами для анализа
                   const jobWithApplications = jobApplications.find(app => app.job?.id);
                   if (jobWithApplications?.job?.id) {
                     handleAIAnalysis(jobWithApplications.job.id);
                   }
                 }}
                 disabled={isAnalyzing}
               >
                 {isAnalyzing ? (
                   <>
                     <span className={styles.spinner}></span>
                     Анализируем...
                   </>
                 ) : (
                   <>
                     🤖 AI Анализ кандидатов
                   </>
                 )}
               </button>
               {aiAnalysis && (
                 <button
                   className={styles.clearAnalysisButton}
                   onClick={clearAnalysis}
                 >
                   ✕ Очистить результаты
                 </button>
               )}
             </div>
           )}
         </div>
      </div>

      {/* Простая статистика на основе данных */}
      <div className={styles.statsGrid}>
         <div className={styles.statCard}>
           <div className={styles.statNumber}>
             {(internshipResponses?.length || 0) + (jobApplications?.length || 0)}
           </div>
           <div className={styles.statLabel}>Всего заявок</div>
         </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#f59e0b' }}>
            {(Array.isArray(internshipResponses) ? internshipResponses.filter(r => r.status === 'PENDING').length : 0) + 
             (Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'PENDING').length : 0)}
          </div>
          <div className={styles.statLabel}>Ожидают рассмотрения</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#3b82f6' }}>
             {Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'REVIEWED').length : 0}
          </div>
          <div className={styles.statLabel}>Рассмотрены HR</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#10b981' }}>
            {(Array.isArray(internshipResponses) ? internshipResponses.filter(r => r.status === 'ACCEPTED').length : 0) + 
             (Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'ACCEPTED').length : 0)}
          </div>
          <div className={styles.statLabel}>Принято</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#8b5cf6' }}>
             {Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length : 0}
          </div>
          <div className={styles.statLabel}>Собеседования</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#059669' }}>
             {Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'HIRED').length : 0}
          </div>
          <div className={styles.statLabel}>Нанято</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#ef4444' }}>
            {(Array.isArray(internshipResponses) ? internshipResponses.filter(r => r.status === 'REJECTED').length : 0) + 
             (Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'REJECTED').length : 0)}
          </div>
          <div className={styles.statLabel}>Отклонено</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber} style={{ color: '#6b7280' }}>
             {Array.isArray(jobApplications) ? jobApplications.filter(a => a.status === 'WITHDRAWN').length : 0}
          </div>
          <div className={styles.statLabel}>Отозвано</div>
        </div>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && aiAnalysis.success && aiAnalysis.data && (
        <div className={styles.aiResultsSection}>
          <div className={styles.aiResultsHeader}>
            <h3 className={styles.aiResultsTitle}>🤖 Результаты AI анализа</h3>
            <div className={styles.aiResultsStats}>
              <span className={styles.aiStat}>
                Проанализировано: {aiAnalysis.data.totalApplications} кандидатов
              </span>
              <span className={styles.aiStat}>
                Время обработки: {aiAnalysis.data.processingTime}мс
              </span>
            </div>
          </div>
          
          <div className={styles.aiSummary}>
            <div className={styles.aiSummaryText}>
              <MarkdownRenderer content={aiAnalysis.data.analysisSummary} />
            </div>
          </div>

          {aiAnalysis.data.topCandidates.length > 0 && (
            <div className={styles.topCandidatesSection}>
              <h4 className={styles.topCandidatesTitle}>🏆 Топ кандидаты</h4>
              <div className={styles.topCandidatesList}>
                {aiAnalysis.data.topCandidates.map((candidate, index) => (
                  <div key={candidate.candidateId} className={styles.candidateCard}>
                    <div className={styles.candidateHeader}>
                      <div className={styles.candidateRank}>
                        #{index + 1}
                      </div>
                      <div className={styles.candidateScores}>
                        <div className={styles.scoreItem}>
                          <span className={styles.scoreLabel}>Общий балл:</span>
                          <span className={styles.scoreValue} style={{ 
                            color: candidate.overallScore >= 8 ? '#10b981' : 
                                   candidate.overallScore >= 6 ? '#f59e0b' : '#ef4444'
                          }}>
                            {candidate.overallScore}/10
                          </span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span className={styles.scoreLabel}>Соответствие:</span>
                          <span className={styles.scoreValue} style={{ 
                            color: candidate.matchScore >= 80 ? '#10b981' : 
                                   candidate.matchScore >= 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {candidate.matchScore}%
                          </span>
                        </div>
                        <div className={styles.scoreItem}>
                          <span className={styles.scoreLabel}>Уровень:</span>
                          <span className={styles.scoreValue} style={{ 
                            color: candidate.fitLevel === 'high' ? '#10b981' : 
                                   candidate.fitLevel === 'medium' ? '#f59e0b' : '#ef4444'
                          }}>
                            {candidate.fitLevel === 'high' ? 'Высокий' : 
                             candidate.fitLevel === 'medium' ? 'Средний' : 'Низкий'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.candidateDetails}>
                      <div className={styles.strengthsSection}>
                        <h5 className={styles.sectionTitle}>✅ Сильные стороны:</h5>
                        <ul className={styles.strengthsList}>
                          {candidate.strengths.map((strength, idx) => (
                            <li key={idx} className={styles.strengthItem}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.weaknessesSection}>
                        <h5 className={styles.sectionTitle}>⚠️ Области для улучшения:</h5>
                        <ul className={styles.weaknessesList}>
                          {candidate.weaknesses.map((weakness, idx) => (
                            <li key={idx} className={styles.weaknessItem}>{weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.recommendationsSection}>
                        <h5 className={styles.sectionTitle}>💡 Рекомендации:</h5>
                        <ul className={styles.recommendationsList}>
                          {candidate.recommendations.map((recommendation, idx) => (
                            <li key={idx} className={styles.recommendationItem}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>

                      {candidate.aiNotes && (
                        <div className={styles.aiNotesSection}>
                          <h5 className={styles.sectionTitle}>🤖 Комментарии AI:</h5>
                          <div className={styles.aiNotes}>
                            <MarkdownRenderer content={candidate.aiNotes} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Error */}
      {analysisError && (
        <div className={styles.aiErrorSection}>
          <div className={styles.aiError}>
            <h4 className={styles.aiErrorTitle}>❌ Ошибка AI анализа</h4>
            <p className={styles.aiErrorMessage}>{analysisError}</p>
            <button
              className={styles.retryButton}
              onClick={() => selectedJobForAnalysis && handleAIAnalysis(selectedJobForAnalysis)}
            >
              🔄 Попробовать снова
            </button>
          </div>
        </div>
      )}

      {/* Табы */}
      <div className={styles.tabs}>
         <button
           className={`${styles.tab} ${activeTab === 'internships' ? styles.tabActive : ''}`}
           onClick={() => setActiveTab('internships')}
         >
           📋 Заявки от вузов на стажировки ({Array.isArray(internshipResponses) ? internshipResponses.length : 0})
         </button>
         <button
           className={`${styles.tab} ${activeTab === 'jobs' ? styles.tabActive : ''}`}
           onClick={() => setActiveTab('jobs')}
         >
           💼 Заявки кандидатов на вакансии ({Array.isArray(jobApplications) ? jobApplications.length : 0})
         </button>
      </div>

      {/* Фильтры */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
           <input
             type="text"
             placeholder="Поиск по кандидату, вакансии, университету..."
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
            <option value="PENDING">Ожидают рассмотрения</option>
            <option value="REVIEWED">Рассмотрены HR</option>
            <option value="ACCEPTED">Принятые</option>
            <option value="REJECTED">Отклоненные</option>
            <option value="INTERVIEW_SCHEDULED">Собеседования</option>
            <option value="HIRED">Нанятые</option>
            <option value="WITHDRAWN">Отозванные</option>
          </select>
        </div>
      </div>

      {/* Контент */}
      <div className={styles.content}>
        {activeTab === 'internships' ? (
          <div className={styles.requestsList}>
             {Array.isArray(internshipResponses) && internshipResponses.length === 0 ? (
               <div className={styles.empty}>
                 <div className={styles.emptyIcon}>📋</div>
                 <h3>Нет заявок от вузов</h3>
                 <p>Заявки от университетов на стажировки появятся здесь</p>
               </div>
            ) : (
              Array.isArray(internshipResponses) ? internshipResponses.map((response) => (
                <div key={response.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <div className={styles.requestInfo}>
                      <h3 className={styles.requestTitle}>{response.companyName}</h3>
                      <p className={styles.requestDetails}>
                        📧 {response.contactEmail}
                      </p>
                      <p className={styles.requestDate}>
                        Отправлен: {formatDate(response.createdAt)}
                      </p>
                    </div>
                    <div className={styles.requestStatus}>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(response.status) }}
                      >
                        {getStatusText(response.status)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.requestContent}>
                    <div className={styles.requestMessage}>
                      <h4>Сообщение от компании:</h4>
                      <p>{response.message}</p>
                    </div>

                    {response.internshipRequest && (
                      <div className={styles.requestInfo}>
                        <h4>Заявка на стажировку:</h4>
                        <p><strong>Специальность:</strong> {response.internshipRequest.specialty}</p>
                        <p><strong>Университет:</strong> {response.internshipRequest.university.name}</p>
                        <p><strong>Количество студентов:</strong> {response.internshipRequest.studentCount}</p>
                        <p><strong>Период:</strong> {response.internshipRequest.period}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.requestActions}>
                    {response.status === 'PENDING' && (
                      <>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleStatusUpdate(response.id, 'ACCEPTED', 'internship')}
                        >
                          ✓ Принять
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleStatusUpdate(response.id, 'REJECTED', 'internship')}
                        >
                          ✗ Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : null
            )}
          </div>
        ) : (
          <div className={styles.applicationsList}>
             {Array.isArray(jobApplications) && jobApplications.length === 0 ? (
               <div className={styles.empty}>
                 <div className={styles.emptyIcon}>💼</div>
                 <h3>Нет заявок от кандидатов</h3>
                 <p>Заявки кандидатов на вакансии появятся здесь</p>
                 <p className={styles.debugInfo}>
                   API: /applications/my возвращает пустой массив
                 </p>
               </div>
            ) : (
               jobApplications?.filter(application => application && application.candidate && application.job).map((application) => (
                <div key={application.id} className={styles.applicationCard}>
                  <div className={styles.applicationHeader}>
                    <div className={styles.applicationInfo}>
                      <h3 className={styles.candidateName}>
                        {application.candidate?.firstName} {application.candidate?.lastName}
                      </h3>
                      <p className={styles.candidateEmail}>📧 {application.candidate?.email}</p>
                      {application.candidate?.phone && (
                        <p className={styles.candidatePhone}>📞 {application.candidate.phone}</p>
                      )}
                      <p className={styles.jobTitle}>
                        <strong>Вакансия:</strong> {application.job?.title}
                      </p>
                      <p className={styles.jobLocation}>
                        <strong>Локация:</strong> {application.job?.location}
                      </p>
                      <p className={styles.jobType}>
                        <strong>Тип:</strong> {application.job?.type === 'FULL_TIME' ? 'Полная занятость' : 
                                           application.job?.type === 'PART_TIME' ? 'Частичная занятость' : 
                                           application.job?.type === 'CONTRACT' ? 'Контракт' : application.job?.type}
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

                    {application.resume && (
                      <div className={styles.resumeSection}>
                        <h4>Резюме:</h4>
                        <div className={styles.resumeInfo}>
                          <p><strong>Название:</strong> {application.resume?.title}</p>
                          <p><strong>Описание:</strong> {application.resume?.summary}</p>
                          <p><strong>По умолчанию:</strong> {application.resume?.isDefault ? 'Да' : 'Нет'}</p>
                        </div>
                        <div className={styles.resumeActions}>
                          <button 
                            className={styles.viewResumeButton}
                            onClick={() => {
                              setSelectedResume(application.resume);
                              setShowResumeModal(true);
                            }}
                          >
                            📄 Просмотреть резюме
                          </button>
                        </div>
                      </div>
                    )}

                    <div className={styles.hrInfo}>
                      <h4>Информация о HR:</h4>
                      <p><strong>HR:</strong> {application.hr?.firstName} {application.hr?.lastName}</p>
                      <p><strong>Компания:</strong> {application.hr?.company}</p>
                    </div>
                  </div>

                  <div className={styles.applicationActions}>
                    {application.status === 'PENDING' && (
                      <>
                        <button
                          className={styles.reviewButton}
                          onClick={() => handleStatusUpdate(application.id, 'REVIEWED', 'job')}
                        >
                          👁 Рассмотреть
                        </button>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleStatusUpdate(application.id, 'ACCEPTED', 'job')}
                        >
                          ✓ Принять
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleStatusUpdate(application.id, 'REJECTED', 'job')}
                        >
                          ✗ Отклонить
                        </button>
                      </>
                    )}
                    {application.status === 'REVIEWED' && (
                      <>
                        <button
                          className={styles.acceptButton}
                          onClick={() => handleStatusUpdate(application.id, 'ACCEPTED', 'job')}
                        >
                          ✓ Принять
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleStatusUpdate(application.id, 'REJECTED', 'job')}
                        >
                          ✗ Отклонить
                        </button>
                      </>
                    )}
                    {application.status === 'ACCEPTED' && (
                      <button
                        className={styles.interviewButton}
                        onClick={() => handleStatusUpdate(application.id, 'INTERVIEW_SCHEDULED', 'job')}
                      >
                        📅 Назначить собеседование
                      </button>
                    )}
                    {application.status === 'INTERVIEW_SCHEDULED' && (
                      <button
                        className={styles.hireButton}
                        onClick={() => handleStatusUpdate(application.id, 'HIRED', 'job')}
                      >
                        🎉 Нанять
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра резюме */}
      {showResumeModal && selectedResume && (
        <div className={styles.modalOverlay} onClick={() => setShowResumeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Резюме кандидата</h3>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setShowResumeModal(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.resumeDetails}>
                <h4>Название резюме:</h4>
                <p>{selectedResume.title}</p>
                
                <h4>Описание:</h4>
                <p>{selectedResume.summary}</p>
                
                <h4>Статус:</h4>
                <p>{selectedResume.isDefault ? 'Резюме по умолчанию' : 'Дополнительное резюме'}</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelButton}
                onClick={() => setShowResumeModal(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedHRPanel;
