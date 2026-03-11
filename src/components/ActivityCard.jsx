import React from 'react';
import { ICONS, ICON_CONFIG } from '../constants/icons';
import { getApplicationStatusLabel } from '../store/pilaconStore';

const TYPE_LABEL = {
    sub: "대타/급구",
    short: "단기",
    regular: "정규직",
};

export default function ActivityCard({
    type, // 'applied' or 'recruitment'
    item, // job or application object
    onClick,
    onAction,
    onSecondaryAction
}) {
    if (type === 'applied') {
        const job = item.job;
        const appliedDate = item.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "";
        const categoryText = job?.category ?? "직군";
        const typeLabel = TYPE_LABEL[job?.type] ?? job?.type ?? "형태";

        return (
            <div className="activity-card is-clickable" onClick={onClick}>
                <div className="activity-card-top">
                    <div className="activity-card-labels">
                        <span className="breadcrumb">{categoryText} · {typeLabel}</span>
                        <h3 className="activity-card-title">{job?.title}</h3>
                        <span className="activity-card-date">지원일: {appliedDate}</span>
                    </div>
                    <span className={`status-badge ${item.status === 'accepted' ? 'accepted' :
                        job?.status === 'closed' ? 'closed' :
                            item.status === 'submitted' ? 'submitted' :
                                item.status === 'canceled' ? 'closed' : 'reviewing'
                        }`}>
                        {item.status === 'accepted' ? '채용확정' :
                            job?.status === 'closed' && item.status !== 'accepted' ? '마감' :
                                getApplicationStatusLabel(item.status)}
                    </span>
                </div>
                {/* 버튼 제거됨 */}
            </div>
        );
    }

    // recruitment (내가 올린 공고)
    const applicantsCount = item.applicants?.length ?? 0;
    const categoryText = item.category ?? "직군";
    const typeLabel = TYPE_LABEL[item.type] ?? item.type ?? "";
    const createdDate = item.createdAt?.slice(0, 10).replaceAll("-", ".") ?? "";

    return (
        <div className="activity-card" onClick={onClick}>
            <div className="activity-card-top">
                <div className="activity-card-labels">
                    <span className="breadcrumb">{categoryText}{typeLabel ? ` · ${typeLabel}` : ""}</span>
                    <h3 className="activity-card-title">{item.title}</h3>
                    <span className="activity-card-date">등록일: {createdDate} · 지원자 {applicantsCount}명</span>
                </div>
                <span className={`status-badge ${item.status === 'active' ? 'submitted' : 'closed'}`}>
                    {item.status === 'active' ? '진행중' : '마감'}
                </span>
            </div>

            <div className="activity-card-footer">
                <button className="activity-btn activity-btn-primary" onClick={(e) => { e.stopPropagation(); onAction?.(); }}>
                    지원자 관리 <ICONS.activity size={14} />
                </button>
                <button className="activity-btn activity-btn-secondary" onClick={(e) => { e.stopPropagation(); onSecondaryAction?.(); }}>
                    마감하기
                </button>
            </div>
        </div>
    );
}
