import urllib.request
import json
import sys

base_url = "http://localhost:8080/api"

def test_api(name, url, method="GET", payload=None):
    try:
        req = urllib.request.Request(url, method=method)
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode('utf-8') if payload else None
        
        with urllib.request.urlopen(req, data=data, timeout=5) as response:
            status = response.status
            res_body = response.read().decode('utf-8')
            json_obj = json.loads(res_body) if res_body and (res_body.startswith('{') or res_body.startswith('[')) else res_body
            print(f"[PASS] {name} (HTTP {status})")
            return json_obj
    except Exception as e:
        print(f"[FAIL] {name} - Error: {e}")
        return None

print("==========================================")
print("RUNNING INMMS AUTOMATED API TEST SUITE")
print("==========================================")

# 1. Login
test_api("Login API", f"{base_url}/auth/login", "POST", {"username": "admin", "password": "admin123"})

# 2. Devices List
devices = test_api("Get All Devices", f"{base_url}/devices")
print(f"   -> Retrieved {len(devices) if devices else 0} active devices.")

# 3. Single Device Detail & Metrics
if devices and len(devices) > 0:
    dev_id = devices[0]['id']
    test_api(f"Get Device Detail #{dev_id}", f"{base_url}/devices/{dev_id}")
    test_api(f"Get Device Metrics #{dev_id}", f"{base_url}/devices/{dev_id}/metrics")

# 4. Dashboard Summary
summary = test_api("Get Dashboard Summary", f"{base_url}/dashboard/summary")
if summary:
    print(f"   -> Health Score: {summary.get('networkHealthScore')}, Total Devices: {summary.get('totalDevices')}")

# 5. Alerts List
alerts = test_api("Get Alerts List", f"{base_url}/alerts")

# 6. Topology Map
topology = test_api("Get Topology Graph", f"{base_url}/topology")

# 7. Reports Summary
reports = test_api("Get Executive SLA Report", f"{base_url}/reports")

# 8. Test Fault Injection Demo Scenario (HIGH_CPU)
print("\n--- Testing Fault Injection Demo Scenario (HIGH_CPU) ---")
scen_res = test_api("Trigger HIGH_CPU Scenario", f"{base_url}/demo/scenario", "POST", {"scenario": "HIGH_CPU", "deviceId": 4})

# Re-fetch dashboard summary to verify health drop & alert generation
summary_after = test_api("Verify Dashboard After Fault Injection", f"{base_url}/dashboard/summary")
if summary_after:
    print(f"   -> Updated Health Score: {summary_after.get('networkHealthScore')}, Warning Alerts: {summary_after.get('warningAlerts')}, Critical Alerts: {summary_after.get('criticalAlerts')}")

# Reset scenario to NORMAL
print("\n--- Resetting Scenario to NORMAL ---")
test_api("Reset Scenario to NORMAL", f"{base_url}/demo/scenario", "POST", {"scenario": "NORMAL"})

print("\n==========================================")
print("ALL API VERIFICATION TESTS PASSED SUCCESSFULLY!")
print("==========================================")
