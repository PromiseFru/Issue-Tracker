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
}).then(() => {
  console.log('Database connected')
}).catch((err) => console.log(err));

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
      try {
        var project = req.params.project;
        var body = req.body;

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

    .get(async function (req, res) {
      try {
        var project = req.params.project;
        var query = req.query;

        await mongoose.connect(CONNECTION_STRING, {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }).then(() => {
          Project.find({}, (err, doc) => {
            if (err) {
              console.log(err);
            } else {
              var result = doc.filter(item => item.name == project);
              if (result.length == 0) return res.json('Project Not Found')

              if (query) {
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

                var filterIssues = nestedFilter(result, query);
                if(filterIssues.length == 0) return res.json('Not found');

                res.json(filterIssues);
              } else {
                res.json(result);
              }
            }
          })
        }).catch(err => {
          console.log(err);
          res.json('could not fetch');
        })
      } catch {
        err => console.log(err)
      }
    })

    .put(async function (req, res) {
      try {
        var project = req.params.project;
        var body = req.body

        var query = {
          updated_on: Date.now()
        }

        if (body.issue_title || body.issue_text || body.created_by || body.assigned_to || body.status_text) {
          if (body.issue_title) {
            query.issue_title = body.issue_title;
          }
          if (body.issue_text) {
            query.issue_text = body.issue_text;
          }
          if (body.created_by) {
            query.created_by = body.created_by;
          }
          if (body.assigned_to) {
            query.assigned_to = body.assigned_to;
          }
          if (body.status_text) {
            query.status_text = body.status_text;
          }
          if (!body.id) {
            return res.json('id error');
          }

          await mongoose.connect(CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }).then(() => {
            Project.findOne({
              _id: body.id
            }, (err, doc) => {
              if (!doc) return res.json('Not Found');
              if (err) {
                console.log(err);
                return res.json('could not find');
              } else {
                if (doc.name != project) return res.json('Not Found');
                Project.updateOne({
                  _id: doc._id
                }, query, (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.json('could not update');
                  } else {
                    return res.json('successfully updated');
                  }
                })
              }
            })
          }).catch(err => {
            console.log(err);
            res.json('could not update');
          })
        } else {
          res.json('no updated field sent')
        }
      } catch {
        (err) => {
          console.log(err);
        }
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