const express = require('express');
var mysql = require('mysql');
const cors = require("cors");
const jwt = require("jsonwebtoken");



const app = express();
const PORT = process.env.PORT || 4061;

app.use(express.json());
app.use(cors());
// Enable pre-flight
app.options("*", cors());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root123',
  port: 3305 ,
  database:'epimax_db',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL nodejs_rest_api database');
});

app.listen(PORT, () => {
  console.log(`Server is running on `);
});



const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  }
};


// Creating API Endpoints



//get 

// Get all users
app.get('/tasks', (request, response) => {
  db.query('SELECT * FROM tasks', (err, results) => {
    if (err) throw err;
    response.json(results);
  });
});

// Get a task by ID
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  await db.query('SELECT * FROM tasks WHERE id = ?',[id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Create a new user
app.post('/tasks', (req, res) => {
  const { id, title,description,status,assignee_id,created_at,updated_at } = req.body;
  db.query('INSERT INTO tasks ( title,description,status,assignee_id,created_at,updated_at) VALUES (?,?,?,?,?,?)', [title,description,status,assignee_id,created_at,updated_at], (err, result) => {
    if (err) throw err;
    res.json({ message: 'User added successfully', id: result.insertId });
  });
});

// Update a user
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description} = req.body;
  db.query('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, id], (err) => {
    if (err) throw err;
    res.json({ message: 'User updated successfully' });
  });
});



// Delete a user
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tasks WHERE id = ?',[id], (err,result) => {
    if (err) throw err;
    res.json({ message: 'Task deleted successfully' });
  });
});

//login 

app.post("/login", async (request, response) => {
  const { username, hashed_password} = request.body;
  console.log(username,hashed_password);
  db.query('SELECT * FROM users WHERE username = ?',[username],(err,result) =>{
    
    if(result.length == 0) {

      response.json({ message: 'User Not found' });
      console.log("user not found");

      
    }else{
      if ( result[0].password_hash==hashed_password){
      
       
        console.log("User name and password are correct")
           
           const jwtToken = jwt.sign("sai", "MY_SECRET_TOKEN");
           response.json({ message: 'User and Password are found', 
                         Token:{jwtToken},
          });
  
      }else{
        response.json({ message: 'Invalid password'});
        console.log(" Password is NoT correct");
      }

    }
  if(err) throw err; 

  })
});
  
//register 

app.post('/register', (req, res) => {
  const{username, password_hash}= req.body;
  db.query('SELECT * FROM users WHERE username = ?',[username],(err,result) =>{
    
    if(result.length == 0) {

      db.query('INSERT INTO users ( username,password_hash) VALUES (?,?)', [username,password_hash], (err, result) => {
        res.json({message : 'new user is added'})
      })
      
    }
 
  });
});



    
