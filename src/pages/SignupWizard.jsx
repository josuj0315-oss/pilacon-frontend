import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import './SignupWizard.css';

const STEPS = [
    { title: '아이디를 입력해 주세요', subtitle: '6~16자 영문 소문자, 숫자만 사용해 주세요.' },
    { title: '이메일을 입력해 주세요', subtitle: '' },
    { title: '이메일을 인증해 주세요', subtitle: '' }, // Step 3
    { title: '비밀번호를 입력해 주세요', subtitle: '' },
    { title: '이름을 입력해 주세요', subtitle: '실명을 입력해 주세요.' },
    { title: '휴대폰 번호를 인증해 주세요', subtitle: '' },
    { title: '약관을 확인해 주세요', subtitle: '' },
];


export default function SignupWizard() {
    const { localSignup, checkUsername, requestPhoneVerification, verifyPhoneCode, requestEmailVerification, verifyEmailCode, showToast } = usePilaCon();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        phone: '',
        verificationCode: '',
        phoneVerificationToken: '',
        emailVerificationCode: '',
        emailVerificationToken: ''
    });

    const [status, setStatus] = useState({
        id: 'initial', // 'initial', 'checking', 'error', 'success'
        idMsg: '',
        emailValid: false,
        passwordValid: false,
        nameValid: false,
        emailRequested: false,
        emailVerified: false,
        emailMessage: '',
        emailMessageType: 'info',
        emailRequesting: false,
        emailVerifying: false,
        emailTimer: 600, // 10 minutes
        phoneRequested: false,
        phoneVerified: false,
        phoneMessage: '',
        phoneMessageType: 'info',
        phoneRequesting: false,
        phoneVerifying: false,
        timer: 300,
        terms: {
            all: false,
            age15: false,
            service: false,
            privacy: false,
            marketing: false
        }
    });

    const timerRef = useRef(null);
    const emailTimerRef = useRef(null);

    const normalizePhone = (val) => val.replace(/\D/g, '').slice(0, 11);
    const isPhoneValid = (val) => /^01\d{8,9}$/.test(val);

    // --- ID Step Logic ---
    const validateUsername = (val) => {
        const regex = /^[a-z0-9]{6,16}$/;
        return regex.test(val);
    };

    useEffect(() => {
        if (step !== 1) return;

        if (!formData.username) {
            setStatus(s => ({ ...s, id: 'initial', idMsg: '' }));
            return;
        }

        if (!validateUsername(formData.username)) {
            setStatus(s => ({ ...s, id: 'error', idMsg: '6~16자 영문 소문자, 숫자만 사용해 주세요.' }));
            return;
        }

        // debounce handleCheckId
        setStatus(s => ({ ...s, id: 'checking', idMsg: '확인 중...' }));
        const timer = setTimeout(async () => {
            const res = await checkUsername(formData.username);
            if (!res.available) {
                setStatus(s => ({ ...s, id: 'error', idMsg: '이미 사용 중인 아이디입니다.' }));
            } else {
                setStatus(s => ({ ...s, id: 'success', idMsg: '사용 가능한 아이디입니다.' }));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.username, step, checkUsername]);

    const handleCheckId = () => {
        // Manual check if needed, but handled by useEffect now
    };

    // --- Email Step Logic ---
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setStatus(s => ({ ...s, emailValid: emailRegex.test(formData.email) }));
    }, [formData.email]);

    // --- Password Step Logic ---
    useEffect(() => {
        const isLengthOk = formData.password.length >= 8;
        const matches = formData.password === formData.passwordConfirm && formData.password !== '';
        setStatus(s => ({ ...s, passwordValid: isLengthOk && matches }));
    }, [formData.password, formData.passwordConfirm]);

    // --- Name Step Logic ---
    useEffect(() => {
        const nameRegex = /^[a-zA-Z가-힣]{2,12}$/;
        setStatus(s => ({ ...s, nameValid: nameRegex.test(formData.name) }));
    }, [formData.name]);
    
    // --- Email Verification Logic ---
    const startEmailTimer = () => {
        setStatus(s => ({ ...s, emailRequested: true, emailTimer: 600 }));
        if (emailTimerRef.current) clearInterval(emailTimerRef.current);
        emailTimerRef.current = setInterval(() => {
            setStatus(s => {
                if (s.emailTimer <= 0) {
                    clearInterval(emailTimerRef.current);
                    return s;
                }
                return { ...s, emailTimer: s.emailTimer - 1 };
            });
        }, 1000);
    };

    const handleRequestEmailVerification = async () => {
        setStatus(prev => ({
            ...prev,
            emailRequesting: true,
            emailMessage: '',
            emailMessageType: 'info'
        }));

        const res = await requestEmailVerification(formData.email);

        if (!res.ok) {
            setStatus(prev => ({
                ...prev,
                emailRequesting: false,
                emailMessage: res.error,
                emailMessageType: 'error'
            }));
            return;
        }

        startEmailTimer();
        setStatus(prev => ({
            ...prev,
            emailRequesting: false,
            emailMessage: res.message,
            emailMessageType: 'success'
        }));
    };

    const handleVerifyEmailCode = async () => {
        if (!status.emailRequested) {
            setStatus(prev => ({ ...prev, emailMessage: '먼저 인증번호를 요청해 주세요.', emailMessageType: 'error' }));
            return;
        }
        if (status.emailTimer <= 0) {
            setStatus(prev => ({ ...prev, emailMessage: '인증 시간이 만료되었습니다. 다시 요청해 주세요.', emailMessageType: 'error' }));
            return;
        }

        setStatus(prev => ({ ...prev, emailVerifying: true, emailMessage: '', emailMessageType: 'info' }));
        const res = await verifyEmailCode(formData.email, formData.emailVerificationCode);

        if (!res.ok || !res.verified) {
            setStatus(prev => ({
                ...prev,
                emailVerifying: false,
                emailMessage: res.error || '인증번호가 올바르지 않습니다.',
                emailMessageType: 'error'
            }));
            return;
        }

        if (emailTimerRef.current) clearInterval(emailTimerRef.current);
        setFormData(prev => ({ ...prev, emailVerificationToken: res.verificationToken }));
        setStatus(prev => ({
            ...prev,
            emailVerifying: false,
            emailVerified: true,
            emailMessage: res.message,
            emailMessageType: 'success'
        }));
    };

    const updateEmailCode = (value) => {
        setFormData(prev => ({
            ...prev,
            emailVerificationCode: value.replace(/\D/g, '').slice(0, 6)
        }));
    };

    // --- Phone Step Logic ---
    const startTimer = () => {
        setStatus(s => ({ ...s, phoneRequested: true, timer: 300 }));
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setStatus(s => {
                if (s.timer <= 0) {
                    clearInterval(timerRef.current);
                    return s;
                }
                return { ...s, timer: s.timer - 1 };
            });
        }, 1000);
    };

    const formatTimer = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (emailTimerRef.current) clearInterval(emailTimerRef.current);
        };
    }, []);

    const updatePhone = (value) => {
        const nextPhone = normalizePhone(value);
        setFormData(prev => ({
            ...prev,
            phone: nextPhone,
            verificationCode: '',
            phoneVerificationToken: ''
        }));
        setStatus(prev => ({
            ...prev,
            phoneRequested: false,
            phoneVerified: false,
            phoneMessage: '',
            phoneMessageType: 'info',
            timer: 300
        }));
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const updateVerificationCode = (value) => {
        setFormData(prev => ({
            ...prev,
            verificationCode: value.replace(/\D/g, '').slice(0, 6)
        }));
        setStatus(prev => ({
            ...prev,
            phoneVerified: false,
            phoneMessage: '',
            phoneMessageType: 'info'
        }));
    };

    const handleRequestPhoneVerification = async () => {
        if (!isPhoneValid(formData.phone)) {
            setStatus(prev => ({
                ...prev,
                phoneRequested: false,
                phoneVerified: false,
                phoneMessage: '올바른 휴대폰 번호를 입력해 주세요.',
                phoneMessageType: 'error'
            }));
            return;
        }

        setStatus(prev => ({
            ...prev,
            phoneRequesting: true,
            phoneVerified: false,
            phoneMessage: '',
            phoneMessageType: 'info'
        }));

        const res = await requestPhoneVerification(formData.phone);

        if (!res.ok) {
            setStatus(prev => ({
                ...prev,
                phoneRequesting: false,
                phoneRequested: false,
                phoneMessage: res.error,
                phoneMessageType: 'error'
            }));
            return;
        }

        startTimer();
        setFormData(prev => ({
            ...prev,
            verificationCode: '',
            phoneVerificationToken: ''
        }));
        setStatus(prev => ({
            ...prev,
            phoneRequesting: false,
            phoneVerified: false,
            phoneMessage: res.message,
            phoneMessageType: 'success'
        }));
    };

    const handleVerifyPhoneCode = async () => {
        if (!status.phoneRequested) {
            setStatus(prev => ({
                ...prev,
                phoneMessage: '먼저 인증번호를 요청해 주세요.',
                phoneMessageType: 'error'
            }));
            return;
        }

        if (status.timer <= 0) {
            setStatus(prev => ({
                ...prev,
                phoneMessage: '인증 시간이 만료되었습니다. 다시 요청해 주세요.',
                phoneMessageType: 'error'
            }));
            return;
        }

        if (formData.verificationCode.length !== 6) {
            setStatus(prev => ({
                ...prev,
                phoneMessage: '인증번호 6자리를 입력해 주세요.',
                phoneMessageType: 'error'
            }));
            return;
        }

        setStatus(prev => ({
            ...prev,
            phoneVerifying: true,
            phoneMessage: '',
            phoneMessageType: 'info'
        }));

        const res = await verifyPhoneCode(formData.phone, formData.verificationCode);

        if (!res.ok || res.verified === false) {
            setStatus(prev => ({
                ...prev,
                phoneVerifying: false,
                phoneVerified: false,
                phoneMessage: res.error || '인증번호가 올바르지 않습니다.',
                phoneMessageType: 'error'
            }));
            return;
        }

        if (timerRef.current) clearInterval(timerRef.current);
        setFormData(prev => ({
            ...prev,
            phoneVerificationToken: res.verificationToken || ''
        }));
        setStatus(prev => ({
            ...prev,
            phoneVerifying: false,
            phoneVerified: true,
            phoneMessage: res.message,
            phoneMessageType: 'success'
        }));
    };

    // --- Terms Step Logic ---
    const toggleTerm = (key) => {
        if (key === 'all') {
            const next = !status.terms.all;
            setStatus(s => ({
                ...s,
                terms: {
                    all: next,
                    age15: next,
                    service: next,
                    privacy: next,
                    marketing: next
                }
            }));
        } else {
            setStatus(s => {
                const nextTerms = { ...s.terms, [key]: !s.terms[key] };
                const allChecked = nextTerms.age15 && nextTerms.service && nextTerms.privacy && nextTerms.marketing;
                return { ...s, terms: { ...nextTerms, all: allChecked } };
            });
        }
    };

    // --- Navigation ---
    const handleNext = async () => {
        if (step < 7) {
            setStep(step + 1);
        } else {
            // Final Signup
            const finalData = {
                username: formData.username,
                password: formData.password,
                nickname: formData.name, // Using name as nickname
                name: formData.name,
                email: formData.email,
                emailVerificationToken: formData.emailVerificationToken || undefined,
                phone: formData.phone,
                phoneVerificationToken: formData.phoneVerificationToken || undefined,
                marketingAgree: status.terms.marketing
            };
            const res = await localSignup(finalData);
            if (res.ok) {
                navigate('/');
            } else {
                showToast(res.error || "회원가입 중 오류가 발생했습니다.", "error");
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate(-1);
    };

    const handleClear = (key) => {
        if (key === 'phone') {
            updatePhone('');
            return;
        }
        if (key === 'verificationCode') {
            updateVerificationCode('');
            return;
        }
        setFormData({ ...formData, [key]: '' });
    };

    // --- Helpers ---
    const isStepValid = () => {
        switch (step) {
            case 1: return status.id === 'success';
            case 2: return status.emailValid;
            case 3: return status.emailVerified;
            case 4: return status.passwordValid;
            case 5: return status.nameValid;
            case 6: return status.phoneVerified;
            case 7: return status.terms.age15 && status.terms.service && status.terms.privacy;
            default: return false;
        }
    };

    return (
        <div className="signup-wizard-container">
            <header className="wizard-header">
                <div className="header-top">
                    <button type="button" className="header-btn" onClick={handleBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button
                        type="button"
                        className="header-btn header-close-btn"
                        tabIndex={-1}
                        onClick={() => navigate('/login')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${(step / 7) * 100}%` }}></div>
                </div>
            </header>

            <main className="wizard-content">
                <h1 className="step-title">{STEPS[step - 1].title}</h1>
                <p className="step-subtitle">{STEPS[step - 1].subtitle}</p>

                {step === 1 && (
                    <div className="input-container">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className={`wizard-input ${status.id === 'error' ? 'error' : ''}`}
                                placeholder="아이디"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            {formData.username && (
                                <button type="button" tabIndex={-1} className="clear-btn" onClick={() => handleClear('username')}>✕</button>
                            )}
                        </div>
                        {status.idMsg && (
                            <p className={`validation-msg ${status.id === 'error' ? 'error' : status.id === 'success' ? 'success' : 'info'}`}>
                                {status.idMsg}
                            </p>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="input-container">
                        <div className="input-wrapper">
                            <input
                                type="email"
                                className={`wizard-input ${formData.email && !status.emailValid ? 'error' : ''}`}
                                placeholder="이메일 주소"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoFocus
                            />
                            {formData.email && (
                                <button type="button" tabIndex={-1} className="clear-btn" onClick={() => handleClear('email')}>✕</button>
                            )}
                        </div>
                        {formData.email && !status.emailValid && (
                            <p className="validation-msg error">올바른 이메일 형식이 아닙니다.</p>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <>
                        <div className="verify-row">
                            <div className="input-container" style={{ flex: 1, marginBottom: 0 }}>
                                <input
                                    type="email"
                                    className="wizard-input readonly"
                                    value={formData.email}
                                    readOnly
                                />
                            </div>
                            <button
                                type="button"
                                className="verify-btn"
                                onClick={handleRequestEmailVerification}
                                disabled={status.emailRequesting}
                            >
                                {status.emailRequesting ? '전송 중...' : status.emailRequested ? '재전송' : '인증 요청'}
                            </button>
                        </div>
                        {status.emailRequested && (
                            <div className="verify-row" style={{ marginTop: '12px' }}>
                                <div className="input-container verification-input-container" style={{ flex: 1, marginBottom: 0 }}>
                                    <input
                                        type="tel"
                                        className={`wizard-input ${status.emailMessageType === 'error' ? 'error' : ''}`}
                                        placeholder="인증번호 6자리"
                                        value={formData.emailVerificationCode}
                                        onChange={(e) => updateEmailCode(e.target.value)}
                                        autoFocus
                                    />
                                    {!status.emailVerified && <div className="timer-wrap">{formatTimer(status.emailTimer)}</div>}
                                </div>
                                <button
                                    type="button"
                                    className="verify-btn"
                                    onClick={handleVerifyEmailCode}
                                    disabled={status.emailVerifying || status.emailVerified}
                                >
                                    {status.emailVerified ? '완료' : status.emailVerifying ? '확인 중...' : '확인'}
                                </button>
                            </div>
                        )}
                        {status.emailMessage && (
                            <p className={`validation-msg ${status.emailMessageType === 'error' ? 'error' : 'success'}`}>
                                {status.emailMessage}
                            </p>
                        )}
                    </>
                )}

                {step === 4 && (
                    <>
                        <div className="input-container">
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    className={`wizard-input ${formData.password && formData.password.length < 8 ? 'error' : ''}`}
                                    placeholder="비밀번호 (8자 이상)"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    autoFocus
                                />
                                {formData.password && (
                                    <button type="button" tabIndex={-1} className="clear-btn" onClick={() => handleClear('password')}>✕</button>
                                )}
                            </div>
                            {formData.password && formData.password.length < 8 && (
                                <p className="validation-msg error">최소 8자 이상 입력해 주세요.</p>
                            )}
                        </div>
                        <div className="input-container">
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    className={`wizard-input ${formData.passwordConfirm && formData.password !== formData.passwordConfirm ? 'error' : ''}`}
                                    placeholder="비밀번호 확인"
                                    value={formData.passwordConfirm}
                                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                />
                                {formData.passwordConfirm && (
                                    <button type="button" tabIndex={-1} className="clear-btn" onClick={() => handleClear('passwordConfirm')}>✕</button>
                                )}
                            </div>
                            {formData.passwordConfirm && formData.password !== formData.passwordConfirm && (
                                <p className="validation-msg error">비밀번호가 일치하지 않습니다.</p>
                            )}
                        </div>
                    </>
                )}

                {step === 5 && (
                    <div className="input-container">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className={`wizard-input ${formData.name && !status.nameValid ? 'error' : ''}`}
                                placeholder="이름"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                            />
                            {formData.name && (
                                <button type="button" tabIndex={-1} className="clear-btn" onClick={() => handleClear('name')}>✕</button>
                            )}
                        </div>
                        {formData.name && !status.nameValid && (
                            <p className="validation-msg error">2~12자 한글 또는 영문을 입력해 주세요.</p>
                        )}
                    </div>
                )}

                {step === 6 && (
                    <>
                        <div className="verify-row">
                            <div className="input-container" style={{ flex: 1, marginBottom: 0 }}>
                                <input
                                    type="tel"
                                    className={`wizard-input ${formData.phone && !isPhoneValid(formData.phone) ? 'error' : ''}`}
                                    placeholder="휴대폰 번호 (- 제외)"
                                    value={formData.phone}
                                    onChange={(e) => updatePhone(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="button"
                                className="verify-btn"
                                onClick={handleRequestPhoneVerification}
                                disabled={status.phoneRequesting}
                            >
                                {status.phoneRequesting ? '전송 중...' : status.phoneRequested ? '재전송' : '인증'}
                            </button>
                        </div>
                        {formData.phone && !isPhoneValid(formData.phone) && (
                            <p className="validation-msg error">휴대폰 번호 10~11자리를 입력해 주세요.</p>
                        )}
                        {status.phoneRequested && (
                            <>
                                <div className="verify-row">
                                    <div className="input-container verification-input-container" style={{ flex: 1, marginBottom: 0 }}>
                                        <input
                                            type="tel"
                                            className={`wizard-input ${status.phoneMessageType === 'error' && formData.verificationCode ? 'error' : ''}`}
                                            placeholder="인증번호 6자리"
                                            value={formData.verificationCode}
                                            onChange={(e) => updateVerificationCode(e.target.value)}
                                        />
                                        {!status.phoneVerified && <div className="timer-wrap">{formatTimer(status.timer)}</div>}
                                    </div>
                                    <button
                                        type="button"
                                        className="verify-btn"
                                        onClick={handleVerifyPhoneCode}
                                        disabled={status.phoneVerifying || status.phoneVerified}
                                    >
                                        {status.phoneVerified ? '완료' : status.phoneVerifying ? '확인 중...' : '확인'}
                                    </button>
                                </div>
                            </>
                        )}
                        {status.phoneMessage && (
                            <p className={`validation-msg ${status.phoneMessageType === 'error' ? 'error' : status.phoneMessageType === 'success' ? 'success' : 'info'}`}>
                                {status.phoneMessage}
                            </p>
                        )}
                        {status.phoneVerified && (
                            <p className="validation-msg success">
                                인증된 번호로 가입이 진행됩니다.
                            </p>
                        )}
                        {status.phoneRequested && !status.phoneVerified && status.timer <= 0 && (
                            <p className="validation-msg error">
                                인증 시간이 만료되었습니다. 인증번호를 다시 요청해 주세요.
                            </p>
                        )}
                    </>
                )}

                {step === 7 && (
                    <div className="terms-list">
                        <div className={`terms-item all-agree ${status.terms.all ? 'checked' : ''}`} onClick={() => toggleTerm('all')}>
                            <div className="checkbox-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="terms-text-content">
                                <span>약관 전체동의</span>
                            </div>
                        </div>

                        <div className={`terms-item ${status.terms.age15 ? 'checked' : ''}`} onClick={() => toggleTerm('age15')}>
                            <div className="checkbox-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="terms-text-content">
                                <span>(필수) 만 15세 이상입니다</span>
                            </div>
                        </div>

                        <div className={`terms-item ${status.terms.service ? 'checked' : ''}`} onClick={() => toggleTerm('service')}>
                            <div className="checkbox-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="terms-text-content">
                                <span>(필수) 서비스 이용약관 동의</span>
                                <span className="detail-link">상세보기 &gt;</span>
                            </div>
                        </div>

                        <div className={`terms-item ${status.terms.privacy ? 'checked' : ''}`} onClick={() => toggleTerm('privacy')}>
                            <div className="checkbox-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="terms-text-content">
                                <span>(필수) 개인정보 처리방침 동의</span>
                                <span className="detail-link">상세보기 &gt;</span>
                            </div>
                        </div>

                        <div className={`terms-item ${status.terms.marketing ? 'checked' : ''}`} onClick={() => toggleTerm('marketing')}>
                            <div className="checkbox-circle">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <div className="terms-text-content">
                                <span>(선택) 광고성 정보 수신 동의</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="wizard-footer">
                <button
                    className={`cta-button ${isStepValid() ? 'active' : ''}`}
                    disabled={!isStepValid()}
                    onClick={handleNext}
                >
                    {step === 7 ? '시작하기' : '다음'}
                </button>
            </footer>
        </div>
    );
}
