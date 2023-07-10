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


  if (input['MATCP'] != undefined) {

    let d = new Date();
    d.setFullYear(2023, 3, 1);

    let dc = new Date();
    dc.setFullYear(2023, 6, 1);

    let date = {
      "$gte": d,
      "$lt": dc
    }

    let findITEMs = await mongodb.find(master_FN, ITEMs, {});
    let findMATCP = await mongodb.find(MAIN_DATA, MAIN, { "MATCP": input['MATCP'], "dateG": date });
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
                  dataobject['PO'] = datamaster['PO'];
                  dataobject["itemlist"]=itemlist,
                  dataobject[itemlist[j]] = {
                    "name": itemobject[itemlist[j]],
                    "itemcode": itemlist[j],
                    "itemlist":itemlist,
                    "data": datamaster['FINAL'][inslist[i]][itemlist[j]]
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
