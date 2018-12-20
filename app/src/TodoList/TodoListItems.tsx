import React from "react";
import { LayoutChangeEvent, View, Text } from "react-native";

import { TodoType } from "app/types/TodoList";

import TodoListItem from "./TodoListItem";

interface PropsType {
  visibleTodos: TodoType[];
  deleteTodo: (todo: TodoType) => any;
  updateTodo: (todo: TodoType, nextTodo) => any;
  onLayout: (event: LayoutChangeEvent) => any;
}

export default class TodoListItems extends React.Component<PropsType> {
  public render() {
    return (
      <View style={{ flex: 1 }} onLayout={this.props.onLayout}>
        {this.props.visibleTodos.map(this.renderTodoListItem)}
        {!this.props.visibleTodos.length && <NoResult />}
      </View>
    );
  }

  private renderTodoListItem = todo => {
    return (
      <TodoListItem
        key={todo.id}
        todo={todo}
        deleteTodo={this.props.deleteTodo}
        updateTodo={this.props.updateTodo}
      />
    );
  };
}

function NoResult() {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Text
        style={{
          textAlign: "center",
          fontFamily: "NotoSansKR-Thin",
          fontSize: 20,
          color: "#aaa"
        }}
      >
        no result
      </Text>
    </View>
  );
}
