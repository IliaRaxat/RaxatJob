'use client';
import { useState, useEffect } from 'react';
import { X, Brain, Clock, CheckCircle, AlertTriangle, Lightbulb, Wrench, FileText } from 'lucide-react';
import { analyzeResume, convertResumeToText, ResumeAnalysisResponse } from '@/entities/ai';
import { Resume } from '@/entities/resume';
import styles from './ResumeAnalysis.module.css';
interface ResumeAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume | null;
}
export default function ResumeAnalysis({ isOpen, onClose, resume }: ResumeAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  useEffect(() => {
    if (isOpen && resume && !isAnalyzing && !analysisResult) {
      startAnalysis();
    }
  }, [isOpen, resume]);
  useEffect(() => {
    if (!isOpen) {
      setIsAnalyzing(false);
      setAnalysisResult(null);
      setError(null);
      setResumeText('');
    }
  }, [isOpen]);
  const startAnalysis = async () => {
    if (!resume) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const text = convertResumeToText(resume);
      setResumeText(text);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await analyzeResume(text, 'gemma3:latest');
      if (process.env.NODE_ENV === 'development') {
                              }
      setAnalysisResult(result);
    } catch (err) {
            setError('Произошла ошибка при анализе резюме. Попробуйте еще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleClose = () => {
    onClose();
  };
  const handleRetry = () => {
    setError(null);
    setAnalysisResult(null);
    startAnalysis();
  };
  if (!isOpen) return null;
  return (
    <div className={styles.analysisContainer}>
      <div className={styles.analysisModal}>
        <div className={styles.analysisHeader}>
          <h2 className={styles.analysisTitle}>
            <Brain size={24} />
            AI Анализ резюме
          </h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.analysisContent}>
          {}
          {resumeText && (
            <div className={styles.resumeTextContainer}>
              <h3 className={styles.resumeTextTitle}>
                <FileText size={20} />
                Текст резюме для анализа
              </h3>
              <div className={`${styles.resumeTextContent} ${isAnalyzing ? styles.analyzing : ''}`}>
                {resumeText}
              </div>
            </div>
          )}
          {isAnalyzing && (
            <div className={styles.loadingContainer}>
              <div className={styles.shimmerContainer}>
                <div className={styles.shimmerBar}></div>
              </div>
              <p className={styles.loadingText}>
                AI анализирует ваше резюме...
              </p>
              <div className={styles.dotsContainer}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          {error && (
            <div className={styles.analysisResults}>
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <AlertTriangle size={20} />
                  Ошибка анализа
                </h3>
                <div className={styles.sectionContent}>
                  <p className={styles.analysisText}>{error}</p>
                </div>
              </div>
              <div className={styles.analysisActions}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={handleClose}
                >
                  Закрыть
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  onClick={handleRetry}
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          )}
          {analysisResult && analysisResult.success && (
            <div className={styles.analysisResults}>
              {}
              {analysisResult.data?.overall_score !== undefined && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <Brain size={20} />
                    Общая оценка: {analysisResult.data.overall_score}/10
                  </h3>
                  <div className={styles.sectionContent}>
                    <div className={styles.scoreBar}>
                      <div 
                        className={styles.scoreFill}
                        style={{ width: `${(analysisResult.data.overall_score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.strengths && analysisResult.data.strengths.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <CheckCircle size={20} />
                    Сильные стороны
                  </h3>
                  <div className={styles.sectionContent}>
                    <ul className={styles.strengthsList}>
                      {analysisResult.data.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.weaknesses && analysisResult.data.weaknesses.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <AlertTriangle size={20} />
                    Области для улучшения
                  </h3>
                  <div className={styles.sectionContent}>
                    <ul className={styles.weaknessesList}>
                      {analysisResult.data.weaknesses.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.improvements && analysisResult.data.improvements.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <Lightbulb size={20} />
                    Предложения по улучшению
                  </h3>
                  <div className={styles.sectionContent}>
                    <ul className={styles.suggestionsList}>
                      {analysisResult.data.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.structure_recommendations && analysisResult.data.structure_recommendations.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <Wrench size={20} />
                    Рекомендации по структуре
                  </h3>
                  <div className={styles.sectionContent}>
                    <ul className={styles.structureAdviceList}>
                      {analysisResult.data.structure_recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.content_recommendations && analysisResult.data.content_recommendations.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <Wrench size={20} />
                    Советы по содержанию
                  </h3>
                  <div className={styles.sectionContent}>
                    <ul className={styles.structureAdviceList}>
                      {analysisResult.data.content_recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {}
              {analysisResult.data?.keywords_to_add && analysisResult.data.keywords_to_add.length > 0 && (
                <div className={styles.analysisSection}>
                  <h3 className={styles.sectionTitle}>
                    <Lightbulb size={20} />
                    Ключевые слова для добавления
                  </h3>
                  <div className={styles.sectionContent}>
                    <div className={styles.keywordsList}>
                      {analysisResult.data.keywords_to_add.map((keyword, index) => (
                        <span key={index} className={styles.keywordTag}>
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {}
              {analysisResult.processingTime > 0 && (
                <div className={styles.processingTime}>
                  <Clock size={16} />
                  Время анализа: {(analysisResult.processingTime / 1000).toFixed(2)}с
                </div>
              )}
              <div className={styles.analysisActions}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={handleClose}
                >
                  Закрыть
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  onClick={handleRetry}
                >
                  Анализировать снова
                </button>
              </div>
            </div>
          )}
          {analysisResult && !analysisResult.success && (
            <div className={styles.analysisResults}>
              <div className={styles.analysisSection}>
                <h3 className={styles.sectionTitle}>
                  <AlertTriangle size={20} />
                  Ошибка анализа
                </h3>
                <div className={styles.sectionContent}>
                  <p className={styles.analysisText}>
                    {analysisResult.error || 'Произошла неизвестная ошибка при анализе резюме.'}
                  </p>
                </div>
              </div>
              <div className={styles.analysisActions}>
                <button 
                  className={`${styles.actionButton} ${styles.secondaryButton}`}
                  onClick={handleClose}
                >
                  Закрыть
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  onClick={handleRetry}
                >
                  Попробовать снова
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
