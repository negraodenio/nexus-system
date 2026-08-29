import { OperationalAuditLedger } from '../security/audit-ledger';

describe('OperationalAuditLedger', () => {
    let ledger: OperationalAuditLedger;

    beforeEach(() => {
        ledger = new OperationalAuditLedger();
    });

    it('should calculate consistent sha256 hashes', async () => {
        const payload = { mockData: 'xyz', val: 123 };
        const hash1 = await ledger.hashKinematicData(payload);
        const hash2 = await ledger.hashKinematicData(payload);
        
        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should successfully append records and link hashes', async () => {
        const kinematicSignature1 = 'sig_1_hash';
        const kinematicSignature2 = 'sig_2_hash';

        const record1 = await ledger.appendRecord(
            'proc_01',
            'operator_01',
            95.5,
            kinematicSignature1,
            { lat: 38.7223, lng: -9.1393 }
        );

        const record2 = await ledger.appendRecord(
            'proc_01',
            'operator_01',
            98.0,
            kinematicSignature2,
            { lat: 38.7223, lng: -9.1393 }
        );

        expect(ledger.getLedger()).toHaveLength(2);
        
        // Verify link chain
        expect(record1.previousHash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
        expect(record2.previousHash).toBe(record1.hash);
        
        // Verify integrity is valid
        const isValid = await ledger.verifyChainIntegrity();
        expect(isValid).toBe(true);
    });

    it('should fail integrity checks if a block is tampered with', async () => {
        await ledger.appendRecord('proc_01', 'operator_01', 95.0, 'sig_1');
        await ledger.appendRecord('proc_01', 'operator_01', 97.0, 'sig_2');
        await ledger.appendRecord('proc_01', 'operator_01', 92.0, 'sig_3');

        // Check original integrity
        expect(await ledger.verifyChainIntegrity()).toBe(true);

        // Tamper with the middle record's score
        const records = ledger.getLedger();
        records[1].score = 10.0; // Changed score from 97.0 to 10.0

        // Verify chain detects tampering
        const isValidAfterTampering = await ledger.verifyChainIntegrity();
        expect(isValidAfterTampering).toBe(false);
    });
});
