import React from "react";
import {
  EmitterSubscription,
  LayoutRectangle,
  Dimensions,
  Keyboard,
  Platform,
  Animated,
  ScrollView
} from "react-native";

import { TodoType } from "app/types/TodoList";

import TodoTitle from "./TodoTitle";
import TodoListHeader from "./TodoListHeader";
import TodoListItems from "./TodoListItems";
import TodoListInput from "./TodoListInput";

interface PropsType {
  layout: LayoutRectangle;
  todos: TodoType[];
  storeTodos: (todos: TodoType[]) => any;
}

interface StateType {
  animHeight: Animated.Value;
  filter: string;
  todos: TodoType[];
}

export default class TodoList extends React.Component<PropsType, StateType> {
  public keyboardWillShowIOS: EmitterSubscription;
  public keyboardWillHideIOS: EmitterSubscription;
  public keyboardShowingIOS = false;

  public todoListScroll: ScrollView;
  public scrollHeight = 0;
  public scrollTop = 0;

  public prevProps = null;
  public state = {
    animHeight: new Animated.Value(this.height),
    filter: "ALL",
    todos: this.props.todos
  };

  public get prevHeight() {
    return this.prevProps.layout.height;
  }

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
    const { filter, todos } = this.state;
    switch (filter) {
      case "ACTIVE":
        return todos.filter(({ complete }) => !complete);
      case "COMPLETE":
        return todos.filter(({ complete }) => complete);
    }
    return todos;
  }

  public componentDidMount() {
    this.handleKeyboardEventsIOS();
  }

  public componentDidUpdate(prevProps, prevState) {
    this.prevProps = prevProps;
    if (prevProps.layout !== this.props.layout) {
      this.handleLayoutUpdate();
    }
    if (prevState.todos !== this.state.todos) {
      this.props.storeTodos(this.state.todos);
    }
  }

  public componentWillUnmount() {
    this.keyboardWillShowIOS && this.keyboardWillShowIOS.remove();
    this.keyboardWillHideIOS && this.keyboardWillHideIOS.remove();
  }

  public render() {
    const { animHeight, filter, todos } = this.state;
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
          ref={node => (this.todoListScroll = node)}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          stickyHeaderIndices={[1]}
          scrollEventThrottle={16}
          onMomentumScrollEnd={this.setScrollTop}
          onScrollEndDrag={this.setScrollTop}
          onScroll={this.setScrollTop}
        >
          <TodoTitle />
          <TodoListHeader
            activeCount={activeCount}
            complete={complete}
            filter={filter}
            setFilter={this.setFilter}
            toggleTodos={this.toggleTodos}
            deleteCompleteTodos={this.deleteCompleteTodos}
          />
          <TodoListItems
            visibleTodos={this.visibleTodos}
            deleteTodo={this.deleteTodo}
            updateTodo={this.updateTodo}
            onLayout={this.handleVisibleTodosUpdate}
          />
        </ScrollView>
        <TodoListInput createTodo={this.createTodo} />
      </Animated.View>
    );
  }

  private scrollTo = (scrollTop: number, animated: boolean) => {
    setTimeout(() => {
      if (this.todoListScroll && this.todoListScroll.scrollTo) {
        this.todoListScroll.scrollTo({ animated, y: scrollTop });
      }
    });
  };

  private scrollToEnd = (animated: boolean) => {
    setTimeout(() => {
      if (this.todoListScroll && this.todoListScroll.scrollToEnd) {
        this.todoListScroll.scrollToEnd({ animated });
      }
    });
  };

  private setScrollTop = event => {
    this.scrollTop = Math.max(0, event.nativeEvent.contentOffset.y);
  };

  private setFilter = (filter: string) => {
    this.setState({ filter });
  };

  private toggleTodos = () => {
    const { todos } = this.state;
    const allTodosComplete = todos.every(({ complete }) => complete);
    this.setState({
      todos: todos.map(todo => ({
        ...todo,
        complete: !allTodosComplete
      }))
    });
  };

  private deleteCompleteTodos = () => {
    const { todos } = this.state;
    this.setState({
      todos: todos.filter(({ complete }) => !complete)
    });
  };

  private createTodo = title => {
    const { todos } = this.state;
    if (title) {
      const id = +new Date();
      this.setState({ todos: [...todos, { id, complete: false, title }] });
      this.scrollToEnd(true);
    }
  };

  private deleteTodo = (todo: TodoType) => {
    const { todos } = this.state;
    this.setState({ todos: todos.filter(t => t.id !== todo.id) });
  };

  private updateTodo = (todo: TodoType, nextTodo) => {
    const { todos } = this.state;
    const todoIndex = todos.findIndex(t => t.id === todo.id);
    if (0 <= todoIndex) {
      this.setState({
        todos: [
          ...todos.slice(0, todoIndex),
          { ...todo, ...nextTodo },
          ...todos.slice(todoIndex + 1)
        ]
      });
    }
  };

  private handleLayoutUpdate = () => {
    switch (Platform.OS) {
      case "android":
        return this.handleLayoutUpdateAndroid();
      default:
        this.setState({ animHeight: new Animated.Value(this.height) });
    }
  };
  private handleLayoutUpdateAndroid = () => {
    let listenerId = null;
    const heightDiff = this.height - this.prevHeight;
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

  private handleVisibleTodosUpdate = event => {
    const layout = event.nativeEvent.layout;
    const prevScrollHeight = this.scrollHeight;
    const scrollHeight = layout.y + layout.height;
    const overscroll =
      scrollHeight - (this.height - this.inputHeight) < this.scrollTop;
    if (scrollHeight < prevScrollHeight && overscroll) {
      this.scrollToEnd(false);
    }
    this.scrollHeight = scrollHeight;
  };

  private handleKeyboardEventsIOS = () => {
    if (Platform.OS === "ios") {
      this.keyboardWillShowIOS = Keyboard.addListener(
        "keyboardWillShow",
        this.handleKeyboardWillShowIOS
      );
      this.keyboardWillHideIOS = Keyboard.addListener(
        "keyboardWillHide",
        this.handleKeyboardWillHideIOS
      );
    }
  };
  private handleKeyboardWillShowIOS = event => {
    if (this.keyboardShowingIOS) return;
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    this.keyboardShowingIOS = true;
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
    if (!this.keyboardShowingIOS) return;
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    Animated.timing(this.state.animHeight, {
      toValue: this.height,
      duration: event.duration - 50
    }).start(() => {
      this.state.animHeight.removeListener(listenerId);
      this.keyboardShowingIOS = false;
    });
    listenerId = this.state.animHeight.addListener(({ value }) => {
      const heightDiff = this.height - value;
      const nextScrollTop = scrollTop + heightDiff - keyboardHeight;
      if (this.height - this.inputHeight < this.scrollHeight - nextScrollTop) {
        this.scrollTo(nextScrollTop, false);
      } else {
        this.scrollToEnd(false);
      }
    });
  };
}
