/**
 * @fileoverview Knowledge Graph Foundation
 * @description The structural core of the Operational Knowledge Digital Twin.
 *              It maps the relationships between human knowledge, procedures,
 *              and physical assets (e.g., "Technician A executed Procedure B on Asset C").
 */

export type NodeType = 'Technician' | 'Procedure' | 'Asset' | 'Location' | 'Organization' | 'Incident' | 'Manual';
export type EdgeType = 'PERFORMED' | 'APPLIES_TO' | 'DOCUMENTED_BY' | 'RELATED_TO' | 'LOCATED_AT' | 'BELONGS_TO';

export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    properties: Record<string, any>;
}

export interface GraphEdge {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: EdgeType;
    properties: Record<string, any>;
    timestamp: number;
}

export class OperationalKnowledgeGraph {
    private nodes: Map<string, GraphNode> = new Map();
    private edges: Map<string, GraphEdge> = new Map();

    /**
     * Creates or updates a node in the graph
     */
    public upsertNode(id: string, type: NodeType, label: string, properties: Record<string, any> = {}): GraphNode {
        const node: GraphNode = { id, type, label, properties };
        this.nodes.set(id, node);
        return node;
    }

    /**
     * Creates a directed relationship (Edge) between two nodes
     */
    public createRelationship(sourceId: string, targetId: string, type: EdgeType, properties: Record<string, any> = {}): GraphEdge {
        if (!this.nodes.has(sourceId)) throw new Error(`Source node ${sourceId} does not exist in the graph.`);
        if (!this.nodes.has(targetId)) throw new Error(`Target node ${targetId} does not exist in the graph.`);

        const edgeId = `edge_${sourceId}_${type}_${targetId}_${Date.now()}`;
        const edge: GraphEdge = {
            id: edgeId,
            sourceNodeId: sourceId,
            targetNodeId: targetId,
            type,
            properties,
            timestamp: Date.now()
        };

        this.edges.set(edgeId, edge);
        return edge;
    }

    /**
     * Retrieves the entire memory context for a given Procedure
     * Example: Finds all Assets it applies to, the Technician who authored it, 
     * and any related Manuals.
     */
    public getProcedureContext(procedureId: string): { 
        procedure: GraphNode, 
        author?: GraphNode, 
        assets: GraphNode[], 
        manuals: GraphNode[],
        incidents: GraphNode[]
    } {
        const procNode = this.nodes.get(procedureId);
        if (!procNode || procNode.type !== 'Procedure') {
            throw new Error(`Node ${procedureId} is not a valid Procedure in the graph.`);
        }

        const assets: GraphNode[] = [];
        const manuals: GraphNode[] = [];
        const incidents: GraphNode[] = [];
        let author: GraphNode | undefined;

        // Traverse edges connected to this procedure
        for (const edge of this.edges.values()) {
            // Find who performed/authored it
            if (edge.targetNodeId === procedureId && edge.type === 'PERFORMED') {
                author = this.nodes.get(edge.sourceNodeId);
            }
            
            // Find what it applies to
            if (edge.sourceNodeId === procedureId) {
                const targetNode = this.nodes.get(edge.targetNodeId);
                if (!targetNode) continue;

                if (edge.type === 'APPLIES_TO' && targetNode.type === 'Asset') {
                    assets.push(targetNode);
                } else if (edge.type === 'DOCUMENTED_BY' && targetNode.type === 'Manual') {
                    manuals.push(targetNode);
                } else if (edge.type === 'RELATED_TO' && targetNode.type === 'Incident') {
                    incidents.push(targetNode);
                }
            }
        }

        return { procedure: procNode, author, assets, manuals, incidents };
    }

    public getGraphStats(): { totalNodes: number, totalEdges: number } {
        return {
            totalNodes: this.nodes.size,
            totalEdges: this.edges.size
        };
    }
}

// Export singleton instance
export const knowledgeGraph = new OperationalKnowledgeGraph();
