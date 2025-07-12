-- Verificar constraints existentes
SELECT constraint_name, table_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'proposals';

-- Remover constraint problemática se existir
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_id_fkey;

-- Verificar se existem outras constraints com nomes estranhos
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'proposals' 
AND constraint_type = 'FOREIGN KEY';