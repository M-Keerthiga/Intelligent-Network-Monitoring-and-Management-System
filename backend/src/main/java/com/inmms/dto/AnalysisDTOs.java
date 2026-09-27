package com.inmms.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AnalysisDTOs {

    public static class IncidentAnalysisResponse {
        private Long alertId;
        private String alertType;
        private String severity;
        private String alertStatus;
        private Long deviceId;
        private String deviceName;
        private String deviceIp;
        private String deviceType;
        private LocalDateTime timestamp;
        private Map<String, Object> observedMetrics;
        private Map<String, Object> baselineMetrics;
        private XaiExplanationDTO xai;
        private BayesianRcaDTO bayesianRca;
        private RecommendationDTO recommendation;

        public IncidentAnalysisResponse() {}

        public Long getAlertId() { return alertId; }
        public void setAlertId(Long alertId) { this.alertId = alertId; }

        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }

        public String getSeverity() { return severity; }
        public void setSeverity(String severity) { this.severity = severity; }

        public String getAlertStatus() { return alertStatus; }
        public void setAlertStatus(String alertStatus) { this.alertStatus = alertStatus; }

        public Long getDeviceId() { return deviceId; }
        public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

        public String getDeviceName() { return deviceName; }
        public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

        public String getDeviceIp() { return deviceIp; }
        public void setDeviceIp(String deviceIp) { this.deviceIp = deviceIp; }

        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public Map<String, Object> getObservedMetrics() { return observedMetrics; }
        public void setObservedMetrics(Map<String, Object> observedMetrics) { this.observedMetrics = observedMetrics; }

        public Map<String, Object> getBaselineMetrics() { return baselineMetrics; }
        public void setBaselineMetrics(Map<String, Object> baselineMetrics) { this.baselineMetrics = baselineMetrics; }

        public XaiExplanationDTO getXai() { return xai; }
        public void setXai(XaiExplanationDTO xai) { this.xai = xai; }

        public BayesianRcaDTO getBayesianRca() { return bayesianRca; }
        public void setBayesianRca(BayesianRcaDTO bayesianRca) { this.bayesianRca = bayesianRca; }

        public RecommendationDTO getRecommendation() { return recommendation; }
        public void setRecommendation(RecommendationDTO recommendation) { this.recommendation = recommendation; }
    }

    public static class XaiExplanationDTO {
        private String mainExplanation;
        private double anomalyScore; // Honest score (0.0 to 1.0)
        private String scoreLabel; // e.g. "Composite Anomaly Severity Score"
        private String explanationStrength; // Very High, High, Moderate, Low
        private String methodology; // Transparent label
        private List<String> evidenceBulletPoints;
        private String conclusion;
        private List<ContributingFactorDTO> contributingFactors;

        public XaiExplanationDTO() {}

        public String getMainExplanation() { return mainExplanation; }
        public void setMainExplanation(String mainExplanation) { this.mainExplanation = mainExplanation; }

        public double getAnomalyScore() { return anomalyScore; }
        public void setAnomalyScore(double anomalyScore) { this.anomalyScore = anomalyScore; }

        public String getScoreLabel() { return scoreLabel; }
        public void setScoreLabel(String scoreLabel) { this.scoreLabel = scoreLabel; }

        public String getExplanationStrength() { return explanationStrength; }
        public void setExplanationStrength(String explanationStrength) { this.explanationStrength = explanationStrength; }

        public String getMethodology() { return methodology; }
        public void setMethodology(String methodology) { this.methodology = methodology; }

        public List<String> getEvidenceBulletPoints() { return evidenceBulletPoints; }
        public void setEvidenceBulletPoints(List<String> evidenceBulletPoints) { this.evidenceBulletPoints = evidenceBulletPoints; }

        public String getConclusion() { return conclusion; }
        public void setConclusion(String conclusion) { this.conclusion = conclusion; }

        public List<ContributingFactorDTO> getContributingFactors() { return contributingFactors; }
        public void setContributingFactors(List<ContributingFactorDTO> contributingFactors) { this.contributingFactors = contributingFactors; }
    }

    public static class ContributingFactorDTO {
        private String metricName;
        private String metricKey;
        private double observedValue;
        private double baselineValue;
        private String unit;
        private double deviationPercent;
        private double contributionPercent;
        private String contributionLevel; // Very High, High, Medium, Low
        private int rank;

        public ContributingFactorDTO() {}

        public ContributingFactorDTO(String metricName, String metricKey, double observedValue, double baselineValue,
                                     String unit, double deviationPercent, double contributionPercent,
                                     String contributionLevel, int rank) {
            this.metricName = metricName;
            this.metricKey = metricKey;
            this.observedValue = observedValue;
            this.baselineValue = baselineValue;
            this.unit = unit;
            this.deviationPercent = deviationPercent;
            this.contributionPercent = contributionPercent;
            this.contributionLevel = contributionLevel;
            this.rank = rank;
        }

        public String getMetricName() { return metricName; }
        public void setMetricName(String metricName) { this.metricName = metricName; }

        public String getMetricKey() { return metricKey; }
        public void setMetricKey(String metricKey) { this.metricKey = metricKey; }

        public double getObservedValue() { return observedValue; }
        public void setObservedValue(double observedValue) { this.observedValue = observedValue; }

        public double getBaselineValue() { return baselineValue; }
        public void setBaselineValue(double baselineValue) { this.baselineValue = baselineValue; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public double getDeviationPercent() { return deviationPercent; }
        public void setDeviationPercent(double deviationPercent) { this.deviationPercent = deviationPercent; }

        public double getContributionPercent() { return contributionPercent; }
        public void setContributionPercent(double contributionPercent) { this.contributionPercent = contributionPercent; }

        public String getContributionLevel() { return contributionLevel; }
        public void setContributionLevel(String contributionLevel) { this.contributionLevel = contributionLevel; }

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
    }

    public static class BayesianRcaDTO {
        private String mostProbableCause;
        private String mostProbableCauseTitle;
        private double highestProbability;
        private String description;
        private String methodology;
        private List<CauseProbabilityDTO> candidateCauses;
        private List<ReasoningStepDTO> reasoningChain;

        public BayesianRcaDTO() {}

        public String getMostProbableCause() { return mostProbableCause; }
        public void setMostProbableCause(String mostProbableCause) { this.mostProbableCause = mostProbableCause; }

        public String getMostProbableCauseTitle() { return mostProbableCauseTitle; }
        public void setMostProbableCauseTitle(String mostProbableCauseTitle) { this.mostProbableCauseTitle = mostProbableCauseTitle; }

        public double getHighestProbability() { return highestProbability; }
        public void setHighestProbability(double highestProbability) { this.highestProbability = highestProbability; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getMethodology() { return methodology; }
        public void setMethodology(String methodology) { this.methodology = methodology; }

        public List<CauseProbabilityDTO> getCandidateCauses() { return candidateCauses; }
        public void setCandidateCauses(List<CauseProbabilityDTO> candidateCauses) { this.candidateCauses = candidateCauses; }

        public List<ReasoningStepDTO> getReasoningChain() { return reasoningChain; }
        public void setReasoningChain(List<ReasoningStepDTO> reasoningChain) { this.reasoningChain = reasoningChain; }
    }

    public static class CauseProbabilityDTO {
        private String causeKey;
        private String title;
        private double probability; // 0.0 - 100.0%
        private double priorProbability; // 0.0 - 100.0%
        private String description;
        private boolean isTopCause;

        public CauseProbabilityDTO() {}

        public CauseProbabilityDTO(String causeKey, String title, double probability, double priorProbability,
                                   String description, boolean isTopCause) {
            this.causeKey = causeKey;
            this.title = title;
            this.probability = probability;
            this.priorProbability = priorProbability;
            this.description = description;
            this.isTopCause = isTopCause;
        }

        public String getCauseKey() { return causeKey; }
        public void setCauseKey(String causeKey) { this.causeKey = causeKey; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public double getProbability() { return probability; }
        public void setProbability(double probability) { this.probability = probability; }

        public double getPriorProbability() { return priorProbability; }
        public void setPriorProbability(double priorProbability) { this.priorProbability = priorProbability; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public boolean isTopCause() { return isTopCause; }
        public void setTopCause(boolean topCause) { isTopCause = topCause; }
    }

    public static class ReasoningStepDTO {
        private int stepNumber;
        private String title;
        private String detail;
        private String tag;

        public ReasoningStepDTO() {}

        public ReasoningStepDTO(int stepNumber, String title, String detail, String tag) {
            this.stepNumber = stepNumber;
            this.title = title;
            this.detail = detail;
            this.tag = tag;
        }

        public int getStepNumber() { return stepNumber; }
        public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDetail() { return detail; }
        public void setDetail(String detail) { this.detail = detail; }

        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
    }

    public static class RecommendationDTO {
        private String title;
        private String actionSummary;
        private String urgency; // CRITICAL, HIGH, MEDIUM, LOW
        private List<String> troubleshootingSteps;

        public RecommendationDTO() {}

        public RecommendationDTO(String title, String actionSummary, String urgency, List<String> troubleshootingSteps) {
            this.title = title;
            this.actionSummary = actionSummary;
            this.urgency = urgency;
            this.troubleshootingSteps = troubleshootingSteps;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getActionSummary() { return actionSummary; }
        public void setActionSummary(String actionSummary) { this.actionSummary = actionSummary; }

        public String getUrgency() { return urgency; }
        public void setUrgency(String urgency) { this.urgency = urgency; }

        public List<String> getTroubleshootingSteps() { return troubleshootingSteps; }
        public void setTroubleshootingSteps(List<String> troubleshootingSteps) { this.troubleshootingSteps = troubleshootingSteps; }
    }
}
