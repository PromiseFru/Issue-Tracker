/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var MongoClient = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongodb').ObjectID;
require('dotenv').config();

const CONNECTION_STRING = process.env.DB;
var dbConnection = mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('Database connected'))
  .catch((err) => console.log(err))

var issuesSchema = new Schema({
  name: String,
  issue_title: {
    type: String,
    required: [true, 'issue_title required']
  },
  issue_text: {
    type: String,
    required: [true, 'issue_text required']
  },
  created_by: {
    type: String,
    required: [true, 'created_by required']
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
      await dbConnection;

      var project = req.params.project;
      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text;
      var createdBy = req.body.created_by;
      var assignedTo = req.body.assigned_to;
      var statusText = req.body.status_text;
      //var createdOn = req.body.created_on;
      //var updatedOn = req.body.updated_on;
      var open = req.body.open;
      if (issueTitle && issueText && createdBy) {
        Issue.create({
          name: project,
          issue_title: issueTitle,
          issue_text: issueText,
          created_by: createdBy,
          assigned_to: assignedTo,
          status_text: statusText
        }, (err, doc) => {
          if (err) return console.log(err)
          res.json({
            _id: doc._id,
            issue_title: doc.issue_title,
            issue_text: doc.issue_text,
            created_by: doc.created_by,
            assigned_to: doc.assigned_to,
            status_text: doc.status_text,
            created_on: doc.created_on,
            open: doc.open
          })
        })
      } else {
        res.json('Fill all required fields');
      }
    })

    .get(function (req, res) {
      var project = req.params.project;

    })

    .put(function (req, res) {
      var project = req.params.project;
      var issueTitle = req.body.issue_title;
      var issueText = req.body.issue_text;
      var createdBy = req.body.created_by;
      var assignedTo = req.body.assigned_to;
      var statusText = req.body.status_text;
      var id = req.body.id;

      var query = {
        updated_on: Date.now()
      }

      if (issueTitle || issueText || createdBy || assignedTo || statusText) {
        if (issueTitle) {
          query.issue_title = issueTitle;
        }
        if (issueText) {
          query.issue_text = issueText;
        }
        if (createdBy) {
          query.created_by = createdBy;
        }
        if (assignedTo) {
          query.assigned_to = assignedTo;
        }
        if (statusText) {
          query.status_text = statusText;
        }
        // console.log(query);

        Issue.findOne({
          _id: id
        }, (err, doc) => {
          if (!doc) return res.json('Not Found');
          if (err) {
            console.log(err);
            return res.json('could not find');
          } else {
            Issue.updateOne({
              _id: doc._id
            }, query, (err, result) => {
              if (err) {
                return res.json('could not update');
              } else {
                return res.json('successfully updated');
              }
            })
          }
        })
      } else {
        res.json('no updated field sent')
      }
    })

    .delete(function (req, res) {
      var project = req.params.project;

    });

};