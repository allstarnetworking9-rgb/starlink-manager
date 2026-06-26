function showDashboard() {

  const template = HtmlService.createTemplateFromFile("Index");

  return template
    .evaluate()
    .setTitle("STARLINK MANAGER PRO");

}

function getDashboard(){

const ss=getDB();

const customer=ss.getSheetByName("CUSTOMERS");

const payment=ss.getSheetByName("PAYMENTS");

const total=customer.getLastRow()-1;

const data=customer.getRange(2,10,total,1).getValues();

let active=0;

data.forEach(r=>{

if(r[0]=="Aktif") active++;

});

return{

total:total,

active:active,

income:"Rp0"

};

}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
