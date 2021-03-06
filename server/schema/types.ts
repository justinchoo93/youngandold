const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLBoolean,
} = require('graphql');
const model = require('./model');

const TaskType = new GraphQLObjectType({
  name: 'Task',
  description: 'Specifies particular tasks',
  fields: {
    id: {type: GraphQLNonNull(GraphQLInt)},
    seniorid: {type: GraphQLNonNull(GraphQLInt)},
    seniorname: {
      type: GraphQLString,
      resolve: (task: any) => {
        const queryText = 'SELECT name FROM seniors WHERE id=$1';
        return model
          .query(queryText, [task.seniorid])
          .then((data: any) => data.rows[0].name)
          .catch((err: any) => console.log(err));
      },
    },
    helpers: {
      type: GraphQLList(GraphQLString),
      resolve: (task: any) => {
        const queryText = `SELECT name 
        FROM helpertask 
        JOIN helpers
        ON helpertask.helperid = helpers.id
        WHERE taskid=$1`;
        return model
          .query(queryText, [task.id])
          .then((data: any) => data.rows.map(({name}: any) => name))
          .catch((err: any) => console.log(err));
      },
    },
    typeid: {type: GraphQLInt},
    type: {
      type: GraphQLString,
      resolve: (task: any) => {
        const queryText = 'SELECT type FROM tasktypes WHERE id=$1';
        return model
          .query(queryText, [task.typeid])
          .then((data: any) => data.rows[0].type)
          .catch((err: any) => console.log(err));
      },
    },
    description: {type: GraphQLString},
    deadline: {type: GraphQLString},
    completed: {type: GraphQLBoolean},
  },
});

const HelperType = new GraphQLObjectType({
  name: 'Helpers',
  description: 'Specifies particular helpers',
  fields: {
    id: {type: GraphQLNonNull(GraphQLInt)},
    name: {type: GraphQLNonNull(GraphQLString)},
    phone: {type: GraphQLNonNull(GraphQLString)},
    email: {type: GraphQLNonNull(GraphQLString)},
    password: {type: GraphQLNonNull(GraphQLString)},
    zipcode: {type: GraphQLInt},
    tasks: {
      type: GraphQLList(TaskType),
      resolve: (helper: any) => {
        const queryText = `SELECT helpertask.taskid as id, tasks.type as typeid, tasks.description, seniors.id as seniorid, seniors.name as seniorName, deadline, completed FROM helpertask
        JOIN tasks ON helpertask.taskid = tasks.id
        JOIN seniors ON seniors.id= tasks.senior
        WHERE helperid=$1`;
        return model
          .query(queryText, [helper.id])
          .then((data: any) => {
            return data.rows;
          })
          .catch((err: any) => console.log(err));
      },
    },
  },
});

const SeniorType = new GraphQLObjectType({
  name: 'Seniors',
  description: 'Specifies particular seniors',
  fields: {
    id: {type: GraphQLNonNull(GraphQLInt)},
    name: {type: GraphQLNonNull(GraphQLString)},
    phone: {type: GraphQLNonNull(GraphQLString)},
    password: {type: GraphQLNonNull(GraphQLString)},
    email: {type: GraphQLString},
    zipcode: {type: GraphQLInt},
    tasks: {
      type: GraphQLList(TaskType),
      resolve: (senior: any) => {
        const queryText = `SELECT helpertask.taskid as id, tasks.type as typeid, tasks.description, seniors.id as seniorid, seniors.name as seniorName, deadline, completed FROM helpertask
        JOIN tasks ON helpertask.taskid = tasks.id
        JOIN seniors ON seniors.id = tasks.senior
        WHERE seniors.id=$1`;
        return model
          .query(queryText, [senior.id])
          .then((data: any) => {
            return data.rows;
          })
          .catch((err: any) => console.log(err));
      },
    },
  },
});

module.exports = {TaskType, HelperType, SeniorType};
