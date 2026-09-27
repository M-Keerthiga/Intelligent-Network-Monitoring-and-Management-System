package com.inmms;

import com.inmms.dto.AnalysisDTOs.*;
import com.inmms.service.bayesian.BayesianNetworkService;
import com.inmms.service.xai.ExplainabilityService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AnalysisServiceTest {

    private final ExplainabilityService explainabilityService = new ExplainabilityService();
    private final BayesianNetworkService bayesianNetworkService = new BayesianNetworkService();

    @Test
    public void testScenarioA_NormalBaseline() {
        XaiExplanationDTO xai = explainabilityService.explain("Router-01", 22.0, 38.0, 15.0, 0.0, 20.0, true);
        BayesianRcaDTO rca = bayesianNetworkService.analyze(22.0, 38.0, 15.0, 0.0, 20.0, true);

        assertTrue(xai.getAnomalyScore() < 0.25, "Normal baseline should have low anomaly score");
        assertEquals("NORMAL_BASELINE", rca.getMostProbableCause(), "Top cause should be NORMAL_BASELINE");
        assertNotNull(rca.getReasoningChain());
    }

    @Test
    public void testScenarioB_HighCpu() {
        XaiExplanationDTO xai = explainabilityService.explain("App-Server-01", 95.0, 50.0, 25.0, 0.1, 25.0, true);
        BayesianRcaDTO rca = bayesianNetworkService.analyze(95.0, 50.0, 25.0, 0.1, 25.0, true);

        assertTrue(xai.getAnomalyScore() >= 0.50, "High CPU should produce significant anomaly score");
        assertEquals("CPU Utilization", xai.getContributingFactors().get(0).getMetricName(), "CPU should be rank 1 contributing factor");
        assertTrue("HARDWARE_FAULT".equals(rca.getMostProbableCause()) || "TRANSIENT_SPIKE".equals(rca.getMostProbableCause()));
    }

    @Test
    public void testScenarioC_NetworkCongestion() {
        // High bandwidth, High CPU, High Latency, Packet Loss (Specification example)
        XaiExplanationDTO xai = explainabilityService.explain("Router-01", 96.0, 89.0, 142.0, 7.1, 95.0, true);
        BayesianRcaDTO rca = bayesianNetworkService.analyze(96.0, 89.0, 142.0, 7.1, 95.0, true);

        assertTrue(xai.getAnomalyScore() > 0.80, "Severe congestion should yield high anomaly score");
        assertEquals("NETWORK_CONGESTION", rca.getMostProbableCause(), "Top root cause must be NETWORK_CONGESTION");
        assertTrue(rca.getHighestProbability() > 70.0, "Network congestion probability should be strong (>70%)");
        assertNotNull(rca.getReasoningChain());
        assertEquals(4, rca.getReasoningChain().size());
    }

    @Test
    public void testScenarioD_PacketLossLinkDegradation() {
        // High packet loss, elevated latency, low/moderate traffic, normal CPU
        XaiExplanationDTO xai = explainabilityService.explain("Core-Switch-01", 30.0, 42.0, 140.0, 18.0, 15.0, true);
        BayesianRcaDTO rca = bayesianNetworkService.analyze(30.0, 42.0, 140.0, 18.0, 15.0, true);

        assertTrue(xai.getAnomalyScore() >= 0.50);
        assertEquals("LINK_FAILURE", rca.getMostProbableCause(), "Top root cause must be LINK_FAILURE");
    }

    @Test
    public void testScenarioE_DeviceDown() {
        XaiExplanationDTO xai = explainabilityService.explain("Main-Gateway", 0.0, 0.0, 0.0, 100.0, 0.0, false);
        BayesianRcaDTO rca = bayesianNetworkService.analyze(0.0, 0.0, 0.0, 100.0, 0.0, false);

        assertEquals(1.0, xai.getAnomalyScore(), "Offline device has max anomaly score 1.0");
        assertEquals("DEVICE_FAILURE", rca.getMostProbableCause(), "Top root cause must be DEVICE_FAILURE");
        assertTrue(rca.getHighestProbability() >= 90.0, "Device failure probability should be >= 90%");
    }
}
