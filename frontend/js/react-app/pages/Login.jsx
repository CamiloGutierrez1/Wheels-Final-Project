import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../css/login.css';

const API_BASE_URL = 'https://wheels-final-project.onrender.com/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya hay usuario autenticado
    const token = localStorage.getItem('token') || sessionStorage.getItem('authToken');
    if (token) {
      const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole') || 'pasajero';
      if (userRole === 'conductor' || userRole === 'driver') {
        navigate('/dashboard/driver', { replace: true });
      } else {
        navigate('/dashboard/rider', { replace: true });
      }
    }

    // Cargar email recordado del localStorage
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Guardar email si "Remember me" está marcado
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user = data.data.user;
        const token = data.data.token;

        // Guardar datos de sesión
        sessionStorage.setItem('userEmail', user.correo);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userName', `${user.nombre} ${user.apellido}`);
        sessionStorage.setItem('userRole', user.rol);
        
        // También guardar en localStorage para que React lo pueda leer
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.rol);
        localStorage.setItem('userName', `${user.nombre} ${user.apellido}`);

        // Redirigir según rol
        if (user.rol === 'driver' || user.rol === 'conductor') {
          navigate('/dashboard/driver', { replace: true });
        } else if (user.rol === 'rider' || user.rol === 'pasajero') {
          navigate('/dashboard/rider', { replace: true });
        } else {
          navigate('/dashboard/rider', { replace: true });
        }
      } else {
        throw new Error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-wrapper">
      {/* Left Side: Login Form */}
      <div className="login-section">
        <div className="login-content">
          <h2 className="login-title">Log in to Wheels</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email@domain.com"
              className="input-field"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
            />

            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
            />

            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="signup-text">
              Don't have an account? <a href="#" className="signup-link" onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}>Sign up</a>
            </p>
          </form>

          {error && (
            <div className="error-box" style={{ display: 'block' }}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Info Card */}
      <div className="info-section">
        <div className="info-card">
          <h1 className="wheels-logo">WHEELS <span className="car-icon">🚗</span></h1>
          
          <div className="map-box">
            <div className="pin-icon">📍</div>
          </div>

          <h3 className="info-title">Speady, Easy and Fast</h3>
          <p className="info-description">
            Commute rides with your campus peers. Work with each 
            other to help fill up seats and save some money while 
            providing company for your nearby friends and family.
          </p>

          <div className="dots">
            <span className="dot active"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Login;

