import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.conversation.list,
    {},
    { initialNumItems: 50 }
  );

  const handleLoadMore = async () => {
    if (status === "CanLoadMore") {
      await loadMore(15);
    }
  };

  return (
    <FlatList
      data={results}
      renderItem={({ item }) => <Item data={item} />}
      keyExtractor={(item) => item._id}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        status === "LoadingFirstPage" || status === "LoadingMore" ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        ) : null
      }
    />
  );
}

const Item = ({ data }: { data: Doc<"conversations"> }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/conversation/[id]",
          params: { id: data._id, fromName: data.fromName },
        })
      }
    >
      <Image
        source={{ uri: "https://placehold.co/600x400?text=Placeholder" }}
        style={styles.avatar}
      />
      <View style={styles.centerContent}>
        <Text style={styles.fromName}>{data.fromName}</Text>
        <Text style={styles.staticText}>blahblah</Text>
      </View>

      <Text style={styles.date}>12/11/2023</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center items vertically
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20, // Make the image circular
    marginRight: 10,
  },
  centerContent: {
    flex: 1, // Take available space
    justifyContent: "center",
  },
  fromName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  staticText: {
    fontSize: 12,
    color: "#666",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  loader: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
