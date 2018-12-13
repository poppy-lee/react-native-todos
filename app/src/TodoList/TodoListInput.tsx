import React from "react";
import { View, TextInput } from "react-native";

interface PropsType {
  createTodo: (title: string) => any;
}

interface StatetType {
  title: string;
}

export default class TodoListInput extends React.Component<
  PropsType,
  StatetType
> {
  public state = {
    title: ""
  };

  public render() {
    return (
      <View
        style={{
          height: 50,
          paddingRight: 20,
          paddingLeft: 20,
          borderColor: "#ddd",
          borderTopWidth: 1,
          backgroundColor: "white"
        }}
      >
        <TextInput
          style={{
            flex: 1,
            fontSize: 18,
            color: "#4d4d4d"
          }}
          placeholder="What needs to be done?"
          returnKeyType="done"
          autoCorrect={false}
          blurOnSubmit={false}
          value={this.state.title}
          onChangeText={this.handleTitleInput}
          onSubmitEditing={this.handleTitleSubmit}
        />
      </View>
    );
  }

  private handleTitleInput = title => {
    this.setState({ title });
  };

  private handleTitleSubmit = () => {
    this.setState({ title: "" });
    this.props.createTodo(this.state.title);
  };
}
