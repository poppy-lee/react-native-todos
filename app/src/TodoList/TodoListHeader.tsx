import React from "react";
import { TouchableWithoutFeedback, Keyboard, View, Text } from "react-native";

interface PropsType {
  activeCount: number;
  complete: boolean;
  filter: string;
  setFilter: (filter: string) => any;
  toggleTodos: () => any;
  deleteCompleteTodos: () => any;
}

const filters = [
  { filter: "ALL", label: "All" },
  { filter: "ACTIVE", label: "Active" },
  { filter: "COMPLETE", label: "Complete" }
];

export default class TodoListHeader extends React.Component<PropsType> {
  public render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{
            height: 70,
            paddingBottom: 10,
            borderColor: "#ddd",
            borderBottomWidth: 1,
            backgroundColor: "white"
          }}
        >
          <TodoListStatus
            activeCount={this.props.activeCount}
            deleteCompleteTodos={this.props.deleteCompleteTodos}
          />
          <TodoListFilters
            filters={filters}
            activeFilter={this.props.filter}
            setFilter={this.props.setFilter}
          />
          <ToggleTodosButton
            complete={this.props.complete}
            toggleTodos={this.props.toggleTodos}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

function TodoListStatus({ activeCount, deleteCompleteTodos }) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 5,
        paddingRight: 15,
        paddingLeft: 15
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            lineHeight: 20,
            fontSize: 14,
            fontFamily: "NotoSansKR-Thin",
            color: "#777"
          }}
        >
          {activeCount ? `${activeCount} left` : "Done"}
        </Text>
      </View>
      <View style={{ flex: 1 }} onTouchEnd={deleteCompleteTodos}>
        <Text
          style={{
            textAlign: "right",
            lineHeight: 20,
            fontSize: 14,
            fontFamily: "NotoSansKR-Thin",
            color: "#777"
          }}
        >
          Clear complete
        </Text>
      </View>
    </View>
  );
}

function TodoListFilters({ filters, activeFilter, setFilter }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
      }}
    >
      {filters.map(({ filter, label }) => (
        <TodoListFilter
          key={filter}
          active={filter === activeFilter}
          label={label}
          onTouchEnd={() => setFilter(filter)}
        />
      ))}
    </View>
  );
}
function TodoListFilter({ active, label, onTouchEnd }) {
  return (
    <View
      style={[
        {
          height: 25,
          padding: 7,
          paddingTop: 2.5,
          paddingBottom: 2.5,
          margin: 2.5,
          marginRight: 5,
          marginLeft: 5,
          borderWidth: 1,
          borderRadius: 3,
          borderColor: "transparent"
        },
        active && { borderColor: "rgba(175, 47, 47, 0.2)" }
      ]}
      onTouchEnd={onTouchEnd}
    >
      <Text
        style={{
          bottom: 0,
          textAlign: "center",
          lineHeight: 18,
          fontSize: 12,
          fontFamily: "NotoSansKR-Thin",
          color: "#777"
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ToggleTodosButton({ complete, toggleTodos }) {
  const textStyle = {
    flex: 1,
    lineHeight: 24,
    fontSize: 20,
    color: "#e6e6e6",
    transform: [{ rotate: "90deg" }]
  };
  return (
    <View
      style={{
        position: "absolute",
        width: 54,
        height: 40,
        bottom: 0,
        paddingTop: 10,
        paddingRight: 18,
        paddingLeft: 14
      }}
      onTouchEnd={toggleTodos}
    >
      <Text style={[textStyle, complete && { color: "black" }]}>❯</Text>
    </View>
  );
}
