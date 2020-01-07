import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://cookie-jar-c7a3a.firebaseio.com"
});
const db = admin.firestore();

// async function asyncMap(lst: any[], func: Function) {
//   const itemPromises = lst.map(item => func(item));
//   return await Promise.all(itemPromises);
// }

async function getMachine(machineId: string) {
  const machineData = (await db.collection('machines').doc(machineId).get()).data();
  if (!machineData) {
    return null;
  }

  return { ...machineData, inventory: Object.values<any[]>(machineData.inventory).map(slotItems => slotItems.map(slotItem => slotItem.id)) };
}

async function getAction(machineId: string, actionParams: string) {
  return {
    status: 'OK',
    elia: '47'
  }
 

}

async function putAction(machineId: string, actionParams: string) {

}

export const iotAction = functions.https.onRequest(async (request, response) => {
  const machineId = 'o5AkuMpP2Vb2bpQvGx70';
  const actionType = request.query['actionType'];
  const actionParams = request.query['actionParams'];

  const actionMap: {[key: string]: ((machineId: string, params: any) => Promise<any>)} = {
    get: getAction,
    put: putAction
  };

  const func = actionMap[actionType];
  if (!func) {
    response.send(null);
  }
  const resp = await func(machineId, actionParams);
  response.send(resp);
});