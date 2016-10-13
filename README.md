Install and start Neo4j.

Run this:

```
LOAD CSV WITH HEADERS FROM "https://raw.githubusercontent.com/fivethirtyeight/data/master/hip-hop-candidate-lyrics/genius_hip_hop_lyrics.csv" AS row
MERGE (c:Candidate {name: row.candidate})
MERGE (a:Artist {name: row.artist})
MERGE (s:Sentiment {type: row.sentiment})
MERGE (t:Theme {type: row.theme})
MERGE (song:Song {name: row.song})
MERGE (line:Line {text: row.line})
SET line.url = row.url
MERGE (line)-[:MENTIONS]->(c)
MERGE (line)-[:HAS_THEME]->(t)
MERGE (line)-[:HAS_SENTIMENT]->(s)
MERGE (song)-[:HAS_LINE]->(line)
MERGE (a)-[r:PERFORMS]->(song)
SET r.data = row.album_release_date
```

```
match (n:Line)
set n.lastWord = split(n.text, ' ')[-1..];
```

```
match (line1:Line), (line2:Line)
where line1 <> line2
CALL apoc.text.phoneticDelta(line1.lastWord, line2.lastWord) yield phonetic1, phonetic2, delta
MERGE (line1)-[r:phonetic]->(line2)
set r.quality = delta
```

```
create index on :Candidate(name)
```
```
create index on :Sentiment(type)
```

Start the server

```
node app.js
```

Go to http://localhost:3001