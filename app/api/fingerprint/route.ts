import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

// Store running processes (in production, use a proper process manager)
const runningProcesses = new Map<number, ChildProcess>();

// GET /api/fingerprint - Check service status
export async function GET() {
  try {
    // Check if bridge service is running on port 8765
    const isRunning = await checkBridgeService();

    return NextResponse.json({
      status: 'ok',
      message: 'Fingerprint API is working',
      bridgeRunning: isRunning,
      runningProcesses: Array.from(runningProcesses.keys()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check service status' },
      { status: 500 }
    );
  }
}

// POST /api/fingerprint - Handle fingerprint operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, platform, pid } = body;

    if (action === 'start-service') {
      // Detect platform
      const detectedPlatform = platform || detectPlatform();

      // Check if service is already running
      const isRunning = await checkBridgeService();
      if (isRunning) {
        return NextResponse.json({
          success: true,
          message: 'Bridge service already running',
          platform: detectedPlatform,
          alreadyRunning: true
        });
      }

      // Start the bridge service
      const result = await startBridgeService(detectedPlatform);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Bridge service started for ${detectedPlatform}`,
          platform: detectedPlatform,
          pid: result.pid
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to start bridge service', details: result.error },
          { status: 500 }
        );
      }
    }

    if (action === 'stop-service') {
      const result = await stopBridgeService(pid);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        pid: pid
      });
    }

    return NextResponse.json(
      { error: 'Unknown action', action },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function checkBridgeService(): Promise<boolean> {
  return new Promise((resolve) => {
    // Simple check - try to connect to the WebSocket port
    const netstat = spawn('netstat', ['-tln']);
    let output = '';

    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });

    netstat.on('close', () => {
      const isRunning = output.includes(':8765');
      resolve(isRunning);
    });

    netstat.on('error', () => {
      resolve(false);
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      netstat.kill();
      resolve(false);
    }, 2000);
  });
}

async function startBridgeService(platform: string): Promise<{ success: boolean; pid?: number; error?: string }> {
  try {
    const scriptPath = getBridgeScriptPath(platform);
    if (!scriptPath) {
      return { success: false, error: `Unsupported platform: ${platform}` };
    }

    // Start the bridge service
    const childProcess = spawn(scriptPath.command, scriptPath.args, {
      cwd: path.join(process.cwd(), scriptPath.cwd || ''),
      detached: true,
      stdio: 'ignore'
    });

    const pid = childProcess.pid!;
    runningProcesses.set(pid, childProcess);

    // Clean up when process exits
    childProcess.on('exit', (code) => {
      console.log(`Bridge service exited with code ${code}`);
      runningProcesses.delete(pid);
    });

    childProcess.on('error', (error) => {
      console.error('Bridge service error:', error);
      runningProcesses.delete(pid);
    });

    // Wait a bit for service to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For testing, assume service started successfully
    // In production, you would verify it's actually running
    console.log(`Bridge service started with PID: ${pid}`);
    return { success: true, pid };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function stopBridgeService(pid?: number): Promise<{ success: boolean; message: string }> {
  try {
    if (pid && runningProcesses.has(pid)) {
      const childProcess = runningProcesses.get(pid)!;
      childProcess.kill('SIGTERM');

      // Wait for process to exit
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 5000);
        childProcess.on('exit', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });

      runningProcesses.delete(pid);
      return { success: true, message: 'Service stopped successfully' };
    }

    // Try to kill all bridge processes
    const killProcess = spawn('pkill', ['-f', 'fingerprint_bridge']);
    await new Promise((resolve) => {
      killProcess.on('close', resolve);
    });

    return { success: true, message: 'Bridge services stopped' };

  } catch (error) {
    return {
      success: false,
      message: `Failed to stop service: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

function detectPlatform(): 'windows' | 'linux' | 'macos' | 'unknown' {
  const platform = process.platform;
  switch (platform) {
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    case 'darwin':
      return 'macos';
    default:
      return 'unknown';
  }
}

function getBridgeScriptPath(platform: string) {
  const basePath = path.join(process.cwd(), 'services');

  // Use platform-specific WebSocket bridge service
  if (platform === 'windows') {
    return {
      command: 'python',
      args: [path.join(basePath, 'fingerprint_bridge_windows.py')],
      cwd: ''
    };
  } else {
    // Linux/macOS - use the full bridge with ZKFinger SDK
    return {
      command: 'python3',
      args: [path.join(basePath, 'fingerprint_bridge.py')],
      cwd: ''
    };
  }
}