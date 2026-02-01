'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/entities/user';
import { useAuth } from '@/features/auth';
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState('');
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      }).unwrap();
            authLogin(result.user);
      router.push('/');
    } catch (err: unknown) {
            let errorMessage = 'Неверный email или пароль';
      if (typeof err === 'object' && err !== null) {
        const error = err as { data?: { message?: string }; message?: string; status?: number };
        if (error.status === 401) {
          errorMessage = 'Неверный email или пароль';
        } else if (error.status === 403) {
          errorMessage = 'Доступ запрещен';
        } else if (error.status === 429) {
          errorMessage = 'Слишком много попыток входа. Попробуйте позже';
        } else if (error.status !== undefined && error.status >= 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else {
          errorMessage = error?.data?.message || error?.message || errorMessage;
        }
      }
      setError(errorMessage);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      paddingTop: '140px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#ffffff',
        border: '1px solid #eaeaea',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#111',
            margin: '0 0 0.5rem'
          }}>Вход в аккаунт</h1>
          <p style={{
            color: '#555',
            fontSize: '1rem',
            margin: 0
          }}>Добро пожаловать обратно!</p>
        </div>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#dcfce7',
              color: '#1db954',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="email" style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#111'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#fff',
                color: '#111',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Введите ваш email"
              required
            />
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="password" style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#111'
            }}>
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #eaeaea',
                borderRadius: '8px',
                fontSize: '1rem',
                background: '#fff',
                color: '#111',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Введите ваш пароль"
              required
            />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <input type="checkbox" style={{
                width: '16px',
                height: '16px',
                accentColor: '#1db954'
              }} />
              <span style={{
                fontSize: '0.875rem',
                color: '#555'
              }}>Запомнить меня</span>
            </label>
            <Link href="/auth/forgot-password" style={{
              fontSize: '0.875rem',
              color: '#1db954',
              textDecoration: 'none'
            }}>
              Забыли пароль?
            </Link>
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #1db954, #1aa34a)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #f0f0f0'
        }}>
          <p style={{
            color: '#555',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Нет аккаунта?{' '}
            <Link href="/auth/register" style={{
              color: '#1db954',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
