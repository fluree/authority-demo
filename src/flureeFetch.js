import fetch from 'isomorphic-fetch';
import { ip, network, db } from './appConfig';

function parseJSON(response) {
  return response.json().then(function (json) {
    const newResponse = Object.assign(response, { json });
    if (response.status < 300) {
      return newResponse;
    } else {
      throw newResponse;
    }
  });
}

function fetchResp(fullUri, fetchOpts){
  return fetch(fullUri, fetchOpts)
  .then(parseJSON)
  .then(resp =>  resp.json)
  .catch(error => {
    let errorMessage = error.json.message
    throw new Error(errorMessage)
  })
}


var flureeFetch = (endpoint, body, opts) => {
  const fullUri = `${ip}/fdb/${network}/${db}${endpoint}`

  var fetchOpts = opts || {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };

  return new Promise((resolve, reject) => {
      fetchResp(fullUri, fetchOpts)
      .then(res => resolve(res))
      .catch(err => reject(err))
  });
}


export { flureeFetch };
