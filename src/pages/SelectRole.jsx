import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePilaCon } from '../store/pilaconStore';
import FitJobLogo from '../components/FitJobLogo';
import './SelectRole.css';

export default function SelectRole() {
    const { user, updateUser, confirm } = usePilaCon();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // 역할 선택 처리
    const handleSelectRole = async (role) => {
        if (loading) return;
        
        try {
            setLoading(true);
            const res = await updateUser({ role });
            
            if (res.ok) {
                if (role === 'INSTRUCTOR') {
                    const proceed = await confirm(
                        "강사 회원 등록 완료",
                        "이력서를 지금 바로 등록하시겠어요? 이력서를 등록하면 더 많은 구인 공고를 만날 수 있습니다.",
                        { confirmText: "이력서 등록하기", cancelText: "나중에 하기" }
                    );
                    if (proceed) navigate('/profile/edit', { replace: true });
                    else navigate('/', { replace: true });
                } else if (role === 'CENTER') {
                    const proceed = await confirm(
                        "센터 회원 등록 완료",
                        "센터 정보를 지금 바로 등록하시겠어요? 센터를 등록하면 구인 공고를 올릴 수 있습니다.",
                        { confirmText: "센터 등록하기", cancelText: "나중에 하기" }
                    );
                    if (proceed) navigate('/profile/centers', { replace: true });
                    else navigate('/', { replace: true });
                }
            } else {
                alert(res.error || "역할 설정 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("Failed to select role:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        navigate('/login', { replace: true });
        return null;
    }

    // 이미 역할이 설정된 경우 홈으로
    if (user.role && user.role !== 'USER') {
        navigate('/', { replace: true });
        return null;
    }

    return (
        <div className="select-role-screen">
            <div className="select-role-container">
                <div className="logo-area">
                    <FitJobLogo height="32px" />
                </div>
                
                <h1 className="select-role-title">어떤 이용자이신가요?</h1>
                <p className="select-role-subtitle">회원님에게 꼭 맞는 서비스를 제공해 드릴게요.</p>

                <div className="role-cards">
                    <div 
                        className={`role-card instructor ${loading ? 'disabled' : ''}`}
                        onClick={() => !loading && handleSelectRole('INSTRUCTOR')}
                    >
                        <div className="role-icon">
                            <span role="img" aria-label="instructor">🧘‍♂️</span>
                        </div>
                        <div className="role-info">
                            <h3>강사입니다</h3>
                            <p>공고를 확인하고<br />이력서를 등록해 지원해보세요.</p>
                        </div>
                        <div className="select-badge">선택하기</div>
                    </div>

                    <div 
                        className={`role-card center ${loading ? 'disabled' : ''}`}
                        onClick={() => !loading && handleSelectRole('CENTER')}
                    >
                        <div className="role-icon">
                            <span role="img" aria-label="center">🏢</span>
                        </div>
                        <div className="role-info">
                            <h3>센터입니다</h3>
                            <p>우수한 강사를 찾고<br />구인 공고를 등록해보세요.</p>
                        </div>
                        <div className="select-badge">선택하기</div>
                    </div>
                </div>

                <div className="role-footer">
                    * 한 번 선택한 역할은 나중에 변경할 수 없습니다.
                </div>
            </div>

            {loading && (
                <div className="role-loading-overlay">
                    <div className="spinner"></div>
                    <p>설정 중...</p>
                </div>
            )}
        </div>
    );
}
