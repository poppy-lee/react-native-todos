import React from "react";
import { LayoutRectangle, AsyncStorage } from "react-native";

import { TodoType } from "app/types/TodoList";
import { todoListReducer } from "./reducer";
import TodoList from "./TodoList";

const STORAGE_KEY = "todo-list";

interface PropsType {
  layout: LayoutRectangle;
}

interface StateType {
  todos: TodoType[];
}

export interface ActionsPropsType {
  toggleTodos: () => any;
  deleteCompleteTodos: () => any;
  createTodo: (title: string) => any;
  deleteTodo: (todo: TodoType) => any;
  updateTodo: (todo: TodoType, nextTodo) => any;
}

export default class TodoListContainer extends React.Component<
  PropsType,
  StateType
> {
  public state = todoListReducer({ todos: [] }, null);
  public initialized = false;

  public get ready() {
    return this.initialized;
  }

  public get actions() {
    return {
      toggleTodos: this.toggleTodos,
      deleteCompleteTodos: this.deleteCompleteTodos,
      createTodo: this.createTodo,
      deleteTodo: this.deleteTodo,
      updateTodo: this.updateTodo
    };
  }

  public componentDidMount() {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(JSON.parse)
      .then(nextState => {
        this.initialized = true;
        this.setState({ ...this.state, ...todoListReducer(nextState, null) });
      });
  }

  public componentDidUpdate() {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ todos: this.state.todos })
    );
  }

  public render() {
    return this.ready ? (
      <TodoList {...this.props} {...this.state} {...this.actions} />
    ) : null;
  }

  private dispatch = action => {
    this.setState(todoListReducer(this.state, action));
  };

  private toggleTodos = () => {
    this.dispatch({ type: "toggleTodos" });
  };
  private deleteCompleteTodos = () => {
    this.dispatch({ type: "deleteCompleteTodos" });
  };
  private createTodo = title => {
    this.dispatch({ type: "createTodo", title });
  };
  private deleteTodo = (todo: TodoType) => {
    this.dispatch({ type: "deleteTodo", todo });
  };
  private updateTodo = (todo: TodoType, nextTodo) => {
    this.dispatch({
      type: "updateTodo",
      todo: { ...todo, ...nextTodo }
    });
  };
}
