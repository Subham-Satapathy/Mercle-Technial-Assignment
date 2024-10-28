const axios = require('axios');
const fs = require('fs')
let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://api.socket.tech/v2/token-lists/all',
  headers: { 
    'Accept': 'application/json',
    "API-KEY": '72a5b4b0-e727-48be-8aa1-5da9d62fe635'
  }
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
  fs.writeFileSync('./tokens.json', JSON.stringify(response.data))
})
.catch((error) => {
  console.log(error);
});