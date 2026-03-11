import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import PilaconLogo from '../components/PilaconLogo';
import './Login.css';

export default function Login() {
    const { localLogin, localSignup, loginWithToken } = usePilaCon();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [mode, setMode] = useState('choice'); // 'choice', 'login', 'signup'
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nickname: ''
    });
    const [error, setError] = useState('');

    // URL에서 토큰 확인 및 처리
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            loginWithToken(token).then((ok) => {
                if (ok) {
                    navigate('/');
                }
            });
        }
    }, [searchParams, loginWithToken, navigate]);

    const handleSocialLogin = (provider) => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        window.location.href = `${API_BASE}/auth/${provider}`;
    };

    const handleLocalSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'login') {
            const res = await localLogin({
                username: formData.username,
                password: formData.password
            });
            if (res.ok) navigate('/');
            else setError(res.error);
        } else {
            const res = await localSignup(formData);
            if (res.ok) navigate('/');
            else setError(res.error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const renderChoice = () => (
        <div className="button-group">
            <button
                className="login-btn kakao"
                onClick={() => handleSocialLogin('kakao')}
            >
                카카오로 시작하기
            </button>

            <button
                className="login-btn naver"
                onClick={() => handleSocialLogin('naver')}
            >
                네이버로 시작하기
            </button>

            <div className="divider">
                <span>또는</span>
            </div>

            <button
                className="login-btn local"
                onClick={() => setMode('login')}
            >
                일반 로그인
            </button>

            <div className="signup-link">
                계정이 없으신가요? <span onClick={() => navigate('/signup')}>회원가입</span>
            </div>
        </div>
    );

    const renderForm = () => (
        <form className="auth-form" onSubmit={handleLocalSubmit}>
            <div className="input-group">
                <input
                    type="text"
                    name="username"
                    placeholder="아이디"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="비밀번호"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {mode === 'signup' && (
                    <input
                        type="text"
                        name="nickname"
                        placeholder="닉네임"
                        value={formData.nickname}
                        onChange={handleChange}
                        required
                    />
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="submit-btn">
                {mode === 'login' ? '로그인' : '회원가입'}
            </button>

            <div className="back-link" onClick={() => {
                setMode('choice');
                setError('');
            }}>
                뒤로가기
            </div>
        </form>
    );

    return (
        <div id="loginScreen" className="login-screen">
            <div className="login-container">
                <div className="logo-area">
                    <PilaconLogo size={100} />
                </div>

                <h1 className="app-title">PILACON</h1>
                <p className="app-description">
                    강사와 센터를 잇는<br />
                    가장 완벽한 필라테스 파트너
                </p>

                {mode === 'choice' ? renderChoice() : renderForm()}

                <p className="terms-text">
                    로그인 시 <span>이용약관</span> 및 <span>개인정보 처리방침</span>에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
}
