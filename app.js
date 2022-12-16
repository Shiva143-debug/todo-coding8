const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
app.post("/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo ( id,todo,priority,status)
  VALUES
    ( ${id}, '${todo}', '${priority}','${status}');
    `;
  const todoList = await db.run(postTodoQuery);
  response.send("todo Added Successfully");
});

const statusArr = ["TO DO", "IN PROGRESS", "DONE"];
const priorityArr = ["HIGH", "MEDIUM", "LOW"];
const hasBothStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasOnlyTodo = (requestQuery) => {
  return requestQuery.todo !== undefined;
};

const hasOnlyStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasOnlyPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const ouPutFormat = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
  };
};

app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  const { search_q = "", status, priority } = requestQuery;
  let sqlQuery;

  switch (true) {
    case hasBothStatusAndPriority(requestQuery):
      if (statusArr.includes(status)) {
        if (priorityArr.includes(priority)) {
          sqlQuery = `
          SELECT * 
          FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND priority = '${priority}';          `;
          const dbResponse = await db.all(sqlQuery);
          const results = dbResponse.map((each) => ouPutFormat(each));
          response.send(results);
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasOnlyStatus(requestQuery):
      if (statusArr.includes(status)) {
        sqlQuery = `
          SELECT * 
          FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status = '${status}';            `;
        const dbResponse = await db.all(sqlQuery);
        const results = dbResponse.map((each) => ouPutFormat(each));
        response.send(results);
        console.log(results);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasOnlyPriority(requestQuery):
      if (priorityArr.includes(priority)) {
        sqlQuery = `
          SELECT * 
          FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}';            `;
        const dbResponse = await db.all(sqlQuery);
        const results = dbResponse.map((each) => ouPutFormat(each));
        response.send(results);
        console.log(results);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    default:
      sqlQuery = `
          SELECT * 
          FROM todo
          WHERE todo LIKE '%${search_q}%';            `;
      const dbResponse = await db.all(sqlQuery);
      const results = dbResponse.map((each) => ouPutFormat(each));
      response.send(results);
      console.log(results);
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    select * from todo where id=${todoId};`;
  const singleTodo = await db.get(getTodoQuery);
  response.send(ouPutFormat(singleTodo));
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
  INSERT INTO
    todo ( id,todo,priority,status)
  VALUES
    ( ${id}, '${todo}', '${priority}','${status}');
    `;
  const todoList = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  const { todo, priority, status } = requestBody;

  let updateTodoQuery;
  switch (true) {
    case hasOnlyStatus(requestBody):
      if (statusArr.includes(status)) {
        updateTodoQuery = `
        update todo set status='${status}'
        where id=${todoId};`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      }
      break;
    case hasOnlyPriority(requestBody):
      if (statusArr.includes(priority));
      updateTodoQuery = `
        update todo set priority='${priority}'
        where id=${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Priority Updated");

      break;
    case hasOnlyTodo(requestBody):
      if (statusArr.includes(todo));
      updateTodoQuery = `
        update todo set todo='${todo}'
        where id=${todoId};`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");

      break;
  }
});
//API 5

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
