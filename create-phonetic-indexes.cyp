match (line1:Line), (line2:Line)
where line1 <> line2
CALL apoc.text.phoneticDelta(line1.lastWord, line2.lastWord) yield phonetic1, phonetic2, delta
MERGE (line1)-[r:phonetic]->(line2)
set r.quality = delta