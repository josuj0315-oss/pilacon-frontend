import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import FitJobLogo from '../components/FitJobLogo';
import './SetNickname.css';

export default function SetNickname() {
    const { user, checkNickname, updateUser } = usePilaCon();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle', 'checking', 'available', 'unavailable'
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // 로그인하지 않은 경우 처리
    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    const handleCheckDuplicate = async () => {
        if (!nickname || nickname.length < 2) {
            setStatus('unavailable');
            setMessage('닉네임은 2자 이상 입력해 주세요.');
            return;
        }

        // 간단한 유효성 검사 (특수문자 제외)
        const regex = /^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+$/;
        if (!regex.test(nickname)) {
            setStatus('unavailable');
            setMessage('한글, 영문, 숫자만 사용할 수 있습니다.');
            return;
        }

        try {
            setStatus('checking');
            const res = await checkNickname(nickname);
            if (res.available) {
                setStatus('available');
                setMessage('사용 가능한 닉네임입니다.');
            } else {
                setStatus('unavailable');
                setMessage('이미 사용 중인 닉네임입니다.');
            }
        } catch (error) {
            setStatus('unavailable');
            setMessage('중복 확인 중 오류가 발생했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status !== 'available' || loading) return;

        try {
            setLoading(true);
            const res = await updateUser({ nickname });
            if (res.ok) {
                navigate('/select-role', { replace: true });
            } else {
                setMessage(res.error || '닉네임 저장에 실패했습니다.');
                setStatus('unavailable');
            }
        } catch (error) {
            setMessage('서버 통신 중 오류가 발생했습니다.');
            setStatus('unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="set-nickname-screen">
            <div className="set-nickname-container">
                <div className="logo-area">
                    <FitJobLogo height="32px" />
                </div>

                <h1 className="set-nickname-title">닉네임을 설정해주세요</h1>
                <p className="set-nickname-subtitle">
                    서비스에서 사용할 이름을 정해주세요.<br />
                    언제든지 마이페이지에서 변경할 수 있습니다.
                </p>

                <form className="nickname-form" onSubmit={handleSubmit}>
                    <div className="input-with-button">
                        <input
                            type="text"
                            placeholder="닉네임 입력 (2~15자)"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setStatus('idle');
                                setMessage('');
                            }}
                            maxLength={15}
                            required
                        />
                        <button
                            type="button"
                            className="check-btn"
                            onClick={handleCheckDuplicate}
                            disabled={status === 'checking' || !nickname}
                        >
                            {status === 'checking' ? '확인 중' : '중복 확인'}
                        </button>
                    </div>

                    {message && (
                        <p className={`status-message ${status}`}>
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="next-btn"
                        disabled={status !== 'available' || loading}
                    >
                        {loading ? '저장 중...' : '다음'}
                    </button>
                </form>
            </div>
        </div>
    );
}
