import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Calculator,
  Sparkles,
  Award,
  FileCheck,
  TrendingDown,
  Percent,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Download,
  Send,
  Building2,
  Scale,
  Zap,
  BookOpen,
  Sliders,
  Check,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, convertCurrency } from '../utils/calculations';
import { useNotification } from '../context/NotificationContext';
import { fetchCATaxAdvisorDataApi } from '../api';

interface CATaxAdvisorViewProps {
  currency?: string;
}

export const CATaxAdvisorView: React.FC<CATaxAdvisorViewProps> = ({ currency = 'INR' }) => {
  const { showToast } = useNotification();

  // Active Regime Selector: 'auto' | 'old' | 'new'
  const [selectedRegime, setSelectedRegime] = useState<'auto' | 'old' | 'new'>('auto');

  // Inputs for Income Tax Calculator
  const [grossIncome, setGrossIncome] = useState<number>(1450000); // ₹14.5L
  const [section80C, setSection80C] = useState<number>(150000); // ₹1.5L max
  const [nps80CCD, setNps80CCD] = useState<number>(50000); // ₹50k max
  const [health80D, setHealth80D] = useState<number>(50000); // Self + Parents
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(200000); // Section 24(b)
  const [hraExemption, setHraExemption] = useState<number>(180000); // HRA claimed
  const [otherDeductions, setOtherDeductions] = useState<number>(50000); // LTA, Food, Education loan 80E
  const [stdDeduction, setStdDeduction] = useState<number>(75000); // Standard Deduction 2024-25 budget

  useEffect(() => {
    fetchCATaxAdvisorDataApi().then((data) => {
      if (data) {
        if (data.grossIncome) setGrossIncome(data.grossIncome);
        if (data.stdDeduction) setStdDeduction(data.stdDeduction);
        if (data.section80C) setSection80C(data.section80C);
        if (data.nps80CCD) setNps80CCD(data.nps80CCD);
        if (data.health80D) setHealth80D(data.health80D);
        if (data.homeLoanInterest) setHomeLoanInterest(data.homeLoanInterest);
        if (data.hraExemption) setHraExemption(data.hraExemption);
        if (data.otherDeductions) setOtherDeductions(data.otherDeductions);
      }
    });
  }, []);

  // CA AI Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ca'; text: string; time: string }>>([
    {
      sender: 'ca',
      text: 'Namaste! I am your AI Chartered Accountant & Zero-Tax Advisor. Select any tax regime below or structure your deductions to legally bring your tax liability down to ₹0. How can I assist you today?',
      time: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');

  // Tax Computations: Old vs New Regime
  const taxComparison = useMemo(() => {
    // 1. OLD REGIME COMPUTATION
    const totalOldDeductions = stdDeduction + section80C + nps80CCD + health80D + homeLoanInterest + hraExemption + otherDeductions;
    const oldTaxableIncome = Math.max(0, grossIncome - totalOldDeductions);

    let oldBaseTax = 0;
    const oldSlabs: Array<{ slab: string; rate: string; amount: number }> = [];

    if (oldTaxableIncome > 250000) {
      const slab1 = Math.min(oldTaxableIncome - 250000, 250000);
      const tax1 = slab1 * 0.05;
      oldBaseTax += tax1;
      oldSlabs.push({ slab: '₹2.5L - ₹5L', rate: '5%', amount: tax1 });
    }
    if (oldTaxableIncome > 500000) {
      const slab2 = Math.min(oldTaxableIncome - 500000, 500000);
      const tax2 = slab2 * 0.2;
      oldBaseTax += tax2;
      oldSlabs.push({ slab: '₹5L - ₹10L', rate: '20%', amount: tax2 });
    }
    if (oldTaxableIncome > 1000000) {
      const slab3 = oldTaxableIncome - 1000000;
      const tax3 = slab3 * 0.3;
      oldBaseTax += tax3;
      oldSlabs.push({ slab: 'Above ₹10L', rate: '30%', amount: tax3 });
    }

    let oldRebate = 0;
    if (oldTaxableIncome <= 500000) {
      oldRebate = oldBaseTax;
      oldBaseTax = 0;
    }

    const oldCess = oldBaseTax * 0.04;
    const netTaxOld = Math.round(oldBaseTax + oldCess);

    // 2. NEW REGIME COMPUTATION (FY 2024-25 Slabs)
    const newTaxableIncome = Math.max(0, grossIncome - stdDeduction); // Standard deduction ₹75,000 allowed in New Regime

    let newBaseTax = 0;
    const newSlabs: Array<{ slab: string; rate: string; amount: number }> = [];

    if (newTaxableIncome > 300000) {
      const slab1 = Math.min(newTaxableIncome - 300000, 400000);
      const tax1 = slab1 * 0.05;
      newBaseTax += tax1;
      newSlabs.push({ slab: '₹3L - ₹7L', rate: '5%', amount: tax1 });
    }
    if (newTaxableIncome > 700000) {
      const slab2 = Math.min(newTaxableIncome - 700000, 300000);
      const tax2 = slab2 * 0.1;
      newBaseTax += tax2;
      newSlabs.push({ slab: '₹7L - ₹10L', rate: '10%', amount: tax2 });
    }
    if (newTaxableIncome > 1000000) {
      const slab3 = Math.min(newTaxableIncome - 1000000, 200000);
      const tax3 = slab3 * 0.15;
      newBaseTax += tax3;
      newSlabs.push({ slab: '₹10L - ₹12L', rate: '15%', amount: tax3 });
    }
    if (newTaxableIncome > 1200000) {
      const slab4 = Math.min(newTaxableIncome - 1200000, 300000);
      const tax4 = slab4 * 0.2;
      newBaseTax += tax4;
      newSlabs.push({ slab: '₹12L - ₹15L', rate: '20%', amount: tax4 });
    }
    if (newTaxableIncome > 1500000) {
      const slab5 = newTaxableIncome - 1500000;
      const tax5 = slab5 * 0.3;
      newBaseTax += tax5;
      newSlabs.push({ slab: 'Above ₹15L', rate: '30%', amount: tax5 });
    }

    let newRebate = 0;
    if (newTaxableIncome <= 700000) {
      newRebate = newBaseTax;
      newBaseTax = 0;
    }

    const newCess = newBaseTax * 0.04;
    const netTaxNew = Math.round(newBaseTax + newCess);

    const recommended = netTaxOld <= netTaxNew ? 'old' : 'new';
    const taxSaved = Math.abs(netTaxOld - netTaxNew);

    return {
      totalOldDeductions,
      oldTaxableIncome,
      oldSlabs,
      oldRebate,
      oldCess,
      netTaxOld,

      newTaxableIncome,
      newSlabs,
      newRebate,
      newCess,
      netTaxNew,

      recommended,
      taxSaved,
      isZeroTax: netTaxOld === 0 || netTaxNew === 0,
    };
  }, [grossIncome, section80C, nps80CCD, health80D, homeLoanInterest, hraExemption, otherDeductions, stdDeduction]);

  // Determine active view regime
  const activeRegime = selectedRegime === 'auto' ? taxComparison.recommended : selectedRegime;
  const activeTax = activeRegime === 'old' ? taxComparison.netTaxOld : taxComparison.netTaxNew;
  const activeTaxableIncome = activeRegime === 'old' ? taxComparison.oldTaxableIncome : taxComparison.newTaxableIncome;
  const activeSlabs = activeRegime === 'old' ? taxComparison.oldSlabs : taxComparison.newSlabs;
  const activeRebate = activeRegime === 'old' ? taxComparison.oldRebate : taxComparison.newRebate;

  const handleSendQuery = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();
      if (lower.includes('zero tax') || lower.includes('no tax')) {
        reply = `To achieve 100% Zero Tax under the Old Regime:
1. Maximize Section 80C to ₹1,50,000 (ELSS / EPF).
2. Claim Tier-1 NPS under 80CCD(1B) for ₹50,000.
3. Claim Medical Insurance under 80D for ₹50,000.
4. Claim Home Loan Interest under Section 24(b) for ₹2,00,000.
5. Claim HRA / Rent Exemption under Section 10(13A) for ₹1,80,000.
This brings Taxable Income down to ${formatCurrency(taxComparison.oldTaxableIncome, currency)}, resulting in ${taxComparison.netTaxOld === 0 ? '🎉 ZERO TAX LIABILITY!' : `tax liability of ${formatCurrency(taxComparison.netTaxOld, currency)}!`}`;
      } else if (lower.includes('regime') || lower.includes('new vs old')) {
        reply = `Comparing Old vs New Regime for ${formatCurrency(grossIncome, currency)} Income:
• Old Tax Regime: Net Tax = ${formatCurrency(taxComparison.netTaxOld, currency)} (with ${formatCurrency(taxComparison.totalOldDeductions, currency)} deductions)
• New Tax Regime: Net Tax = ${formatCurrency(taxComparison.netTaxNew, currency)} (with ₹75,000 standard deduction)
Conclusion: ${taxComparison.recommended === 'old' ? 'Old Regime is better!' : 'New Regime is better!'} Opting for ${taxComparison.recommended === 'old' ? 'Old Regime' : 'New Regime'} saves you ${formatCurrency(taxComparison.taxSaved, currency)} annually.`;
      } else {
        reply = `Based on your Gross Income of ${formatCurrency(grossIncome, currency)}, the ${activeRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'} gives you an effective tax liability of ${formatCurrency(activeTax, currency)}.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ca', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 600);
  };

  const handleExportCAReport = () => {
    showToast(`Zero-Tax Strategy Report for ${activeRegime.toUpperCase()} REGIME generated! Preparing export...`, 'success');
    window.print();
  };

  return (
    <div className="content-area">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
            <span style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(59,130,246,0.2))', color: '#10b981', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-block' }}>
              AI CHARTERED ACCOUNTANT 💼
            </span>
            <h1 style={{ fontSize: 'clamp(16px, 4.2vw, 22px)', margin: '2px 0 0 0', lineHeight: 1.3 }}>Zero-Tax Engine & CA Advisory Suite 🛡️</h1>
          </div>
          <p style={{ fontSize: 'clamp(11px, 2.8vw, 13px)', margin: '4px 0 0 0' }}>Switch regimes interactively, optimize deductions & legally bring tax liability down to ₹0.</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={handleExportCAReport}>
            <Download size={16} />
            <span>Export CA Tax Certificate</span>
          </button>
        </div>
      </div>

      {/* Regime Selector Bar & Banner */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Interactive Tax Regime Selector
            </span>
            <h3 style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>
              Select Active Tax Regime to Test & Audit
            </h3>
          </div>

          {/* Interactive Toggle Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-main)', padding: 3, borderRadius: 10, border: '1px solid var(--border-color)', gap: 3, flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
            <button
              onClick={() => {
                setSelectedRegime('auto');
                showToast(`Auto-switch enabled: Recommending ${taxComparison.recommended === 'old' ? 'Old Regime' : 'New Regime'}`, 'info');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 800,
                border: 'none',
                background: selectedRegime === 'auto' ? 'var(--accent-primary)' : 'transparent',
                color: selectedRegime === 'auto' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                flex: 1,
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={13} />
              <span>Auto ({taxComparison.recommended.toUpperCase()})</span>
            </button>

            <button
              onClick={() => {
                setSelectedRegime('old');
                showToast('Switched view to Old Tax Regime', 'info');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 800,
                border: 'none',
                background: selectedRegime === 'old' ? '#10b981' : 'transparent',
                color: selectedRegime === 'old' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                flex: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {selectedRegime === 'old' && <Check size={13} />}
              <span>Old Regime</span>
            </button>

            <button
              onClick={() => {
                setSelectedRegime('new');
                showToast('Switched view to New Tax Regime (FY 2024-25)', 'info');
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 800,
                border: 'none',
                background: selectedRegime === 'new' ? '#3b82f6' : 'transparent',
                color: selectedRegime === 'new' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                flex: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {selectedRegime === 'new' && <Check size={13} />}
              <span>New Regime</span>
            </button>
          </div>
        </div>

        {/* Selected Regime Audit Status Banner */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: activeTax === 0
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${activeTax === 0 ? '#10b981' : '#3b82f6'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Award size={24} color={activeTax === 0 ? '#10b981' : '#3b82f6'} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
                Active View: <strong>{activeRegime === 'old' ? 'Old Tax Regime' : 'New Tax Regime'}</strong>
                {selectedRegime === 'auto' && ' (Auto-Recommended)'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                Gross Income: {formatCurrency(grossIncome, currency)} • Taxable Income: <strong>{formatCurrency(activeTaxableIncome, currency)}</strong> • Net Tax: <strong style={{ color: activeTax === 0 ? '#10b981' : '#38bdf8' }}>{formatCurrency(activeTax, currency)}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Tax Saving vs Other Regime</span>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
              +{formatCurrency(taxComparison.taxSaved, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Clickable Regime Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Old Regime Card */}
        <div
          onClick={() => {
            setSelectedRegime('old');
            showToast('Switched to Old Tax Regime', 'info');
          }}
          style={{
            padding: 20,
            borderRadius: 16,
            background: activeRegime === 'old' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
            border: `2px solid ${activeRegime === 'old' ? '#10b981' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          {taxComparison.recommended === 'old' && (
            <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#10b981', color: '#fff' }}>
              RECOMMENDED
            </span>
          )}

          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#10b981', marginBottom: 4 }}>
            Old Tax Regime (With Deductions)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 10px 0' }}>
            {formatCurrency(taxComparison.netTaxOld, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>Total Deductions (80C, 80D, HRA, 24b): <strong>{formatCurrency(taxComparison.totalOldDeductions, currency)}</strong></div>
            <div>Taxable Base: <strong>{formatCurrency(taxComparison.oldTaxableIncome, currency)}</strong></div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: activeRegime === 'old' ? '#10b981' : 'var(--text-muted)' }}>
            {activeRegime === 'old' ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
            <span>{activeRegime === 'old' ? 'Currently Selected' : 'Click to Inspect Old Regime'}</span>
          </div>
        </div>

        {/* New Regime Card */}
        <div
          onClick={() => {
            setSelectedRegime('new');
            showToast('Switched to New Tax Regime (FY 2024-25)', 'info');
          }}
          style={{
            padding: 20,
            borderRadius: 16,
            background: activeRegime === 'new' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
            border: `2px solid ${activeRegime === 'new' ? '#3b82f6' : 'var(--border-color)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          {taxComparison.recommended === 'new' && (
            <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: '#3b82f6', color: '#fff' }}>
              RECOMMENDED
            </span>
          )}

          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 4 }}>
            New Tax Regime (FY 2024-25 Budget)
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 10px 0' }}>
            {formatCurrency(taxComparison.netTaxNew, currency)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div>Standard Deduction: <strong>{formatCurrency(stdDeduction, currency)}</strong></div>
            <div>Taxable Base: <strong>{formatCurrency(taxComparison.newTaxableIncome, currency)}</strong></div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: activeRegime === 'new' ? '#3b82f6' : 'var(--text-muted)' }}>
            {activeRegime === 'new' ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
            <span>{activeRegime === 'new' ? 'Currently Selected' : 'Click to Inspect New Regime'}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Calculator & Breakdown */}
      <div className="calculators-grid">
        {/* Left Column: Interactive Income & Deduction Sliders */}
        <div className="metric-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={18} color="#3b82f6" />
              Income & Deduction Structuring
            </h3>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              FY 2024-25 BUDGET READY
            </span>
          </div>

          {/* Gross Income Input */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label">Gross Annual Salary / Income:</label>
              <strong style={{ color: 'var(--accent-primary)', fontSize: 15 }}>{formatCurrency(grossIncome, currency)}</strong>
            </div>
            <input
              type="range"
              min={300000}
              max={5000000}
              step={50000}
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: 14 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Legal Tax Exemptions & Deductions</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: activeRegime === 'old' ? '#10b981' : 'var(--text-muted)' }}>
                {activeRegime === 'old' ? '✓ Applies to Active Old Regime' : '(Switch to Old Regime to apply)'}
              </span>
            </h4>

            {/* Section 80C */}
            <div className="form-group" style={{ marginBottom: 14, opacity: activeRegime === 'old' ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Section 80C (EPF, PPF, ELSS, Insurance):</span>
                <strong>{formatCurrency(section80C, currency)} / ₹1.5L</strong>
              </div>
              <input
                type="range"
                min={0}
                max={150000}
                step={10000}
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981' }}
              />
            </div>

            {/* Section 80CCD(1B) NPS */}
            <div className="form-group" style={{ marginBottom: 14, opacity: activeRegime === 'old' ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Section 80CCD(1B) NPS Extra Deduction:</span>
                <strong>{formatCurrency(nps80CCD, currency)} / ₹50k</strong>
              </div>
              <input
                type="range"
                min={0}
                max={50000}
                step={5000}
                value={nps80CCD}
                onChange={(e) => setNps80CCD(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#a855f7' }}
              />
            </div>

            {/* Section 80D Health */}
            <div className="form-group" style={{ marginBottom: 14, opacity: activeRegime === 'old' ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Section 80D Medical Insurance (Self & Parents):</span>
                <strong>{formatCurrency(health80D, currency)} / ₹75k</strong>
              </div>
              <input
                type="range"
                min={0}
                max={75000}
                step={5000}
                value={health80D}
                onChange={(e) => setHealth80D(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Section 24(b) Home Loan */}
            <div className="form-group" style={{ marginBottom: 14, opacity: activeRegime === 'old' ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Section 24(b) Home Loan Interest:</span>
                <strong>{formatCurrency(homeLoanInterest, currency)} / ₹2L</strong>
              </div>
              <input
                type="range"
                min={0}
                max={200000}
                step={10000}
                value={homeLoanInterest}
                onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* HRA Exemption */}
            <div className="form-group" style={{ marginBottom: 14, opacity: activeRegime === 'old' ? 1 : 0.65 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Section 10(13A) HRA / Rent Exemption:</span>
                <strong>{formatCurrency(hraExemption, currency)}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={400000}
                step={10000}
                value={hraExemption}
                onChange={(e) => setHraExemption(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Tax Slab & Computation Audit */}
        <div className="metric-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={18} color="#10b981" />
            Detailed Tax Audit ({activeRegime.toUpperCase()} REGIME)
          </h3>

          <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: 16, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
              Step-by-Step Slab Calculation:
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '6px 4px' }}>Tax Slab</th>
                  <th style={{ padding: '6px 4px' }}>Rate</th>
                  <th style={{ padding: '6px 4px', textAlign: 'right' }}>Tax Amount</th>
                </tr>
              </thead>
              <tbody>
                {activeSlabs.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '12px 4px', textAlign: 'center', color: '#10b981', fontWeight: 700 }}>
                      Income within 0% tax exempt slab!
                    </td>
                  </tr>
                ) : (
                  activeSlabs.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: 600 }}>{s.slab}</td>
                      <td style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>{s.rate}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(s.amount, currency)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {activeRebate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px 4px 4px', fontSize: 12, color: '#10b981', fontWeight: 700 }}>
                <span>Less: Sec 87A Tax Rebate:</span>
                <span>-{formatCurrency(activeRebate, currency)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', marginTop: 10, paddingTop: 10, fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>
              <span>Total Tax Payable:</span>
              <span style={{ color: activeTax === 0 ? '#10b981' : '#38bdf8' }}>
                {formatCurrency(activeTax, currency)}
              </span>
            </div>
          </div>

          {/* Zero-Tax Action Prompts */}
          <div style={{ padding: 16, borderRadius: 14, background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} color="#f59e0b" />
              Instant CA AI Tax Prompts
            </h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => handleSendQuery('How can I reach zero tax on my income?')}
              >
                Zero-Tax Strategy
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => handleSendQuery('Compare Old vs New Tax Regime for me')}
              >
                Regime Comparison
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => handleSendQuery('Explain HRA exemption rules')}
              >
                HRA Exemption Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI CA Chat Box */}
      <div className="metric-card" style={{ marginTop: 20, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#a855f7" />
          Interactive CA Advisory Chat
        </h3>

        <div
          style={{
            maxHeight: 280,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 16,
            background: 'var(--bg-main)',
            borderRadius: 12,
            border: '1px solid var(--border-color)',
            marginBottom: 14,
          }}
        >
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: 12,
                background: msg.sender === 'user' ? 'rgba(37, 99, 235, 0.25)' : 'var(--bg-card-elevated)',
                border: `1px solid ${msg.sender === 'user' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-color)'}`,
                color: 'var(--text-main)',
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: msg.sender === 'user' ? '#60a5fa' : '#a855f7', marginBottom: 4 }}>
                {msg.sender === 'user' ? 'YOU' : 'AI CHARTERED ACCOUNTANT 💼'} • {msg.time}
              </div>
              {msg.text}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Ask CA anything about tax filing, 80C, HRA..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            style={{ flex: '1 1 180px', minWidth: 0, fontSize: 13 }}
          />
          <button className="btn-primary" onClick={() => handleSendQuery()} style={{ flexShrink: 0, height: 38 }}>
            <Send size={16} />
            <span>Ask CA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
