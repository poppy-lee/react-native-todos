import React from "react";
import { FlatList, View, Text } from "react-native";

import { TodoType } from "app/types/TodoList";

import TodoListItem from "./TodoListItem";

interface PropsType {
  visibleTodos: TodoType[];
  deleteTodo: (todo: TodoType) => any;
  updateTodo: (todo: TodoType, nextTodo) => any;
}

export default class TodoListItems extends React.Component<PropsType> {
  public render() {
    return (
      <FlatList
        data={this.props.visibleTodos}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={({ id }) => `${id}`}
        renderItem={this.renderTodoListItem}
        ListEmptyComponent={NoResult}
      />
    );
  }

  private renderTodoListItem = ({ item: todo }) => {
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
