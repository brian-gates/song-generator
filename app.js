var express = require('express');
var app = express();
var cypher = require('cypher-stream')('bolt://localhost');
var $ = require('highland');
var R = require('ramda');

cypher = R.compose($, cypher);

var log = console.log.bind(console);

app.use('/public', express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('./index.html', { root: __dirname + '/public/' });
});

app.get('/candidates', (req, res) => {
  cypher(`
    match (candidate:Candidate)
    return candidate
  `)
  .toArray(data => res.json(data));
});

app.get('/lyrics', (req, res) => {
  if(req.query.like) {
    var sentimentClause = `
      match (sentiment:Sentiment { type: "${req.query.like === '1' ? 'positive' : 'negative'}" })
      match (sentiment)<-[:HAS_SENTIMENT]-(line1)
      match (sentiment)<-[:HAS_SENTIMENT]-(line2)
    `;
  }
  if(req.query.candidate) {
    var candidateClause = `
      match (candidate:Candidate { name: "${req.query.candidate}" })
      match (candidate)<-[:MENTIONS]-(line1)
      match (candidate)<-[:MENTIONS]-(line2)
    `;

  }
  var query = `
    match (line1:Line)-[r:phonetic]->(line2:Line)
    ${sentimentClause}
    ${candidateClause}
    where r.quality >= 3
    return
      line1.text as line1,
      line2.text as line2,
      r.quality as quality,
      sentiment,
      candidate
    order by rand()
    limit 4
  `;
  console.log(query);

  cypher(query).toArray(data => res.json(data));
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});
