import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const EmailHeader = ({ id }: { id: string }) => {
  const collection = useQuery(api.collection.get, {
    id: id as Id<"collections">,
  });

  if (!collection) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{collection.name || "No Name"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
