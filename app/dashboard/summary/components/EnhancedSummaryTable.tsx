'use client';

import { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Collapse,
  IconButton,
  Chip,
  Tooltip,
  styled
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InfoIcon from '@mui/icons-material/Info';
import { CompleteSummaryRow } from '@/types/summary';
import { formatCurrency, formatPercentage } from '@/lib/calculations/summaryCalculations';

interface EnhancedSummaryTableProps {
  data: CompleteSummaryRow[];
  showAdjustments?: boolean;
}

// Styled components for better visuals
const SectionHeaderRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  '& .MuiTableCell-root': {
    fontWeight: 600,
    fontSize: '0.95rem'
  }
}));

const SubRowCell = styled(TableCell)({
  paddingLeft: '2rem',
  fontSize: '0.875rem'
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderRight: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderRight: 'none'
  }
}));

const CurrencyCell = styled(StyledTableCell)({
  textAlign: 'right',
  fontFamily: 'monospace'
});

const VarianceCell = styled(StyledTableCell)<{ variance?: number }>(({ theme, variance = 0 }) => ({
  textAlign: 'right',
  fontFamily: 'monospace',
  backgroundColor: variance > 0
    ? theme.palette.error.light
    : variance < -5
    ? theme.palette.success.light
    : 'transparent',
  color: variance > 0 || variance < -5 ? theme.palette.common.white : 'inherit'
}));

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  itemNumber
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  itemNumber?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <SectionHeaderRow>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
            <Typography variant="subtitle2">
              {itemNumber && `${itemNumber}. `}{title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell colSpan={100} />
      </SectionHeaderRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={100}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table size="small">{children}</Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function EnhancedSummaryTable({ data, showAdjustments = true }: EnhancedSummaryTableProps) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No summary data available
        </Typography>
      </Box>
    );
  }

  // Get all months for column headers
  const months = data.map(row => row.month);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell sx={{ minWidth: 250, fontWeight: 'bold' }}>
              Category
            </StyledTableCell>
            {months.map(month => (
              <StyledTableCell key={month} sx={{ minWidth: 120, textAlign: 'right', fontWeight: 'bold' }}>
                {month}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* MEDICAL CLAIMS SECTION (Items #1-7) */}
          <CollapsibleSection title="Medical Claims" defaultOpen={true} itemNumber="1-7">
            <TableBody>
              {/* Item #1 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #1: Domestic Medical Facility Claims from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Domestic Medical Facility (IP/OP)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-dom`}>
                    {formatCurrency(row.medicalClaims.domesticMedicalFacilityIPOP)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #2 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #2: Non-Domestic Medical Claims from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Non-Domestic Medical (IP/OP)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-nondom`}>
                    {formatCurrency(row.medicalClaims.nonDomesticMedicalIPOP)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #3 */}
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <SubRowCell sx={{ fontWeight: 600 }}>
                  <Tooltip title="Item #3: Total Hospital Claims = Item #1 + Item #2">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total Hospital Claims
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-hosp`} sx={{ fontWeight: 600 }}>
                    {formatCurrency(row.medicalClaims.totalHospitalClaims)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #4 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #4: Non-Hospital Medical Claims from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Non-Hospital Medical Claims
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-nonhosp`}>
                    {formatCurrency(row.medicalClaims.nonHospitalMedicalClaims)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #5 */}
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <SubRowCell sx={{ fontWeight: 600 }}>
                  <Tooltip title="Item #5: Total All Medical Claims = Item #3 + Item #4">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total All Medical Claims
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-allmed`} sx={{ fontWeight: 600 }}>
                    {formatCurrency(row.medicalClaims.totalAllMedicalClaims)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #6 - User adjustable */}
              {showAdjustments && (
                <TableRow>
                  <SubRowCell>
                    <Tooltip title="Item #6: UC Claims Settlement Adjustment (user-adjustable)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        UC Claims Settlement Adjustment
                        <Chip label="Adjustable" size="small" color="info" />
                        <InfoIcon fontSize="small" color="action" />
                      </Box>
                    </Tooltip>
                  </SubRowCell>
                  {data.map(row => (
                    <CurrencyCell
                      key={`${row.month}-ucadj`}
                      sx={{
                        color: row.medicalClaims.ucSettlementAdjustment !== 0 ? 'primary.main' : 'inherit',
                        fontWeight: row.medicalClaims.ucSettlementAdjustment !== 0 ? 600 : 400
                      }}
                    >
                      {formatCurrency(row.medicalClaims.ucSettlementAdjustment)}
                    </CurrencyCell>
                  ))}
                </TableRow>
              )}

              {/* Item #7 */}
              <TableRow sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                <SubRowCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Item #7: Total Adjusted Medical Claims = Item #5 + Item #6">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total Adjusted All Medical Claims
                      <InfoIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-adjmed`} sx={{ fontWeight: 700 }}>
                    {formatCurrency(row.medicalClaims.totalAdjustedMedicalClaims)}
                  </CurrencyCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>

          {/* PHARMACY SECTION (Items #8-9) */}
          <CollapsibleSection title="Pharmacy" defaultOpen={true} itemNumber="8-9">
            <TableBody>
              {/* Item #8 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #8: Total Rx Claims from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total Rx Claims
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-rx`}>
                    {formatCurrency(row.pharmacy.totalRxClaims)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #9 - User adjustable */}
              {showAdjustments && (
                <TableRow>
                  <SubRowCell>
                    <Tooltip title="Item #9: Rx Rebates (user-adjustable, typically negative)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Rx Rebates
                        <Chip label="Adjustable" size="small" color="info" />
                        <InfoIcon fontSize="small" color="action" />
                      </Box>
                    </Tooltip>
                  </SubRowCell>
                  {data.map(row => (
                    <CurrencyCell
                      key={`${row.month}-rxreb`}
                      sx={{
                        color: row.pharmacy.rxRebates !== 0 ? 'success.main' : 'inherit',
                        fontWeight: row.pharmacy.rxRebates !== 0 ? 600 : 400
                      }}
                    >
                      {formatCurrency(row.pharmacy.rxRebates)}
                    </CurrencyCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </CollapsibleSection>

          {/* STOP LOSS SECTION (Items #10-11) */}
          <CollapsibleSection title="Stop Loss" defaultOpen={true} itemNumber="10-11">
            <TableBody>
              {/* Item #10 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #10: Total Stop Loss Fees calculated from Configure Fees page">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total Stop Loss Fees
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-sl`}>
                    {formatCurrency(row.stopLoss.totalStopLossFees)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #11 - User adjustable */}
              {showAdjustments && (
                <TableRow>
                  <SubRowCell>
                    <Tooltip title="Item #11: Stop Loss Reimbursement (user-adjustable)">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Stop Loss Reimbursement
                        <Chip label="Adjustable" size="small" color="info" />
                        <InfoIcon fontSize="small" color="action" />
                      </Box>
                    </Tooltip>
                  </SubRowCell>
                  {data.map(row => (
                    <CurrencyCell
                      key={`${row.month}-slreimb`}
                      sx={{
                        color: row.stopLoss.stopLossReimbursement !== 0 ? 'success.main' : 'inherit',
                        fontWeight: row.stopLoss.stopLossReimbursement !== 0 ? 600 : 400
                      }}
                    >
                      {formatCurrency(row.stopLoss.stopLossReimbursement)}
                    </CurrencyCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </CollapsibleSection>

          {/* ADMINISTRATIVE FEES SECTION (Items #12-14) */}
          <CollapsibleSection title="Administrative Fees" defaultOpen={true} itemNumber="12-14">
            <TableBody>
              {/* Item #12 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #12: Consulting fees from Configure Fees page">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Consulting
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-consult`}>
                    {formatCurrency(row.adminFees.consulting)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #13 - Individual admin fee line items */}
              {data[0]?.adminFees.adminFeeLineItems.map((fee, index) => (
                <TableRow key={`admin-fee-${index}`}>
                  <SubRowCell sx={{ pl: 4 }}>
                    <Tooltip title={`${fee.name} (${fee.feeType.toUpperCase()}): ${fee.description || 'Calculated from Configure Fees'}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {fee.name}
                        <Chip label={fee.feeType.toUpperCase()} size="small" variant="outlined" />
                        <InfoIcon fontSize="small" color="action" />
                      </Box>
                    </Tooltip>
                  </SubRowCell>
                  {data.map(row => {
                    const feeItem = row.adminFees.adminFeeLineItems.find(f => f.id === fee.id);
                    return (
                      <CurrencyCell key={`${row.month}-fee-${fee.id}`}>
                        {formatCurrency(feeItem?.calculatedAmount || 0)}
                      </CurrencyCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Item #14 */}
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <SubRowCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Item #14: Total Admin Fees = Consulting + All Fee Line Items">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Total Admin Fees
                      <InfoIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-totaladmin`} sx={{ fontWeight: 700 }}>
                    {formatCurrency(row.adminFees.totalAdminFees)}
                  </CurrencyCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>

          {/* TOTALS SECTION (Items #15-16) */}
          <CollapsibleSection title="Monthly & Cumulative Totals" defaultOpen={true} itemNumber="15-16">
            <TableBody>
              {/* Item #15 */}
              <TableRow sx={{ backgroundColor: 'warning.light' }}>
                <SubRowCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Item #15: Monthly Claims and Expenses = Medical + Rx + Rebates + Stop Loss - Reimbursement + Admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      MONTHLY CLAIMS AND EXPENSES
                      <InfoIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-monthly`} sx={{ fontWeight: 700 }}>
                    {formatCurrency(row.totals.monthlyClaimsAndExpenses)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #16 */}
              <TableRow sx={{ backgroundColor: 'warning.dark', color: 'common.white' }}>
                <SubRowCell sx={{ fontWeight: 700 }}>
                  <Tooltip title="Item #16: CUMULATIVE CLAIMS AND EXPENSES = Running Total">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      CUMULATIVE CLAIMS AND EXPENSES
                      <InfoIcon fontSize="small" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-cumul`} sx={{ fontWeight: 700 }}>
                    {formatCurrency(row.totals.cumulativeClaimsAndExpenses)}
                  </CurrencyCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>

          {/* ENROLLMENT & METRICS SECTION (Items #17-21) */}
          <CollapsibleSection title="Enrollment & PEPM Metrics" defaultOpen={true} itemNumber="17-21">
            <TableBody>
              {/* Item #17 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #17: EE Count (Active & COBRA) from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      EE Count (Active & COBRA)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <StyledTableCell key={`${row.month}-ee`} sx={{ textAlign: 'right' }}>
                    {row.enrollment.eeCount.toLocaleString()}
                  </StyledTableCell>
                ))}
              </TableRow>

              {/* Item #18 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #18: Member Count from uploaded CSV">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Member Count
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <StyledTableCell key={`${row.month}-member`} sx={{ textAlign: 'right' }}>
                    {row.enrollment.memberCount.toLocaleString()}
                  </StyledTableCell>
                ))}
              </TableRow>

              {/* Item #19 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #19: PEPM Non-Lagged Actual = Monthly Expenses / EE Count">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      PEPM Non-Lagged Actual
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-pepm-actual`}>
                    {formatCurrency(row.pepm.pepmNonLaggedActual)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #20 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #20: PEPM Non-Lagged Cumulative">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      PEPM Non-Lagged Cumulative
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-pepm-cumul`}>
                    {formatCurrency(row.pepm.pepmNonLaggedCumulative)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #21 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #21: Incurred Target PEPM (target cost per employee)">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Incurred Target PEPM
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-pepm-target`}>
                    {formatCurrency(row.pepm.incurredTargetPEPM)}
                  </CurrencyCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>

          {/* BUDGET SECTION (Items #22-24) */}
          <CollapsibleSection title="Budget Data" defaultOpen={false} itemNumber="22-24">
            <TableBody>
              {/* Item #22 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #22: 2024-2025 PEPM Budget (with 0% Margin)">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      2024-2025 PEPM Budget (with 0% Margin)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-budget-pepm`}>
                    {formatCurrency(row.budget.pepmBudget)}
                  </CurrencyCell>
                ))}
              </TableRow>

              {/* Item #23 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #23: 2024-2025 PEPM Budget EE Counts">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      2024-2025 PEPM Budget EE Counts
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <StyledTableCell key={`${row.month}-budget-ee`} sx={{ textAlign: 'right' }}>
                    {row.budget.pepmBudgetEECounts.toLocaleString()}
                  </StyledTableCell>
                ))}
              </TableRow>

              {/* Item #24 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #24: Annual Cumulative Budget">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Annual Cumulative Budget
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <CurrencyCell key={`${row.month}-budget-annual`}>
                    {formatCurrency(row.budget.annualCumulativeBudget)}
                  </CurrencyCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>

          {/* VARIANCE ANALYSIS SECTION (Items #25-28) */}
          <CollapsibleSection title="Variance Analysis" defaultOpen={true} itemNumber="25-28">
            <TableBody>
              {/* Item #25 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #25: Actual Monthly Difference = Actual - Budget">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Actual Monthly Difference
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <VarianceCell
                    key={`${row.month}-var-monthly`}
                    variance={row.variance.percentDifferenceMonthly}
                  >
                    {formatCurrency(row.variance.actualMonthlyDifference)}
                  </VarianceCell>
                ))}
              </TableRow>

              {/* Item #26 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #26: % Difference (Monthly)">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      % Difference (Monthly)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <VarianceCell
                    key={`${row.month}-var-monthly-pct`}
                    variance={row.variance.percentDifferenceMonthly}
                  >
                    {formatPercentage(row.variance.percentDifferenceMonthly)}
                  </VarianceCell>
                ))}
              </TableRow>

              {/* Item #27 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #27: Cumulative Difference = Cumulative Actual - Cumulative Budget">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Cumulative Difference
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <VarianceCell
                    key={`${row.month}-var-cumul`}
                    variance={row.variance.percentDifferenceCumulative}
                  >
                    {formatCurrency(row.variance.cumulativeDifference)}
                  </VarianceCell>
                ))}
              </TableRow>

              {/* Item #28 */}
              <TableRow>
                <SubRowCell>
                  <Tooltip title="Item #28: % Difference (Cumulative)">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      % Difference (Cumulative)
                      <InfoIcon fontSize="small" color="action" />
                    </Box>
                  </Tooltip>
                </SubRowCell>
                {data.map(row => (
                  <VarianceCell
                    key={`${row.month}-var-cumul-pct`}
                    variance={row.variance.percentDifferenceCumulative}
                  >
                    {formatPercentage(row.variance.percentDifferenceCumulative)}
                  </VarianceCell>
                ))}
              </TableRow>
            </TableBody>
          </CollapsibleSection>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
