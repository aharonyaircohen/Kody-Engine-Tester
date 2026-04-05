# [test-suite] Dry run validation

Add a health check endpoint at /api/health that returns { status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() }. Add a test for it.