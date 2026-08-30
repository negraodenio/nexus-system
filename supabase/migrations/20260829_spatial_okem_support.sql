-- Migration: SpatialOKEM Support
-- Adds spatial metadata support to OKEMs via the existing metadata JSONB column.
-- No schema changes — spatial data lives inside metadata.spatialMetadata.
--
-- SpatialOKEM stores:
--   metadata.spatialMetadata: { source, hasDepth, hasLiDAR, deviceModel, ... }
--   metadata.spatialSteps: [{ spatialReferenceFrames: [...] }]
--
-- This migration only adds an index for querying spatial OKEMs.
-- All spatial fields are optional — existing OKEMs are unaffected.

-- Index for querying OKEMs by spatial source
CREATE INDEX IF NOT EXISTS idx_okems_spatial_source
    ON okems USING btree ((metadata->'spatialMetadata'->>'source'))
    WHERE metadata->'spatialMetadata' IS NOT NULL;

-- Index for querying OKEMs with depth capability
CREATE INDEX IF NOT EXISTS idx_okems_has_depth
    ON okems USING btree ((metadata->'spatialMetadata'->>'hasDepth'))
    WHERE metadata->'spatialMetadata'->>'hasDepth' = 'true';
