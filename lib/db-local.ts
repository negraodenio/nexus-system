import Dexie, { Table } from 'dexie';

export interface LocalLandmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export interface PendingSkill {
    id?: number;
    title: string;
    videoBlob: Blob;
    skeletonFrames: LocalLandmark[][];
    createdAt: Date;
    status: 'pending' | 'uploading' | 'failed';
    instructions?: string; // POP/SOP text
}

export class NexusLocalDB extends Dexie {
    pendingSkills!: Table<PendingSkill>;

    constructor() {
        super('NexusLocalDB');
        this.version(1).stores({
            pendingSkills: '++id, status, createdAt' // Primary key and indexes
        });
    }
}

export const db = new NexusLocalDB();
