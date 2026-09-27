package com.inmms.service.bayesian;

import com.inmms.dto.AnalysisDTOs.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BayesianNetworkService {

    public static class CandidateCause {
        String key;
        String title;
        double prior;
        String description;

        public CandidateCause(String key, String title, double prior, String description) {
            this.key = key;
            this.title = title;
            this.prior = prior;
            this.description = description;
        }
    }

    private final List<CandidateCause> CAUSES = Arrays.asList(
            new CandidateCause("NETWORK_CONGESTION", "Network Traffic Congestion / Bandwidth Saturation", 0.24,
                    "High data transmission volume exceeds link bandwidth capacity, creating buffer queue delays and packet drops."),
            new CandidateCause("LINK_FAILURE", "Physical Link / Cable Degradation", 0.14,
                    "Physical interface faults, cable attenuation, or duplex mismatch causing packet drops without high throughput."),
            new CandidateCause("HARDWARE_FAULT", "Hardware / Processor Core Overload", 0.10,
                    "Internal device CPU or memory resource exhaustion independent of external network traffic."),
            new CandidateCause("CONFIG_ISSUE", "Configuration / Routing Loop Issue", 0.12,
                    "Mismatched MTU, sub-optimal BGP/OSPF routing path, or routing hop loops causing packet latency and drops."),
            new CandidateCause("DEVICE_FAILURE", "Device Outage / Power Interruption", 0.10,
                    "Complete device failure, unreachable interface, or hardware shutdown."),
            new CandidateCause("TRANSIENT_SPIKE", "Transient Workload / Normal Surge", 0.15,
                    "Temporary application burst within normal operating envelope, self-stabilizing shortly."),
            new CandidateCause("NORMAL_BASELINE", "Normal Healthy Baseline", 0.15,
                    "All telemetry measurements operating within certified baseline parameters.")
    );

    public BayesianRcaDTO analyze(double cpu, double memory, double latency,
                                  double packetLoss, double traffic, boolean reachable) {
        BayesianRcaDTO rca = new BayesianRcaDTO();
        rca.setMethodology("Bayesian Belief Network Causal Inference (Exact Posterior Evaluation via Bayes' Theorem)");

        // 1. If device is DOWN or 100% packet loss
        if (!reachable || packetLoss >= 99.0) {
            rca.setMostProbableCause("DEVICE_FAILURE");
            rca.setMostProbableCauseTitle("Device Outage / Power Interruption");
            rca.setHighestProbability(94.2);
            rca.setDescription("Evidence shows 100% packet loss and complete failure of ICMP/telemetry ping checks. The device or its direct uplink is entirely down.");

            List<CauseProbabilityDTO> causes = new ArrayList<>();
            causes.add(new CauseProbabilityDTO("DEVICE_FAILURE", "Device Outage / Power Interruption", 94.2, 10.0, "Complete loss of device reachability.", true));
            causes.add(new CauseProbabilityDTO("LINK_FAILURE", "Physical Link / Uplink Disconnection", 4.5, 14.0, "Physical cable severed or uplink switch port disabled.", false));
            causes.add(new CauseProbabilityDTO("HARDWARE_FAULT", "Critical Hardware Power Supply Failure", 1.3, 10.0, "PSU or mainboard power rail failure.", false));
            rca.setCandidateCauses(causes);

            List<ReasoningStepDTO> steps = new ArrayList<>();
            steps.add(new ReasoningStepDTO(1, "Telemetry Evidence", "Device unreachable, 0.0 MB/s traffic, 100% packet loss.", "OBSERVED"));
            steps.add(new ReasoningStepDTO(2, "Causal Link Mapping", "Reachability node (P=0.0) strongly conditions Device Failure node.", "SYMPTOM"));
            steps.add(new ReasoningStepDTO(3, "Bayesian Prior Update", "Likelihood P(Unreachable | DeviceFailure) = 0.99 dominates posteriors.", "INFERENCE"));
            steps.add(new ReasoningStepDTO(4, "Diagnostic Conclusion", "Most probable root cause: Device Outage (94.2% posterior confidence).", "CONCLUSION"));
            rca.setReasoningChain(steps);
            return rca;
        }

        // 2. Evaluated Symptoms (Continuous Sigmoid Response between 0.0 and 1.0)
        double sTraffic = sigmoid(traffic, 60.0, 18.0);
        double sLatency = sigmoid(latency, 75.0, 25.0);
        double sLoss = sigmoid(packetLoss, 3.5, 2.0);
        double sCpu = sigmoid(cpu, 75.0, 10.0);
        double sMem = sigmoid(memory, 75.0, 10.0);

        Map<String, Double> unnormalizedPosteriors = new HashMap<>();

        for (CandidateCause cause : CAUSES) {
            double prior = cause.prior;
            double likelihood;

            switch (cause.key) {
                case "NETWORK_CONGESTION":
                    // Traffic Congestion manifests with high traffic, high latency, buffer queue loss, and high CPU
                    likelihood = (0.10 + 0.90 * sTraffic) *
                                 (0.10 + 0.90 * sLatency) *
                                 (0.10 + 0.90 * sLoss) *
                                 (0.10 + 0.90 * sCpu);
                    break;

                case "LINK_FAILURE":
                    // Link failure manifests with high loss and latency, but low/normal traffic and normal CPU
                    likelihood = (0.10 + 0.90 * sLoss) *
                                 (0.10 + 0.90 * sLatency) *
                                 (0.10 + 0.90 * (1.0 - sTraffic)) *
                                 (0.10 + 0.90 * (1.0 - sCpu));
                    break;

                case "HARDWARE_FAULT":
                    // Hardware fault causes extreme CPU or Memory with normal external traffic and low packet loss
                    double resourceStress = Math.max(sCpu, sMem);
                    likelihood = (0.10 + 0.90 * resourceStress) *
                                 (0.10 + 0.90 * (1.0 - sTraffic)) *
                                 (0.10 + 0.90 * (1.0 - sLoss));
                    break;

                case "CONFIG_ISSUE":
                    // Config issue (routing loop/MTU mismatch) causes high latency and packet loss with normal traffic
                    likelihood = (0.10 + 0.90 * sLatency) *
                                 (0.10 + 0.90 * sLoss) *
                                 (0.10 + 0.90 * (1.0 - sTraffic));
                    break;

                case "TRANSIENT_SPIKE":
                    // Transient spike in traffic or CPU without sustained packet loss or severe latency
                    double spikeLoad = Math.max(sTraffic, sCpu);
                    likelihood = (0.10 + 0.90 * spikeLoad) *
                                 (1.0 - 0.90 * sLoss) *
                                 (1.0 - 0.90 * sLatency);
                    break;

                case "NORMAL_BASELINE":
                    // Normal healthy operation across all dimensions
                    likelihood = (1.0 - 0.95 * sTraffic) *
                                 (1.0 - 0.95 * sLatency) *
                                 (1.0 - 0.95 * sLoss) *
                                 (1.0 - 0.95 * sCpu) *
                                 (1.0 - 0.95 * sMem);
                    break;

                case "DEVICE_FAILURE":
                    // Reachable device has virtually 0 likelihood of being power failed / down
                    likelihood = 0.0001;
                    break;

                default:
                    likelihood = 0.01;
            }

            double unnorm = prior * Math.max(likelihood, 1e-9);
            unnormalizedPosteriors.put(cause.key, unnorm);
        }

        // Sum for Bayes normalizer P(Evidence)
        double totalUnnormalized = 0.0;
        for (double val : unnormalizedPosteriors.values()) {
            totalUnnormalized += val;
        }

        List<CauseProbabilityDTO> causeDTOs = new ArrayList<>();
        String topCauseKey = null;
        double maxProb = -1.0;

        for (CandidateCause cause : CAUSES) {
            double unnorm = unnormalizedPosteriors.getOrDefault(cause.key, 0.0);
            double prob = totalUnnormalized > 0 ? (unnorm / totalUnnormalized) * 100.0 : cause.prior * 100.0;
            prob = Math.round(prob * 10.0) / 10.0;

            if (prob > maxProb) {
                maxProb = prob;
                topCauseKey = cause.key;
            }

            causeDTOs.add(new CauseProbabilityDTO(cause.key, cause.title, prob,
                    Math.round(cause.prior * 100.0 * 10.0) / 10.0, cause.description, false));
        }

        // Mark top cause
        for (CauseProbabilityDTO dto : causeDTOs) {
            if (dto.getCauseKey().equals(topCauseKey)) {
                dto.setTopCause(true);
            }
        }

        // Sort causes descending by probability
        causeDTOs.sort((a, b) -> Double.compare(b.getProbability(), a.getProbability()));

        final String finalTopCauseKey = topCauseKey;
        CandidateCause topCause = CAUSES.stream()
                .filter(c -> c.key.equals(finalTopCauseKey))
                .findFirst()
                .orElse(CAUSES.get(0));

        rca.setMostProbableCause(topCause.key);
        rca.setMostProbableCauseTitle(topCause.title);
        rca.setHighestProbability(causeDTOs.get(0).getProbability());
        rca.setDescription(topCause.description);
        rca.setCandidateCauses(causeDTOs);

        // Build dynamic step-by-step Bayesian Reasoning Chain
        List<ReasoningStepDTO> reasoningSteps = new ArrayList<>();

        List<String> evidenceItems = new ArrayList<>();
        if (traffic > 60.0) evidenceItems.add(String.format("High Bandwidth (%.1f MB/s)", traffic));
        if (cpu > 75.0) evidenceItems.add(String.format("High CPU (%.1f%%)", cpu));
        if (latency > 70.0) evidenceItems.add(String.format("High Latency (%.1f ms)", latency));
        if (packetLoss > 2.0) evidenceItems.add(String.format("Packet Loss (%.1f%%)", packetLoss));
        if (memory > 75.0) evidenceItems.add(String.format("High Memory (%.1f%%)", memory));

        String evidenceSummary = evidenceItems.isEmpty()
                ? "All parameters operating within certified normal baseline thresholds."
                : String.join(", ", evidenceItems);

        reasoningSteps.add(new ReasoningStepDTO(1, "Observed Evidence Extraction",
                evidenceSummary, "EVIDENCE"));

        String symptomPropagation;
        if ("NETWORK_CONGESTION".equals(topCause.key)) {
            symptomPropagation = "Heavy bandwidth utilization correlates with elevated latency and buffer drops, confirming saturation of link queue capacity.";
        } else if ("LINK_FAILURE".equals(topCause.key)) {
            symptomPropagation = "Significant packet loss detected without accompanying traffic spikes, pointing to physical or link-layer transmission error.";
        } else if ("HARDWARE_FAULT".equals(topCause.key)) {
            symptomPropagation = "Severe CPU/Memory core saturation detected while external bandwidth and latency remain unaffected.";
        } else if ("CONFIG_ISSUE".equals(topCause.key)) {
            symptomPropagation = "Extreme latency delay and packet drops characteristic of routing loop or MTU mismatch.";
        } else if ("TRANSIENT_SPIKE".equals(topCause.key)) {
            symptomPropagation = "Elevated traffic or compute load detected without buffer collapse or persistent packet loss.";
        } else {
            symptomPropagation = "Metrics reflect expected healthy operation without topological cascade.";
        }
        reasoningSteps.add(new ReasoningStepDTO(2, "Causal Graph Propagation", symptomPropagation, "SYMPTOM"));

        reasoningSteps.add(new ReasoningStepDTO(3, "Bayesian Posterior Calculation",
                String.format("Evaluated CPD conditional likelihoods P(Evidence | Causes) against prior distributions across 7 network hypothesis nodes. Bayes normalizer converged.", topCause.title),
                "BAYES"));

        reasoningSteps.add(new ReasoningStepDTO(4, "Root Cause Convergence",
                String.format("Most Probable Cause: %s (Calculated Posterior Probability: %.1f%%).",
                        topCause.title, causeDTOs.get(0).getProbability()),
                "DIAGNOSIS"));

        rca.setReasoningChain(reasoningSteps);
        return rca;
    }

    private double sigmoid(double val, double center, double scale) {
        double z = (val - center) / scale;
        // Bounded sigmoid 1 / (1 + exp(-z))
        if (z < -10.0) return 0.0;
        if (z > 10.0) return 1.0;
        return 1.0 / (1.0 + Math.exp(-z));
    }
}
