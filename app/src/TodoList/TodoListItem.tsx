import React from "react";
import { View, Text } from "react-native";
import SvgImage from "react-native-svg-uri";

import { TodoType } from "app/types/TodoList";

interface PropsType {
  todo: TodoType;
  deleteTodo: (todo: TodoType) => any;
  updateTodo: (todo: TodoType, nextTodo) => any;
}

export default class TodoListItem extends React.Component<PropsType> {
  public render() {
    const { title, complete } = this.props.todo;
    return (
      <TodoListItemWrapper>
        <ToggleButton complete={complete} toggleTodo={this.toggleTodo} />
        <TodoListItemTitle complete={complete}>{title}</TodoListItemTitle>
        <DeletButton deleteTodo={this.deleteTodo} />
      </TodoListItemWrapper>
    );
  }

  private toggleTodo = () => {
    const { todo, updateTodo } = this.props;
    updateTodo(todo, { complete: !todo.complete });
  };

  private deleteTodo = () => {
    const { todo, deleteTodo } = this.props;
    deleteTodo(todo);
  };
}

function TodoListItemWrapper(props) {
  return (
    <View
      style={{
        minHeight: 60,
        flexDirection: "row",
        borderBottomColor: "#ededed",
        borderBottomWidth: 1
      }}
    >
      {props.children}
    </View>
  );
}

function TodoListItemTitle(props) {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Text
        style={[
          {
            paddingTop: 15,
            paddingBottom: 15,
            lineHeight: 30,
            fontFamily: "NotoSansKR-Thin",
            fontSize: 22
          },
          props.complete && {
            color: "#c8c8c8",
            textDecorationLine: "line-through"
          }
        ]}
      >
        {props.children}
      </Text>
    </View>
  );
}

function ToggleButton({ complete, toggleTodo }) {
  return (
    <View
      style={{ justifyContent: "center", width: 54, paddingLeft: 4 }}
      onTouchEnd={toggleTodo}
    >
      <SvgImage
        width="40"
        height="40"
        svgXmlData={
          complete
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#bddad5" stroke-width="3"/><path fill="#5dc2af" d="M72 25L42 71 27 56l-4 4 20 20 34-52z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-10 -18 100 135"><circle cx="50" cy="50" r="50" fill="none" stroke="#ededed" stroke-width="3"/></svg>'
        }
      />
    </View>
  );
}

function DeletButton({ deleteTodo }) {
  return (
    <View
      style={{ justifyContent: "center", width: 54, right: 0, padding: 10 }}
      onTouchEnd={deleteTodo}
    >
      <Text
        style={{
          textAlign: "center",
          lineHeight: 30,
          fontFamily: "NotoSansKR-Thin",
          fontSize: 24,
          color: "#cc9a9a"
        }}
      >
        ×
      </Text>
    </View>
  );
}
