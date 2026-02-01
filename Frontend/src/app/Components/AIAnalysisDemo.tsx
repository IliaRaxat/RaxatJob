'use client';
import React, { useState } from 'react';
import { 
  analyzeJobCandidates, 
  getJobAnalysisResults,
  checkHRAIServiceHealth,
  JobAnalysisResponse,
  JobCandidateAnalysis
} from '@/entities/ai';
import { useHRToken } from '@/shared/lib/hooks/useAuthToken';
import MarkdownRenderer from './MarkdownRenderer';
import styles from './AIAnalysisDemo.module.css';
const AIAnalysisDemo: React.FC = () => {
  const [jobId, setJobId] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<JobAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [serviceHealth, setServiceHealth] = useState<boolean | null>(null);
  const hrToken = useHRToken();
  const handleAIAnalysis = async () => {
    if (!jobId.trim()) {
      setAnalysisError('Введите ID вакансии');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
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
  const handleGetResults = async () => {
    if (!jobId.trim()) {
      setAnalysisError('Введите ID вакансии');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
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
  const checkHealth = async () => {
    try {
      const result = await checkHRAIServiceHealth(hrToken || undefined);
      setServiceHealth(result.success);
    } catch (error) {
      setServiceHealth(false);
    }
  };
  const clearResults = () => {
    setAiAnalysis(null);
    setAnalysisError(null);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🤖 AI Анализ кандидатов - Демо</h2>
        <p className={styles.subtitle}>
          Тестирование AI анализа кандидатов на вакансии
        </p>
        <div className={styles.tokenInfo}>
          <span className={styles.tokenLabel}>HR Token:</span>
          <span className={styles.tokenValue}>
            {hrToken ? `✅ ${hrToken.substring(0, 20)}...` : '❌ Не найден'}
          </span>
        </div>
      </div>
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label htmlFor="jobId" className={styles.label}>
            ID вакансии:
          </label>
          <input
            id="jobId"
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Введите ID вакансии для анализа"
            className={styles.input}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || !jobId.trim()}
            className={styles.analyzeButton}
          >
            {isAnalyzing ? 'Анализируем...' : '🤖 Запустить анализ'}
          </button>
          <button
            onClick={handleGetResults}
            disabled={isAnalyzing || !jobId.trim()}
            className={styles.getResultsButton}
          >
            📊 Получить результаты
          </button>
          <button
            onClick={checkHealth}
            className={styles.healthButton}
          >
            🏥 Проверить сервис
          </button>
          <button
            onClick={clearResults}
            className={styles.clearButton}
          >
            ✕ Очистить
          </button>
        </div>
      </div>
      {}
      {serviceHealth !== null && (
        <div className={styles.healthStatus}>
          <div className={`${styles.healthIndicator} ${serviceHealth ? styles.healthy : styles.unhealthy}`}>
            {serviceHealth ? '✅ Сервис доступен' : '❌ Сервис недоступен'}
          </div>
        </div>
      )}
      {}
      {aiAnalysis && aiAnalysis.success && aiAnalysis.data && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h3 className={styles.resultsTitle}>📊 Результаты анализа</h3>
            <div className={styles.resultsStats}>
              <span className={styles.stat}>
                Кандидатов: {aiAnalysis.data.totalApplications}
              </span>
              <span className={styles.stat}>
                Время: {aiAnalysis.data.processingTime}мс
              </span>
            </div>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryText}>
              <MarkdownRenderer content={aiAnalysis.data.analysisSummary} />
            </div>
          </div>
          {aiAnalysis.data.topCandidates.length > 0 && (
            <div className={styles.candidatesSection}>
              <h4 className={styles.candidatesTitle}>🏆 Топ кандидаты</h4>
              <div className={styles.candidatesList}>
                {aiAnalysis.data.topCandidates.map((candidate, index) => (
                  <div key={candidate.candidateId} className={styles.candidateCard}>
                    <div className={styles.candidateHeader}>
                      <div className={styles.rank}>#{index + 1}</div>
                      <div className={styles.scores}>
                        <div className={styles.score}>
                          <span className={styles.scoreLabel}>Балл:</span>
                          <span className={styles.scoreValue} style={{ 
                            color: candidate.overallScore >= 8 ? '#10b981' : 
                                   candidate.overallScore >= 6 ? '#f59e0b' : '#ef4444'
                          }}>
                            {candidate.overallScore}/10
                          </span>
                        </div>
                        <div className={styles.score}>
                          <span className={styles.scoreLabel}>Соответствие:</span>
                          <span className={styles.scoreValue} style={{ 
                            color: candidate.matchScore >= 80 ? '#10b981' : 
                                   candidate.matchScore >= 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {candidate.matchScore}%
                          </span>
                        </div>
                        <div className={styles.score}>
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
                      <div className={styles.section}>
                        <h5 className={styles.sectionTitle}>✅ Сильные стороны:</h5>
                        <ul className={styles.list}>
                          {candidate.strengths.map((strength, idx) => (
                            <li key={idx} className={styles.listItem}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.section}>
                        <h5 className={styles.sectionTitle}>⚠️ Слабые стороны:</h5>
                        <ul className={styles.list}>
                          {candidate.weaknesses.map((weakness, idx) => (
                            <li key={idx} className={styles.listItem}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.section}>
                        <h5 className={styles.sectionTitle}>💡 Рекомендации:</h5>
                        <ul className={styles.list}>
                          {candidate.recommendations.map((recommendation, idx) => (
                            <li key={idx} className={styles.listItem}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                      {candidate.aiNotes && (
                        <div className={styles.section}>
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
      {}
      {analysisError && (
        <div className={styles.errorSection}>
          <div className={styles.error}>
            <h4 className={styles.errorTitle}>❌ Ошибка</h4>
            <p className={styles.errorMessage}>{analysisError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIAnalysisDemo;
