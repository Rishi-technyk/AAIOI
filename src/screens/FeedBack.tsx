import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import ShimmerPlaceholder from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import { javascriptGet, javascriptPost } from "../util/api";
import { FONT_FAMILY } from "../util/colors";

/* ================= TYPES ================= */

interface FeedbackCategory {
  id: number;
  name: string;
}

interface FeedbackType {
  id: number;
  name: string;
  categories: FeedbackCategory[];
}

interface RootState {
  auth: {
    token: string;
  };
}

/* ================= COMPONENT ================= */

const FeedbackScreen: React.FC = () => {
  const userData = useSelector((state: RootState) => state.auth);

  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    loadFeedbackTypes();
  }, []);

  /* ================= API ================= */

  const loadFeedbackTypes = async () => {
    try {
      const response = await javascriptGet({
        path: "member/feedback/types-with-categories",
        body: {},
        Token: userData?.token,
      });

      if (response?.status) {
        setFeedbackTypes(response.data);
        setSelectedType(response.data?.[0]?.id ?? null);
      } else {
        Alert.alert("Error", response?.message || "Unable to load feedback data");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load feedback data.");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!selectedType) return Alert.alert("Validation", "Please select feedback type");
    if (!selectedCategory) return Alert.alert("Validation", "Please select category");
    if (!description.trim()) return Alert.alert("Validation", "Please enter description");

    try {
      setSubmitting(true);

      const response = await javascriptPost({
        path: "member/feedback/submit",
        body: {
          type_id: selectedType,
          category_id: selectedCategory,
          description,
        },
        Token: userData?.token,
      });

      if (response?.status) {
        Alert.alert("Thank You", response.message);
        setSelectedType(null);
        setSelectedCategory(null);
        setDescription("");
      } else {
        Alert.alert("Error", response?.message || "Submission failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const categoriesForSelectedType: FeedbackCategory[] =
    selectedType
      ? feedbackTypes.find(t => t.id === selectedType)?.categories || []
      : [];

  /* ================= UI ================= */

  return (
    <View style={{ flex: 1 }}>
      <Header title="Submit Your Feedback" />

      <View style={styles.container}>
        {loading ? (
          <>
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmer} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmer} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmerBig} />
            <ShimmerPlaceholder LinearGradient={LinearGradient} style={styles.shimmerBtn} />
          </>
        ) : (
          <>
            {/* Feedback Type */}
            <Dropdown
              style={styles.dropdown}
              data={feedbackTypes.map(t => ({
                label: t.name.toUpperCase(),
                value: t.id,
              }))}
              labelField="label"
              valueField="value"
              placeholder="Select Feedback Type"
              value={selectedType}
              itemTextStyle={{ color: "black" }}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholder}
              onChange={item => {
                setSelectedType(item.value);
                setSelectedCategory(null);
              }}
            />

            {/* Category */}
            <Dropdown
              style={styles.dropdown}
              data={categoriesForSelectedType}
              labelField="name"
              valueField="id"
              placeholder="Select Category"
              value={selectedCategory}
              itemTextStyle={{ color: "black" }}
              selectedTextStyle={styles.selectedText}
              placeholderStyle={styles.placeholder}
              onChange={item => setSelectedCategory(item.id)}
            />

            {/* Description */}
            <TextInput
              style={styles.input}
              placeholder="Enter Description..."
              placeholderTextColor="grey"
              multiline
              numberOfLines={5}
              maxLength={150}
              value={description}
              onChangeText={setDescription}
            />

            {/* Submit */}
            <TouchableOpacity style={styles.btn} onPress={submitFeedback} disabled={submitting}>
              {submitting && <ActivityIndicator color="white" style={{ marginRight: 8 }} />}
              <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default FeedbackScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    padding: 12,
    color: "black",
    height: 110,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#0066FF",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  selectedText: {
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  placeholder: {
    color: "grey",
  },

  /* Shimmer */
  shimmer: {
    height: 50,
    borderRadius: 10,
    marginBottom: 15,
  },
  shimmerBig: {
    height: 110,
    borderRadius: 10,
    marginBottom: 20,
  },
  shimmerBtn: {
    height: 50,
    borderRadius: 10,
  },
});

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import { Dropdown } from "react-native-element-dropdown";
// import { useSelector } from "react-redux";
// import { javascriptGet, javascriptPost } from "../util/api";
// import Header from "../components/Header";
// import { FONT_FAMILY } from "../util/colors";

// const FeedbackScreen = () => {
//   const [feedbackTypes, setFeedbackTypes] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [selectedType, setSelectedType] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [description, setDescription] = useState("");

//   const userData = useSelector((state) => state.auth);
//   useEffect(() => {
//     loadFeedbackTypes();
//   }, []);

//   // 🔵 Fetch Types + Categories (ONE API)
//   const loadFeedbackTypes = async () => {
//     try {
//       const apiRequestObject = {
//         path: "member/feedback/types-with-categories",
//         body: {},
//         Token: userData?.token,
//       };

//       const response = await javascriptGet(apiRequestObject);
  
//       if (response.status) {
//         setFeedbackTypes(response.data);
//         setSelectedType(response.data[0]?.id ||null)
//       } else {
//         Alert.alert("Error", response.message || "Unable to load feedback types");
//       }
//     } catch (err) {
//       console.log("Error Loading Feedback Types:", err);
//       Alert.alert("Error", "Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   // 🔵 Submit Feedback
//   const submitFeedback = async () => {
//     if (!selectedType) return Alert.alert("Please select feedback type");
//     if (!selectedCategory) return Alert.alert("Please select category");
//     if (!description.trim()) return Alert.alert("Please enter description");

//     const body = {
//       type_id: selectedType,
//       category_id: selectedCategory,
//       description: description,
//     };

//     try {
//       const apiRequestObject = {
//         path: "member/feedback/submit",
//         body: body,
//         Token: userData?.token,
//       };
// setLoading(true)
// console.log( apiRequestObject, '---------------------- apiRequestObject ---------------------');
//       const response = await javascriptPost(apiRequestObject);
//       console.log( response, '---------------------- response ---------------------');
// setLoading(false)
//       if (response.status===true) {
//           Alert.alert("Thank You!", response.message);

//         // reset form
//         setSelectedType(null);
//         setSelectedCategory(null);
//         setDescription("");
//       } else {
//         Alert.alert("Error", response.message || "Submission failed");
//       }
//     } catch (err) {
//       console.log("Submit Error:", err);
//       Alert.alert("Error", "Something went wrong.");
//     }
//   };

//   const categoriesForSelectedType =
//     selectedType && feedbackTypes
//       ? feedbackTypes.find((t) => t.id === selectedType)?.categories || []
//       : [];

//   return (
//     <View>
//       <Header title={"Submit Your Feedback"} />

//       <View style={styles.container}>
//           <>
//             {/* Type Dropdown */}
//             <Dropdown
//               style={styles.dropdown}
//               data={
//                 feedbackTypes?.map((t) => ({
//                   label: t.name.toUpperCase(),
//                   value: t.id,
//                 })) || []
//               }
//               selectedTextStyle={{
//                 color: "black",
//                 fontFamily: FONT_FAMILY.normal,
//               }}
              
//               placeholderStyle={{ color: "grey" }}
//               labelField="label"
//               valueField="value"
//                itemTextStyle={{ color: "black" }}
//               placeholder="Select Feedback Type"
//               value={selectedType}
//               onChange={(item) => {
//                 setSelectedType(item.value);
//                 setSelectedCategory(null);
//               }}
//             />

           
//               <Dropdown
//                 style={styles.dropdown}
//                  placeholderStyle={{ color: "grey" }}
//                 data={categoriesForSelectedType}
//                 labelField="name"
//                 valueField="id"
//                 selectedTextStyle={{
//                   color: "black",
//                   fontFamily: FONT_FAMILY.normal,
//                 }}
//                 placeholder="Select Category"
//                 itemTextStyle={{ color: "black" }}
//                 value={selectedCategory}
//                 onChange={(item) => setSelectedCategory(item.id)}
//               />

//             {/* Description */}
//             <TextInput
//               style={styles.input}
//               placeholder="Enter Description..."
//               placeholderTextColor="grey"
//               multiline
//               numberOfLines={5}
//               maxLength={150}
//               value={description}
//               returnKeyType="done"
//               onSubmitEditing={submitFeedback}
//               onChangeText={setDescription}
//             />

//             {/* Submit */}
//             <TouchableOpacity   style={styles.btn} onPress={submitFeedback}>
//              {loading && <ActivityIndicator color={'white'} style={{marginRight:10}}/>}
//               <Text style={styles.btnText}>Submit</Text>
//             </TouchableOpacity>
//           </>
//       </View>
//     </View>
//   );
// };

// export default FeedbackScreen;

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#bbb",
//     color:'black',
//     borderRadius: 10,
//     padding: 12,
//     textAlignVertical: "top",
//     marginBottom: 20,
//     height: 110,
//   },
//   btn: {
//     backgroundColor: "#0066FF",
//     padding: 15,
//     borderRadius: 10,
//     justifyContent: "center",
//     flexDirection:'row'
//   },
//   btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
// });
