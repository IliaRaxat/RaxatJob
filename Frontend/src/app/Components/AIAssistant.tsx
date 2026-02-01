'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendAIChatMessage, checkAIServiceHealth } from '@/entities/ai';
import { useAuth } from '@/features/auth';
import styles from './AIAssistant.module.css';
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  tags: string[];
  postedAt: string;
}
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  results?: Job[];
  isError?: boolean;
}
interface AIAssistantProps {
  jobs: Job[];
}
export default function AIAssistant({ jobs }: AIAssistantProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState<boolean | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(true);
  const getSiteContext = () => {
    const currentPath = window.location.pathname;
    const userRole = user?.role;
    const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Пользователь';
    let context = `Ты - AI помощник платформы для поиска работы и стажировок. `;
    if (isAuthenticated && user) {
      context += `Пользователь: ${userName} (${userRole}). `;
      switch (userRole) {
        case 'CANDIDATE':
          context += `Пользователь - кандидат, ищет работу или стажировки. Может создавать резюме, подавать заявки на вакансии. `;
          break;
        case 'HR':
          context += `Пользователь - HR-специалист, публикует вакансии, ищет кандидатов, управляет процессом найма. `;
          break;
        case 'UNIVERSITY':
          context += `Пользователь - представитель университета, публикует стажировки и программы для студентов. `;
          break;
        case 'ADMIN':
          context += `Пользователь - администратор платформы, имеет доступ ко всем функциям. `;
          break;
      }
    } else {
      context += `Пользователь не авторизован. `;
    }
    if (currentPath.includes('/jobs')) {
      context += `Сейчас пользователь на странице вакансий. `;
    } else if (currentPath.includes('/companies')) {
      context += `Сейчас пользователь на странице стажировок. `;
    } else if (currentPath.includes('/resume')) {
      context += `Сейчас пользователь работает с резюме. `;
    } else if (currentPath.includes('/hr')) {
      context += `Сейчас пользователь в HR панели. `;
    } else if (currentPath.includes('/admin')) {
      context += `Сейчас пользователь в админ панели. `;
    } else if (currentPath.includes('/universities')) {
      context += `Сейчас пользователь в панели университета. `;
    }
    context += `Доступно ${jobs.length} вакансий и стажировок. `;
    context += `Помогай пользователю с вопросами о поиске работы, создании резюме, публикации вакансий, стажировках и других функциях платформы. `;
    context += `Отвечай на русском языке, будь дружелюбным и полезным.`;
    return context;
  };
  useEffect(() => {
    const getWelcomeMessage = () => {
      if (!isAuthenticated) {
        return 'Привет! Я AI помощник платформы для поиска работы и стажировок. Я помогу вам найти подходящие вакансии, создать резюме или ответить на вопросы о платформе.';
      }
      const userName = user?.firstName ? `, ${user.firstName}` : '';
      const currentPath = window.location.pathname;
      switch (user?.role) {
        case 'CANDIDATE':
          if (currentPath.includes('/resume')) {
            return `Привет${userName}! Я помогу вам с созданием и улучшением резюме, поиском подходящих вакансий и стажировок.`;
          }
          return `Привет${userName}! Я помогу вам найти подходящие вакансии и стажировки, создать резюме или ответить на вопросы о поиске работы.`;
        case 'HR':
          if (currentPath.includes('/hr')) {
            return `Привет${userName}! Я помогу вам с публикацией вакансий, поиском кандидатов, управлением заявками и другими HR задачами.`;
          }
          return `Привет${userName}! Я помогу вам с HR задачами: публикация вакансий, поиск кандидатов, анализ резюме.`;
        case 'UNIVERSITY':
          return `Привет${userName}! Я помогу вам с публикацией стажировок, поиском студентов, управлением программами для университетов.`;
        case 'ADMIN':
          return `Привет${userName}! Я помогу вам с администрированием платформы, аналитикой и управлением пользователями.`;
        default:
          return `Привет${userName}! Я помогу вам с вопросами о платформе.`;
      }
    };
    setMessages([{
      id: '1',
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date()
    }]);
  }, [user, isAuthenticated]);
  useEffect(() => {
    const checkAI = async () => {
      setIsCheckingAI(true);
      const isAvailable = await checkAIServiceHealth();
      setAiServiceAvailable(isAvailable);
      setIsCheckingAI(false);
    };
    checkAI();
  }, []);
  const searchByPrompt = (prompt: string): Job[] => {
    const keywords = prompt.toLowerCase().split(' ');
    return jobs.filter(job => {
      const searchText = `${job.title} ${job.description} ${job.tags.join(' ')} ${job.company}`.toLowerCase();
      return keywords.some(keyword => 
        keyword.length > 2 && searchText.includes(keyword)
      );
    }).slice(0, 3); 
  };
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    try {
      if (aiServiceAvailable) {
        const contextualMessage = `${getSiteContext()}\n\nВопрос пользователя: ${currentInput}`;
        const aiResponse = await sendAIChatMessage(contextualMessage);
        if (aiResponse.success && aiResponse.data) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.data.response,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(aiResponse.error || 'AI сервис недоступен');
        }
      } else {
        throw new Error('AI сервис недоступен');
      }
    } catch (error) {
            const results = searchByPrompt(currentInput);
      let fallbackText = '';
      if (results.length > 0) {
        fallbackText = `Нашел ${results.length} подходящих ${results.length === 1 ? 'вакансию' : 'вакансии'}:`;
      } else {
        if (user?.role === 'CANDIDATE') {
          fallbackText = 'К сожалению, не нашел подходящих вакансий по вашему запросу. Попробуйте изменить критерии поиска или создать резюме для лучшего поиска.';
        } else if (user?.role === 'HR') {
          fallbackText = 'Не нашел подходящих вакансий. Возможно, стоит создать новую вакансию или изменить критерии поиска.';
        } else if (user?.role === 'UNIVERSITY') {
          fallbackText = 'Не нашел подходящих стажировок. Возможно, стоит создать новую стажировку или изменить критерии поиска.';
        } else {
          fallbackText = 'К сожалению, не нашел подходящих вакансий по вашему запросу. Попробуйте изменить критерии поиска.';
        }
      }
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        isUser: false,
        timestamp: new Date(),
        results: results.length > 0 ? results : undefined
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const getPlaceholderText = () => {
    const currentPath = window.location.pathname;
    if (!isAuthenticated) {
      return 'Задайте вопрос о платформе или поиске работы...';
    }
    switch (user?.role) {
      case 'CANDIDATE':
        if (currentPath.includes('/resume')) {
          return 'Спросите о создании резюме, навыках или карьерных советах...';
        }
        return 'Опишите какую работу ищете или задайте вопрос о поиске...';
      case 'HR':
        if (currentPath.includes('/hr')) {
          return 'Спросите о HR задачах, поиске кандидатов или управлении...';
        }
        return 'Опишите какого специалиста ищете или задайте HR вопрос...';
      case 'UNIVERSITY':
        return 'Спросите о стажировках, студентах или университетских программах...';
      case 'ADMIN':
        return 'Спросите об администрировании, аналитике или управлении...';
      default:
        return 'Задайте вопрос о платформе...';
    }
  };
  const getQuickActions = () => {
    const currentPath = window.location.pathname;
    switch (user?.role) {
      case 'CANDIDATE':
        if (currentPath.includes('/resume')) {
          return [
            { icon: '📝', text: 'Как улучшить резюме?' },
            { icon: '💼', text: 'Найти работу по навыкам' },
            { icon: '🎯', text: 'Советы по карьере' }
          ];
        }
        return [
          { icon: '🔍', text: 'Найти работу' },
          { icon: '📝', text: 'Создать резюме' },
          { icon: '💼', text: 'Стажировки' }
        ];
      case 'HR':
        return [
          { icon: '👥', text: 'Найти кандидатов' },
          { icon: '📋', text: 'Создать вакансию' },
          { icon: '📊', text: 'Аналитика' }
        ];
      case 'UNIVERSITY':
        return [
          { icon: '🎓', text: 'Создать стажировку' },
          { icon: '👨‍🎓', text: 'Найти студентов' },
          { icon: '📚', text: 'Программы' }
        ];
      case 'ADMIN':
        return [
          { icon: '📊', text: 'Аналитика' },
          { icon: '👥', text: 'Пользователи' },
          { icon: '⚙️', text: 'Настройки' }
        ];
      default:
        return [
          { icon: '❓', text: 'Как работает платформа?' },
          { icon: '🔍', text: 'Найти работу' },
          { icon: '📝', text: 'Создать резюме' }
        ];
    }
  };
  const handleQuickAction = (actionText: string) => {
    setInputValue(actionText);
    handleSend();
  };
  return (
    <>
      {}
      {!isCheckingAI && aiServiceAvailable && (
        <button 
          className={`${styles.floatingButton} ${isOpen ? styles.floatingButtonActive : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
        {isOpen ? (
          <>
            <span>Закрыть</span>
            <svg className={styles.floatingIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </>
        ) : (
          <>
            <span>AI Помощник</span>
            <svg className={styles.floatingIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.33C8.73 1.33 9.33 1.93 9.33 2.67V3.33H10.67C11.4 3.33 12 3.93 12 4.67V5.33H12.67C13.4 5.33 14 5.93 14 6.67V10.67C14 12.14 12.81 13.33 11.33 13.33H11C10.85 13.33 10.67 13.18 10.67 12.33V12C10.67 11.85 10.52 11.67 10.33 11.67H5.67C5.48 11.67 5.33 11.85 5.33 12V12.33C5.33 13.18 5.15 13.33 5 13.33H4.67C3.19 13.33 2 12.14 2 10.67V6.67C2 5.93 2.6 5.33 3.33 5.33H4V4.67C4 3.93 4.6 3.33 5.33 3.33H6.67V2.67C6.67 1.93 7.27 1.33 8 1.33Z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="5.33" cy="7.33" r="0.67" fill="currentColor"/>
              <circle cx="10.67" cy="7.33" r="0.67" fill="currentColor"/>
              <path d="M6 9.33H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </>
        )}
      </button>
      )}
      {}
      {!isCheckingAI && aiServiceAvailable && isOpen && (
        <div className={styles.aiModal}>
          <div className={styles.aiModalHeader}>
            <div className={styles.aiTitle}>
              <div className={styles.aiIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C13.1046 2 14 2.89543 14 4V5H16C17.1046 5 18 5.89543 18 7V8H19C20.1046 8 21 8.89543 21 10V16C21 18.2091 19.2091 20 17 20H16.5C16.2239 20 16 19.7761 16 19.5V18.5C16 18.2239 15.7761 18 15.5 18H8.5C8.22386 18 8 18.2239 8 18.5V19.5C8 19.7761 7.77614 20 7.5 20H7C4.79086 20 3 18.2091 3 16V10C3 8.89543 3.89543 8 5 8H6V7C6 5.89543 6.89543 5 8 5H10V4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12C8.55228 12 9 11.5523 9 11C9 10.4477 8.55228 10 8 10C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z" fill="currentColor"/>
                  <path d="M16 12C16.5523 12 17 11.5523 17 11C17 10.4477 16.5523 10 16 10C15.4477 10 15 10.4477 15 11C15 11.5523 15.4477 12 16 12Z" fill="currentColor"/>
                  <path d="M9 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M11 6H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h3>AI Помощник</h3>
                {aiServiceAvailable !== null && (
                  <div className={styles.aiStatus}>
                    {aiServiceAvailable ? (
                      <span className={styles.aiStatusOnline}>🟢 AI активен</span>
                    ) : (
                      <span className={styles.aiStatusOffline}>🔴 Локальный режим</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button 
              className={styles.aiCloseBtn} 
              onClick={() => setIsOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className={styles.aiMessages}>
            {messages.map((message) => (
              <div key={message.id} className={`${styles.aiMessage} ${message.isUser ? styles.aiMessageUser : styles.aiMessageBot}`}>
                <div className={styles.aiMessageContent}>
                  {message.isUser ? (
                    <p>{message.text}</p>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p style={{ margin: '0 0 0.5rem 0' }}>{children}</p>,
                        ul: ({ children }) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                        strong: ({ children }) => <strong style={{ fontWeight: '600', color: 'inherit' }}>{children}</strong>,
                        em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                        code: ({ children }) => <code style={{ 
                          background: '#f1f3f4', 
                          padding: '0.125rem 0.25rem', 
                          borderRadius: '3px', 
                          fontSize: '0.85em',
                          fontFamily: 'monospace'
                        }}>{children}</code>,
                        blockquote: ({ children }) => <blockquote style={{ 
                          borderLeft: '3px solid #e10600', 
                          paddingLeft: '1rem', 
                          margin: '0.5rem 0',
                          fontStyle: 'italic',
                          color: '#666'
                        }}>{children}</blockquote>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  )}
                  {message.results && (
                    <div className={styles.aiResults}>
                      {message.results.map((job) => (
                        <div key={job.id} className={styles.aiJobCard}>
                          <h4>{job.title}</h4>
                          <p>{job.company} • {job.location}</p>
                          <div className={styles.aiJobTags}>
                            {job.tags.slice(0, 3).map(tag => (
                              <span key={tag} className={styles.aiJobTag}>{tag}</span>
                            ))}
                          </div>
                          <Link href={`/jobs/${job.id}`} className={styles.aiJobLink}>
                            Подробнее →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className={styles.aiMessageTime}>
                  {message.timestamp.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className={styles.aiMessage}>
                <div className={styles.aiMessageContent}>
                  <div className={styles.aiLoading}>
                    <div className={styles.aiLoadingDot}></div>
                    <div className={styles.aiLoadingDot}></div>
                    <div className={styles.aiLoadingDot}></div>
                  </div>
                </div>
              </div>
            )}
            {}
            {messages.length === 1 && isAuthenticated && user && (
              <div className={styles.quickActions}>
                <div className={styles.quickActionsTitle}>Быстрые действия:</div>
                <div className={styles.quickActionsGrid}>
                  {getQuickActions().map((action, index) => (
                    <button
                      key={index}
                      className={styles.quickActionBtn}
                      onClick={() => handleQuickAction(action.text)}
                    >
                      {action.icon} {action.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.aiInput}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholderText()}
              className={styles.aiTextarea}
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={styles.aiSendBtn}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
