import { procedureManager } from './digital-procedure';
import { knowledgeGraph } from './knowledge-graph';
import { auditLedger } from '../security/audit-ledger';

async function runDemo() {
    console.log("==================================================================");
    console.log("🚀 DEMO: NEXUS - OPERATIONAL KNOWLEDGE DIGITAL TWIN");
    console.log("==================================================================\n");

    // 1. Setup the Infrastructure Context
    console.log("📦 1. Inicializando Infraestrutura de Conhecimento...");
    const joao = knowledgeGraph.upsertNode('tech_01', 'Technician', 'Técnico Sénior João', { experience: '15 years' });
    const pedro = knowledgeGraph.upsertNode('tech_02', 'Technician', 'Técnico Júnior Pedro', { experience: '6 months' });
    const asset = knowledgeGraph.upsertNode('asset_v1', 'Asset', 'Válvula Principal (Rede Norte)', { type: 'PVC Piping' });
    const manual = knowledgeGraph.upsertNode('doc_01', 'Manual', 'Manual Operacional ISO-9001', { version: '2023' });
    const incident = knowledgeGraph.upsertNode('inc_01', 'Incident', 'Incidente 2024-04 (Ruptura de Válvula)', { severity: 'HIGH' });

    // 2. The Senior Executes and Captures the Procedure
    console.log("\n👨‍🔧 2. Fase de Captura (Há 6 meses)...");
    console.log(`     O ${joao.label} executa a Substituição da Válvula.`);
    
    const proc = procedureManager.createProcedure('Substituição de Válvula Segura', joao.id, asset.id);
    
    // Simulate kinetic captures
    const mockKinematicsStep1: any[] = []; // In reality, coming from KineticEngine
    procedureManager.addStepToProcedure(proc.id, 'Fechar Fluxo D\'água', 'Rodar 90 graus', mockKinematicsStep1, [4, 8]);
    
    const mockKinematicsStep2: any[] = []; 
    procedureManager.addStepToProcedure(proc.id, 'Desapertar Válvula', 'Desapertar lentamente', mockKinematicsStep2);
    
    // Formalize the Knowledge
    procedureManager.formalizeProcedure(proc.id);
    console.log(`     ✅ Conhecimento Capturado: Procedimento Digital #${proc.id}`);

    // 3. Build the Organizational Memory (Knowledge Graph)
    console.log("\n🧠 3. Construindo a Memória Organizacional (Knowledge Graph)...");
    const procNode = knowledgeGraph.upsertNode(proc.id, 'Procedure', proc.name, { version: proc.version });
    knowledgeGraph.createRelationship(joao.id, proc.id, 'PERFORMED');
    knowledgeGraph.createRelationship(proc.id, asset.id, 'APPLIES_TO');
    knowledgeGraph.createRelationship(proc.id, manual.id, 'DOCUMENTED_BY');
    knowledgeGraph.createRelationship(proc.id, incident.id, 'RELATED_TO');

    const ctx = knowledgeGraph.getProcedureContext(proc.id);
    console.log(`     Grafo criado para o Procedimento '${ctx.procedure.label}':`);
    console.log(`     - Criado por: ${ctx.author?.label}`);
    console.log(`     - Aplica-se a: ${ctx.assets.map(a => a.label).join(', ')}`);
    console.log(`     - Mitiga o Incidente: ${ctx.incidents.map(i => i.label).join(', ')}`);
    console.log(`     - Baseado em: ${ctx.manuals.map(m => m.label).join(', ')}`);

    // 4. The Junior Reuses the Knowledge
    console.log(`\n👨‍🎓 4. Fase de Reutilização (Hoje)...`);
    console.log(`     O ${pedro.label} executa a tarefa assistido pelo NEXUS.`);
    
    // Simulate Junior executing the task and the DTW matching against the Senior's template yielding 97% conformity
    const executionResult = procedureManager.evaluateStepExecution(proc.id, proc.steps[0].id, [], {
        score: 0.97,
        normalizedScore: 97.0, // 97% Conformity
        confidence: 0.99,
        feedback: [],
        kinematicQuality: 0.95
    });

    console.log(`     ✅ Execução concluída.`);
    console.log(`     📊 Conformidade Cinemática: ${executionResult.score}%`);

    // 5. Compliance & Audit (The Corporate Ledger)
    console.log(`\n🔐 5. Fase de Auditoria e Governança...`);
    const kinematicSig = await auditLedger.hashKinematicData({ juniorMotionData: '...' });
    const auditRecord = await auditLedger.appendRecord(
        proc.id,
        pedro.id,
        executionResult.score,
        kinematicSig,
        { lat: 41.15, lng: -8.61 }
    );

    console.log(`     ✅ Trilha Auditável Gerada:`);
    console.log(`        ID Auditoria: ${auditRecord.id}`);
    console.log(`        Hash SHA-256: ${auditRecord.hash}`);
    console.log(`        PreviousHash: ${auditRecord.previousHash}`);

    // Verify Integrity
    const isValid = await auditLedger.verifyChainIntegrity();
    console.log(`\n🛡️ Integridade Total da Ledger: ${isValid ? 'VERIFICADA E IMUTÁVEL' : 'COMPROMETIDA'}`);

    console.log("\n==================================================================");
    console.log("🏆 TESE PROVADA: O NEXUS converteu intuição num ativo digital auditável.");
    console.log("==================================================================");
}

runDemo().catch(console.error);
