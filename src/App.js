import React, { Component } from 'react';
import './App.css';

import * as Parse from 'parse';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      todo: null,
      todosList: []
    }

    Parse.serverURL = "https://todotutorial.back4app.io";
    Parse.initialize('j3dBLz81KYQPLUKsmuP0ahny8d1vsPjLpw0fUtxR', 'kIBgtNiI0637TDIwxlReLrq5yHSTyw95hJmvCGnz');

    this.createSubscription();
  }

  componentDidMount() {
    //this.getNewTodoList();
  }

  componentDidUpdate() {

  }

  createSubscription = async () => {
    this.query = new Parse.Query('message');

    try {
      let subscription = await this.query.subscribe();
      let result = await this.query.ascending('createdAt').limit(25).find();
      this.messages = new Set(result);



      // this event is triggered if successfully connected
      subscription.on('open', () => {
        this.getNewTodoList();
        console.log('subscription opened :D');
      });

      subscription.on('create', object => {
        this.messages.add(object);
        this.getNewTodoList();
        console.log('Object created :D');
      });

      subscription.on('delete', object => {
        this.messages.forEach(message => {
          if (message.id === object.id)
            this.messages.delete(message);
        });
        this.getNewTodoList();
        console.log('Object destroyed D:');
      });

      subscription.on('update', object => {
        this.getNewTodoList();
        console.log('Object updated :D');
      });

    } catch (err) {
      console.log(err);
    }
  }

  onChangeHandler = event => {

    if (event.target.value.trim() !== '')
      this.setState({
        todo: event.target.value
      });
  }

  onClickHandler = () => {
    if (this.state.todo) {
      let Message = Parse.Object.extend('message');
      const message = new Message();

      message.set('name', this.state.todo);
      message.set('completed', false);
      message.save();

      const input = document.querySelector('input');
      input.value = '';
    }
  }

  getNewTodoList = () => {
    this.setState({
      todosList: [...this.messages]
    });
  }

  updateTodo = event => {
    this.state.todosList.forEach(e => {
      if (e.id === event.target.id) {
        e.set('completed', event.target.checked);
        e.save();
      }
    });
    console.log('update?');
  }

  deleteChecked = () => {
    this.state.todosList.forEach(e => {
      if (e.get('completed')) {
        e.destroy();
      }
    });
  }

  deleteAll = () => {
    this.state.todosList.forEach(e => {
      e.destroy();
    });
  }

  displayTodosList = () => {
    console.log('getting here?');

    

    return this.state.todosList.map(message => {
      console.log(message.get('completed'));

      return (
        <li key={message.id}>
          <label htmlFor={message.id}>{message.get('name')}</label>
          <input
            type="checkbox"
            name={message.get('name')}
            id={message.id}
            onChange={this.updateTodo}
            
            checked={message.get('completed')} />
        </li>
      );
    });

  }

  render() {
    const todosList = this.displayTodosList();

    return (
      <div className="App">
        <input type="text" onChange={this.onChangeHandler} />
        <button onClick={this.onClickHandler}>ADD</button>

        <ol>
          {todosList}
        </ol>

        <button onClick={this.deleteAll}>DELETE ALL</button>
        <button onClick={this.deleteChecked}>DELETE COMPLETED</button>

        {/*Make this looks more close like the example*/}
      </div>
    );
  }
}

export default App;