import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  DollarSign,
  Building,
  Sparkles,
  Flame,
  TrendingUp,
  CreditCard,
  Scale,
  PiggyBank,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface CalculatorsViewProps {
  currency: string;
}

type CalcType = 'tax' | 'loan' | 'sip' | 'fire' | 'compound' | 'debt' | 'inflation' | 'cagr';

export const CalculatorsView: React.FC<CalculatorsViewProps> = ({ currency }) => {
  const [activeCalc, setActiveCalc] = useState<CalcType>('tax');

  // 1. Tax Calculator State
  const [annualIncome, setAnnualIncome] = useState<number>(1500000);
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [deductions80C, setDeductions80C] = useState<number>(150000);
  const [deductions80D, setDeductions80D] = useState<number>(50000);
  const [npsDeduction, setNpsDeduction] = useState<number>(50000);
  const [hraDeduction, setHraDeduction] = useState<number>(100000);

  // 2. Loan EMI State
  const [loanAmount, setLoanAmount] = useState<number>(6000000);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);

  // 3. SIP & Step-Up State
  const [monthlySIP, setMonthlySIP] = useState<number>(25000);
  const [sipReturnRate, setSipReturnRate] = useState<number>(12);
  const [sipTenureYears, setSipTenureYears] = useState<number>(15);
  const [stepUpPct, setStepUpPct] = useState<number>(10);

  // 4. FIRE / Retirement State
  const [currentAge, setCurrentAge] = useState<number>(28);
  const [retireAge, setRetireAge] = useState<number>(50);
  const [monthlyExpenseToday, setMonthlyExpenseToday] = useState<number>(75000);
  const [currentRetirementSaved, setCurrentRetirementSaved] = useState<number>(1500000);
  const [fireInflation, setFireInflation] = useState<number>(6);
  const [fireReturnRate, setFireReturnRate] = useState<number>(11);

  // 5. Compound Interest / Lumpsum State
  const [initialLumpsum, setInitialLumpsum] = useState<number>(500000);
  const [monthlyAddition, setMonthlyAddition] = useState<number>(10000);
  const [compoundRate, setCompoundRate] = useState<number>(10);
  const [compoundYears, setCompoundYears] = useState<number>(10);
  const [compoundFreq, setCompoundFreq] = useState<number>(12); // 12 = monthly, 4 = quarterly, 1 = yearly

  // 6. Debt Avalanche / Payoff State
  const [totalDebt, setTotalDebt] = useState<number>(800000);
  const [debtInterestRate, setDebtInterestRate] = useState<number>(14);
  const [minMonthlyPayment, setMinMonthlyPayment] = useState<number>(20000);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(10000);

  // 7. Inflation & Future Cost State
  const [currentCost, setCurrentCost] = useState<number>(2500000);
  const [inflationRateVal, setInflationRateVal] = useState<number>(7);
  const [futureYears, setFutureYears] = useState<number>(15);

  // 8. CAGR & Return State
  const [cagrInitial, setCagrInitial] = useState<number>(200000);
  const [cagrFinal, setCagrFinal] = useState<number>(750000);
  const [cagrYears, setCagrYears] = useState<number>(7);

  // --- 1. TAX CALCULATIONS (FY 2026-27 Slabs) ---
  const standardDeduction = taxRegime === 'new' ? 75000 : 50000;
  const totalOldDeductions = taxRegime === 'old'
    ? standardDeduction + Math.min(150000, deductions80C) + deductions80D + npsDeduction + hraDeduction
    : standardDeduction;

  const taxableIncome = Math.max(0, annualIncome - totalOldDeductions);

  let estimatedTax = 0;
  if (taxRegime === 'new') {
    // 2026/27 New Tax Slabs (Rebate up to 7L, Standard deduction 75k)
    if (taxableIncome <= 700000) {
      estimatedTax = 0;
    } else {
      if (taxableIncome > 300000) estimatedTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
      if (taxableIncome > 700000) estimatedTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
      if (taxableIncome > 1000000) estimatedTax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
      if (taxableIncome > 1200000) estimatedTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      if (taxableIncome > 1500000) estimatedTax += (taxableIncome - 1500000) * 0.30;
    }
  } else {
    // Old Regime Slabs
    if (taxableIncome > 250000) estimatedTax += Math.min(taxableIncome - 250000, 250000) * 0.05;
    if (taxableIncome > 500000) estimatedTax += Math.min(taxableIncome - 500000, 500000) * 0.20;
    if (taxableIncome > 1000000) estimatedTax += (taxableIncome - 1000000) * 0.30;
  }
  const cess = estimatedTax * 0.04;
  const totalTaxPayable = Math.round(estimatedTax + cess);
  const monthlyTakeHome = Math.round((annualIncome - totalTaxPayable) / 12);

  // --- 2. LOAN EMI CALCULATIONS ---
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const monthlyEMI = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
  const totalPayment = monthlyEMI * totalMonths;
  const totalInterest = Math.max(0, totalPayment - loanAmount);
  const interestPercentage = Math.round((totalInterest / (totalPayment || 1)) * 100);

  // --- 3. SIP & STEP-UP COMPOUNDING CALCULATIONS ---
  const sipMonthlyRate = sipReturnRate / 12 / 100;
  const sipTotalMonths = sipTenureYears * 12;

  // Standard SIP calculation
  const totalInvestedSIPStandard = monthlySIP * sipTotalMonths;
  const projectedSIPValueStandard = Math.round(
    monthlySIP * (((Math.pow(1 + sipMonthlyRate, sipTotalMonths) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate))
  );

  // Step-Up SIP calculation
  let totalInvestedStepUp = 0;
  let projectedStepUpValue = 0;
  let currentMonthlySip = monthlySIP;

  for (let yr = 0; yr < sipTenureYears; yr++) {
    for (let m = 0; m < 12; m++) {
      const remainingMonths = sipTotalMonths - (yr * 12 + m);
      totalInvestedStepUp += currentMonthlySip;
      projectedStepUpValue += currentMonthlySip * Math.pow(1 + sipMonthlyRate, remainingMonths);
    }
    currentMonthlySip *= (1 + stepUpPct / 100);
  }
  projectedStepUpValue = Math.round(projectedStepUpValue);
  totalInvestedStepUp = Math.round(totalInvestedStepUp);

  // --- 4. FIRE / RETIREMENT CALCULATIONS ---
  const yearsToRetire = Math.max(1, retireAge - currentAge);
  const futureMonthlyExpense = monthlyExpenseToday * Math.pow(1 + fireInflation / 100, yearsToRetire);
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // 4% Safe Withdrawal Rule (Corpus = Annual Expense * 25)
  const fireCorpusNeeded = Math.round(futureAnnualExpense * 25);

  // Future value of existing saved retirement funds
  const futureSavedValueFIRE = currentRetirementSaved * Math.pow(1 + fireReturnRate / 100, yearsToRetire);
  const remainingFIREDeficit = Math.max(0, fireCorpusNeeded - futureSavedValueFIRE);

  // Monthly contribution required to bridge remaining FIRE corpus
  const fireMonthlyRate = fireReturnRate / 12 / 100;
  const fireTotalMonths = yearsToRetire * 12;
  const requiredMonthlyFIRE = fireMonthlyRate > 0
    ? Math.round((remainingFIREDeficit * fireMonthlyRate) / ((Math.pow(1 + fireMonthlyRate, fireTotalMonths) - 1) * (1 + fireMonthlyRate)))
    : Math.round(remainingFIREDeficit / fireTotalMonths);

  const fireReadinessPct = Math.min(100, Math.round((futureSavedValueFIRE / (fireCorpusNeeded || 1)) * 100));

  // --- 5. COMPOUND INTEREST / LUMPSUM CALCULATIONS ---
  const compR = compoundRate / 100;
  const compN = compoundFreq;
  const compT = compoundYears;

  // Lumpsum FV = P * (1 + r/n)^(n*t)
  const lumpsumFV = initialLumpsum * Math.pow(1 + compR / compN, compN * compT);

  // Monthly contributions FV
  const monthlyCompRate = compoundRate / 12 / 100;
  const monthlyCompMonths = compoundYears * 12;
  const monthlyCompFV = monthlyAddition > 0 && monthlyCompRate > 0
    ? monthlyAddition * (((Math.pow(1 + monthlyCompRate, monthlyCompMonths) - 1) / monthlyCompRate) * (1 + monthlyCompRate))
    : monthlyAddition * monthlyCompMonths;

  const totalCompoundValue = Math.round(lumpsumFV + monthlyCompFV);
  const totalPrincipalInvested = Math.round(initialLumpsum + (monthlyAddition * monthlyCompMonths));
  const compoundInterestEarned = Math.max(0, totalCompoundValue - totalPrincipalInvested);

  // --- 6. DEBT AVALANCHE / PAYOFF CALCULATIONS ---
  const totalMonthlyPay = minMonthlyPayment + extraMonthlyPayment;
  const monthlyDebtRate = debtInterestRate / 12 / 100;

  let monthsToDebtFree = 0;
  let totalDebtInterestPaid = 0;
  let tempBalance = totalDebt;

  if (totalMonthlyPay > tempBalance * monthlyDebtRate) {
    while (tempBalance > 0 && monthsToDebtFree < 600) {
      const interestForMonth = tempBalance * monthlyDebtRate;
      totalDebtInterestPaid += interestForMonth;
      const principalPayment = Math.min(tempBalance, totalMonthlyPay - interestForMonth);
      tempBalance -= principalPayment;
      monthsToDebtFree++;
    }
  } else {
    monthsToDebtFree = 999; // Never ends
  }

  // Savings without extra payment
  let monthsMinOnly = 0;
  let totalInterestMinOnly = 0;
  let tempBalMin = totalDebt;
  if (minMonthlyPayment > tempBalMin * monthlyDebtRate) {
    while (tempBalMin > 0 && monthsMinOnly < 600) {
      const interestForMonth = tempBalMin * monthlyDebtRate;
      totalInterestMinOnly += interestForMonth;
      const principalPayment = Math.min(tempBalMin, minMonthlyPayment - interestForMonth);
      tempBalMin -= principalPayment;
      monthsMinOnly++;
    }
  }

  const interestSavedWithExtra = Math.max(0, Math.round(totalInterestMinOnly - totalDebtInterestPaid));
  const monthsSavedWithExtra = Math.max(0, monthsMinOnly - monthsToDebtFree);

  // --- 7. INFLATION & FUTURE COST CALCULATIONS ---
  const futureCostValue = Math.round(currentCost * Math.pow(1 + inflationRateVal / 100, futureYears));
  const inflationImpactMultiplier = (futureCostValue / (currentCost || 1)).toFixed(2);
  const purchasingPowerRetainedPct = Math.round((1 / Math.pow(1 + inflationRateVal / 100, futureYears)) * 100);

  // --- 8. CAGR CALCULATIONS ---
  const absoluteReturnPct = cagrInitial > 0 ? (((cagrFinal - cagrInitial) / cagrInitial) * 100).toFixed(1) : '0';
  const cagrValue = cagrInitial > 0 && cagrYears > 0
    ? ((Math.pow(cagrFinal / cagrInitial, 1 / cagrYears) - 1) * 100).toFixed(2)
    : '0';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title-group">
          <h1>Financial Calculators Suite</h1>
          <p>8 precision financial engines for tax optimization, loan amortization, SIP step-up compounding & FIRE planning.</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="nav-tab-bar" style={{ marginBottom: 20 }}>
        <button className={`nav-tab-btn ${activeCalc === 'tax' ? 'active' : ''}`} onClick={() => setActiveCalc('tax')}>
          <Percent size={13} /> Tax & Take-Home
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'loan' ? 'active' : ''}`} onClick={() => setActiveCalc('loan')}>
          <Building size={13} /> Loan EMI
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'sip' ? 'active' : ''}`} onClick={() => setActiveCalc('sip')}>
          <TrendingUp size={13} /> SIP Compounding
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'fire' ? 'active' : ''}`} onClick={() => setActiveCalc('fire')}>
          <Flame size={13} /> FIRE & Retirement
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'compound' ? 'active' : ''}`} onClick={() => setActiveCalc('compound')}>
          <PiggyBank size={13} /> Compound Interest
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'debt' ? 'active' : ''}`} onClick={() => setActiveCalc('debt')}>
          <CreditCard size={13} /> Debt Payoff
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'inflation' ? 'active' : ''}`} onClick={() => setActiveCalc('inflation')}>
          <Scale size={13} /> Inflation Calculator
        </button>
        <button className={`nav-tab-btn ${activeCalc === 'cagr' ? 'active' : ''}`} onClick={() => setActiveCalc('cagr')}>
          <Zap size={13} /> CAGR & Returns
        </button>
      </div>

      <div className="calculators-grid">
        {/* ==================================================================== */}
        {/* 1. INCOME TAX CALCULATOR */}
        {/* ==================================================================== */}
        {activeCalc === 'tax' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="calc-card-title" style={{ fontWeight: 800 }}>Income Tax Engine (2026/27)</h3>
                <div style={{ display: 'flex', gap: 6, background: 'var(--bg-main)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <button className={`fx-btn ${taxRegime === 'new' ? 'active' : ''}`} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setTaxRegime('new')}>New Regime</button>
                  <button className={`fx-btn ${taxRegime === 'old' ? 'active' : ''}`} style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setTaxRegime('old')}>Old Regime</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Gross Salary / Income ({currency}):</label>
                <input type="number" className="form-control" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} />
              </div>

              {taxRegime === 'old' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Section 80C Deductions (PPF, EPF, ELSS - Max 1.5L):</label>
                    <input type="number" className="form-control" value={deductions80C} onChange={(e) => setDeductions80C(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section 80D Health Insurance Deduction:</label>
                    <input type="number" className="form-control" value={deductions80D} onChange={(e) => setDeductions80D(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section 80CCD(1B) NPS Additional Deduction (Max 50k):</label>
                    <input type="number" className="form-control" value={npsDeduction} onChange={(e) => setNpsDeduction(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HRA Exemption Amount:</label>
                    <input type="number" className="form-control" value={hraDeduction} onChange={(e) => setHraDeduction(Number(e.target.value))} />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, padding: 12, borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#38bdf8' }}>
                  ℹ️ <strong>New Tax Regime:</strong> Standard deduction of {formatCurrency(75000, currency)} applied automatically with zero tax up to {formatCurrency(700000, currency)} income!
                </div>
              )}
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#38bdf8' }}>Tax & Paycheck Breakdown</h3>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Net Taxable Income</div>
                  <div className="calc-display-val" style={{ fontWeight: 800 }}>{formatCurrency(taxableIncome, currency)}</div>
                </div>

                <div className="calc-display-box" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <div className="calc-label" style={{ color: '#ef4444' }}>Total Tax + Cess (4%)</div>
                  <div className="calc-display-val" style={{ fontWeight: 800 }}>{formatCurrency(totalTaxPayable, currency)}</div>
                </div>
              </div>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                <div className="calc-label" style={{ color: '#10b981' }}>Estimated Monthly In-Hand Paycheck</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900 }}>{formatCurrency(monthlyTakeHome, currency)}/mo</div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, padding: '4px 0' }}>
                💡 <strong>Tax Tip:</strong> In FY 2026-27, the New Tax Regime offers lower tax slabs for gross incomes up to ₹15L without requiring extensive 80C investment locking!
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 2. HOME LOAN EMI CALCULATOR */}
        {/* ==================================================================== */}
        {activeCalc === 'loan' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800 }}>Home & Car Loan EMI Engine</h3>

              <div className="form-group">
                <label className="form-label">Loan Principal Amount ({currency}):</label>
                <input type="number" className="form-control" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Interest Rate (% p.a.):</label>
                <input type="number" step="0.1" className="form-control" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Loan Tenure: <strong>{loanTenureYears} Years</strong> ({loanTenureYears * 12} Months)</label>
                <input type="range" min="1" max="30" value={loanTenureYears} onChange={(e) => setLoanTenureYears(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#10b981' }}>Repayment Summary</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Monthly EMI Payment</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#38bdf8' }}>{formatCurrency(monthlyEMI, currency)}/mo</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Principal Loan</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(loanAmount, currency)}</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <div className="calc-label" style={{ color: '#ef4444' }}>Total Interest ({interestPercentage}%)</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(totalInterest, currency)}</div>
                </div>
              </div>

              <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Payable Over {loanTenureYears} Yrs:</span>
                <strong style={{ fontSize: 14, color: 'var(--text-main)' }}>{formatCurrency(totalPayment, currency)}</strong>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 3. SIP & STEP-UP COMPOUNDING */}
        {/* ==================================================================== */}
        {activeCalc === 'sip' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800 }}>SIP & Step-Up Wealth Growth</h3>

              <div className="form-group">
                <label className="form-label">Initial Monthly SIP ({currency}):</label>
                <input type="number" className="form-control" value={monthlySIP} onChange={(e) => setMonthlySIP(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Expected CAGR Return Rate (% p.a.):</label>
                <input type="number" step="0.5" className="form-control" value={sipReturnRate} onChange={(e) => setSipReturnRate(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Step-Up Increment (% per year): <strong>{stepUpPct}%</strong></label>
                <input type="range" min="0" max="25" step="1" value={stepUpPct} onChange={(e) => setStepUpPct(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Investment Duration: <strong>{sipTenureYears} Years</strong></label>
                <input type="range" min="1" max="35" value={sipTenureYears} onChange={(e) => setSipTenureYears(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))', border: '1px solid rgba(168,85,247,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#a855f7' }}>Projected Wealth Corpus</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Projected Corpus with {stepUpPct}% Step-Up</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#10b981' }}>{formatCurrency(projectedStepUpValue, currency)}</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Capital Invested</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(totalInvestedStepUp, currency)}</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                  <div className="calc-label" style={{ color: '#10b981' }}>Estimated Compounded Gain</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>+ {formatCurrency(projectedStepUpValue - totalInvestedStepUp, currency)}</div>
                </div>
              </div>

              {stepUpPct > 0 && (
                <div style={{ fontSize: 11, color: '#a855f7', background: 'rgba(168,85,247,0.08)', padding: 10, borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
                  ⚡ <strong>Step-Up Power:</strong> Stepping up your SIP by {stepUpPct}% yearly yields <strong>{formatCurrency(projectedStepUpValue - projectedSIPValueStandard, currency)} extra wealth</strong> compared to a flat SIP!
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 4. FIRE & RETIREMENT CALCULATOR */}
        {/* ==================================================================== */}
        {activeCalc === 'fire' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#ef4444' }}>🔥 FIRE & Early Retirement Engine</h3>

              <div className="calc-subgrid">
                <div className="form-group">
                  <label className="form-label">Current Age:</label>
                  <input type="number" className="form-control" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Retire Age:</label>
                  <input type="number" className="form-control" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Monthly Living Expenses ({currency}):</label>
                <input type="number" className="form-control" value={monthlyExpenseToday} onChange={(e) => setMonthlyExpenseToday(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Existing Retirement Savings ({currency}):</label>
                <input type="number" className="form-control" value={currentRetirementSaved} onChange={(e) => setCurrentRetirementSaved(Number(e.target.value))} />
              </div>

              <div className="calc-subgrid">
                <div className="form-group">
                  <label className="form-label">Expected Inflation (%):</label>
                  <input type="number" step="0.5" className="form-control" value={fireInflation} onChange={(e) => setFireInflation(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Portfolio ROI (%):</label>
                  <input type="number" step="0.5" className="form-control" value={fireReturnRate} onChange={(e) => setFireReturnRate(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1))', border: '1px solid rgba(239,68,68,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#f59e0b' }}>FIRE Corpus Target (4% Rule)</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Target FIRE Nest-Egg Corpus Required (Age {retireAge})</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#f59e0b' }}>{formatCurrency(fireCorpusNeeded, currency)}</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Future Expense (Age {retireAge})</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(futureMonthlyExpense, currency)}/mo</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#38bdf8' }}>
                  <div className="calc-label" style={{ color: '#38bdf8' }}>Monthly Savings Required</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(requiredMonthlyFIRE, currency)}/mo</div>
                </div>
              </div>

              <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span>FIRE Readiness Tracker:</span>
                  <strong style={{ color: fireReadinessPct >= 80 ? '#10b981' : '#f59e0b' }}>{fireReadinessPct}% On Track</strong>
                </div>
                <div style={{ height: 8, width: '100%', backgroundColor: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${fireReadinessPct}%`, backgroundColor: fireReadinessPct >= 80 ? '#10b981' : '#f59e0b', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 5. COMPOUND INTEREST / LUMPSUM */}
        {/* ==================================================================== */}
        {activeCalc === 'compound' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800 }}>Compound Interest & Lumpsum</h3>

              <div className="form-group">
                <label className="form-label">Initial Lumpsum Principal ({currency}):</label>
                <input type="number" className="form-control" value={initialLumpsum} onChange={(e) => setInitialLumpsum(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Monthly Deposit ({currency}):</label>
                <input type="number" className="form-control" value={monthlyAddition} onChange={(e) => setMonthlyAddition(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Interest Rate (% p.a.):</label>
                <input type="number" step="0.5" className="form-control" value={compoundRate} onChange={(e) => setCompoundRate(Number(e.target.value))} />
              </div>

              <div className="calc-subgrid">
                <div className="form-group">
                  <label className="form-label">Compounding Frequency:</label>
                  <select className="form-control" value={compoundFreq} onChange={(e) => setCompoundFreq(Number(e.target.value))}>
                    <option value={12}>Monthly</option>
                    <option value={4}>Quarterly</option>
                    <option value={1}>Annually</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Time Horizon (Years):</label>
                  <input type="number" className="form-control" value={compoundYears} onChange={(e) => setCompoundYears(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#10b981' }}>Compounded Value Output</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Maturity Amount After {compoundYears} Years</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#10b981' }}>{formatCurrency(totalCompoundValue, currency)}</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Principal Paid</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(totalPrincipalInvested, currency)}</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                  <div className="calc-label" style={{ color: '#10b981' }}>Total Compounded Interest</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>+ {formatCurrency(compoundInterestEarned, currency)}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 6. DEBT AVALANCHE / PAYOFF */}
        {/* ==================================================================== */}
        {activeCalc === 'debt' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#ec4899' }}>Debt Avalanche & Acceleration</h3>

              <div className="form-group">
                <label className="form-label">Total Outstanding Debt ({currency}):</label>
                <input type="number" className="form-control" value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Interest Rate (% p.a.):</label>
                <input type="number" step="0.5" className="form-control" value={debtInterestRate} onChange={(e) => setDebtInterestRate(Number(e.target.value))} />
              </div>

              <div className="calc-subgrid">
                <div className="form-group">
                  <label className="form-label">Min Monthly Payment ({currency}):</label>
                  <input type="number" className="form-control" value={minMonthlyPayment} onChange={(e) => setMinMonthlyPayment(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Extra Monthly Payoff ({currency}):</label>
                  <input type="number" className="form-control" value={extraMonthlyPayment} onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(236,72,153,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#ec4899' }}>Debt Free Timeline</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Time to Become Completely Debt-Free</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#ec4899' }}>
                  {monthsToDebtFree >= 600 ? 'Infinite (Increase Payment!)' : `${Math.floor(monthsToDebtFree / 12)} Yrs ${monthsToDebtFree % 12} Mos`}
                </div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Interest Paid</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(Math.round(totalDebtInterestPaid), currency)}</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                  <div className="calc-label" style={{ color: '#10b981' }}>Interest Saved by Extra Payoff</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>+ {formatCurrency(interestSavedWithExtra, currency)}</div>
                </div>
              </div>

              {monthsSavedWithExtra > 0 && (
                <div style={{ fontSize: 11, color: '#ec4899', background: 'rgba(236,72,153,0.08)', padding: 12, borderRadius: 10, border: '1px solid rgba(236,72,153,0.2)' }}>
                  🎉 Adding {formatCurrency(extraMonthlyPayment, currency)}/mo cuts your debt timeline by <strong>{Math.floor(monthsSavedWithExtra / 12)} Yrs {monthsSavedWithExtra % 12} Mos</strong>!
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 7. INFLATION CALCULATOR */}
        {/* ==================================================================== */}
        {activeCalc === 'inflation' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800 }}>Purchasing Power & Inflation</h3>

              <div className="form-group">
                <label className="form-label">Current Cost of Goal / Item Today ({currency}):</label>
                <input type="number" className="form-control" value={currentCost} onChange={(e) => setCurrentCost(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Annual Inflation Rate (%): <strong>{inflationRateVal}%</strong></label>
                <input type="range" min="1" max="15" step="0.5" value={inflationRateVal} onChange={(e) => setInflationRateVal(Number(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Time Horizon: <strong>{futureYears} Years</strong></label>
                <input type="range" min="1" max="40" value={futureYears} onChange={(e) => setFutureYears(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1))', border: '1px solid rgba(245,158,11,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#f59e0b' }}>Future Inflation Impact</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Estimated Future Cost in {futureYears} Years</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#ef4444' }}>{formatCurrency(futureCostValue, currency)}</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Cost Multiplier</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{inflationImpactMultiplier}x Price Rise</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  <div className="calc-label" style={{ color: '#ef4444' }}>Retained Purchasing Power</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{purchasingPowerRetainedPct}% of Value</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================================================================== */}
        {/* 8. CAGR & RETURNS CALCULATOR */}
        {/* ==================================================================== */}
        {activeCalc === 'cagr' && (
          <>
            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#06b6d4' }}>CAGR & Investment Returns</h3>

              <div className="form-group">
                <label className="form-label">Initial Investment Amount ({currency}):</label>
                <input type="number" className="form-control" value={cagrInitial} onChange={(e) => setCagrInitial(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Final Maturity / Current Portfolio Value ({currency}):</label>
                <input type="number" className="form-control" value={cagrFinal} onChange={(e) => setCagrFinal(Number(e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Investment Duration (Years):</label>
                <input type="number" step="0.5" className="form-control" value={cagrYears} onChange={(e) => setCagrYears(Number(e.target.value))} />
              </div>
            </div>

            <div className="metric-card calc-card" style={{ display: 'flex', flexDirection: 'column', gap: 16, background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(6,182,212,0.3)' }}>
              <h3 className="calc-card-title" style={{ fontWeight: 800, color: '#06b6d4' }}>Annualized Performance</h3>

              <div className="calc-display-box calc-display-box-primary" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Compound Annual Growth Rate (CAGR)</div>
                <div className="calc-display-val-lg" style={{ fontWeight: 900, color: '#06b6d4' }}>{cagrValue}% p.a.</div>
              </div>

              <div className="calc-subgrid">
                <div className="calc-display-box" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                  <div className="calc-label" style={{ color: 'var(--text-muted)' }}>Total Net Absolute Gain</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>{formatCurrency(cagrFinal - cagrInitial, currency)}</div>
                </div>
                <div className="calc-display-box" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                  <div className="calc-label" style={{ color: '#10b981' }}>Total Absolute Return</div>
                  <div className="calc-sub-val" style={{ fontWeight: 800 }}>+{absoluteReturnPct}%</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

