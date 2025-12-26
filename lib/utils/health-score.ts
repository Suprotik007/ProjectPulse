import { Types } from 'mongoose';

/**
 * PROJECT HEALTH SCORE ALGORITHM
 * 
 * This algorithm calculates a project's health score (0-100) based on multiple factors:
 * 
 * WEIGHTED FORMULA:
 * Health Score = (Client Satisfaction × 30%) + 
 *                (Employee Confidence × 25%) + 
 *                (Timeline Performance × 25%) + 
 *                (Risk Factor × 20%)
 * 
 * COMPONENT BREAKDOWN:
 * 
 * 1. Client Satisfaction (30% weight):
 *    - Average satisfaction rating from last 4 weeks of feedback
 *    - Scale: 1-5 stars → converted to 0-100
 *    - No feedback = neutral 75/100
 * 
 * 2. Employee Confidence (25% weight):
 *    - Average confidence level from last 4 weeks of check-ins
 *    - Scale: 1-5 → converted to 0-100
 *    - No check-ins = neutral 70/100
 * 
 * 3. Timeline Performance (25% weight):
 *    - Compares actual progress vs expected progress
 *    - Expected progress = (days elapsed / total days) × 100
 *    - Actual progress = average completion % from recent check-ins
 *    - Score = 100 - Math.abs(expected - actual)
 *    - Behind schedule reduces score more than being ahead
 * 
 * 4. Risk Factor (20% weight):
 *    - Penalties for flagged issues and open risks
 *    - High severity risk: -10 points each
 *    - Medium severity risk: -5 points each
 *    - Low severity risk: -2 points each
 *    - Flagged issue: -5 points each
 *    - Maximum penalty: -30 points
 * 
 * STATUS DETERMINATION:
 * - 80-100: On Track (Green)
 * - 60-79:  At Risk (Yellow)
 * - 0-59:   Critical (Red)
 */

interface HealthScoreInput {
  projectId: string | Types.ObjectId;
  startDate: Date;
  endDate: Date;
  feedbacks: Array<{
    satisfactionRating: number;
    issueFlagged: boolean;
    createdAt: Date;
  }>;
  checkIns: Array<{
    confidenceLevel: number;
    completionPercentage: number;
    createdAt: Date;
  }>;
  risks: Array<{
    severity: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'Resolved';
  }>;
}

