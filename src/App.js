import React from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import './styles/App.css';
import { pbkdf2Sync } from 'crypto';
import { flureeFetch } from './flureeFetch';
import { signTransaction,  } from 'fluree-cryptography';
import { network, db } from './appConfig';
import AceEditor from 'react-ace';
import 'brace/mode/json';
import 'brace/theme/xcode';

const privKey = "27bbb8ec9dd67a6f973968eee094a402caf9be94f24dad88a34868736c60ae4e";

const wait = ms => new Promise((r, j)=>setTimeout(r, ms))

class App extends React.Component {
  state = {
    username: "hr1",
    password: "password123",
    todo: "Submit expense report",
    error: null, 
    todos: []  
  }

  componentDidMount(){
   this.fetchTodos()
  }

  checkUser = () => {
    // The person who possesses the private key (say 'sysadmin') has the responsibility to ensure 
    // that the _auth record they are signing on behalf (say 'hr1') is really who they say they 
    // are ('hr1' is *really* 'hr1'). The security of a database that uses authority depends on the 
    // strength of this process. 

    return flureeFetch("/query", { "select": ["password", "salt"], "from": ["_user/username", this.state.username] })
    .then(res => {
      if(res.password ===  pbkdf2Sync(this.state.password, res.salt, 100, 16, 'sha512').toString('hex')){
        return true  } else { throw "This password is incorrect." }})
      .catch(err => {
        let error = err.message ? err.message : err;
        this.setState({ error: error})
        throw error
      })
  }

  fetchTodos = () => {
    return flureeFetch("/query", { "select": ["task"], "from": "todo" })
    .then(res => {
      let todos = [];
      res.map(item => todos.push(item["task"]))  
      this.setState({ todos: todos })
    })
    .catch(err => this.setState({ error: JSON.stringify(err)}))
  }

  submitToDo = () => {
    let txid; 

    this.setState({ error: null, res: null})
    this.checkUser()
    .then(res => {
      let tx = [{
        "_id": "todo",
        "id": "#(inc (max-pred-val \"todo/id\"))",
        "task": this.state.todo
      }]

      let signedCommand = signTransaction(this.state.username, `${network}/${db}`, Date.now() + 180000, 10000, 10, 
      privKey, JSON.stringify(tx))

      return flureeFetch("/command", signedCommand)
    })
    .then(res => {
      txid = res
      return;
    })
    .then(res => wait(1000))
    .then(res => flureeFetch("/query", {"select": ["*"], "from": ["_tx/id", txid]}))
    .then(res => this.setState({ res: res}))
    .then(res => this.fetchTodos())
    .catch(err => {
      let error = err.message ? err.message : JSON.stringify(err)
      this.setState({ error: error})
    })

  }

  render(){
  return (
    <div className="App">
      <Row>
        <Col sm={12} className="m20">
          <h2>Fluree Authority Demo</h2>
        </Col>
      </Row>
      <Row>
        <Col sm={6}>
          { this.state.error && <Alert variant="danger">{this.state.error}</Alert> }
          <Form onSubmit={e => e.preventDefault()}>
            <div className="steps">
              <h5>1. A user would log in to an administrative portal. </h5>
            </div>
            <div className="formSec mb20">
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="username" value={this.state.username} placeholder="Enter username"
              onChange={(e) => this.setState({username: e.target.value})}></Form.Control>
              <Form.Text className="text-muted text-left">
                Valid usernames are: hr1, hr2, and h3.
              </Form.Text>
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="The password is: password123" value={this.state.password}
              onChange={(e) => this.setState({password: e.target.value})}></Form.Control>
              <Form.Text className="text-muted text-left">
                Pssst. The password is 'password123'.
              </Form.Text>
            </Form.Group>
            </div>
            <div className="steps">
              <h5>2. If the log in is successful, they can add a new to do. </h5>
            </div>
            <div className="formSec mb20">
              <Form.Group controlId="handle">
                <Form.Label>To Do</Form.Label>
                <Form.Control type="text" placeholder="Enter 'to do'." value={this.state.todo}
                onChange={(e) => this.setState({todo: e.target.value})}></Form.Control>
              </Form.Group>
            </div>
            <Button onClick={this.submitToDo}>Submit!</Button>
          </Form>
        </Col>
        <Col sm={6}>
          <div className="steps">
            <h5>3. The transaction is signed by an authority with a private key, and there is a record of the auth that submitted the transaction. Notice the auth and the authority below are different.</h5>
          </div>
          <div style={{ height: "270px" }}>
            <AceEditor
                mode="json"
                theme="xcode"
                name="command-res"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                width= {"90%"}
                height= {"250px"}
                highlightActiveLine={true}
                value={JSON.stringify(this.state.res, null, 2)}
                editorProps={{ $blockScrolling: true }}
                setOptions={{
                showLineNumbers: true,
                tabSize: 2,
                }}/>
          </div>
          <div style={{ width: "90%" }}>
              <h2>To-Dos</h2>
            { this.state.todos && this.state.todos.map(todo => <Alert variant="info">{todo}</Alert>)}
          </div>
        </Col>
      </Row>
    </div>
  );
}}

export default App;
