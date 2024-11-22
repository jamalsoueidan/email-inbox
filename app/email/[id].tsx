import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { usePaginatedQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
function cleanTextBody(text: string): string {
  return text.replace(/(\r?\n|\r|\s*\n\s*)+/g, "\n").trim();
}

const Item = ({
  data,
}: {
  data: FunctionReturnType<typeof api.collection.paginate>["page"][0];
}) => {
  const router = useRouter();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%"], []); // Adjust snap point to fill 50% of screen height

  const openBottomSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: data.markedAsRead ? "#f9f9f9" : "#e6f7ff" },
        ]}
        onPress={openBottomSheet}
      >
        <View style={styles.header}>
          <Text style={styles.fromName}>
            {data.fromName || data.from}{" "}
            {data.textBodyRun ? (
              <MaterialIcons name="check-circle" size={16} color="green" />
            ) : null}
          </Text>
          <Text style={styles.date}>
            {new Date(data.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {data.subject}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.bodyPreview} numberOfLines={2}>
            {cleanTextBody(data.textBody) || "No body"}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default function Email() {
  const { id } = useLocalSearchParams();
  const { results, status, loadMore } = usePaginatedQuery(
    api.collection.paginate,
    { id: id as Id<"collections"> },
    { initialNumItems: 15 }
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
          <View style={pageStyles.loader}>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        ) : null
      }
    />
  );
}

const pageStyles = StyleSheet.create({
  loader: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fromName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  date: {
    fontSize: 12,
    color: "#777",
  },
  subject: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bodyPreview: {
    fontSize: 12,
    color: "#777",
    flex: 1,
    marginRight: 10,
  },
  actionSheetContent: {
    padding: 20,
  },
  modalSubject: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  modalBody: {
    fontSize: 14,
    marginBottom: 16,
    color: "#555",
  },
  scrollView: {
    height: 390,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
