import * as admin from "firebase-admin"
class pushModule{
   async initializeFirebase(){
    try{
        await admin.initializeApp({
            credential:admin.credential.cert("firebaseConfig.json")
        })
        console.log("firebase-connection successfully established")
    }
    catch(error){
        console.error("found-error",error)
    }
   }
}

export const pushNotification=new pushModule();