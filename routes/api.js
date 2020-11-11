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

var projectSchema = new Schema({
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
  open: {
    type: Boolean,
    default: true
  }
})

var Project = mongoose.model('Project', projectSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .post(async function (req, res) {
      var project = req.params.project;
      var body = req.body;

      console.log(body);

      try {
        await mongoose.connect(CONNECTION_STRING, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }).then(() => {
          if (body.issue_title && body.issue_text && body.created_by) {
            Project.create({
              name: project,
              issue_title: body.issue_title,
              issue_text: body.issue_text,
              created_by: body.created_by,
              assigned_to: body.assigned_to,
              status_text: body.status_text
            }, (err, doc) => {
              if (err) {
                console.log(err);
                res.json('could not create');
              }
              console.log('successfully created');
              res.json(doc);
            })
          } else {
            res.json('Fill all required fields');
          }
        }).catch(err => {
          console.log(err);
          res.json('could not create');
        })
      } catch {
        (err) => console.log(err)
      };
    })

    .get(function (req, res) {
      var project = req.params.project;
      var query = req.query;

      console.log(query);

      Project.findOne({
        name: project
      }, (err, doc) => {
        if (err) {
          console.log(err);
          return res.json('Not found');
        } else {
          if (query) {
            var fetchAll = doc.issues;
            var nestedFilter = (targetArray, filters) => {
              var filterKeys = Object.keys(filters);
              return targetArray.filter(function (eachObj) {
                return filterKeys.every(function (eachKey) {
                  if (!filters[eachKey].length) {
                    return true;
                  }
                  return filters[eachKey].includes(eachObj[eachKey]);
                });
              });
            };

            var filterIssues = nestedFilter(fetchAll, query);

            res.json(filterIssues);
          } else {
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