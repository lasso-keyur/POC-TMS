-- V17: Update Team Mate Voices 2026 survey metadata
-- Pages JSON is managed via the UI now, only update metadata fields
UPDATE SURVEYS SET build_status = 'DRAFT', cycle = '2026 Q1'
WHERE title = 'Team Mate Voices 2026' AND (build_status IS NULL OR cycle IS NULL);
