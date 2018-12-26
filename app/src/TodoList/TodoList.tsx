import React from "react";
import {
  LayoutRectangle,
  Dimensions,
  Keyboard,
  Platform,
  Animated,
  ScrollView
} from "react-native";

import { TodoType } from "app/types/TodoList";

import { ActionsPropsType } from "./TodoListContainer";
import TodoTitle from "./TodoTitle";
import TodoListHeader from "./TodoListHeader";
import TodoListItems from "./TodoListItems";
import TodoListInput from "./TodoListInput";

interface PropsType extends ActionsPropsType {
  layout: LayoutRectangle;
  todos: TodoType[];
}

interface StateType {
  animHeight: Animated.Value;
  filter: string;
}

export default class TodoList extends React.Component<PropsType, StateType> {
  public keyboardShowing = false;

  public scrollView: ScrollView;
  public scrollHeight = 0;
  public scrollTop = 0;

  public state = {
    animHeight: new Animated.Value(0),
    filter: "ALL"
  };

  public get height() {
    return this.props.layout.height;
  }
  public get offsetTop() {
    return this.props.layout.y;
  }
  public get offsetBottom() {
    return Dimensions.get("window").height - this.offsetTop - this.height;
  }

  public get inputHeight() {
    return 50;
  }

  public get visibleTodos() {
    const { todos } = this.props;
    const { filter } = this.state;
    switch (filter) {
      case "ACTIVE":
        return todos.filter(({ complete }) => !complete);
      case "COMPLETE":
        return todos.filter(({ complete }) => complete);
    }
    return todos;
  }

  public componentDidMount() {
    this.addKeyboardEventListeners();
    this.handleLayoutUpdate(null, this.props.layout);
  }

  public componentDidUpdate(prevProps, prevState) {
    if (prevProps.layout !== this.props.layout) {
      this.handleLayoutUpdate(prevProps.layout, this.props.layout);
    }
  }

  public componentWillUnmount() {
    this.removeKeyboardeEventListeners();
  }

  public render() {
    const { todos } = this.props;
    const { animHeight, filter } = this.state;
    const complete = todos.length && todos.every(({ complete }) => complete);
    const activeCount = todos.filter(({ complete }) => !complete).length;

    return (
      <Animated.View
        style={[
          Platform.OS === "android" && { height: animHeight },
          Platform.OS === "ios" && { flex: 1, maxHeight: animHeight }
        ]}
      >
        <ScrollView
          ref={node => (this.scrollView = node)}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          stickyHeaderIndices={[1]}
          scrollEventThrottle={16}
          onContentSizeChange={this.handleContentSizeChange}
          onMomentumScrollEnd={this.handleScroll}
          onScrollEndDrag={this.handleScroll}
          onScroll={this.handleScroll}
        >
          <TodoTitle />
          <TodoListHeader
            activeCount={activeCount}
            complete={complete}
            filter={filter}
            setFilter={this.setFilter}
            toggleTodos={this.props.toggleTodos}
            deleteCompleteTodos={this.deleteCompleteTodos}
          />
          <TodoListItems
            visibleTodos={this.visibleTodos}
            deleteTodo={this.props.deleteTodo}
            updateTodo={this.props.updateTodo}
          />
        </ScrollView>
        <TodoListInput createTodo={this.createTodo} />
      </Animated.View>
    );
  }

  private deleteCompleteTodos = () => {
    this.props.deleteCompleteTodos();
    this.scrollTo(this.scrollTop, true);
  };

  private createTodo = (title: string) => {
    this.props.createTodo(title);
    this.scrollToEnd(true);
  };

  private setFilter = (filter: string) => {
    this.setState({ filter });
    this.scrollTo(this.scrollTop, true);
  };

  private scrollTo = (scrollTop: number, animated: boolean) => {
    setTimeout(() => {
      if (this.scrollView && this.scrollView.scrollTo) {
        this.scrollView.scrollTo({ animated, y: scrollTop });
      }
    });
  };
  private scrollToEnd = (animated: boolean) => {
    setTimeout(() => {
      if (this.scrollView && this.scrollView.scrollToEnd) {
        this.scrollView.scrollToEnd({ animated });
      }
    });
  };

  private handleScroll = event => {
    this.scrollTop = Math.max(0, event.nativeEvent.contentOffset.y);
  };
  private handleContentSizeChange = (scrollWidth, scrollHeight) => {
    const prevScrollHeight = this.scrollHeight;
    const overscroll =
      scrollHeight - (this.height - this.inputHeight) < this.scrollTop;
    if (scrollHeight < prevScrollHeight && overscroll) {
      this.scrollToEnd(true);
    } else {
      Platform.OS === "ios" && this.scrollTo(this.scrollTop, true);
    }
    this.scrollHeight = scrollHeight;
  };

  private handleLayoutUpdate = (
    prevLayout: LayoutRectangle,
    layout: LayoutRectangle
  ) => {
    switch (Platform.OS) {
      case "android":
        if (prevLayout)
          return this.handleLayoutUpdateAndroid(prevLayout, layout);
      default:
        this.setState({ animHeight: new Animated.Value(layout.height) });
    }
  };
  private handleLayoutUpdateAndroid = (
    prevLayout: LayoutRectangle,
    layout: LayoutRectangle
  ) => {
    let listenerId = null;
    const heightDiff = layout.height - prevLayout.height;
    const nextScrollTop = this.scrollTop - heightDiff;
    Animated.timing(this.state.animHeight, {
      toValue: this.height,
      duration: 125
    }).start(() => {
      this.scrollTo(nextScrollTop, true);
      this.state.animHeight.removeListener(listenerId);
    });
    listenerId = this.state.animHeight.addListener(() => {
      this.scrollTo(nextScrollTop, false);
    });
  };

  private addKeyboardEventListeners = () => {
    if (Platform.OS === "ios") {
      Keyboard.addListener("keyboardWillShow", this.handleKeyboardWillShowIOS);
      Keyboard.addListener("keyboardWillHide", this.handleKeyboardWillHideIOS);
    }
  };
  private removeKeyboardeEventListeners = () => {
    Keyboard.removeAllListeners("keyboardWillShow");
    Keyboard.removeAllListeners("keyboardWillHide");
  };
  private handleKeyboardWillShowIOS = event => {
    if (this.keyboardShowing) return;
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    this.keyboardShowing = true;
    Animated.timing(this.state.animHeight, {
      toValue: this.height - keyboardHeight,
      duration: event.duration
    }).start(() => this.state.animHeight.removeListener(listenerId));
    listenerId = this.state.animHeight.addListener(({ value }) => {
      if (this.height - this.inputHeight < this.scrollHeight) {
        const heightDiff = this.height - value;
        this.scrollTo(scrollTop + heightDiff, false);
      } else {
        this.scrollToEnd(false);
      }
    });
  };
  private handleKeyboardWillHideIOS = event => {
    if (!this.keyboardShowing) return;
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    Animated.timing(this.state.animHeight, {
      toValue: this.height,
      duration: event.duration - 40
    }).start(() => {
      this.state.animHeight.removeListener(listenerId);
      this.keyboardShowing = false;
    });
    listenerId = this.state.animHeight.addListener(({ value }) => {
      const heightDiff = this.height - value;
      const nextScrollTop = scrollTop + heightDiff - keyboardHeight;
      this.scrollTo(Math.max(0, nextScrollTop), false);
    });
  };
}
