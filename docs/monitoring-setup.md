# System Monitoring Setup Guide

## Overview

The Banking Access Control System includes comprehensive monitoring capabilities to ensure system health, performance tracking, and proactive issue detection. This guide covers the setup and usage of the monitoring and alerting system.

## Monitoring Components

### 1. System Health Monitoring
- **Endpoint**: `GET /api/health`
- **Purpose**: Basic system health checks and status reporting
- **Response**: System status, uptime, environment information

### 2. Performance Metrics
- **Endpoint**: `GET /api/metrics`
- **Purpose**: Detailed performance monitoring (memory, CPU, uptime)
- **Specific Metrics**: `GET /api/metrics?metric=memory|cpu|uptime`

### 3. Alerting System
- **Endpoint**: `GET/POST/PUT /api/alerts`
- **Purpose**: Multi-level system notifications and issue tracking
- **Features**: Alert creation, resolution, and severity management

### 4. Monitoring Dashboard
- **Component**: `MonitoringDashboard.tsx`
- **Purpose**: Interactive web interface for system monitoring
- **Features**: Real-time metrics, alert management, quick diagnostics

## Setup Instructions

### 1. Environment Configuration

Add monitoring configuration to your `.env.local`:

```env
# Monitoring Configuration (Optional)
MONITORING_ENABLED=true
ALERT_RETENTION_DAYS=30
METRICS_RETENTION_HOURS=24
```

### 2. Health Check Integration

#### Docker Health Checks
The system includes built-in Docker health checks:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

#### Load Balancer Health Checks
Configure your load balancer to use the health endpoint:
- **URL**: `http://your-app/api/health`
- **Expected Response**: HTTP 200 with `{"status": "healthy"}`

### 3. Alerting Configuration

#### Basic Alert Creation
```javascript
// Create a system alert
const response = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'system',
    message: 'Database connection slow',
    severity: 'warning',
    source: 'database-monitor'
  })
});
```

#### Alert Severity Levels
- **info**: General information (blue)
- **warning**: Potential issues requiring attention (yellow)
- **error**: Errors that need resolution (red)
- **critical**: Critical system issues (red)

## Monitoring Dashboard Usage

### Accessing the Dashboard

The monitoring dashboard is available as a React component that can be integrated into your admin interface:

```tsx
import MonitoringDashboard from '../components/MonitoringDashboard'

export default function AdminPage() {
  return (
    <div>
      <h1>System Administration</h1>
      <MonitoringDashboard />
    </div>
  )
}
```

### Dashboard Features

#### System Health Panel
- **Status Indicator**: Overall system health (healthy/unhealthy)
- **Uptime Tracking**: System uptime in hours and minutes
- **Environment Info**: Current environment and version

#### Memory Usage Panel
- **Heap Usage**: JavaScript heap memory consumption
- **RSS Memory**: Resident Set Size (total memory usage)
- **Memory Trends**: Historical memory usage patterns

#### Performance Panel
- **Platform Info**: Operating system and architecture
- **Node.js Version**: Runtime version information
- **System Load**: CPU and memory utilization

#### Alerts Panel
- **Active Alerts**: Current unresolved system alerts
- **Alert History**: Recent alert activity
- **Severity Filtering**: Filter alerts by severity level
- **Resolution Tracking**: Mark alerts as resolved

### Quick Actions
- **Refresh Data**: Manual refresh of all metrics
- **Test Alert**: Create a test alert for verification
- **Raw Metrics**: View detailed JSON metrics data

## Automated Monitoring

### Health Check Scripts

Create automated health check scripts:

```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="http://localhost:3000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✅ System is healthy"
  exit 0
else
  echo "❌ System is unhealthy (HTTP $RESPONSE)"
  # Send alert or notification here
  exit 1
fi
```

### Cron Job Setup

Set up automated health checks:

```bash
# Check health every 5 minutes
*/5 * * * * /path/to/health-check.sh

# Generate daily metrics report
0 9 * * * /path/to/generate-metrics-report.sh
```

## Alert Integration

### External Notification Services

#### Slack Integration
```javascript
// Send alert to Slack
async function sendSlackAlert(alert) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
      attachments: [{
        color: getSeverityColor(alert.severity),
        fields: [
          { title: 'Type', value: alert.type, short: true },
          { title: 'Source', value: alert.source, short: true },
          { title: 'Time', value: alert.timestamp, short: true }
        ]
      }]
    })
  });
}
```

