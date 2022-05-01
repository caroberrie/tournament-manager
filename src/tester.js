const Database = require('./database')
const moment = require('moment')

async function populateDB() {
    const db = await new Database();

    var members = await db.getUsersinTourn("New Tourn");

   // await db.addToListToPlay("New Tourn","user5","user4")
   l = members.length
   console.log(Math.floor(l/2))
   var count =1;
  // console.log(l)
  for(var d=1;d <= members.length-1;d++){
    count = 1;
    console.log("loop 1 star")
    for(var i=0;i <= 2;i++){
      console.log(i);
//update 1 and last of lis=0
        
    



        if(d+i >= members.length-1){
          await db.addToListToPlay("New Tourn",members[d].username,members[count].username);
          count++;
          
        }
        else{
        await db.addToListToPlay("New Tourn",members[d].username,members[d+i+1].username);}
        console.log("case 1")

        if(i == 0 ){
          if(d+i >= members.length-1){
            await db.updatePlayNext("New Tourn",members[d].username,members[count].username )
            
          }else
              await db.updatePlayNext("New Tourn",members[d].username,members[d+i+1].username )
            }
      }
//update 2 and second to last 
//etc etc
//
    }
  }
 //   console.log(members[1].listtoplay[0]);
    

populateDB();