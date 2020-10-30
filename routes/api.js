/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var assert = require('chai').assert;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
require('dotenv').config();

const CONNECTION_STRING = process.env.DB; 

var db = new Promise((resolve, reject) => {
  try{
    MongoClient.connect(CONNECTION_STRING, (err, db) => {
      if(err) console.log(err);
      console.log('connected');
      resolve(db);
    });
  }catch(err){
    reject(err);
  }
})

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      
    })
    
    .put(function (req, res){
      var project = req.params.project;
      
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      
    });
    
};
