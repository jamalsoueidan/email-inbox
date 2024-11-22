import { api } from "@/convex/_generated/api";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { usePaginatedQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
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
  data: FunctionReturnType<typeof api.collection.list>["page"][0];
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
          { backgroundColor: data.email.markedAsRead ? "#f9f9f9" : "#e6f7ff" },
        ]}
        onPress={openBottomSheet}
      >
        <View style={styles.header}>
          <Text style={styles.fromName}>
            {data.email.fromName}{" "}
            {data.email.textBodyRun ? (
              <MaterialIcons name="check-circle" size={16} color="green" />
            ) : null}
          </Text>
          <Text style={styles.date}>
            {new Date(data.email.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {data.email.subject}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.bodyPreview} numberOfLines={2}>
            {cleanTextBody(data.email.textBody) || "No body"}
          </Text>
        </View>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.actionSheetContent}>
          <Text style={styles.modalSubject}>{data.email.fromName}</Text>
          <Text style={styles.modalSubject}>{data.email.subject}</Text>
          <BottomSheetScrollView style={styles.scrollView}>
            <Text style={styles.modalBody}>
              {cleanTextBody(data.email.textBody) || "No body"}
            </Text>
          </BottomSheetScrollView>
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={() =>
                router.push({
                  pathname: "/email/[id]",
                  params: { id: data._id, fromName: data.email.from },
                })
              }
            >
              <Text style={styles.buttonText}>Reply</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: "#FFC107" }]}
              onPress={() => console.log("Mark as Read")}
            >
              <Text style={styles.buttonText}>Mark as Read</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default function Inbox() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.collection.list,
    {},
    { initialNumItems: 15 }
  );

  const handleLoadMore = async () => {
    if (status === "CanLoadMore") {
      await loadMore(15);
    }
  };

  return (
    <BottomSheetModalProvider>
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
    </BottomSheetModalProvider>
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
    height: 320,
    marginBottom: 10,
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
