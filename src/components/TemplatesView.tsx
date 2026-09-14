import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { formatCurrency, FX_SYMBOLS } from '../utils/calculations';
import { FileText, Plus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { fetchGoalTemplatesApi } from '../api';

interface TemplatesViewProps {
  onInstantiateTemplate: (templateName: string, category: string, targetAmount: number, inflation: number) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onInstantiateTemplate }) => {
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    fetchGoalTemplatesApi().then((data) => {
      setTemplates(data || []);
    });
  }, []);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Goal Template Library 📋</h1>
          <p>Instantiate pre-built templates or save custom goal structures for future reuse.</p>
        </div>
      </div>

      <div className="goals-grid">
        {templates.map((tpl, i) => (
          <div key={i} className="goal-card" style={{ borderTop: '4px solid var(--accent-primary)' }}>
            <div className="goal-card-top">
              <div className="goal-icon-title">
                <div className="goal-category-icon">📋</div>
                <div>
                  <h3 className="goal-title">{tpl.name}</h3>
                  <span className="goal-category-badge">{tpl.category} Template</span>
                </div>
              </div>
            </div>

            <p className="template-desc">{tpl.desc}</p>

            <div className="template-stats-box">
              <span>Base Target: <strong>{formatCurrency(tpl.target)}</strong></span>
              <span>Inf Rate: <strong>{tpl.inflation}% p.a.</strong></span>
            </div>

            <button
              className="btn-primary"
              style={{ marginTop: 8 }}
              onClick={() => onInstantiateTemplate(tpl.name, tpl.category, tpl.target, tpl.inflation)}
            >
              <Sparkles size={16} />
              <span>Instantiate Goal</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
