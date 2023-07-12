const express = require("express");
const router = express.Router();
var mssql = require('../../function/mssql');
var mongodb = require('../../function/mongodb');
var httpreq = require('../../function/axios');
var axios = require('axios');


let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';

let master_FN = 'master_FN';
let ITEMs = 'ITEMs';



router.post('/TOBEREPOR/GETDATASOI12', async (req, res) => {
  //-------------------------------------
  console.log(req.body);
  //-------------------------------------
  let input = req.body;
  let output = {};
  let itemlist = [];
  let inslist = [];
  let itemobject = {};
  // let dataobject = {};
  let dataolist = [];
  let RESULTFORMATitem = {};


  if (input['MATCP'] != undefined && input['STARTyear'] != undefined && input['STARTmonth'] != undefined && input['STARTday'] != undefined && input['ENDyear'] != undefined && input['ENDmonth'] != undefined && input['ENDday'] != undefined ) {

    let d = new Date();
    d.setFullYear(input['STARTyear'], input['STARTmonth'] , input['STARTday'] );

    let dc = new Date();
    dc.setFullYear(input['ENDyear'] ,  input['ENDmonth'], input['ENDday']);

    let date = {
      "$gte": d,
      "$lt": dc
    }

    let findITEMs = await mongodb.find(master_FN, ITEMs, {});
    let findMATCP = await mongodb.find(MAIN_DATA, MAIN, { "MATCP": input['MATCP'], "ALL_DONE": "DONE", "dateG": date });
    let findPATTERN = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['MATCP'] });




    if (findPATTERN.length > 0) {
      let data = findPATTERN[0]['FINAL'];
      for (let i = 0; i < data.length; i++) {
        itemlist.push(data[i]['ITEMs']);
      }


      for (let i = 0; i < itemlist.length; i++) {
        for (let j = 0; j < findITEMs.length; j++) {
          if (itemlist[i] === findITEMs[j]['masterID']) {
            itemobject[itemlist[i]] = findITEMs[j]['ITEMs'];
            RESULTFORMATitem[itemlist[i]] = findITEMs[j]['RESULTFORMAT'];
            //RESULTFORMATitem
            break;
          }

        }


      }

      

      if (findMATCP.length > 0) {

        inslist = Object.keys(findMATCP[0]['FINAL']);

        for (let M = 0; M < findMATCP.length; M++) {

          let dataobject = {};
          let datamaster = findMATCP[M];
          for (let i = 0; i < inslist.length; i++) {

            for (let j = 0; j < itemlist.length; j++) {

              if (datamaster['FINAL'][inslist[i]] != undefined) {


                if (datamaster['FINAL'][inslist[i]][itemlist[j]] != undefined) {
                  if(RESULTFORMATitem[itemlist[j]] !== 'Text' && RESULTFORMATitem[itemlist[j]] !== 'OCR' && RESULTFORMATitem[itemlist[j]] !== 'Picture'){

                    //----------------------------------------------------------------------------------------

                    if(RESULTFORMATitem[itemlist[j]] === 'Number' ){

                      dataobject['PO'] = datamaster['PO'];
                      dataobject["itemlist"]=itemlist,
           
                      subpicdata = Object.keys(datamaster['FINAL'][inslist[i]][itemlist[j]])
                      let datasetraw = [];
                      if(subpicdata.length>0){
                
                        for (let k = 0; k < subpicdata.length; k++) {
                          let datainside = datamaster['FINAL'][inslist[i]][itemlist[j]][subpicdata[k]];
                          let datasetrawin = [];
                          for (let v = 0; v < datainside.length; v++) {
                            datasetrawin.push(datainside[v]['PO3']);
                            // console.log(datainside)
                            
                          }
                          datasetraw.push(datasetrawin);
                        }
                      }

                      dataobject[itemlist[j]] = {
                        "name": itemobject[itemlist[j]],
                        "itemcode": itemlist[j],
                        'RESULTFORMAT' : RESULTFORMATitem[itemlist[j]],
                        // "data": datamaster['FINAL'][inslist[i]][itemlist[j]],
                        "data":datasetraw,
                        "data_ans":datamaster['FINAL_ANS'][itemlist[j]],
                      }

                    }else if(RESULTFORMATitem[itemlist[j]] === 'Graph' ){

                      dataobject['PO'] = datamaster['PO'];
                      dataobject["itemlist"]=itemlist,

                      subpicdata = Object.keys(datamaster['FINAL'][inslist[i]][itemlist[j]])
                      let datasetraw = [];
                      if(subpicdata.length>0){
                
                        for (let k = 0; k < subpicdata.length; k++) {
                          let datainside = datamaster['FINAL'][inslist[i]][itemlist[j]][subpicdata[k]];
                          let datasetrawin = [];
                          for (let v = 0; v < datainside.length; v++) {
                            datasetrawin.push(datainside[v]['PO3']);
                            // console.log(datainside)
                            
                          }
                          datasetraw.push(datasetrawin);
                        }
                      }

                      dataobject[itemlist[j]] = {
                        "name": itemobject[itemlist[j]],
                        "itemcode": itemlist[j],
                        'RESULTFORMAT' : RESULTFORMATitem[itemlist[j]],
                        "data":datasetraw,
                        "data_ans": datamaster['FINAL_ANS'][itemlist[j]+'_point'],
        
                      }

                    }

                   

                    //----------------------------------------------------------------------------------------
                  }
                 


                }
              }


            }

          }
          dataolist.push(dataobject)
        }
      }

    }




    console.log(findMATCP.length);
  }

  output = dataolist


  //-------------------------------------
  res.json(output);
});



module.exports = router;
