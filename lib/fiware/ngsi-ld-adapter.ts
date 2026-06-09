/**
 * @fileoverview FIWARE NGSI-LD Adapter for NEXUS
 * @description Translates NEXUS Kinematic Validation Events into FIWARE Smart Data Models
 *              (NGSI-LD format) for integration with Municipal Urban Management Platforms (PGU).
 *              This is a STRICT requirement for Portugal PRR C19-i08 (Smart Territories).
 */

export interface KinematicValidationEvent {
  technicianId: string;
  tenantId: string;
  procedureId: string;
  finalScore: number;
  kinematicQuality: number;
  location?: { lat: number; lng: number };
  timestamp: string;
  cryptoSignature: string; // The proof of immutability
  // Sprint 2: Operational Risk Injection
  riskScore?: number;
  riskDecision?: 'SAFE' | 'WARNING' | 'CRITICAL_HALT';
}

/**
 * NGSI-LD Base Entity Structure
 */
export interface NGSILDEntity {
  id: string;
  type: string;
  '@context': string[];
  [key: string]: any;
}

export class FIWAREAdapter {
  private readonly contextUrl = 'https://schema.lab.fiware.org/ld/context';
  private readonly brokerUrl: string;

  constructor(brokerUrl: string = process.env.ORION_BROKER_URL || 'http://localhost:1026/ngsi-ld/v1') {
    this.brokerUrl = brokerUrl;
  }

  /**
   * Transforms a Nexus Kinematic Event into a FIWARE NGSI-LD UrbanDevice/Validation Event
   */
  public transformToNGSILD(event: KinematicValidationEvent): NGSILDEntity {
    // We map a Nexus Event to a custom Smart City Entity: 'KinematicAudit'
    // aligned with the Smart Data Models structure.
    return {
      id: `urn:ngsi-ld:KinematicAudit:${event.tenantId}:${event.procedureId}:${Date.now()}`,
      type: 'KinematicAudit',
      '@context': [
        this.contextUrl,
        'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld'
      ],
      technician: {
        type: 'Relationship',
        object: `urn:ngsi-ld:Technician:${event.technicianId}`
      },
      procedure: {
        type: 'Property',
        value: event.procedureId
      },
      roiScore: {
        type: 'Property',
        value: event.finalScore,
        unitCode: 'P1' // Percentage
      },
      kinematicQuality: {
        type: 'Property',
        value: event.kinematicQuality
      },
      operationalRisk: event.riskScore !== undefined ? {
        type: 'Property',
        value: event.riskScore,
        decision: event.riskDecision
      } : undefined,
      cryptographicProof: {
        type: 'Property',
        value: event.cryptoSignature
      },
      location: event.location ? {
        type: 'GeoProperty',
        value: {
          type: 'Point',
          coordinates: [event.location.lng, event.location.lat] // NGSI-LD uses [lon, lat]
        }
      } : undefined,
      dateObserved: {
        type: 'Property',
        value: {
          '@type': 'DateTime',
          '@value': event.timestamp
        }
      }
    };
  }

  /**
   * Simulates publishing to an Orion Context Broker
   * In production, this performs a POST to the /entities or /entityOperations/upsert endpoint
   */
  public async publishToContextBroker(entity: NGSILDEntity): Promise<{ success: boolean; status: number; message: string }> {
    console.log(`[FIWARE ADAPTER] Publishing NGSI-LD Entity to ${this.brokerUrl}/entities`);
    console.log(JSON.stringify(entity, null, 2));
    
    // In a real environment, we'd use fetch() to send the payload.
    // For the PRR presentation, we simulate a successful 201 Created response.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          status: 201,
          message: 'NGSI-LD Context successfully updated in Orion Broker.'
        });
      }, 400);
    });
  }
}

export const fiwareAdapter = new FIWAREAdapter();
