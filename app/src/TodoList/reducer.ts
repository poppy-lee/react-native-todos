interface ActionType {
  type:
    | "toggleTodos"
    | "deleteCompleteTodos"
    | "createTodo"
    | "deleteTodo"
    | "updateTodo";
}

export const todoListReducer = <StateType>(
  state: StateType,
  action: ActionType
): StateType => {
  switch (action && action.type) {
    case "toggleTodos":
      return toggleTodos(state, action);
    case "deleteCompleteTodos":
      return deleteCompleteTodos(state, action);
    case "createTodo":
      return createTodo(state, action);
    case "deleteTodo":
      return deleteTodo(state, action);
    case "updateTodo":
      return updateTodo(state, action);
  }
  return state;
};

const toggleTodos = (state, action) => {
  const allTodosComplete = state.todos.every(({ complete }) => complete);
  return {
    ...state,
    todos: state.todos.map(todo => ({
      ...todo,
      complete: !allTodosComplete
    }))
  };
};

const deleteCompleteTodos = (state, action) => {
  return {
    ...state,
    todos: state.todos.filter(({ complete }) => !complete)
  };
};

const createTodo = (state, action) => {
  if (!action.title) return state;
  const todo = {
    id: +new Date(),
    complete: false,
    title: action.title
  };
  return {
    ...state,
    todos: [...state.todos, todo]
  };
};

const deleteTodo = (state, action) => {
  return {
    ...state,
    todos: state.todos.filter(t => t.id !== action.todo.id)
  };
};

const updateTodo = (state, action) => {
  const todoIndex = state.todos.findIndex(t => t.id === action.todo.id);
  if (todoIndex === -1) return state;
  return {
    ...state,
    todos: [
      ...state.todos.slice(0, todoIndex),
      action.todo,
      ...state.todos.slice(todoIndex + 1)
    ]
  };
};
