import React from "react";
import {
  EmitterSubscription,
  LayoutRectangle,
  AsyncStorage,
  Dimensions,
  Keyboard,
  Platform,
  Animated,
  ScrollView
} from "react-native";

import { TodoType } from "app/types/TodoList";

import { todoListReducer } from "./reducer";
import TodoTitle from "./TodoTitle";
import TodoListHeader from "./TodoListHeader";
import TodoListItems from "./TodoListItems";
import TodoListInput from "./TodoListInput";

interface PropsType {
  layout: LayoutRectangle;
}

interface StateType {
  animHeight: Animated.Value;
  filter: string;
  todos: TodoType[];
}

const STORAGE_KEY = "todo-list";

const initialState = {
  animHeight: new Animated.Value(this.height),
  filter: "ALL",
  todos: []
};

export default class TodoList extends React.Component<PropsType, StateType> {
  public keyboardWillShowIOS: EmitterSubscription;
  public keyboardWillHideIOS: EmitterSubscription;
  public keyboardShowingIOS = false;

  public todoListScroll: ScrollView;
  public scrollHeight = 0;
  public scrollTop = 0;

  public loaded = false;
  public prevProps = null;
  public state = todoListReducer<StateType>(initialState, null);

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

  public dispatch = action => {
    this.setState(todoListReducer(this.state, action));
  };

  public componentDidMount() {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(JSON.parse)
      .then(state => {
        this.loaded = true;
        this.setState({
          ...todoListReducer(state, null),
          animHeight: new Animated.Value(this.height)
        });
      });
    this.handleKeyboardEventsIOS();
  }

  public componentDidUpdate(prevProps, prevState) {
    if (prevProps.layout !== this.props.layout) {
      this.handleLayoutUpdate();
    }
    this.prevProps = prevProps;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  public componentWillUnmount() {
    this.keyboardWillShowIOS && this.keyboardWillShowIOS.remove();
    this.keyboardWillHideIOS && this.keyboardWillHideIOS.remove();
  }

  public render() {
    const { animHeight, filter, todos } = this.state;
    const complete = todos.length && todos.every(({ complete }) => complete);
    const activeCount = todos.filter(({ complete }) => !complete).length;

    return this.loaded ? (
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
    ) : null;
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
    this.dispatch({ type: "toggleTodos" });
  };
  private deleteCompleteTodos = () => {
    this.dispatch({ type: "deleteCompleteTodos" });
  };
  private createTodo = title => {
    this.dispatch({ type: "createTodo", title });
    this.scrollToEnd(true);
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
      if (this.height - this.inputHeight < this.scrollHeight) {
        this.scrollTo(nextScrollTop, false);
      } else {
        this.scrollToEnd(false);
      }
    });
  };
}
