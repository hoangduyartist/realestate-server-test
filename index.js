const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// ctrl
const LocationController = require('./controllers/location'); 

// CORS Policy
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
//   next();
// });

app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 52428800, extended: true }));

app.get('/', function (req, res) {
  // res.send('Hello World!');
  const apisInfo = [
    {
      name: 'Location',
      url: '/rest-api/location/:area',
      area_params: ['province', 'district', 'ward']
    }
  ]
  const data = {
    apis: apisInfo
  }

  res.status(200).json({
    status: 200,
    message: 'Hello World!',
    data
  })
});

app.get('/rest-api/location/:area', LocationController.GetLocations);
app.get('/rest-api/static-location/:area', LocationController.GetStaticStreet);
app.post('/rest-api/static-location/:area', LocationController.AddStaticStreet);

const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log('myapp listening on port ' + port);
});