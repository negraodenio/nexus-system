'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle, ExternalLink, Hash, Globe, Hexagon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { SkillBadge3D } from './skill-badge-3d'

interface CertificateCardProps {
    attestation: {
        skillTitle: string;
        score: number;
        ipfsHash: string;
        transactionHash: string;
        timestamp: number;
        network: string;
    }
}

export function CertificateCard({ attestation }: CertificateCardProps) {
    const dateStr = new Date(attestation.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-4xl bg-[#101822] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl group"
        >
            {/* Holographic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-amber-500/10 pointer-events-none" />
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen" />

            <div className="relative flex flex-col md:flex-row h-full">
                {/* 3D Badge Section */}
                <div className="w-full md:w-[350px] bg-black/40 border-r border-white/5 flex flex-col items-center justify-center p-8">
                    <SkillBadge3D score={attestation.score} title={attestation.skillTitle} />
                    <div className="mt-4 text-center">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-sm uppercase tracking-[0.2em] mb-1">
                            <Hexagon className="w-4 h-4" />
                            Tier: {attestation.score >= 90 ? 'Expert' : 'Certified'}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">Immutable ID: {attestation.ipfsHash.substring(0, 12)}...</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                <Shield className="w-8 h-8 text-blue-400" />
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <QRCodeSVG 
                                    value={`https://nexus.ai/verify/${attestation.transactionHash}`} 
                                    size={64} 
                                    bgColor="transparent" 
                                    fgColor="#ffffff" 
                                />
                            </div>
                        </div>

                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase leading-none">
                            Certificate of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Competence</span>
                        </h1>
                        <p className="text-slate-400 text-lg font-medium mb-12">
                            This is to certify that the user has successfully mastered the kinetic patterns of <span className="text-white underline decoration-blue-500/50 underline-offset-4">{attestation.skillTitle}</span>.
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mastery Level</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black ${attestation.score >= 90 ? 'text-green-400' : 'text-amber-400'}`}>{attestation.score}%</span>
                                    <span className="text-xs text-slate-500 font-mono">Alignment Score</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Authenticated on</h4>
                                <div className="text-xl font-bold text-white leading-tight">{dateStr}</div>
                                <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {attestation.network} (Polygon)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Verification Link */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-[10px] text-white font-bold leading-none">VERIFIED ON LEDGER</p>
                                <p className="text-[9px] text-slate-500 font-mono">Hash: {attestation.transactionHash}</p>
                            </div>
                        </div>
                        
                        <a 
                            href={`https://amoy.polygonscan.com/tx/${attestation.transactionHash}`}
                            target="_blank"
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-xs font-black text-slate-300 hover:text-white uppercase tracking-widest"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Verify Transaction
                        </a>
                    </div>
                </div>
            </div>
            
            {/* Holographic Security Strip */}
            <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent opacity-30 skew-x-12 transform translate-x-12" />
        </motion.div>
    )
}
