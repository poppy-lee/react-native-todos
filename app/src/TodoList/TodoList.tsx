import React from "react";
import {
  EmitterSubscription,
  LayoutRectangle,
  Dimensions,
  Keyboard,
  Platform,
  Animated,
  ScrollView,
  View,
  Text
} from "react-native";

import { TodoType } from "app/types/TodoList";

import TodoTitle from "./TodoTitle";
import TodoListHeader from "./TodoListHeader";
import TodoListItem from "./TodoListItem";
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
  public keyboardWillShow: EmitterSubscription;
  public keyboardWillHide: EmitterSubscription;
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

  public get screenHeight() {
    return Dimensions.get("window").height;
  }
  public get height() {
    return this.props.layout.height;
  }
  public get offsetTop() {
    return this.props.layout.y;
  }
  public get offsetBottom() {
    return this.screenHeight - this.offsetTop - this.height;
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
      this.handleLayoutDidUpdate();
    }
    if (prevState.todos !== this.state.todos) {
      this.props.storeTodos(this.state.todos);
    }
  }

  public componentWillUnmount() {
    this.keyboardWillShow.remove();
    this.keyboardWillHide.remove();
  }

  public render() {
    const { animHeight, filter, todos } = this.state;
    const complete = todos.length && todos.every(({ complete }) => complete);
    const activeCount = todos.filter(({ complete }) => !complete).length;

    const setScrollHeight = (width, height) => {
      this.scrollHeight = height;
    };
    const setScrollTop = event => {
      this.scrollTop = Math.max(0, event.nativeEvent.contentOffset.y);
    };

    return (
      <Animated.View style={{ height: animHeight }}>
        <ScrollView
          ref={node => (this.todoListScroll = node)}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          stickyHeaderIndices={[1]}
          scrollEventThrottle={16}
          onContentSizeChange={setScrollHeight}
          onMomentumScrollEnd={setScrollTop}
          onScrollEndDrag={setScrollTop}
          onScroll={setScrollTop}
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
          <View style={{ flex: 1 }}>
            {this.visibleTodos.map(this.renderTodoListItem)}
            {!this.visibleTodos.length && <NoResult />}
          </View>
        </ScrollView>
        <TodoListInput createTodo={this.createTodo} />
      </Animated.View>
    );
  }

  private renderTodoListItem = todo => {
    return (
      <TodoListItem
        key={todo.id}
        todo={todo}
        deleteTodo={this.deleteTodo}
        updateTodo={this.updateTodo}
      />
    );
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
      setTimeout(this.todoListScroll.scrollToEnd);
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

  private handleLayoutDidUpdate = () => {
    let listenerId = this.handleLayoutDidUpdateAndroid();
    Animated.timing(this.state.animHeight, {
      toValue: this.height,
      duration: 125
    }).start(() => this.state.animHeight.removeListener(listenerId));
  };
  private handleLayoutDidUpdateAndroid = () => {
    let listenerId = null;
    if (Platform.OS === "android") {
      const heightDiff = this.prevHeight - this.height;
      const nextScrollTop = this.scrollTop + heightDiff;
      listenerId = this.state.animHeight.addListener(() => {
        this.todoListScroll.scrollTo({ animated: false, y: nextScrollTop });
      });
    }
    return listenerId;
  };

  private handleKeyboardEventsIOS = () => {
    if (Platform.OS === "ios") {
      this.keyboardWillShow = Keyboard.addListener(
        "keyboardWillShow",
        this.handleKeyboardWillShowIOS
      );
      this.keyboardWillHide = Keyboard.addListener(
        "keyboardWillHide",
        this.handleKeyboardWillHideIOS
      );
    }
  };
  private handleKeyboardWillShowIOS = event => {
    const todoListInputHeight = 50;
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    Animated.timing(this.state.animHeight, {
      toValue: this.height - keyboardHeight,
      duration: event.duration
    }).start(() => this.state.animHeight.removeListener(listenerId));
    listenerId = this.state.animHeight.addListener(({ value }) => {
      if (this.height - todoListInputHeight < this.scrollHeight) {
        this.todoListScroll.scrollTo({
          animated: false,
          y: scrollTop + (this.height - value)
        });
      } else {
        this.todoListScroll.scrollToEnd({ animated: false });
      }
    });
  };
  private handleKeyboardWillHideIOS = event => {
    const keyboardHeight = event.endCoordinates.height - this.offsetBottom;
    const scrollTop = this.scrollTop;
    let listenerId = null;
    Animated.timing(this.state.animHeight, {
      toValue: this.height,
      duration: event.duration - 50
    }).start(() => this.state.animHeight.removeListener(listenerId));
    listenerId = this.state.animHeight.addListener(({ value }) => {
      this.todoListScroll.scrollTo({
        animated: false,
        y: Math.max(0, scrollTop - (keyboardHeight - (this.height - value)))
      });
    });
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
