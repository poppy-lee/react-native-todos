import React from "react";
import {
  LayoutChangeEvent,
  LayoutRectangle,
  SafeAreaView,
  View
} from "react-native";

import TodoList from "./TodoList";

interface StateType {
  layout: LayoutRectangle;
}

export default class TodoApp extends React.Component<any, StateType> {
  public state = {
    layout: null
  };

  public render() {
    const { layout } = this.state;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1 }} onLayout={this.handleLayout}>
          {layout && <TodoList layout={layout} />}
        </View>
      </SafeAreaView>
    );
  }

  private handleLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    this.setState({ layout: { x, y, width, height } });
  };
}
