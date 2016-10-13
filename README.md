![Example of the interface](http://i.imgur.com/wa6T4j4.png)

1st place winner at https://github.com/neo4j-meetups/graph-hack-sfo-2016

# Run it yourself

## Prepare the Data

Install [Neo4j](https://neo4j.com/download/), then run the following queries.

Load the data:
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

Get the last word of each line for rhyming.
```
match (n:Line)
set n.lastWord = split(n.text, ' ')[-1..];
```

Create relationships between lines based on their rhyming qualities.
```
match (line1:Line), (line2:Line)
where line1 <> line2
CALL apoc.text.phoneticDelta(line1.lastWord, line2.lastWord) yield phonetic1, phonetic2, delta
MERGE (line1)-[r:phonetic]->(line2)
set r.quality = delta
```

Create a few indexes for performance
```
create index on :Candidate(name);
create index on :Sentiment(type);
```

## Start the server

```
node app.js
```

Go to http://localhost:3001
