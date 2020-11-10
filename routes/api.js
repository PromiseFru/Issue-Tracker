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
mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log('Database connected'))
  .catch((err) => console.log(err))

var projectSchema = new Schema({
  name: String,
  issues: [{
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
    open: {
      type: Boolean,
      default: true
    }
  }]
})

var Project = mongoose.model('Project', projectSchema);

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

      var newIssue = {
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText
      }

      if (issueTitle && issueText && createdBy) {
        Project.findOne({
          name: project
        }, (err, doc) => {
          if (err) return console.log(err);
          if (!doc) {
            Project.create({
              name: project,
              issues: newIssue
            }, (err, doc) => {
              if (err) return console.log(err);

              var fetchIssues = []

              doc.issues.forEach(ele => {
                fetchIssues.push(ele)
              })
              res.json(
                fetchIssues[fetchIssues.length - 1]
              )

            })
          } else {
            Project.updateOne({
              name: project
            }, {
              $push: {
                issues: newIssue
              }
            }, (err, doc) => {
              if (err) return console.log(err);

              Project.findOne({
                name: project
              }, (err, doc) => {
                if (err) return console.log(err);
                var fetchIssues = []

                doc.issues.forEach(ele => {
                  fetchIssues.push(ele)
                })
                res.json(
                  fetchIssues[fetchIssues.length - 1]
                )
              })
            })
          }
        })
      } else {
        res.json('Fill all required fields');
      }
    })

    .get(function (req, res) {
      var project = req.params.project;
      var query = req.query;

      console.log(query);

      Project.findOne({
        name: project
      }, (err, doc) => {
        if(err) {
          console.log(err);
          return res.json('Not found');
        }else {
          if(query){
            var fetchAll = doc.issues;
            // var fields = ['issue_title', 'issue_text', 'created_on', 'updated_on', 'created_by', 'assigned_to', 'open', 'status_text', '_id'];
            var filterIssues = fetchAll.filter((obj) => {
              if(obj['open'] == query['open']){
                return true;
              }
            });

            res.json(filterIssues);
          }else{
            res.json(doc.issues);
          }
        }
      })
    })

    .put(async function (req, res) {
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

        Project.findOne({
          name: project
        }, (err, doc) => {
          if (!doc) return res.json('Not Found');
          if (err) {
            console.log(err);
            return res.json('could not find');
          } else {
            var fetchAll = doc.issues;
            var pos = fetchAll.map(item => item._id).indexOf(id)
            var removed = fetchAll.splice(pos, 1);
            var fetchedId = removed[0]._id;
            var fetchedCreatedOn = removed[0].created_on;
            var updated = {
              _id: fetchedId,
              created_on: fetchedCreatedOn,
              ...query
            }
            fetchAll.splice(pos, 0, updated);

            Project.updateOne({
              name: project
            }, {
              issues: fetchAll
            }, (err, result) => {
              if (err) {
                console.log(err);
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
      var id = req.body.id;

      if (id) {
        Project.findOne({
          name: project
        }, (err, doc) => {
          if (!doc) return res.json('Not Found');
          if (err) {
            console.log(err);
            return res.json('could not find');
          } else {
            var fetchAll = doc.issues;
            var pos = fetchAll.map(item => item._id).indexOf(id)
            var removed = fetchAll.splice(pos, 1);
            var fetchedId = removed[0]._id;

            Project.updateOne({
              name: project
            }, {
              issues: fetchAll
            }, (err, result) => {
              if (err) {
                console.log(err);
                return res.json('could not delete ' + fetchedId);
              } else {
                return res.json('deleted ' + fetchedId);
              }
            })
          }
        })
      } else {
        res.json('id error');
      }
    });

};