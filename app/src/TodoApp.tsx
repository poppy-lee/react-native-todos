import React from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  AsyncStorage,
  SafeAreaView,
  View
} from "react-native";

import { TodoType } from "app/types/TodoList";
import TodoList from "./TodoList";

const TODOS_KEY = "todo-app/todos";

interface StateType {
  layout: LayoutRectangle;
  todos: TodoType[];
}

export default class TodoApp extends React.Component<any, StateType> {
  public state = {
    layout: null,
    todos: null
  };

  public componentDidMount() {
    this.retrieveTodos();
  }

  public render() {
    const { layout, todos } = this.state;
    const ready = layout && todos;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1 }} onLayout={this.handleOnLayout}>
          {ready && (
            <TodoList
              layout={layout}
              todos={todos}
              storeTodos={this.storeTodos}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  private retrieveTodos = async () => {
    const todos = await AsyncStorage.getItem(TODOS_KEY);
    this.setState({ todos: JSON.parse(todos) || [] });
  };

  private storeTodos = async todos => {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  };

  private handleOnLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    this.setState({ layout: { x, y, width, height } });
  };
}
