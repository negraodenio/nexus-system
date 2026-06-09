import { NextResponse } from 'next/server';
import { fiwareAdapter } from '@/lib/fiware/ngsi-ld-adapter';

/**
 * @route POST /api/fiware/notify
 * @description Receives a standard NEXUS Kinematic Event, converts it to NGSI-LD, 
 *              and simulates publishing it to a Municipal Orion Context Broker.
 *              Used to prove PRR Interoperability compliance.
 */
export async function POST(req: Request) {
  try {
    const event = await req.json();

    // 1. Transform internal event to NGSI-LD Smart Data Model
    const ngsiLDPayload = fiwareAdapter.transformToNGSILD(event);

    // 2. Publish to Context Broker (Simulated)
    const result = await fiwareAdapter.publishToContextBroker(ngsiLDPayload);

    return NextResponse.json({
      success: true,
      message: 'Event successfully published to FIWARE Context Broker.',
      ngsiLdPayload: ngsiLDPayload,
      brokerResponse: result
    });

  } catch (error: any) {
    console.error('[FIWARE API Error]', error);
    return NextResponse.json(
      { error: 'Failed to process NGSI-LD event', details: error.message },
      { status: 500 }
    );
  }
}
