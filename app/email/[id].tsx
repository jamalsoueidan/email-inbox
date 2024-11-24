import { RenderHTML } from "@/components/RenderHTML";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePaginatedQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Collapsible from "react-native-collapsible";

import { FlatList } from "react-native-gesture-handler";

const Item = ({
  data,
}: {
  data: FunctionReturnType<typeof api.collection.paginate>["page"][0];
}) => {
  const dimensions = Dimensions.get("window");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [itemHeaderHeight, setItemHeaderHeight] = useState(0);
  const handleItemHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    setItemHeaderHeight(event.nativeEvent.layout.height);
  }, []);

  return (
    <ThemedView style={[styles.emailContainer]}>
      <ThemedView
        style={[styles.emailHeader, isCollapsed && styles.emailHeaderNoBorder]}
        onLayout={handleItemHeaderLayout}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={styles.emailSubject}>{data.subject}</ThemedText>
          <ThemedText style={styles.emailDate}>
            {new Date(data.date).toLocaleDateString()}{" "}
            {new Date(data.date).toLocaleTimeString()}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => setIsCollapsed(!isCollapsed)}
          style={styles.collapseButton}
        >
          <ThemedText style={styles.collapseButtonText}>
            {isCollapsed ? "Show More" : "Show Less"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {data.attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsHeader}>Attachments:</Text>
          {data.attachments.map((attachment, index) => (
            <Text key={index} style={styles.attachmentItem}>
              {attachment.name || `Attachment ${index + 1}`}
            </Text>
          ))}
        </View>
      )}

      <Collapsible collapsed={isCollapsed} style={styles.emailHeaderNoBorder}>
        <ThemedView
          style={{
            height: dimensions.height - itemHeaderHeight - 86,
          }}
        >
          <RenderHTML body={data.htmlBody} />
        </ThemedView>
      </Collapsible>
    </ThemedView>
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
  emailContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 10,
    borderRadius: 8,
  },
  emailHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  emailHeaderNoBorder: {
    borderBottomWidth: 0, // Remove the border when collapsed
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  emailDate: {
    fontSize: 12,
  },
  emailSubject: {
    fontSize: 18,
    fontWeight: "600",
    flexWrap: "wrap", // Allow wrapping
    flex: 1,
  },
  attachmentsContainer: {
    marginTop: 15,
  },
  attachmentsHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  attachmentItem: {
    fontSize: 14,
    color: "#007BFF",
  },
  collapseButton: {
    paddingRight: 10,
  },
  collapseButtonText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
