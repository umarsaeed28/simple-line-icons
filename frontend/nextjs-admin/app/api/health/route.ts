import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if all required environment variables are set
    const requiredEnvVars = [
      'DESIGNER_AGENT_URL',
      'DATA_AGENT_URL', 
      'USER_AGENT_URL'
    ]

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    )

    if (missingEnvVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: `Missing environment variables: ${missingEnvVars.join(', ')}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    // Check connectivity to agent services
    const agentChecks = await Promise.allSettled([
      fetch(`${process.env.DESIGNER_AGENT_URL}/health`),
      fetch(`${process.env.DATA_AGENT_URL}/health`),
      fetch(`${process.env.USER_AGENT_URL}/health`)
    ])

    const agentStatuses = {
      designer: agentChecks[0].status === 'fulfilled' && agentChecks[0].value.ok,
      data: agentChecks[1].status === 'fulfilled' && agentChecks[1].value.ok,
      user: agentChecks[2].status === 'fulfilled' && agentChecks[2].value.ok
    }

    const allAgentsHealthy = Object.values(agentStatuses).every(status => status)

    return NextResponse.json({
      status: allAgentsHealthy ? 'healthy' : 'degraded',
      service: 'room-in-a-box-admin',
      timestamp: new Date().toISOString(),
      agents: agentStatuses,
      version: process.env.npm_package_version || '1.0.0'
    })

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}