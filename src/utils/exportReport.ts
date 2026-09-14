import { Goal, LifeEvent } from '../types';
import { formatCurrency, convertCurrency } from './calculations';

/**
 * Generates and triggers download of a CSV file containing Goals data.
 */
export const exportGoalsCSV = (goals: Goal[], currency: string = 'INR') => {
  const headers = [
    'Goal ID',
    'Goal Name',
    'Category',
    'Goal Type',
    'Priority',
    'Status',
    'Target Amount',
    'Current Amount',
    'Monthly Contribution',
    'Target Date',
    'Expected Inflation (%)',
    'Expected Return (%)',
  ];

  const rows = goals.map((g) => [
    `"${g.id}"`,
    `"${g.name.replace(/"/g, '""')}"`,
    `"${g.customCategory || g.category}"`,
    `"${g.goalType}"`,
    `"${g.priority || 'Medium'}"`,
    `"${g.status}"`,
    convertCurrency(g.targetAmount, g.currency, currency),
    convertCurrency(g.currentAmount, g.currency, currency),
    convertCurrency(g.monthlyContribution, g.currency, currency),
    `"${g.targetDate}"`,
    g.expectedInflation,
    g.expectedReturn,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LIFEOS_Goals_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads a complete JSON backup of the user's financial state.
 */
export const exportJSONBackup = (goals: Goal[], lifeEvents: LifeEvent[]) => {
  const data = {
    app: 'LIFEOS Financial Operating System',
    exportedAt: new Date().toISOString(),
    goals,
    lifeEvents,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LIFEOS_Financial_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Opens a print-friendly HTML financial summary report window.
 */
export const printFinancialReport = (
  goals: Goal[],
  lifeEvents: LifeEvent[],
  currency: string = 'INR',
  userName: string = 'LIFEOS User'
) => {
  const totalTarget = goals.reduce((acc, g) => acc + convertCurrency(g.targetAmount, g.currency, currency), 0);
  const totalSaved = goals.reduce((acc, g) => acc + convertCurrency(g.currentAmount, g.currency, currency), 0);
  const totalMonthlySip = goals.reduce((acc, g) => acc + convertCurrency(g.monthlyContribution, g.currency, currency), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    console.warn('Popup blocked: Please allow popups to generate the printable financial report.');
    return;
  }

  const reportHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>LIFEOS Financial Executive Summary - ${userName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #111827;
            margin: 0;
            padding: 30px;
          }
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
            letter-spacing: -0.5px;
          }
          .tagline {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
          }
          .meta-info {
            text-align: right;
            font-size: 12px;
            color: #4b5563;
          }
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
          }
          .card-lbl {
            font-size: 11px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 600;
          }
          .card-val {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-top: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: 700;
            color: #374151;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .status-pill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
          }
          .status-ON-TRACK { background: #d1fae5; color: #065f46; }
          .status-BEHIND { background: #fee2e2; color: #991b1b; }
          .status-COMPLETED { background: #dbeafe; color: #1e40af; }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #1f2937;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            font-size: 11px;
            color: #9ca3af;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 10px 20px; font-weight: 700; border-radius: 6px; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="brand">LIFEOS</div>
            <div class="tagline">Personal Financial Operating System • Wealth & Goals Executive Summary</div>
          </div>
          <div class="meta-info">
            <div><strong>Client:</strong> ${userName}</div>
            <div><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</div>
            <div><strong>Currency Base:</strong> ${currency}</div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div class="card-lbl">Total Target Capital</div>
            <div class="card-val">${formatCurrency(totalTarget, currency)}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Current Portfolio Saved</div>
            <div class="card-val">${formatCurrency(totalSaved, currency)}</div>
          </div>
          <div class="card">
            <div class="card-lbl">Required Monthly SIP</div>
            <div class="card-val">${formatCurrency(totalMonthlySip, currency)}/mo</div>
          </div>
          <div class="card">
            <div class="card-lbl">Overall Goal Progress</div>
            <div class="card-val">${overallProgress}%</div>
          </div>
        </div>

        <div class="section-title">Goal Portfolio Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Goal Name</th>
              <th>Category</th>
              <th>Target Date</th>
              <th>Target Amount</th>
              <th>Saved Amount</th>
              <th>Monthly SIP</th>
              <th>Inflation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${goals
              .map(
                (g) => `
              <tr>
                <td><strong>${g.name}</strong></td>
                <td>${g.customCategory || g.category}</td>
                <td>${g.targetDate}</td>
                <td>${formatCurrency(convertCurrency(g.targetAmount, g.currency, currency), currency)}</td>
                <td>${formatCurrency(convertCurrency(g.currentAmount, g.currency, currency), currency)}</td>
                <td>${formatCurrency(convertCurrency(g.monthlyContribution, g.currency, currency), currency)}/mo</td>
                <td>${g.expectedInflation}%</td>
                <td><span class="status-pill status-${g.status.replace(' ', '-')}">${g.status}</span></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        ${
          lifeEvents.length > 0
            ? `
          <div class="section-title">Key Life Events Roadmap</div>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Estimated Cost</th>
                <th>Recurrence</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${lifeEvents
                .map(
                  (e) => `
                <tr>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.date}</td>
                  <td>${formatCurrency(convertCurrency(e.estimatedCost, e.currency, currency), currency)}</td>
                  <td>${e.recurrence}</td>
                  <td>${e.priority}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `
            : ''
        }

        <div class="footer">
          Generated automatically by LIFEOS Financial Operating System. Confidential & Personal Financial Record.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(reportHtml);
  printWindow.document.close();
};