interface HealthScoreResult {
  score: number;
  status: 'On Track' | 'At Risk' | 'Critical' | 'Completed';
  breakdown: {
    clientSatisfaction: number;
    employeeConfidence: number;
    timelinePerformance: number;
    riskFactor: number;
  };
  details: {
    avgSatisfaction: number;
    avgConfidence: number;
    expectedProgress: number;
    actualProgress: number;
    flaggedIssues: number;
    openRisks: {
      high: number;
      medium: number;
      low: number;
    };
  };
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreResult {
  const {
    startDate,
    endDate,
    feedbacks,
    checkIns,
    risks,
  } = input;

  // Get date 4 weeks ago
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // ===== 1. CLIENT SATISFACTION (30% weight) =====
  const recentFeedbacks = feedbacks.filter(
    (f) => new Date(f.createdAt) >= fourWeeksAgo
  );

  let clientSatisfactionScore = 75; // Default neutral score

  if (recentFeedbacks.length > 0) {
    const avgSatisfaction =
      recentFeedbacks.reduce((sum, f) => sum + f.satisfactionRating, 0) /
      recentFeedbacks.length;

    // Convert 1-5 scale to 0-100
    clientSatisfactionScore = (avgSatisfaction / 5) * 100;
  }

  // ===== 2. EMPLOYEE CONFIDENCE (25% weight) =====
  const recentCheckIns = checkIns.filter(
    (c) => new Date(c.createdAt) >= fourWeeksAgo
  );

  let employeeConfidenceScore = 70; // Default neutral score

  if (recentCheckIns.length > 0) {
    const avgConfidence =
      recentCheckIns.reduce((sum, c) => sum + c.confidenceLevel, 0) /
      recentCheckIns.length;

    // Convert 1-5 scale to 0-100
    employeeConfidenceScore = (avgConfidence / 5) * 100;
  }

  // ===== 3. TIMELINE PERFORMANCE (25% weight) =====
  const now = new Date();
  const projectStart = new Date(startDate);
  const projectEnd = new Date(endDate);

  // Calculate expected progress based on timeline
  const totalDays = Math.max(
    1,
    (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.max(
    0,
    (now.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100);

  // Calculate actual progress from recent check-ins
  let actualProgress = expectedProgress; // Default to expected if no check-ins

  if (recentCheckIns.length > 0) {
    actualProgress =
      recentCheckIns.reduce((sum, c) => sum + c.completionPercentage, 0) /
      recentCheckIns.length;
  }

  // Calculate timeline performance score
  const progressDifference = actualProgress - expectedProgress;

  let timelinePerformanceScore = 100;

  if (progressDifference < 0) {
    // Behind schedule - penalize more heavily
    timelinePerformanceScore = Math.max(0, 100 + progressDifference * 2);
  } else if (progressDifference > 0) {
    // Ahead of schedule - slight bonus, but cap it
    timelinePerformanceScore = Math.min(100, 100 + progressDifference * 0.5);
  }

  // ===== 4. RISK FACTOR (20% weight) =====
  const openRisks = risks.filter((r) => r.status === 'Open');

  const highRisks = openRisks.filter((r) => r.severity === 'High').length;
  const mediumRisks = openRisks.filter((r) => r.severity === 'Medium').length;
  const lowRisks = openRisks.filter((r) => r.severity === 'Low').length;

  const flaggedIssues = recentFeedbacks.filter((f) => f.issueFlagged).length;

  // Calculate risk penalties
  let riskPenalty = 0;
  riskPenalty += highRisks * 10; // -10 points per high risk
  riskPenalty += mediumRisks * 5; // -5 points per medium risk
  riskPenalty += lowRisks * 2; // -2 points per low risk
  riskPenalty += flaggedIssues * 5; // -5 points per flagged issue

  // Cap risk penalty at -30 points
  riskPenalty = Math.min(30, riskPenalty);

  const riskFactorScore = Math.max(0, 100 - riskPenalty);

  // ===== CALCULATE FINAL WEIGHTED SCORE =====
  const finalScore = Math.round(
    clientSatisfactionScore * 0.3 +
      employeeConfidenceScore * 0.25 +
      timelinePerformanceScore * 0.25 +
      riskFactorScore * 0.2
  );

  // Ensure score is between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, finalScore));

  // ===== DETERMINE STATUS =====
  let status: 'On Track' | 'At Risk' | 'Critical' | 'Completed';

  // Check if project is completed
  if (now >= projectEnd && actualProgress >= 95) {
    status = 'Completed';
  } else if (clampedScore >= 80) {
    status = 'On Track';
  } else if (clampedScore >= 60) {
    status = 'At Risk';
  } else {
    status = 'Critical';
  }

  // ===== RETURN DETAILED RESULT =====
  return {
    score: clampedScore,
    status,
    breakdown: {
      clientSatisfaction: Math.round(clientSatisfactionScore * 0.3),
      employeeConfidence: Math.round(employeeConfidenceScore * 0.25),
      timelinePerformance: Math.round(timelinePerformanceScore * 0.25),
      riskFactor: Math.round(riskFactorScore * 0.2),
    },
    details: {
      avgSatisfaction:
        recentFeedbacks.length > 0
          ? recentFeedbacks.reduce((sum, f) => sum + f.satisfactionRating, 0) /
            recentFeedbacks.length
          : 0,
      avgConfidence:
        recentCheckIns.length > 0
          ? recentCheckIns.reduce((sum, c) => sum + c.confidenceLevel, 0) /
            recentCheckIns.length
          : 0,
      expectedProgress: Math.round(expectedProgress),
      actualProgress: Math.round(actualProgress),
      flaggedIssues,
      openRisks: {
        high: highRisks,
        medium: mediumRisks,
        low: lowRisks,
      },
    },
  };
}

/**
 * Determines project status based on health score
 */
export function getStatusFromScore(score: number): 'On Track' | 'At Risk' | 'Critical' {
  if (score >= 80) return 'On Track';
  if (score >= 60) return 'At Risk';
  return 'Critical';
}

/**
 * Gets color class for status badge
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'On Track':
      return 'bg-success text-success-dark';
    case 'At Risk':
      return 'bg-warning text-warning-dark';
    case 'Critical':
      return 'bg-danger text-danger-dark';
    case 'Completed':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

/**
 * Gets color class for health score display
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
}