#### Email Integration
```javascript
// Send alert via email
async function sendEmailAlert(alert) {
  // Integration with services like SendGrid, Mailgun, etc.
  const emailData = {
    to: 'admin@bank.com',
    subject: `System Alert: ${alert.severity.toUpperCase()}`,
    body: `
      Alert Details:
      - Type: ${alert.type}
      - Message: ${alert.message}
      - Severity: ${alert.severity}
      - Source: ${alert.source}
      - Time: ${alert.timestamp}
    `
  };

  // Send email using your preferred service
}
```

#### PagerDuty Integration
```javascript
// Create PagerDuty incident for critical alerts
async function createPagerDutyIncident(alert) {
  if (alert.severity !== 'critical') return;

  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;

  await fetch('https://events.pagerduty.com/v2/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      routing_key: routingKey,
      event_action: 'trigger',
      payload: {
        summary: alert.message,
        severity: 'critical',
        source: alert.source,
        component: 'banking-access-control',
        group: 'system-monitoring'
      }
    })
  });
}
```

## Performance Optimization

### Memory Management
- Monitor heap usage trends
- Implement garbage collection monitoring
- Set up alerts for memory threshold breaches

### Response Time Monitoring
- Track API response times
- Set up alerts for slow responses
- Monitor database query performance

### Resource Alerts
```javascript
// Example resource monitoring alerts
const alerts = [
  {
    type: 'memory',
    message: 'High memory usage detected',
    severity: 'warning',
    threshold: 80 // percentage
  },
  {
    type: 'cpu',
    message: 'High CPU usage detected',
    severity: 'warning',
    threshold: 90 // percentage
  },
  {
    type: 'disk',
    message: 'Low disk space warning',
    severity: 'error',
    threshold: 10 // GB remaining
  }
];
```

## Troubleshooting

### Common Issues

#### Health Check Failures
- **Cause**: Application not responding
- **Solution**: Check application logs, restart service
- **Prevention**: Implement proper error handling and recovery

#### High Memory Usage
- **Cause**: Memory leaks or large data processing
- **Solution**: Monitor heap dumps, optimize data processing
- **Prevention**: Implement memory monitoring and alerts

#### Alert Spam
- **Cause**: Too many similar alerts
- **Solution**: Implement alert deduplication and rate limiting
- **Prevention**: Configure appropriate alert thresholds

### Monitoring Best Practices

1. **Set Appropriate Thresholds**: Configure alerts for meaningful thresholds
2. **Implement Alert Escalation**: Critical alerts should notify multiple channels
3. **Regular Review**: Periodically review and adjust monitoring configuration
4. **Documentation**: Keep monitoring setup and procedures documented
5. **Testing**: Regularly test monitoring and alerting systems

## API Reference

### Health Check API
```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production"
}
```

### Metrics API
```http
GET /api/metrics
GET /api/metrics?metric=memory
GET /api/metrics?metric=cpu
GET /api/metrics?metric=uptime
```

Response:
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 104857600,
    "heapTotal": 67108864,
    "heapUsed": 45000000,
    "external": 2000000
  },
  "cpu": {
    "user": 120000,
    "system": 30000
  },
  "version": "18.17.0",
  "platform": "linux"
}
```

### Alerts API
```http
GET /api/alerts
GET /api/alerts?type=system
GET /api/alerts?limit=50

POST /api/alerts
Content-Type: application/json

{
  "type": "system",
  "message": "Database connection slow",
  "severity": "warning",
  "source": "database-monitor"
}

PUT /api/alerts
Content-Type: application/json

{
  "id": "alert-123",
  "resolved": true
}
```

## Security Considerations

- **API Access**: Protect monitoring endpoints with authentication
- **Alert Data**: Ensure alert contents don't expose sensitive information
- **External Integrations**: Secure webhook URLs and API keys
- **Log Security**: Monitor logs for sensitive data exposure
- **Access Control**: Limit monitoring dashboard access to administrators

## Next Steps

1. **Configure Alert Integrations**: Set up Slack, email, or PagerDuty notifications
2. **Set Up Automated Monitoring**: Implement cron jobs for regular health checks
3. **Configure Thresholds**: Define appropriate alert thresholds for your environment
4. **Test Monitoring**: Verify all monitoring components work correctly
5. **Document Procedures**: Create runbooks for common alert responses

For additional support or questions about the monitoring system, refer to the main project documentation or contact the development team.