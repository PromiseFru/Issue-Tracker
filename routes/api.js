/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var assert = require('chai').assert;
var MongoClient = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;
require('dotenv').config();

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (err) return console.log(err);
  console.log('Database Connected');
})

var issuesSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  assigned_to: String,
  status_text: String,
  created_on: {
    type: Date,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  open: Boolean
})

var Issue = mongoose.model('Issue', issuesSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .post(async function (req, res) {
      var project = req.params.project;
      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text;
      var createdBy = req.body.created_by;
      var assignedTo = req.body.assigned_to;
      var statusText = req.body.status_text;
      //var createdOn = req.body.created_on;
      //var updatedOn = req.body.updated_on;
      var open = req.body.open;

      Issue.create({
        name: project,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText
      }, (err, doc) => {
        if (err) console.log(err);
        res.send({
          issue_title: issueTitle,
          issue_text: issueText,
          created_by: createdBy,
          assigned_to: assignedTo,
          status_text: tatusText
        })
      })
    })

    .get(function (req, res) {
      var project = req.params.project;

    })

    .put(function (req, res) {
      var project = req.params.project;

    })

    .delete(function (req, res) {
      var project = req.params.project;

    });

};