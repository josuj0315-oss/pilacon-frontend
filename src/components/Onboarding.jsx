import React, { useState, useRef, useEffect } from 'react';
import './Onboarding.css';
import introImg from '../assets/onboarding/intro.png';
import searchImg from '../assets/onboarding/search.png';
import applyImg from '../assets/onboarding/apply.png';
import chatImg from '../assets/onboarding/chat.png';
import PilaconLogo from './PilaconLogo';

const slides = [
    {
        id: 1,
        title: "운동 강사와 센터를 연결하는 플랫폼",
        description: "필라테스, 요가, 헬스 트레이너 등 운동 직군을 위한 전문 구인구직 서비스입니다. 대타, 단기, 정규직 채용 정보를 한 곳에서 확인할 수 있습니다.",
        image: introImg
    },
    {
        id: 2,
        title: "내 주변 운동 채용 찾기",
        description: "지역과 운동 종목을 선택하면 맞춤 채용 공고를 확인할 수 있습니다.",
        image: searchImg
    },
    {
        id: 3,
        title: "간편하게 지원하기",
        description: "이력서를 등록하고 마음에 드는 공고에 빠르게 지원할 수 있습니다.",
        image: applyImg
    },
    {
        id: 4,
        title: "채팅으로 빠르게 연결",
        description: "센터와 강사가 채팅으로 바로 소통하며 면접 및 채용 진행을 할 수 있습니다.",
        image: chatImg
    },
    {
        id: 5,
        title: "필라콘 시작하기",
        description: "강사와 센터를 잇는 가장 완벽한 파트너,\n지금 바로 시작해보세요!",
        isLast: true
    }
];

export default function Onboarding({ onComplete }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft;
            const width = containerRef.current.offsetWidth;
            const index = Math.round(scrollLeft / width);
            setActiveIndex(index);
        }
    };

    return (
        <div className="onboarding-overlay">
            <div 
                className="onboarding-container" 
                ref={containerRef}
                onScroll={handleScroll}
            >
                {slides.map((slide, index) => (
                    <div className="onboarding-slide" key={slide.id}>
                        <div className="onboarding-image-box">
                            {slide.isLast ? (
                                <div style={{ animation: 'fadeInScale 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                    <PilaconLogo size={120} />
                                </div>
                            ) : (
                                <img src={slide.image} alt={slide.title} />
                            )}
                        </div>
                        <div className="onboarding-content">
                            <h1 className="onboarding-title">{slide.title}</h1>
                            <p className="onboarding-description">
                                {slide.description.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="onboarding-footer">
                <div className="onboarding-dots">
                    {slides.map((_, index) => (
                        <div 
                            key={index} 
                            className={`dot ${index === activeIndex ? 'active' : ''}`}
                        />
                    ))}
                </div>
                
                {activeIndex === slides.length - 1 && (
                    <button className="start-btn" onClick={onComplete}>
                        시작하기
                    </button>
                )}
            </div>
        </div>
    );
}
