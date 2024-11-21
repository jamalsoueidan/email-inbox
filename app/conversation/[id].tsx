import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Conversation() {
  const { id, fromName } = useLocalSearchParams();
  const messages = useQuery(api.conversation.messages, {
    id: id as Id<"conversations">,
  });
  const [text, onChangeText] = useState("");

  console.log(id, fromName);
  const send = async () => {
    onChangeText("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.shortenEmail}</Text>
          </View>
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />

      <View style={styles.inputContainer}>
        <TextInput
          editable
          multiline
          numberOfLines={2}
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
        />
        <Button title="Send" onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    flex: 1,
  },
  item: {
    display: "flex",
    backgroundColor: "#e6e6e6",
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});
