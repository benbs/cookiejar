import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';
const serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cookie-jar-c7a3a.firebaseio.com"
});
const db = admin.firestore();

// async function asyncMap(lst: any[], func: Function) {
//   const itemPromises = lst.map(item => func(item));
//   return await Promise.all(itemPromises);
// }




async function getAction(machineId: string, actionParams: string) {
  return {
    status: 'OK',
    elia: '47'
  }
}
async function addSnacktoDB(snackCollectionId: string) {
  const defaultImg="https://image.freepik.com/free-vector/kawaii-fast-food-cookie-donut-illustration_24908-60628.jpg";
  const snacksRef = db.collection('snacks').doc(snackCollectionId);
  if (!(await snacksRef.get()).exists) {
    const snackDataOpenFoods = await getDataFromFoodsDB(snackCollectionId);
    let cal = snackDataOpenFoods.calories;
    let name = snackDataOpenFoods.name;
    let img = snackDataOpenFoods.image;
    if (!img) {
      img = 'need_config';
    }
    if (!cal) {
      cal = 'need_config';
    }
    if (!name) {
      name = 'need_config';
    }
    await db.collection("snacks").doc(snackCollectionId).set({
      calories: cal,
      image: img,
      name: name
    })
  }
  return snacksRef;
}

function findFreeHelix(machine: any) {
  const capacity = machine.capacity
  for (const helixIndex in machine.inventory) {
    const helix = machine.inventory[helixIndex];
    if (capacity - helix.length > 0) {
      return helix;
    }
  }
  return null;
}

function putSnackInMachine(helix: any, machineRef: any, machineData: any, snackRef: any) {
  const newHelix = [...helix, snackRef];
  machineRef.update({
    [`inventory.${Object.values(machineData.inventory).indexOf(helix)}`]: newHelix
  });
}

function sendSignalToArduino(machineRef: any, machineData: any, helixNum: number, helixData: any) {
  const cycles = (-1) * (machineData.capacity - helixData.length);

  machineRef.update({
    'properties.desired.$version': admin.firestore.FieldValue.increment(1),
    'properties.desired.actionType': 'put',
    'properties.desired.cycles': cycles,
    'properties.desired.helixIndex': helixNum
  });

}

async function getDataFromFoodsDB(barcode: string) {
  const response = await fetch('https://world.openfoodfacts.org/api/v0/product/' + barcode, {
    headers: {
      'User-Agent': 'CookieJar - Android - Version 1.0'
    }
  });
  const data = await response.json();
  const name = data.product.product_name;
  const image = data.product.selected_images.front.display;// the image is in en/he: "url..." find solution
  const calories = data.product.nutriments.energy;//actually need energy-kcal_serving
  return { name: name, image: image, calories: calories };
}

async function putAction(machineId: string, actionParams: string) {
  /*----------------------DB update----------------------*/
  const barcode = actionParams;
  const machineRef = db.collection('machines').doc(machineId);
  const machineData = (await machineRef.get()).data();
  if (!machineData) {
    return { status: "error", result: "machine data fetching failed" };
  }
  const freeHelix = findFreeHelix(machineData);
  if (!freeHelix) {
    return { status: "error", result: "no free spot in machine" };
  }
  const snackRef = await addSnacktoDB(barcode);
  putSnackInMachine(freeHelix, machineRef, machineData, snackRef);
  /*----------------------DB update----------------------*/

  /*----------------------Arduino update----------------------*/
  const helixNum = Object.values(machineData.inventory).indexOf(freeHelix);
  sendSignalToArduino(machineRef, machineData, helixNum, freeHelix);
  /*----------------------Arduino update----------------------*/

  return { status: "success", result: "snack " + barcode + " added to " + helixNum };
}

function setJobOnProgress(machineRef: any) {
  machineRef.update({
    'onProccess': 'true'
  });
}
function isJobInProgress(machineData: any) {
  if (machineData.onProccess == 'false') {
    return false;
  }
  return true;
}

export const iotAction = functions.https.onRequest(async (request, response) => {
  const machineId = 'o5AkuMpP2Vb2bpQvGx70';
  const actionType = request.query['actionType'];
  const actionParams = request.query['actionParams'];
  const machineRef = db.collection('machines').doc(machineId);
  const machineData = (await machineRef.get()).data();
  if (isJobInProgress(machineData)) {
    response.send({ status: "error", result: "can't finish job, another job is currently in progress" });
  } else {
    const actionMap: { [key: string]: ((machineId: string, params: any) => Promise<any>) } = {
      get: getAction,
      put: putAction
    };

    const func = actionMap[actionType];
    if (!func) {
      response.send(null);
    }
    //  switch finished job flag to false
    setJobOnProgress(machineRef);
    //till here Elia's updates
    const resp = await func(machineId, actionParams);
    response.send(resp);
  }
});


function finishJob(machineRef: any) {
  machineRef.update({
    'onProccess': 'true'
  });
}

export const iotFinishJob = functions.https.onRequest(async (request, response) => {
  const machineId = 'o5AkuMpP2Vb2bpQvGx70';
  const machineRef = db.collection('machines').doc(machineId);
  finishJob(machineRef);
  response.send("finish job message sent from jar");
});