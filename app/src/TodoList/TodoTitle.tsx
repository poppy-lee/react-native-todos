import React from "react";
import { TouchableWithoutFeedback, Keyboard, View, Text } from "react-native";

export default function TodoTitle() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ height: 140 }}>
        <Text
          style={{
            textAlign: "center",
            lineHeight: 140,
            fontFamily: "NotoSansKR-Thin",
            fontSize: 100,
            color: "rgba(175, 47, 47, 0.15)"
          }}
        >
          todos
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}
